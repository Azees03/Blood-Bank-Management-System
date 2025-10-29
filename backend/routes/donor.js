// Get Donor Dashboard
router.get("/dashboard/:id", async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.status(200).json({
      _id: donor._id,
      name: donor.name,
      email: donor.email,
      bloodGroup: donor.bloodGroup,
      phone: donor.phone,
      address: donor.address
    });
  } catch (error) {
    console.error("❌ Donor Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});