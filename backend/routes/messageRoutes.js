const express = require("express");
const Message = require("../models/Message");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/inbox", verifyToken, async (req, res) => {

  const messages = await Message.find({
    receiver: req.user.id
  })
  .sort({ createdAt: -1 });

  res.json(messages);

});


router.patch("/read/:id", verifyToken, async (req, res) => {

  await Message.findByIdAndUpdate(req.params.id, {
    isRead: true
  });

  res.json({ msg: "Marked as read" });

});

module.exports = router;