import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./BloodBankDashboard.css";

const BloodBankDashboard = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [newStock, setNewStock] = useState({ bloodType: "", units: "" });
  const [donationApplications, setDonationApplications] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("inventory");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [bloodRequestForm, setBloodRequestForm] = useState({
    bloodType: "",
    unitsNeeded: "",
    urgency: "normal",
    description: "",
    contactInfo: ""
  });

  const bankId = localStorage.getItem("bloodBankId");
  const bankName = localStorage.getItem("bloodBankName");

  // Fetch functions with useCallback to prevent infinite re-renders
  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/stock/${bankId}`);
      const data = await res.json();
      setStock(data);
    } catch (err) {
      console.error("Stock fetch error:", err);
    }
  }, [bankId]);

  const fetchDonationApplications = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/donation-applications/bank/${bankId}`);
      const data = await res.json();
      setDonationApplications(data);
    } catch (err) {
      console.error("Applications fetch error:", err);
    }
  }, [bankId]);

  const fetchBloodRequests = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/blood-requests/bank/${bankId}`);
      const data = await res.json();
      setBloodRequests(data);
    } catch (err) {
      console.error("Blood requests fetch error:", err);
    }
  }, [bankId]);

  const fetchHospitalRequests = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/hospital-requests/bank/${bankId}`);
      const data = await res.json();
      setHospitalRequests(data);
    } catch (err) {
      console.error("Hospital requests fetch error:", err);
    }
  }, [bankId]);

  useEffect(() => {
    if (!bankId || bankId === "undefined") {
      navigate("/login");
      return;
    }
    fetchStock();
    fetchDonationApplications();
    fetchBloodRequests();
    fetchHospitalRequests();
  }, [bankId, navigate, fetchStock, fetchDonationApplications, fetchBloodRequests, fetchHospitalRequests]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!bankId || bankId === "undefined") {
      alert("Invalid blood bank ID. Please log in again.");
      navigate("/login");
      return;
    }

    const payload = {
      bloodBankId: bankId,
      bloodType: newStock.bloodType,
      units: Number(newStock.units),
    };

    try {
      const res = await fetch("http://localhost:5000/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data.message);
      fetchStock();
      setNewStock({ bloodType: "", units: "" });
    } catch (error) {
      console.error("Add stock error:", error);
      alert("Server error while adding stock");
    }
  };

  const handlePostBloodRequest = async (e) => {
    e.preventDefault();
    
    const payload = {
      bloodBankId: bankId,
      bloodType: bloodRequestForm.bloodType,
      unitsNeeded: Number(bloodRequestForm.unitsNeeded),
      urgency: bloodRequestForm.urgency,
      description: bloodRequestForm.description,
      contactInfo: bloodRequestForm.contactInfo
    };

    try {
      const url = editingRequest 
        ? `http://localhost:5000/api/blood-requests/${editingRequest._id}`
        : "http://localhost:5000/api/blood-requests";
      
      const method = editingRequest ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await res.json();
      alert(editingRequest ? "Blood request updated successfully!" : "Blood request posted successfully!");
      fetchBloodRequests();
      
      setBloodRequestForm({
        bloodType: "",
        unitsNeeded: "",
        urgency: "normal",
        description: "",
        contactInfo: ""
      });
      setShowRequestForm(false);
      setEditingRequest(null);
    } catch (error) {
      console.error("Post blood request error:", error);
      alert("Server error while posting request");
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const payload = { status: action };
      if (action === "approved") {
        payload.donationDate = new Date().toISOString().split('T')[0];
      }

      const res = await fetch(`http://localhost:5000/api/donation-applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await res.json();
      alert(`Application ${action} successfully`);
      fetchDonationApplications();
      
      // If approved, update blood stock
      if (action === "approved") {
        const application = donationApplications.find(app => app._id === applicationId);
        if (application) {
          await updateBloodStock(application.bloodType, application.units);
          await updateBloodRequest(application.requestId._id, application.units);
        }
      }
    } catch (error) {
      console.error("Application action error:", error);
      alert("Server error while updating application");
    }
  };

  const handleHospitalRequestAction = async (requestId, action) => {
    try {
      const payload = { status: action };
      if (action === "approved") {
        payload.deliveryDate = new Date().toISOString().split('T')[0];
      } else if (action === "rejected") {
        payload.rejectionReason = "Insufficient stock available";
      }

      const res = await fetch(`http://localhost:5000/api/hospital-requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await res.json();
      alert(`Hospital request ${action} successfully`);
      fetchHospitalRequests();
    } catch (error) {
      console.error("Hospital request action error:", error);
      alert("Server error while updating request");
    }
  };

  const updateBloodStock = async (bloodType, units) => {
    try {
      const payload = {
        bloodBankId: bankId,
        bloodType: bloodType,
        units: Number(units),
      };

      await fetch("http://localhost:5000/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      fetchStock();
    } catch (error) {
      console.error("Update stock error:", error);
    }
  };

  const updateBloodRequest = async (requestId, donatedUnits) => {
    try {
      const request = bloodRequests.find(req => req._id === requestId);
      if (request) {
        const remainingUnits = request.unitsNeeded - donatedUnits;
        
        if (remainingUnits <= 0) {
          await fetch(`http://localhost:5000/api/blood-requests/${requestId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "fulfilled", unitsNeeded: 0 }),
          });
        } else {
          await fetch(`http://localhost:5000/api/blood-requests/${requestId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unitsNeeded: remainingUnits }),
          });
        }
        
        fetchBloodRequests();
      }
    } catch (error) {
      console.error("Update blood request error:", error);
    }
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setBloodRequestForm({
      bloodType: request.bloodType,
      unitsNeeded: request.unitsNeeded,
      urgency: request.urgency,
      description: request.description,
      contactInfo: request.contactInfo || ""
    });
    setShowRequestForm(true);
  };

  const handleCloseRequest = async (requestId) => {
    try {
      await fetch(`http://localhost:5000/api/blood-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });

      alert("Blood request closed successfully!");
      fetchBloodRequests();
    } catch (error) {
      console.error("Close request error:", error);
      alert("Server error while closing request");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const activeBloodRequests = bloodRequests.filter(req => req.status === "active");
  const pendingHospitalRequests = hospitalRequests.filter(req => req.status === "pending");
  const pendingDonationApplications = donationApplications.filter(app => app.status === "pending");

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-info">
          <h1>{bankName} Dashboard</h1>
          <p>Blood Bank Management System</p>
        </div>
        <div className="header-actions">
          <span>Welcome, {bankName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === "inventory" ? "active" : ""} 
          onClick={() => setActiveTab("inventory")}
        >
          Blood Inventory
        </button>
        <button 
          className={activeTab === "requests" ? "active" : ""} 
          onClick={() => setActiveTab("requests")}
        >
          Request Blood ({activeBloodRequests.length})
        </button>
        <button 
          className={activeTab === "applications" ? "active" : ""} 
          onClick={() => setActiveTab("applications")}
        >
          Donation Applications ({pendingDonationApplications.length})
        </button>
        <button 
          className={activeTab === "hospitalRequests" ? "active" : ""} 
          onClick={() => setActiveTab("hospitalRequests")}
        >
          Hospital Requests ({pendingHospitalRequests.length})
        </button>
      </nav>

      {/* Inventory Section */}
      {activeTab === "inventory" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Blood Inventory Management</h2>
            <button 
              onClick={() => setActiveTab("requests")}
              className="request-blood-btn"
            >
              📢 Request Blood from Donors
            </button>
          </div>

          {/* Current Stock */}
          <div className="stock-section">
            <h3>Current Blood Stock</h3>
            <div className="stock-grid">
              {stock.length > 0 ? (
                stock.map((item) => (
                  <div key={item._id} className={`stock-card ${item.units < 3 ? 'critical' : item.units < 5 ? 'low-stock' : ''}`}>
                    <div className="blood-type">{item.bloodType}</div>
                    <div className="units">{item.units} Units</div>
                    <div className="stock-status">
                      {item.units < 3 ? 'CRITICAL' : item.units < 5 ? 'LOW' : 'SUFFICIENT'}
                    </div>
                    <div className="last-updated">
                      Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No blood stock available. Add your first blood units!</p>
                </div>
              )}
            </div>
          </div>

          {/* Add/Update Stock */}
          <div className="add-stock-section">
            <h3>Add / Update Blood Stock</h3>
            <form onSubmit={handleAddStock} className="stock-form">
              <div className="form-group">
                <select
                  value={newStock.bloodType}
                  onChange={(e) => setNewStock({ ...newStock, bloodType: e.target.value })}
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
                <input
                  type="number"
                  placeholder="Units   (Use '-' sign to reduce from the available stock)"
                  value={newStock.units}
                  onChange={(e) => setNewStock({ ...newStock, units: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">Add / Update Stock</button>
            </form>
          </div>
        </div>
      )}

      {/* Blood Requests Section */}
      {activeTab === "requests" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Request Blood from Donors</h2>
            <p>Post blood requests that donors can see and apply for</p>
          </div>

          {!showRequestForm ? (
            <>
              <button 
                onClick={() => {
                  setEditingRequest(null);
                  setBloodRequestForm({
                    bloodType: "",
                    unitsNeeded: "",
                    urgency: "normal",
                    description: "",
                    contactInfo: ""
                  });
                  setShowRequestForm(true);
                }}
                className="post-request-btn"
              >
                ➕ Post New Blood Request
              </button>

              <div className="blood-requests-list">
                <h3>Your Blood Requests</h3>
                
                {activeBloodRequests.length > 0 ? (
                  activeBloodRequests.map((request) => (
                    <div key={request._id} className="blood-request-card">
                      <div className="request-header">
                        <h4>{request.bloodType} Blood Needed - {request.unitsNeeded} Units</h4>
                        <span className={`urgency-badge ${request.urgency}`}>
                          {request.urgency.toUpperCase()}
                        </span>
                      </div>
                      <div className="request-details">
                        <p><strong>Description:</strong> {request.description}</p>
                        <p><strong>Posted:</strong> {new Date(request.postedDate).toLocaleDateString()}</p>
                        <p><strong>Applications Received:</strong> {request.applicationsReceived}</p>
                        {request.contactInfo && (
                          <p><strong>Contact:</strong> {request.contactInfo}</p>
                        )}
                      </div>
                      <div className="request-actions">
                        <button 
                          onClick={() => handleEditRequest(request)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCloseRequest(request._id)}
                          className="close-btn"
                        >
                          Close Request
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No active blood requests. Post your first request to get donations!</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="request-form-section">
              <h3>{editingRequest ? 'Edit Blood Request' : 'Post New Blood Request'}</h3>
              <form onSubmit={handlePostBloodRequest} className="blood-request-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Blood Type Needed *</label>
                    <select
                      value={bloodRequestForm.bloodType}
                      onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, bloodType: e.target.value })}
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
                    <label>Units Needed *</label>
                    <input
                      type="number"
                      min="1"
                      value={bloodRequestForm.unitsNeeded}
                      onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, unitsNeeded: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Urgency Level</label>
                  <select
                    value={bloodRequestForm.urgency}
                    onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, urgency: e.target.value })}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    placeholder="Explain why you need this blood (e.g., 'Emergency surgery', 'Regular stock replenishment')"
                    value={bloodRequestForm.description}
                    onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, description: e.target.value })}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Information</label>
                  <input
                    type="text"
                    placeholder="Phone number or email for donors to contact"
                    value={bloodRequestForm.contactInfo}
                    onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, contactInfo: e.target.value })}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editingRequest ? 'Update Request' : 'Post Blood Request'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowRequestForm(false);
                      setEditingRequest(null);
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Donation Applications Section */}
      {activeTab === "applications" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Donation Applications</h2>
            <p>Review and manage donation applications from donors</p>
          </div>

          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Donor Name</th>
                  <th>Blood Type</th>
                  <th>Contact</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donationApplications.map((application) => (
                  <tr key={application._id}>
                    <td>{application.donorId?.name || "N/A"}</td>
                    <td>{application.bloodType}</td>
                    <td>
                      <div className="contact-info">
                        <div>📞 {application.donorId?.phone || "N/A"}</div>
                        <div>📧 {application.donorId?.email || "N/A"}</div>
                      </div>
                    </td>
                    <td>{new Date(application.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${application.status}`}>
                        {application.status}
                      </span>
                    </td>
                    <td>
                      {application.status === "pending" && (
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleApplicationAction(application._id, "approved")}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleApplicationAction(application._id, "rejected")}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {application.status === "approved" && (
                        <span className="approved-text">✅ Approved</span>
                      )}
                      {application.status === "rejected" && (
                        <span className="rejected-text">❌ Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {donationApplications.length === 0 && (
            <div className="empty-state">
              <p>No donation applications received yet.</p>
              <p>Post blood requests to receive applications from donors.</p>
            </div>
          )}
        </div>
      )}

      {/* Hospital Requests Section */}
      {activeTab === "hospitalRequests" && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Hospital Blood Requests</h2>
            <p>Review and manage blood requests from hospitals</p>
          </div>

          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Blood Type</th>
                  <th>Units</th>
                  <th>Patient Details</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hospitalRequests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.hospitalId?.hospitalName}</td>
                    <td>{request.bloodType}</td>
                    <td>{request.units}</td>
                    <td className="patient-details">{request.patientDetails}</td>
                    <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      {request.status === "pending" && (
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleHospitalRequestAction(request._id, "approved")}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleHospitalRequestAction(request._id, "rejected")}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status === "approved" && (
                        <span className="approved-text">✅ Approved</span>
                      )}
                      {request.status === "rejected" && (
                        <span className="rejected-text">❌ Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hospitalRequests.length === 0 && (
            <div className="empty-state">
              <p>No hospital requests received yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BloodBankDashboard;