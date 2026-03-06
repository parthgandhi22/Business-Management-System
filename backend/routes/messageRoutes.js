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


router.get("/unread-count", verifyToken, async (req,res)=>{

  try{

    const count = await Message.countDocuments({
      receiver:req.user.id,
      isRead:false
    });

    res.json({count});

  }catch(err){
    res.status(500).json({error:err.message});
  }
});

module.exports = router;