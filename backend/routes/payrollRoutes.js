const express = require("express");
const SalarySlip = require("../models/SalarySlip");
const User = require("../models/User");

const sendEmail = require("../utils/sendEmail");
const { salaryEmailTemplate } = require("../utils/emailTemplates");

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

    res.json({ msg: "Email sent successfully" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


module.exports = router;