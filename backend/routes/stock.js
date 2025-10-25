const express = require("express");
const router = express.Router();
const BloodStock = require("../models/BloodStock");
const mongoose = require("mongoose"); // ✅ Add this

router.get("/:bankId", async (req, res) => {
  try {
    const items = await BloodStock.find({ bloodBankId: req.params.bankId });
    res.json(items);
  } catch (err) {
    console.error("fetch stock err:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("📦 Incoming POST:", req.body);

    const { bloodBankId, bloodType, units } = req.body;
    if (!bloodBankId || !bloodType || typeof units !== "number") {
      return res.status(400).json({ message: "Missing or invalid data" });
    }

    // ✅ Convert string ID to ObjectId
    const bankObjectId = new mongoose.Types.ObjectId(bloodBankId);

    const existing = await BloodStock.findOne({ 
      bloodBankId: bankObjectId, 
      bloodType 
    });
    
    if (existing) {
      existing.units += units;
      existing.lastUpdated = Date.now();
      await existing.save();
      return res.json({ message: "Stock updated" });
    }

    // ✅ Use ObjectId for new document
    const item = new BloodStock({ 
      bloodBankId: bankObjectId, 
      bloodType, 
      units 
    });
    
    await item.save();
    return res.json({ message: "Stock added" });
  } catch (err) {
    console.error("❌ Add stock error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;