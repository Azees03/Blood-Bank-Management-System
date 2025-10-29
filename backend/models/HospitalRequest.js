const mongoose = require("mongoose");

const hospitalRequestSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  bloodBankId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BloodBank",
    required: true,
  },
  bloodType: { type: String, required: true },
  units: { type: Number, required: true },
  urgency: { type: String, default: "normal" },
  status: { type: String, default: "pending" },
  patientDetails: { type: String, required: true },
  requiredBy: { type: Date },
  notes: { type: String },
  rejectionReason: { type: String },
  deliveryDate: { type: Date },
  requestDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("HospitalRequest", hospitalRequestSchema);