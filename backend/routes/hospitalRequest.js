const express = require("express");
const router = express.Router();
const HospitalRequest = require("../models/HospitalRequest");

// Submit hospital blood request
router.post("/", async (req, res) => {
  try {
    const newRequest = new HospitalRequest(req.body);
    await newRequest.save();
    res.status(201).json({ message: "Blood request submitted successfully", request: newRequest });
  } catch (error) {
    console.error("❌ Hospital request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get requests by hospital
router.get("/hospital/:hospitalId", async (req, res) => {
  try {
    const requests = await HospitalRequest.find({ hospitalId: req.params.hospitalId })
      .populate("bloodBankId", "bankName address phone");
    res.json(requests);
  } catch (error) {
    console.error("❌ Get hospital requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get requests for blood bank
router.get("/bank/:bankId", async (req, res) => {
  try {
    const requests = await HospitalRequest.find({ bloodBankId: req.params.bankId, status: "pending" })
      .populate("hospitalId", "hospitalName address phone");
    res.json(requests);
  } catch (error) {
    console.error("❌ Get bank requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update request status
router.patch("/:requestId/status", async (req, res) => {
  try {
    const { status, rejectionReason, deliveryDate } = req.body;
    const request = await HospitalRequest.findByIdAndUpdate(
      req.params.requestId,
      { status, rejectionReason, deliveryDate },
      { new: true }
    );
    res.json({ message: "Request status updated", request });
  } catch (error) {
    console.error("❌ Update request status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;