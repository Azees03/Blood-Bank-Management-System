const express = require("express");
const router = express.Router();
const Hospital = require("../models/Hospital");

// Register Hospital
router.post("/register", async (req, res) => {
  try {
    const newHospital = new Hospital(req.body);
    await newHospital.save();
    res.status(201).json({ 
      message: "Hospital registered successfully", 
      hospital: newHospital 
    });
  } catch (error) {
    console.error("❌ Hospital Registration Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email or registration number already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Login Hospital
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const hospital = await Hospital.findOne({ email, password });
    if (!hospital) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ 
      message: "Login successful", 
      hospital: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        email: hospital.email,
        contactPerson: hospital.contactPerson
      }
    });
  } catch (error) {
    console.error("❌ Hospital Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Hospital Dashboard
router.get("/dashboard/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.status(200).json(hospital);
  } catch (error) {
    console.error("❌ Hospital Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;