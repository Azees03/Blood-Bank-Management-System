const mongoose = require("mongoose");

const bloodBankSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  registrationId: { type: String, required: true },
  managerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
});

module.exports = mongoose.model("BloodBank", bloodBankSchema);
