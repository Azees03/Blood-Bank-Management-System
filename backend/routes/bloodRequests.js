const express = require("express");
const router = express.Router();
const BloodRequest = require("../models/BloodRequest");

// Post new blood request
router.post("/", async (req, res) => {
  try {
    const newRequest = new BloodRequest(req.body);
    await newRequest.save();
    
    // Populate blood bank details for response
    await newRequest.populate("bloodBankId", "bankName address phone");
    
    res.status(201).json({ 
      message: "Blood request posted successfully", 
      request: newRequest 
    });
  } catch (error) {
    console.error("❌ Blood request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get blood requests by blood bank
router.get("/bank/:bankId", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ bloodBankId: req.params.bankId })
      .populate("bloodBankId", "bankName address phone")
      .sort({ postedDate: -1 });
    res.json(requests);
  } catch (error) {
    console.error("❌ Get blood requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all active blood requests (for donors)
router.get("/active", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: "active" })
      .populate("bloodBankId", "bankName address phone email")
      .sort({ postedDate: -1 });
    res.json(requests);
  } catch (error) {
    console.error("❌ Get active requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update blood request
router.put("/:requestId", async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.requestId,
      req.body,
      { new: true }
    ).populate("bloodBankId", "bankName address phone");
    
    res.json({ message: "Request updated successfully", request });
  } catch (error) {
    console.error("❌ Update request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;