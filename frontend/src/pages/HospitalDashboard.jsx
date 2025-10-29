import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./HospitalDashboard.css";

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bloodAvailability");
  const [bloodBanks, setBloodBanks] = useState([]);
  const [bloodStock, setBloodStock] = useState([]);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedBloodBank, setSelectedBloodBank] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("");
  const [requestForm, setRequestForm] = useState({
    bloodBankId: "",
    bloodType: "",
    units: "",
    urgency: "normal",
    patientDetails: "",
    requiredBy: "",
    notes: ""
  });

  const hospitalId = localStorage.getItem("hospitalId");
  const hospitalName = localStorage.getItem("hospitalName");

  // Fetch functions with useCallback
  const fetchBloodBanks = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bloodbank");
      const data = await res.json();
      setBloodBanks(data);
    } catch (err) {
      console.error("Blood banks fetch error:", err);
    }
  }, []);

  const fetchBloodStock = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stock");
      const data = await res.json();
      setBloodStock(data);
    } catch (err) {
      console.error("Blood stock fetch error:", err);
    }
  }, []);

  const fetchHospitalRequests = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/hospital-requests/hospital/${hospitalId}`);
      const data = await res.json();
      setHospitalRequests(data);
    } catch (err) {
      console.error("Hospital requests fetch error:", err);
    }
  }, [hospitalId]);

  useEffect(() => {
    if (!hospitalId || hospitalId === "undefined") {
      navigate("/login");
      return;
    }
    fetchBloodBanks();
    fetchBloodStock();
    fetchHospitalRequests();
  }, [hospitalId, navigate, fetchBloodBanks, fetchBloodStock, fetchHospitalRequests]);

  const handleRequestBlood = (bloodBank = null) => {
    if (bloodBank) {
      setSelectedBloodBank(bloodBank);
      setRequestForm(prev => ({
        ...prev,
        bloodBankId: bloodBank._id
      }));
    }
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    const payload = {
      hospitalId: hospitalId,
      bloodBankId: selectedBloodBank ? selectedBloodBank._id : requestForm.bloodBankId,
      bloodType: requestForm.bloodType,
      units: Number(requestForm.units),
      urgency: requestForm.urgency,
      patientDetails: requestForm.patientDetails,
      requiredBy: requestForm.requiredBy,
      notes: requestForm.notes
    };

    try {
      const res = await fetch("http://localhost:5000/api/hospital-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (res.ok) {
        alert("Blood request submitted successfully! The blood bank will process your request.");
        setShowRequestForm(false);
        setSelectedBloodBank(null);
        setRequestForm({
          bloodBankId: "",
          bloodType: "",
          units: "",
          urgency: "normal",
          patientDetails: "",
          requiredBy: "",
          notes: ""
        });
        fetchHospitalRequests();
      } else {
        alert(data.message || "Request submission failed");
      }
    } catch (error) {
      console.error("Request submission error:", error);
      alert("Server error while submitting request");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Filter blood stock based on search and filters
  const filteredBloodStock = bloodStock.filter(item =>
    (item.bloodBankId?.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.bloodType.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (bloodTypeFilter === "" || item.bloodType === bloodTypeFilter)
  );

  // Group blood stock by blood bank for better display
  const groupedBloodStock = filteredBloodStock.reduce((groups, item) => {
    const bankName = item.bloodBankId?.bankName || "Unknown Bank";
    if (!groups[bankName]) {
      groups[bankName] = [];
    }
    groups[bankName].push(item);
    return groups;
  }, {});

  const getStockLevelColor = (units) => {
    if (units >= 10) return '#27ae60'; // Green - Good
    if (units >= 5) return '#f39c12';  // Orange - Moderate
    return '#e74c3c'; // Red - Low
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'critical': return '#e74c3c';
      case 'urgent': return '#f39c12';
      case 'normal': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-info">
          <h1>Hospital Dashboard</h1>
          <p>{hospitalName} - Medical Services</p>
        </div>
        <div className="header-actions">
          <span>Hospital Portal</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === "bloodAvailability" ? "active" : ""} 
          onClick={() => setActiveTab("bloodAvailability")}
        >
          Blood Availability
        </button>
        <button 
          className={activeTab === "requestHistory" ? "active" : ""} 
          onClick={() => setActiveTab("requestHistory")}
        >
          Request History ({hospitalRequests.length})
        </button>
        <button 
          className={activeTab === "bloodBanks" ? "active" : ""} 
          onClick={() => setActiveTab("bloodBanks")}
        >
          Blood Banks
        </button>
      </nav>

      {/* Blood Availability Section */}
      {activeTab === "bloodAvailability" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Available Blood Stock</h2>
            <p>Search and view available blood units from all registered blood banks</p>
            <button 
              onClick={() => setActiveTab("bloodBanks")}
              className="request-blood-btn"
            >
              📋 Request Blood
            </button>
          </div>

          {/* Search and Filter */}
          <div className="search-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by blood bank name or blood type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <select
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Blood Types</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Blood Stock Display */}
          <div className="blood-stock-section">
            {Object.keys(groupedBloodStock).length > 0 ? (
              Object.entries(groupedBloodStock).map(([bankName, stocks]) => (
                <div key={bankName} className="blood-bank-stock">
                  <div className="bank-header">
                    <h3>{bankName}</h3>
                    <div className="bank-contact">
                      <span>📞 {stocks[0]?.bloodBankId?.phone || "N/A"}</span>
                      <button 
                        onClick={() => handleRequestBlood(bloodBanks.find(bank => bank.bankName === bankName))}
                        className="request-btn-small"
                      >
                        Request Blood
                      </button>
                    </div>
                  </div>
                  
                  <div className="stock-grid">
                    {stocks.map((stock, index) => (
                      <div key={index} className="stock-item">
                        <div className="blood-type">{stock.bloodType}</div>
                        <div 
                          className="units-display"
                          style={{ color: getStockLevelColor(stock.units) }}
                        >
                          {stock.units} Units
                        </div>
                        <div className="stock-status">
                          {stock.units >= 10 ? 'Good' : stock.units >= 5 ? 'Moderate' : 'Low'}
                        </div>
                        <div className="last-updated">
                          Updated: {new Date(stock.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No blood stock found matching your search criteria.</p>
                <p>Try adjusting your search or check back later.</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <h3>Total Blood Banks</h3>
              <p>{bloodBanks.length}</p>
            </div>
            <div className="stat-card">
              <h3>Available Blood Types</h3>
              <p>{new Set(bloodStock.map(item => item.bloodType)).size}</p>
            </div>
            <div className="stat-card">
              <h3>Total Units Available</h3>
              <p>{bloodStock.reduce((sum, item) => sum + item.units, 0)}</p>
            </div>
            <div className="stat-card">
              <h3>Your Active Requests</h3>
              <p>{hospitalRequests.filter(req => req.status === "pending").length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Request History Section */}
      {activeTab === "requestHistory" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Blood Request History</h2>
            <p>Track your blood requests and their status</p>
          </div>

          <div className="requests-table">
            <table>
              <thead>
                <tr>
                  <th>Blood Bank</th>
                  <th>Blood Type</th>
                  <th>Units</th>
                  <th>Urgency</th>
                  <th>Patient Details</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {hospitalRequests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.bloodBankId?.bankName || "N/A"}</td>
                    <td>{request.bloodType}</td>
                    <td>{request.units}</td>
                    <td>
                      <span 
                        className="urgency-badge"
                        style={{backgroundColor: getUrgencyColor(request.urgency)}}
                      >
                        {request.urgency}
                      </span>
                    </td>
                    <td className="patient-details">
                      {request.patientDetails}
                    </td>
                    <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      {request.status === "approved" && request.deliveryDate && (
                        <div className="request-details">
                          <strong>Delivered:</strong> {new Date(request.deliveryDate).toLocaleDateString()}
                        </div>
                      )}
                      {request.status === "rejected" && request.rejectionReason && (
                        <div className="request-details">
                          <strong>Reason:</strong> {request.rejectionReason}
                        </div>
                      )}
                      {request.status === "pending" && (
                        <div className="request-details">
                          Awaiting blood bank response
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Request Statistics */}
          <div className="request-stats">
            <div className="stat-card">
              <h3>Total Requests</h3>
              <p>{hospitalRequests.length}</p>
            </div>
            <div className="stat-card">
              <h3>Approved</h3>
              <p>{hospitalRequests.filter(req => req.status === "approved").length}</p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p>{hospitalRequests.filter(req => req.status === "pending").length}</p>
            </div>
            <div className="stat-card">
              <h3>Success Rate</h3>
              <p>
                {hospitalRequests.length > 0 
                  ? `${((hospitalRequests.filter(req => req.status === "approved").length / hospitalRequests.length) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
          </div>

          {hospitalRequests.length === 0 && (
            <div className="empty-state">
              <p>No blood requests submitted yet.</p>
              <p>Go to Blood Availability to request blood from blood banks.</p>
            </div>
          )}
        </div>
      )}

      {/* Blood Banks Section */}
      {activeTab === "bloodBanks" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Registered Blood Banks</h2>
            <p>Contact information for all registered blood banks</p>
          </div>

          <div className="blood-banks-list">
            {bloodBanks.map((bank) => (
              <div key={bank._id} className="blood-bank-card">
                <div className="bank-main-info">
                  <h3>{bank.bankName}</h3>
                  <p className="bank-address">📍 {bank.address}</p>
                </div>
                
                <div className="bank-contact-info">
                  <div className="contact-item">
                    <strong>Phone:</strong> {bank.phone}
                  </div>
                  {bank.email && (
                    <div className="contact-item">
                      <strong>Email:</strong> {bank.email}
                    </div>
                  )}
                  {bank.hours && (
                    <div className="contact-item">
                      <strong>Hours:</strong> {bank.hours}
                    </div>
                  )}
                </div>

                <div className="bank-actions">
                  <button 
                    onClick={() => handleRequestBlood(bank)}
                    className="request-btn"
                  >
                    Request Blood
                  </button>
                  <button 
                    className="contact-btn"
                    onClick={() => window.open(`tel:${bank.phone}`)}
                  >
                    📞 Call Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {bloodBanks.length === 0 && (
            <div className="empty-state">
              <p>No blood banks registered yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {selectedBloodBank 
                  ? `Request Blood from ${selectedBloodBank.bankName}`
                  : 'Send Blood Request'
                }
              </h3>
              <button 
                onClick={() => {
                  setShowRequestForm(false);
                  setSelectedBloodBank(null);
                }}
                className="close-modal"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="blood-request-form">
              {selectedBloodBank && (
                <div className="form-group">
                  <label>Blood Bank</label>
                  <input 
                    type="text" 
                    value={selectedBloodBank.bankName} 
                    disabled 
                    className="disabled-input"
                  />
                </div>
              )}

              {!selectedBloodBank && (
                <div className="form-group">
                  <label>Select Blood Bank *</label>
                  <select
                    value={requestForm.bloodBankId}
                    onChange={(e) => setRequestForm({...requestForm, bloodBankId: e.target.value})}
                    required
                  >
                    <option value="">Select Blood Bank</option>
                    {bloodBanks.map(bank => (
                      <option key={bank._id} value={bank._id}>{bank.bankName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Blood Type Needed *</label>
                  <select
                    value={requestForm.bloodType}
                    onChange={(e) => setRequestForm({...requestForm, bloodType: e.target.value})}
                    required
                  >
                    <option value="">Select Blood Type</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Units Required *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={requestForm.units}
                    onChange={(e) => setRequestForm({...requestForm, units: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Urgency Level *</label>
                  <select
                    value={requestForm.urgency}
                    onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}
                    required
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Required By Date</label>
                  <input
                    type="datetime-local"
                    value={requestForm.requiredBy}
                    onChange={(e) => setRequestForm({...requestForm, requiredBy: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Patient Details *</label>
                <textarea
                  placeholder="Enter patient information, medical condition, and reason for blood requirement..."
                  value={requestForm.patientDetails}
                  onChange={(e) => setRequestForm({...requestForm, patientDetails: e.target.value})}
                  required
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  placeholder="Any special requirements or additional information..."
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({...requestForm, notes: e.target.value})}
                  rows="2"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Submit Blood Request
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowRequestForm(false);
                    setSelectedBloodBank(null);
                  }}
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

export default HospitalDashboard;