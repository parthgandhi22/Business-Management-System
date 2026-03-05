const express = require("express");
const User = require("../models/User");
const generateSalarySlip = require("../utils/generateSalarySlip");

const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

// this route is for testing functionality, you can remove it in production
// ============================
// GENERATE SALARY SLIP
// ============================

router.post("/generate", verifyToken, checkRole("admin"), async (req, res) => {

    try {

      const { userId, baseSalary, bonus, deductions, month } = req.body;

      const user = await User.findById(userId);

      const filePath = generateSalarySlip(user, {
        baseSalary,
        bonus,
        deductions,
        month
      });

      res.json({
        msg: "Salary slip generated",
        file: filePath
      });

    } catch (err) {

      res.status(500).json({
        error: err.message
      });

    }

  }
);

module.exports = router;