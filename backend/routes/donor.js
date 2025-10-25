const express = require("express");
const router = express.Router();
const Donor = require("../models/Donor");

// Register Donor
router.post("/register", async (req, res) => {
  try {
    const newDonor = new Donor(req.body);
    await newDonor.save();
    res.status(201).json({ 
      message: "Donor registered successfully", 
      donor: newDonor 
    });
  } catch (error) {
    console.error("❌ Donor Registration Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Login Donor
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const donor = await Donor.findOne({ email, password });
    if (!donor) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ 
      message: "Login successful", 
      donor: {
        _id: donor._id,
        name: donor.name,
        email: donor.email,
        bloodGroup: donor.bloodGroup,
        isAvailable: donor.isAvailable
      }
    });
  } catch (error) {
    console.error("❌ Donor Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Donor Dashboard
router.get("/dashboard/:id", async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.status(200).json(donor);
  } catch (error) {
    console.error("❌ Donor Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;