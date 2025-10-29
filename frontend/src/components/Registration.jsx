// src/components/Registration.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registration.css";

const Registration = () => {
  const [role, setRole] = useState("donor");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Common fields
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    
    // Donor specific
    dob: "",
    gender: "",
    bloodGroup: "",
    
    // Hospital specific
    hospitalName: "",
    registrationNumber: "",
    contactPerson: "",
    
    // Blood Bank specific
    bankName: "",
    registrationId: "",
    managerName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let endpoint = "";
      let payload = {};

      if (role === "bloodbank") {
        endpoint = "http://localhost:5000/api/bloodbank/register";
        payload = {
          bankName: formData.bankName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          registrationId: formData.registrationId,
          managerName: formData.managerName,
        };
      } else if (role === "hospital") {
        endpoint = "http://localhost:5000/api/hospital/register";
        payload = {
          hospitalName: formData.hospitalName,
          registrationNumber: formData.registrationNumber,
          contactPerson: formData.contactPerson,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
        };
      } else if (role === "donor") {
        endpoint = "http://localhost:5000/api/donor/register";
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          dob: formData.dob,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`);
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="registration-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>Select Role</label>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="donor">Donor</option>
          <option value="hospital">Hospital</option>
          <option value="bloodbank">Blood Bank</option>
        </select>

        {/* Common Fields */}
        {(role === "donor" || role === "hospital" || role === "bloodbank") && (
          <>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label>Address</label>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* Donor Specific Fields */}
        {role === "donor" && (
          <>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />

            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <label>Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="">Select Blood Group</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </>
        )}

        {/* Hospital Specific Fields */}
        {role === "hospital" && (
          <>
            <label>Hospital Name</label>
            <input
              type="text"
              name="hospitalName"
              placeholder="Hospital Name"
              value={formData.hospitalName}
              onChange={handleChange}
              required
            />

            <label>Registration Number</label>
            <input
              type="text"
              name="registrationNumber"
              placeholder="Registration Number"
              value={formData.registrationNumber}
              onChange={handleChange}
              required
            />

            <label>Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              placeholder="Contact Person Name"
              value={formData.contactPerson}
              onChange={handleChange}
              required
            />
          </>
        )}

        {/* Blood Bank Specific Fields */}
        {role === "bloodbank" && (
          <>
            <label>Blood Bank Name</label>
            <input
              type="text"
              name="bankName"
              placeholder="Blood Bank Name"
              value={formData.bankName}
              onChange={handleChange}
              required
            />

            <label>Registration ID</label>
            <input
              type="text"
              name="registrationId"
              placeholder="Registration ID"
              value={formData.registrationId}
              onChange={handleChange}
              required
            />

            <label>Manager Name</label>
            <input
              type="text"
              name="managerName"
              placeholder="Manager Name"
              value={formData.managerName}
              onChange={handleChange}
              required
            />
          </>
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Registration;