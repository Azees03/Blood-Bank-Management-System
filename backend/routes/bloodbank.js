const express = require("express");
const router = express.Router();
const BloodBank = require("../models/BloodBank");

// Register Blood Bank
router.post("/register", async (req, res) => {
  try {
    const newBank = new BloodBank(req.body);
    await newBank.save();
    res.status(201).json({ message: "Blood bank registered successfully", data: newBank });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Blood Bank
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const bank = await BloodBank.findOne({ email, password });
    if (!bank) return res.status(400).json({ message: "Invalid credentials" });
    res.status(200).json({ message: "Login successful", bank });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Dashboard (fetch bank details)
router.get("/dashboard/:id", async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ message: "Blood bank not found" });
    res.status(200).json(bank);
  } catch (error) {
    console.error("❌ Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
