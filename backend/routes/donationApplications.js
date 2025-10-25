const express = require("express");
const router = express.Router();
const DonationApplication = require("../models/DonationApplication");

// Submit donation application
router.post("/", async (req, res) => {
  try {
    const newApplication = new DonationApplication(req.body);
    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully", application: newApplication });
  } catch (error) {
    console.error("❌ Donation application error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get applications by donor
router.get("/donor/:donorId", async (req, res) => {
  try {
    const applications = await DonationApplication.find({ donorId: req.params.donorId })
      .populate("bloodBankId", "bankName address phone")
      .populate("requestId", "bloodType unitsNeeded");
    res.json(applications);
  } catch (error) {
    console.error("❌ Get applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get applications by blood bank
router.get("/bank/:bankId", async (req, res) => {
  try {
    const applications = await DonationApplication.find({ bloodBankId: req.params.bankId, status: "pending" })
      .populate("donorId", "name email phone bloodGroup");
    res.json(applications);
  } catch (error) {
    console.error("❌ Get bank applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;