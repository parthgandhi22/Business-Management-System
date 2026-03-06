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
router.post("/send/:id", verifyToken, checkRole("admin"), async (req, res) => {

  try {

    const slip = await SalarySlip.findById(req.params.id)
      .populate("employee");

    const emp = slip.employee;

    const html = salaryEmailTemplate(
      emp.name,
      slip.month,
      "63000"
    );

    await sendEmail(
      emp.email,
      `Salary Slip - ${slip.month}`,
      html,
      slip.filePath
    );

    slip.sent = true;

    await slip.save();
    
    await createMessage({
      sender: "Admin",
      receiver: slip.employee._id,
      type: "payroll",
      message: `Salary slip for ${slip.month} has been sent to your email`
    });

    const io = req.app.get("io");
    
    io.emit("salarySent", {
      employee: emp.name,
      month: slip.month
    });


    res.json({ msg: "Email sent successfully" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


module.exports = router;