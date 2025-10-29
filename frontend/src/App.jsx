import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Registration from "./components/Registration";
import BloodBankDashboard from "./pages/BloodBankDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import BloodSearchDashboard from "./pages/BloodSearchDashboard";
import DonorDashboard from "./pages/DonorDashboard"; 

const AppContent = () => {
  const location = useLocation();

  // Define the paths where navbar should be visible
  const showNavbarPaths = ["/", "/login", "/register"];

  const showNavbar = showNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        <Route path="/blood-search" element={<BloodSearchDashboard />} />
        <Route path="/bloodbank/dashboard" element={<BloodBankDashboard />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        <Route path="/donor/dashboard" element={<DonorDashboard />} />

        <Route path="*" element={<Dashboard />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
