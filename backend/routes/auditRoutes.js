const express = require("express");
const AuditLog = require("../models/AuditLog");
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/logs", verifyToken, checkRole("admin"), async (req, res) => {

    const logs = await AuditLog
      .find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  }
);

module.exports = router;