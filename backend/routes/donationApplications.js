const express = require("express");
const router = express.Router();
const DonationApplication = require("../models/DonationApplication");
const BloodRequest = require("../models/BloodRequest");

// Submit donation application
router.post("/", async (req, res) => {
  try {
    const newApplication = new DonationApplication(req.body);
    await newApplication.save();
    
    // Update applications count in blood request
    await BloodRequest.findByIdAndUpdate(
      req.body.requestId,
      { $inc: { applicationsReceived: 1 } }
    );
    
    await newApplication.populate("bloodBankId", "bankName address phone");
    await newApplication.populate("donorId", "name email phone bloodGroup");
    await newApplication.populate("requestId", "bloodType unitsNeeded");
    
    res.status(201).json({ 
      message: "Application submitted successfully", 
      application: newApplication 
    });
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
      .populate("requestId", "bloodType unitsNeeded")
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    console.error("❌ Get applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get applications by blood bank
router.get("/bank/:bankId", async (req, res) => {
  try {
    const applications = await DonationApplication.find({ bloodBankId: req.params.bankId })
      .populate("donorId", "name email phone bloodGroup lastDonationDate")
      .populate("requestId", "bloodType unitsNeeded")
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    console.error("❌ Get bank applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update application status
router.patch("/:applicationId/status", async (req, res) => {
  try {
    const { status, rejectionReason, donationDate } = req.body;
    const application = await DonationApplication.findByIdAndUpdate(
      req.params.applicationId,
      { status, rejectionReason, donationDate },
      { new: true }
    )
    .populate("donorId", "name email phone bloodGroup")
    .populate("bloodBankId", "bankName address phone")
    .populate("requestId", "bloodType unitsNeeded");
    
    res.json({ message: "Application status updated", application });
  } catch (error) {
    console.error("❌ Update application status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;