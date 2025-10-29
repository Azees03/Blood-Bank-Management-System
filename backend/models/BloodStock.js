const mongoose = require("mongoose");

const bloodStockSchema = new mongoose.Schema({
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodBank",
    required: true,
  },
  bloodType: { type: String, required: true },
  units: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BloodStock", bloodStockSchema);