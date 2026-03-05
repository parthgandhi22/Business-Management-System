const express = require("express");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();
// this route is for testing email functionality, you can remove it in production
router.post("/test", async (req, res) => {

  try {

    const { email } = req.body;

    await sendEmail(
      email,
      "Test Email from BMS",
      "Hello! This email was sent from your Business Management System."
    );

    res.json({
      msg: "Email sent successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

});

module.exports = router;