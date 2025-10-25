const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema({
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodBank",
    required: true,
  },
  bloodType: { type: String, required: true },
  unitsNeeded: { type: Number, required: true },
  urgency: { type: String, default: "normal" },
  status: { type: String, default: "active" },
  description: { type: String, required: true },
  contactInfo: { type: String },
  postedDate: { type: Date, default: Date.now },
  applicationsReceived: { type: Number, default: 0 },
});

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);