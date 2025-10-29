const mongoose = require("mongoose");

const donationApplicationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Donor",
    required: true,
  },
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodBank",
    required: true,
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodRequest",
    required: true,
  },
  bloodType: { type: String, required: true },
  units: { type: Number, required: true },
  status: { type: String, default: "pending" },
  appliedDate: { type: Date, default: Date.now },
  donationDate: { type: Date },
  healthConditions: { type: String },
  message: { type: String },
  rejectionReason: { type: String }
});

module.exports = mongoose.model("DonationApplication", donationApplicationSchema);