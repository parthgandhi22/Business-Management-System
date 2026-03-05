const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({

  sender: {
    type: String,
    default: "system"
  },

  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["task", "payroll", "announcement"],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);