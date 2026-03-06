const express = require("express");
const User = require("../models/User");
const createMessage = require("../utils/createMessage");

const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

const router = express.Router();


router.post("/announcement", verifyToken, checkRole("admin"), async (req, res) => {
    const { message } = req.body;
    const finalmessage = "Admin Announcement: " + message;
    const employees = await User.find({ role: "employee" });

    for(const emp of employees){

      await createMessage({
        sender: "Admin",
        receiver: emp._id,
        type: "announcement",
        message: finalmessage
      });

    }
    const io = req.app.get("io");
    io.emit("announcement");

    res.json({ msg: "Announcement sent" });

});

module.exports = router;