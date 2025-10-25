const express = require("express");
const router = express.Router();
const BloodRequest = require("../models/BloodRequest");

// Post new blood request
router.post("/", async (req, res) => {
  try {
    const newRequest = new BloodRequest(req.body);
    await newRequest.save();
    res.status(201).json({ message: "Blood request posted successfully", request: newRequest });
  } catch (error) {
    console.error("❌ Blood request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get blood requests by blood bank
router.get("/bank/:bankId", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ bloodBankId: req.params.bankId });
    res.json(requests);
  } catch (error) {
    console.error("❌ Get blood requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all active blood requests (for donors)
router.get("/active", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: "active" }).populate("bloodBankId", "bankName address phone");
    res.json(requests);
  } catch (error) {
    console.error("❌ Get active requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;