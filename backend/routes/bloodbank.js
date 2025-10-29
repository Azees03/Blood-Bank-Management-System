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
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Login Blood Bank
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const bank = await BloodBank.findOne({ email, password });
    if (!bank) return res.status(400).json({ message: "Invalid credentials" });
    res.status(200).json({ 
      message: "Login successful", 
      bank: {
        _id: bank._id,
        bankName: bank.bankName,
        email: bank.email,
        phone: bank.phone,
        address: bank.address
      }
    });
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

// Get all blood banks (for hospital directory)
router.get("/", async (req, res) => {
  try {
    const bloodBanks = await BloodBank.find()
      .select("bankName address phone email hours")
      .sort({ bankName: 1 });
    res.json(bloodBanks);
  } catch (error) {
    console.error("❌ Get blood banks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;