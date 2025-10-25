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
const hospitalRoutes = require("./routes/hospital"); // ✅ Add hospital routes
const donorRoutes = require("./routes/donor"); // ✅ Add donor routes

// Use routes
app.use("/api/bloodbank", bloodBankRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/hospital", hospitalRoutes); // ✅ Use hospital routes
app.use("/api/donor", donorRoutes); // ✅ Use donor routes

// Default route
app.get("/", (req, res) => {
  res.send("Blood Bank Management Backend is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));