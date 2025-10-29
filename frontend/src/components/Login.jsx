// src/components/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let endpoint = "";
      
      if (role === "bloodbank") {
        endpoint = "http://localhost:5000/api/bloodbank/login";
      } else if (role === "hospital") {
        endpoint = "http://localhost:5000/api/hospital/login";
      } else if (role === "donor") {
        endpoint = "http://localhost:5000/api/donor/login";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Login failed:", text);
        alert("Login failed. Please check credentials or server.");
        return;
      }

      const data = await res.json();

      // Store session details based on role
      localStorage.setItem("token", data.token || "dummy-token");
      localStorage.setItem("role", role);
      
      if (role === "bloodbank") {
        localStorage.setItem("bloodBankId", data.bank._id);
        localStorage.setItem("bloodBankName", data.bank.bankName);
        navigate("/bloodbank/dashboard");
      } else if (role === "hospital") {
        localStorage.setItem("hospitalId", data.hospital._id);
        localStorage.setItem("hospitalName", data.hospital.hospitalName);
        navigate("/hospital/dashboard");
      } else if (role === "donor") {
      localStorage.setItem("donorId", data.donor._id);
      localStorage.setItem("donorName", data.donor.name);
      localStorage.setItem("donorEmail", data.donor.email);
      localStorage.setItem("donorBloodGroup", data.donor.bloodGroup);
      navigate("/donor/dashboard");
    }

      alert("Login successful!");
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label>Select Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="donor">Donor</option>
          <option value="hospital">Hospital</option>
          <option value="bloodbank">Blood Bank</option>
        </select>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="login-btn">
          Login
        </button>

        <p className="register-text">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;