const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/blood_management")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Import routes
const bloodBankRoutes = require("./routes/bloodbank");
const stockRoutes = require("./routes/stock");
const hospitalRoutes = require("./routes/hospital");
const donorRoutes = require("./routes/donor");
const bloodRequestRoutes = require("./routes/bloodRequests");
const hospitalRequestRoutes = require("./routes/hospitalRequests");
const donationApplicationRoutes = require("./routes/donationApplications");

// Use routes
app.use("/api/bloodbank", bloodBankRoutes);  // Blood bank auth + directory
app.use("/api/stock", stockRoutes);          // Blood stock management
app.use("/api/hospital", hospitalRoutes);    // Hospital auth
app.use("/api/donor", donorRoutes);          // Donor auth
app.use("/api/blood-requests", bloodRequestRoutes);       // Blood bank posts
app.use("/api/hospital-requests", hospitalRequestRoutes); // Hospital requests
app.use("/api/donation-applications", donationApplicationRoutes); // Donor apps

// Default route
app.get("/", (req, res) => {
  res.send("Blood Bank Management Backend is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));