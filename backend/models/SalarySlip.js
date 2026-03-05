const mongoose = require("mongoose");

const SalarySlipSchema = new mongoose.Schema({

  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  month: String,

  filePath: String,

  sent: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("SalarySlip", SalarySlipSchema);