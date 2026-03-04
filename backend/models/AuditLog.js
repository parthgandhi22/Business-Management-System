const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    userName: {
      type: String
    },

    role: {
      type: String
    },

    action: {
      type: String,
      required: true
    },

    targetType: {
      type: String
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId
    },

    description: {
      type: String
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);