const express = require("express");
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/employees", verifyToken, checkRole("manager"), async (req, res) => {
    const employees = await User.find({ role: "employee" })
      .select("name email");

    res.json(employees);
  }
);

// GET ALL USERS (Admin Only)
router.get("/all", verifyToken, checkRole("admin"), async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  }
);

module.exports = router;