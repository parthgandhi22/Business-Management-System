const express = require("express");
const SalarySlip = require("../models/SalarySlip");
const User = require("../models/User");

const sendEmail = require("../utils/sendEmail");
const { salaryEmailTemplate } = require("../utils/emailTemplates");
const createMessage = require("../utils/createMessage");

const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();


// ===============================
// GET ALL SLIPS (ADMIN)
// ===============================
router.get("/all", verifyToken, checkRole("admin"), async (req, res) => {

  try {

    const slips = await SalarySlip.find()
      .populate("employee", "name email");

    res.json(slips);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

// ===============================
// GET MY SLIPS (EMPLOYEE)
// ===============================

router.get("/my-slips", verifyToken, async (req,res)=>{

  try{

    const slips = await SalarySlip.find({
      employee: req.user.id
    })
    .sort({createdAt:-1})
    .limit(5);

    res.json(slips);

  }catch(err){
    res.status(500).json({error:err.message});
  }

});


// ===============================
// SEND EMAIL
// ===============================
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

router.post("/send/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {

    const slip = await SalarySlip.findById(req.params.id).populate("employee");

    if (!slip) {
      return res.status(404).json({ error: "Slip not found" });
    }

    const emp = slip.employee;

    if (!emp) {
      return res.status(400).json({ error: "Employee not found" });
    }

    const baseSalary = 60000;
    const bonus = 5000;
    const deductions = 2000;

    const netSalary = baseSalary + bonus - deductions;

    // ===============================
    // DELETE OLD FILE (if exists)
    // ===============================

    if (slip.filePath) {

      const filePath = path.join(__dirname, "..", slip.filePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

    }

    // ===============================
    // GENERATE PDF IN MEMORY
    // ===============================

    const doc = new PDFDocument();

    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {

      const pdfData = Buffer.concat(buffers);

      const html = salaryEmailTemplate(
        emp.name,
        slip.month,
        netSalary
      );

      // ===============================
      // SEND EMAIL
      // ===============================

      await sendEmail(
        emp.email,
        `Salary Slip - ${slip.month}`,
        html,
        null,
        pdfData
      );

      slip.sent = true;
      await slip.save();

      // ===============================
      // CREATE INBOX MESSAGE
      // ===============================

      await createMessage({
        sender: "Admin",
        receiver: emp._id,
        type: "payroll",
        message: `Salary slip for ${slip.month} has been sent to your email`
      });

      const io = req.app.get("io");

      io.emit("salarySent", {
        employee: emp.name,
        month: slip.month
      });

      res.json({ msg: "Email sent successfully" });

    });

    // ===============================
    // PDF CONTENT
    // ===============================

    doc.fontSize(20).text("OPERIX Salary Slip", { align: "center" });

    doc.moveDown();

    doc.fontSize(12).text(`Employee: ${emp.name}`);
    doc.text(`Month: ${slip.month}`);
    doc.text(`Salary: ₹${netSalary}`);

    doc.end();

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }
});


module.exports = router;