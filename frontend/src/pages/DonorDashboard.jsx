import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./DonorDashboard.css";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bloodRequests");
  const [bloodRequests, setBloodRequests] = useState([]);
  const [donationApplications, setDonationApplications] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnlyCompatible, setShowOnlyCompatible] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    units: 1,
    lastDonationDate: "",
    healthConditions: "",
    message: ""
  });

  const donorId = localStorage.getItem("donorId");
  const donorName = localStorage.getItem("donorName");
  const donorEmail = localStorage.getItem("donorEmail");
  const donorBloodGroup = localStorage.getItem("donorBloodGroup");

  console.log("🔍 Donor Info from localStorage:", { 
    donorId, 
    donorName, 
    donorEmail, 
    donorBloodGroup 
  });

  // Fetch functions with useCallback
  const fetchBloodRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching blood requests...");
      const res = await fetch("http://localhost:5000/api/blood-requests/active");
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("✅ Fetched blood requests:", data);
      setBloodRequests(data);
    } catch (err) {
      console.error("❌ Blood requests fetch error:", err);
      alert("Failed to load blood requests. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDonationApplications = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/donation-applications/donor/${donorId}`);
      const data = await res.json();
      setDonationApplications(data);
    } catch (err) {
      console.error("Applications fetch error:", err);
    }
  }, [donorId]);

  const fetchBloodBanks = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bloodbank");
      const data = await res.json();
      setBloodBanks(data);
    } catch (err) {
      console.error("Blood banks fetch error:", err);
    }
  }, []);

  // Function to manually set blood type (temporary fix)
  const fetchDonorBloodType = useCallback(async () => {
    try {
      console.log("🔄 Fetching donor blood type from database...");
      const res = await fetch(`http://localhost:5000/api/donor/dashboard/${donorId}`);
      const data = await res.json();
      if (data.bloodGroup) {
        console.log("✅ Found blood type in DB:", data.bloodGroup);
        localStorage.setItem("donorBloodGroup", data.bloodGroup);
        window.location.reload(); // Refresh to apply the change
      }
    } catch (err) {
      console.error("❌ Error fetching donor blood type:", err);
    }
  }, [donorId]);

  useEffect(() => {
    if (!donorId || donorId === "undefined") {
      navigate("/login");
      return;
    }

    // If blood type is not in localStorage, try to fetch it
    if (!donorBloodGroup) {
      console.log("⚠️ Blood type not found in localStorage, fetching from DB...");
      fetchDonorBloodType();
    }

    fetchBloodRequests();
    fetchDonationApplications();
    fetchBloodBanks();
    
    setApplicationForm(prev => ({
      ...prev,
      donorName: donorName || "",
      donorEmail: donorEmail || "",
    }));
  }, [donorId, donorName, donorEmail, donorBloodGroup, navigate, fetchBloodRequests, fetchDonationApplications, fetchBloodBanks, fetchDonorBloodType]);

  const handleApplyForDonation = (request) => {
    if (!donorBloodGroup) {
      alert("Please set your blood type in your profile before applying to donate.");
      return;
    }

    if (!isRequestCompatible(request)) {
      alert(`Your blood type (${donorBloodGroup}) is not compatible with the requested type (${request.bloodType}).`);
      return;
    }

    setSelectedRequest(request);
    setApplicationForm(prev => ({
      ...prev,
      donorName: donorName || "",
      donorEmail: donorEmail || "",
    }));
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    
    if (!donorBloodGroup) {
      alert("Blood type not found. Please log in again.");
      return;
    }

    const payload = {
      donorId: donorId,
      bloodBankId: selectedRequest.bloodBankId._id,
      requestId: selectedRequest._id,
      bloodType: donorBloodGroup,
      units: Number(applicationForm.units),
      healthConditions: applicationForm.healthConditions,
      message: applicationForm.message
    };

    console.log("📤 Submitting application:", payload);

    try {
      const res = await fetch("http://localhost:5000/api/donation-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("🎉 Donation application submitted successfully! The blood bank will review your application.");
        setShowApplicationForm(false);
        setSelectedRequest(null);
        setApplicationForm({
          donorName: donorName || "",
          donorEmail: donorEmail || "",
          donorPhone: "",
          units: 1,
          lastDonationDate: "",
          healthConditions: "",
          message: ""
        });
        fetchDonationApplications();
        fetchBloodRequests();
      } else {
        alert(data.message || "Application submission failed");
      }
    } catch (error) {
      console.error("Application submission error:", error);
      alert("Server error while submitting application");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'critical': return '#e74c3c';
      case 'urgent': return '#f39c12';
      case 'normal': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const canDonate = (lastDonationDate) => {
    if (!lastDonationDate) return true;
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDonation);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 56;
  };

  // Fixed Blood type compatibility - Who can donate to whom
  const canDonateTo = (donorType, recipientType) => {
    if (!donorType || !recipientType) return false;
    
    // Universal donors
    if (donorType === 'O-') return true; // O- can donate to anyone
    
    // Exact match always works
    if (donorType === recipientType) return true;
    
    // Specific compatibilities
    const compatibility = {
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB+': ['AB+'],
      'A-': ['A+', 'A-', 'AB+', 'AB-'],
      'B-': ['B+', 'B-', 'AB+', 'AB-'],
      'AB-': ['AB+', 'AB-'],
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // Universal donor
    };
    
    return compatibility[donorType]?.includes(recipientType) || false;
  };

  const isRequestCompatible = (request) => {
    return donorBloodGroup && canDonateTo(donorBloodGroup, request.bloodType);
  };

  // Filter requests based on blood type compatibility
  const displayedBloodRequests = showOnlyCompatible && donorBloodGroup 
    ? bloodRequests.filter(request => isRequestCompatible(request))
    : bloodRequests;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-info">
          <h1>Donor Dashboard</h1>
          <p>Welcome back, {donorName}! Ready to save lives?</p>
        </div>
        <div className="header-actions">
          <span>Blood Type: <strong>{donorBloodGroup || "Not specified"}</strong></span>
          {!donorBloodGroup && (
            <button 
              onClick={fetchDonorBloodType}
              style={{
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginLeft: '10px'
              }}
            >
              Fix Blood Type
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === "bloodRequests" ? "active" : ""} 
          onClick={() => setActiveTab("bloodRequests")}
        >
          Blood Requests ({displayedBloodRequests.length})
        </button>
        <button 
          className={activeTab === "applications" ? "active" : ""} 
          onClick={() => setActiveTab("applications")}
        >
          My Applications ({donationApplications.length})
        </button>
        <button 
          className={activeTab === "bloodBanks" ? "active" : ""} 
          onClick={() => setActiveTab("bloodBanks")}
        >
          Find Blood Banks
        </button>
      </nav>

      {/* Blood Requests Section */}
      {activeTab === "bloodRequests" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Blood Requests from Blood Banks</h2>
            <p>
              {showOnlyCompatible && donorBloodGroup 
                ? `Showing requests compatible with your blood type (${donorBloodGroup})`
                : "Showing all blood requests from blood banks"
              }
            </p>
          </div>

          {/* Filter Toggle - Only show if blood type is available */}
          {donorBloodGroup ? (
            <div className="filter-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={showOnlyCompatible}
                  onChange={(e) => setShowOnlyCompatible(e.target.checked)}
                />
                Show only compatible blood types ({donorBloodGroup})
              </label>
            </div>
          ) : (
            <div className="filter-toggle" style={{background: '#fff3cd', border: '1px solid #ffeaa7'}}>
              <p style={{margin: 0, color: '#856404'}}>
                ⚠️ Your blood type is not set. Please contact support or try the "Fix Blood Type" button above.
              </p>
            </div>
          )}

          {/* Request Information */}
          <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd'}}>
            <h4 style={{margin: '0 0 10px 0', color: '#666'}}>Request Information:</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px'}}>
              <div><strong>Your Blood Type:</strong> <span style={{color: donorBloodGroup ? '#27ae60' : '#e74c3c', fontWeight: 'bold'}}>{donorBloodGroup || 'Not specified'}</span></div>
              <div><strong>Total Requests:</strong> {bloodRequests.length}</div>
              <div><strong>Showing:</strong> {displayedBloodRequests.length}</div>
              <div><strong>Filter:</strong> {showOnlyCompatible ? 'Compatible Only' : 'All Requests'}</div>
            </div>
            {donorBloodGroup && (
              <div style={{marginTop: '10px', fontSize: '14px'}}>
                <strong>As {donorBloodGroup}, you can donate to:</strong> {
                  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
                    .filter(type => canDonateTo(donorBloodGroup, type))
                    .join(', ')
                }
              </div>
            )}
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading blood requests...</p>
            </div>
          ) : displayedBloodRequests.length > 0 ? (
            <div className="blood-requests-grid">
              {displayedBloodRequests.map((request) => {
                const compatible = isRequestCompatible(request);
                const canApply = compatible && canDonate(applicationForm.lastDonationDate);
                
                return (
                  <div key={request._id} className={`blood-request-card ${compatible ? 'compatible' : 'incompatible'}`}>
                    {!compatible && donorBloodGroup && (
                      <div className="incompatible-warning">
                        ⚠️ Not compatible with your blood type ({donorBloodGroup})
                      </div>
                    )}
                    
                    {!donorBloodGroup && (
                      <div className="incompatible-warning">
                        ⚠️ Blood type not set - cannot determine compatibility
                      </div>
                    )}
                    
                    <div className="request-header">
                      <div className="blood-type-badge" style={{backgroundColor: getUrgencyColor(request.urgency)}}>
                        {request.bloodType}
                      </div>
                      <span className={`urgency-badge ${request.urgency}`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="request-content">
                      <h3>{request.bloodBankId?.bankName || "Unknown Blood Bank"}</h3>
                      <p className="request-description">{request.description}</p>
                      
                      <div className="request-details">
                        <div className="detail-item">
                          <strong>Units Needed:</strong> {request.unitsNeeded}
                        </div>
                        <div className="detail-item">
                          <strong>Location:</strong> {request.bloodBankId?.address || "N/A"}
                        </div>
                        <div className="detail-item">
                          <strong>Contact:</strong> {request.contactInfo || request.bloodBankId?.phone || "N/A"}
                        </div>
                        <div className="detail-item">
                          <strong>Posted:</strong> {new Date(request.postedDate).toLocaleDateString()}
                        </div>
                        <div className="detail-item">
                          <strong>Applications:</strong> {request.applicationsReceived || 0}
                        </div>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button 
                        onClick={() => handleApplyForDonation(request)}
                        className={`apply-btn ${canApply ? 'compatible-btn' : 'incompatible-btn'}`}
                        disabled={!canApply}
                      >
                        {!donorBloodGroup ? 'Set Blood Type' : 
                         !compatible ? 'Not Compatible' : 
                         !canDonate(applicationForm.lastDonationDate) ? 'Not Eligible' : 
                         'Apply to Donate'}
                      </button>
                      
                      {compatible && !canDonate(applicationForm.lastDonationDate) && (
                        <small className="eligibility-warning">
                          You are not eligible to donate yet (minimum 56 days between donations)
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Blood Requests Found</h3>
              <p>
                {showOnlyCompatible && donorBloodGroup 
                  ? `No blood requests compatible with your blood type (${donorBloodGroup})`
                  : "No blood requests available at the moment"
                }
              </p>
              
              <div style={{marginTop: '20px'}}>
                <button 
                  onClick={fetchBloodRequests}
                  className="refresh-btn"
                  style={{
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  Refresh Requests
                </button>
                
                {showOnlyCompatible && (
                  <button 
                    onClick={() => setShowOnlyCompatible(false)}
                    className="refresh-btn"
                    style={{
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Show All Requests
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blood Banks Section */}
      {activeTab === "bloodBanks" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Find Blood Banks</h2>
            <p>Locate nearby blood banks and donation centers</p>
          </div>

          <div className="blood-banks-grid">
            {bloodBanks.map((bank) => (
              <div key={bank._id} className="bank-card">
                <h3>{bank.bankName}</h3>
                <p className="address">📍 {bank.address}</p>
                <p className="phone">📞 {bank.phone}</p>
                {bank.email && <p className="email">📧 {bank.email}</p>}
                {bank.hours && <p className="hours">🕒 {bank.hours}</p>}
                
                <div className="bank-actions">
                  <button 
                    onClick={() => {
                      // Navigate to blood requests filtered by this bank
                      setActiveTab("bloodRequests");
                    }}
                    className="primary-btn"
                  >
                    View Requests
                  </button>
                </div>
              </div>
            ))}
          </div>

          {bloodBanks.length === 0 && (
            <div className="empty-state">
              <p>No blood banks found.</p>
            </div>
          )}
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Apply to Donate Blood</h3>
              <button 
                onClick={() => setShowApplicationForm(false)}
                className="close-modal"
              >
              </button>
            </div>
            
            <form onSubmit={handleSubmitApplication} className="application-form">
              <div className="form-group">
                <label>Blood Bank</label>
                <input 
                  type="text" 
                  value={selectedRequest?.bloodBankId.bankName} 
                  disabled 
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Blood Type Needed</label>
                <input 
                  type="text" 
                  value={selectedRequest?.bloodType} 
                  disabled 
                  className="disabled-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    value={applicationForm.donorName}
                    onChange={(e) => setApplicationForm({...applicationForm, donorName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Your Blood Type *</label>
                  <input
                    type="text"
                    value={applicationForm.bloodType}
                    onChange={(e) => setApplicationForm({...applicationForm, bloodType: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={applicationForm.donorEmail}
                    onChange={(e) => setApplicationForm({...applicationForm, donorEmail: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={applicationForm.donorPhone}
                    onChange={(e) => setApplicationForm({...applicationForm, donorPhone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Units to Donate *</label>
                <select
                  value={applicationForm.units}
                  onChange={(e) => setApplicationForm({...applicationForm, units: e.target.value})}
                  required
                >
                  <option value={1}>1 Unit</option>
                  <option value={2}>2 Units</option>
                </select>
              </div>

              <div className="form-group">
                <label>Last Donation Date</label>
                <input
                  type="date"
                  value={applicationForm.lastDonationDate}
                  onChange={(e) => setApplicationForm({...applicationForm, lastDonationDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Health Conditions (if any)</label>
                <textarea
                  placeholder="List any health conditions, medications, or recent illnesses..."
                  value={applicationForm.healthConditions}
                  onChange={(e) => setApplicationForm({...applicationForm, healthConditions: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Additional Message</label>
                <textarea
                  placeholder="Any additional information for the blood bank..."
                  value={applicationForm.message}
                  onChange={(e) => setApplicationForm({...applicationForm, message: e.target.value})}
                  rows="2"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Submit Application
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowApplicationForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default DonorDashboard;