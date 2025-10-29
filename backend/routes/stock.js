const express = require("express");
const router = express.Router();
const BloodStock = require("../models/BloodStock");
const mongoose = require("mongoose");

// Get stock by blood bank
router.get("/:bankId", async (req, res) => {
  try {
    const items = await BloodStock.find({ bloodBankId: req.params.bankId });
    res.json(items);
  } catch (err) {
    console.error("fetch stock err:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add/Update stock
router.post("/", async (req, res) => {
  try {
    const { bloodBankId, bloodType, units } = req.body;
    
    if (!bloodBankId || !bloodType || typeof units !== "number") {
      return res.status(400).json({ message: "Missing or invalid data" });
    }

    const bankObjectId = new mongoose.Types.ObjectId(bloodBankId);
    const existing = await BloodStock.findOne({ bloodBankId: bankObjectId, bloodType });
    
    if (existing) {
      existing.units += units;
      existing.lastUpdated = Date.now();
      await existing.save();
      return res.json({ message: "Stock updated" });
    }

    const item = new BloodStock({ bloodBankId: bankObjectId, bloodType, units });
    await item.save();
    return res.json({ message: "Stock added" });
  } catch (err) {
    console.error("❌ Add stock error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all blood stock for hospitals
router.get("/", async (req, res) => {
  try {
    const stock = await BloodStock.find()
      .populate("bloodBankId", "bankName address phone email")
      .sort({ lastUpdated: -1 });
    res.json(stock);
  } catch (err) {
    console.error("fetch all stock err:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;