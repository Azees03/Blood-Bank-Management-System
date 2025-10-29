import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./BloodSearchDashboard.css";

const BloodSearchDashboard = () => {
  const navigate = useNavigate();
  const [bloodStock, setBloodStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodType: "",
    location: "",
    minUnits: 0,
    urgency: ""
  });

  // Fetch all blood stock data
  const fetchBloodStock = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching blood stock data...");
      const res = await fetch("http://localhost:5000/api/stock");
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("✅ Fetched blood stock:", data);
      console.log("📊 Total blood banks found:", new Set(data.map(item => item.bloodBankId?._id)).size);
      setBloodStock(data);
      setFilteredStock(data);
    } catch (err) {
      console.error("❌ Blood stock fetch error:", err);
      alert("Failed to load blood availability data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBloodStock();
  }, [fetchBloodStock]);

  // Apply filters whenever filters or data changes
  useEffect(() => {
    let filtered = [...bloodStock];

    // Filter by blood type
    if (filters.bloodType) {
      filtered = filtered.filter(item => item.bloodType === filters.bloodType);
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(item => 
        item.bloodBankId?.address?.toLowerCase().includes(filters.location.toLowerCase()) ||
        item.bloodBankId?.bankName?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by minimum units
    if (filters.minUnits > 0) {
      filtered = filtered.filter(item => item.units >= filters.minUnits);
    }

    // Filter by urgency (stock level)
    if (filters.urgency) {
      filtered = filtered.filter(item => {
        const stockLevel = getStockLevel(item.units);
        return stockLevel === filters.urgency;
      });
    }

    setFilteredStock(filtered);
  }, [filters, bloodStock]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      bloodType: "",
      location: "",
      minUnits: 0,
      urgency: ""
    });
  };

  const getStockLevel = (units) => {
    if (units >= 10) return 'high';
    if (units >= 5) return 'medium';
    return 'low';
  };

  const getStockLevelColor = (units) => {
    const level = getStockLevel(units);
    switch(level) {
      case 'high': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'low': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStockLevelText = (units) => {
    const level = getStockLevel(units);
    switch(level) {
      case 'high': return 'High Stock';
      case 'medium': return 'Medium Stock';
      case 'low': return 'Low Stock';
      default: return 'Out of Stock';
    }
  };

  const handleRequestBlood = (bloodBankId, bloodType) => {
    const userRole = localStorage.getItem("role");
    
    if (userRole === "hospital") {
      // Redirect to hospital request form
      navigate("/hospital/dashboard", { 
        state: { 
          preSelectedBank: bloodBankId,
          preSelectedType: bloodType 
        } 
      });
    } else if (userRole === "donor") {
      alert("Please Contact the respective Blood Bank through Phone or Email.");
    } else {
      alert("Please login to request blood.");
      navigate("/login");
    }
  };

  const handleRefresh = () => {
    fetchBloodStock();
  };

  // Group stock by blood bank for better display
  const groupedStock = filteredStock.reduce((groups, item) => {
    const bankId = item.bloodBankId?._id;
    if (!bankId) return groups;

    if (!groups[bankId]) {
      groups[bankId] = {
        bankInfo: item.bloodBankId,
        stock: []
      };
    }
    
    groups[bankId].stock.push(item);
    return groups;
  }, {});

  // Get unique blood banks count
  const uniqueBloodBanks = new Set(bloodStock.map(item => item.bloodBankId?._id)).size;
  const showingBloodBanks = new Set(filteredStock.map(item => item.bloodBankId?._id)).size;

  return (
    <div className="blood-search-dashboard">
      {/* Header */}
      <header className="search-header">
        <div className="header-content">
          <h1>🔍 Search Blood Availability</h1>
          <p>Find available blood units from registered blood banks</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Refresh Data
          </button>
          <button onClick={() => navigate("/")} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Search and Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          {/* Blood Type Filter */}
          <div className="filter-group">
            <label>Blood Type</label>
            <select
              value={filters.bloodType}
              onChange={(e) => handleFilterChange('bloodType', e.target.value)}
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

          {/* Location Filter */}
          <div className="filter-group">
            <label>Location / Blood Bank</label>
            <input
              type="text"
              placeholder="Search by location or blood bank name..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          {/* Minimum Units Filter */}
          <div className="filter-group">
            <label>Minimum Units Available</label>
            <select
              value={filters.minUnits}
              onChange={(e) => handleFilterChange('minUnits', parseInt(e.target.value))}
            >
              <option value={0}>Any Quantity</option>
              <option value={1}>1+ Units</option>
              <option value={5}>5+ Units</option>
              <option value={10}>10+ Units</option>
            </select>
          </div>

          {/* Urgency/Stock Level Filter */}
          <div className="filter-group">
            <label>Stock Level</label>
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange('urgency', e.target.value)}
            >
              <option value="">All Stock Levels</option>
              <option value="high">High Stock (10+ units)</option>
              <option value="medium">Medium Stock (5-9 units)</option>
              <option value="low">Low Stock (1-4 units)</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-filters-btn">
            🗑️ Clear Filters
          </button>
          <div className="results-count">
            Showing {filteredStock.length} blood units from {showingBloodBanks} of {uniqueBloodBanks} blood banks
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Blood Banks</h3>
          <p>{uniqueBloodBanks}</p>
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
          <h3>Last Updated</h3>
          <p>
            {bloodStock.length > 0 
              ? new Date(Math.max(...bloodStock.map(item => new Date(item.lastUpdated))))
                  .toLocaleTimeString()
              : 'Never'
            }
          </p>
        </div>
      </div>

      {/* Blood Availability Table */}
      <div className="blood-availability-section">
        <div className="section-header">
          <h2>Available Blood Stock</h2>
          <p>Real-time blood availability from all registered blood banks</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>🔄 Loading blood availability data...</p>
          </div>
        ) : filteredStock.length > 0 ? (
          <div className="availability-table-container">
            <table className="availability-table">
              <thead>
                <tr>
                  <th>Blood Bank</th>
                  <th>Location</th>
                  <th>Blood Type</th>
                  <th>Units Available</th>
                  <th>Stock Level</th>
                  <th>Last Updated</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(groupedStock).map((bankData, index) => (
                  bankData.stock.map((item, itemIndex) => (
                    <tr key={`${bankData.bankInfo._id}-${item.bloodType}`}>
                      {itemIndex === 0 && (
                        <>
                          <td rowSpan={bankData.stock.length} className="bank-name-cell">
                            <strong>{bankData.bankInfo.bankName}</strong>
                          </td>
                          <td rowSpan={bankData.stock.length} className="bank-address-cell">
                            {bankData.bankInfo.address}
                          </td>
                        </>
                      )}
                      <td className="blood-type-cell">
                        <span className="blood-type-badge">{item.bloodType}</span>
                      </td>
                      <td className="units-cell">
                        <strong>{item.units}</strong> units
                      </td>
                      <td className="stock-level-cell">
                        <span 
                          className="stock-level-badge"
                          style={{ backgroundColor: getStockLevelColor(item.units) }}
                        >
                          {getStockLevelText(item.units)}
                        </span>
                      </td>
                      <td className="updated-cell">
                        {new Date(item.lastUpdated).toLocaleDateString()} at{' '}
                        {new Date(item.lastUpdated).toLocaleTimeString()}
                      </td>
                      <td className="contact-cell">
                        <div className="contact-info">
                          <div>📞 {bankData.bankInfo.phone}</div>
                          {bankData.bankInfo.email && (
                            <div>📧 {bankData.bankInfo.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleRequestBlood(bankData.bankInfo._id, item.bloodType)}
                          className="request-blood-btn"
                          title="Request this blood type"
                        >
                          🩸 Request
                        </button>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Blood Found</h3>
            <p>No blood units match your current filters.</p>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters to See All Available Blood
            </button>
          </div>
        )}
      </div>

      {/* Debug Information - Remove in production */}
      {!loading && (
        <div className="debug-info" style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
          border: '1px solid #ddd',
          fontSize: '14px'
        }}>
          <h4 style={{margin: '0 0 10px 0', color: '#666'}}>Debug Information:</h4>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'}}>
            <div><strong>Total Blood Banks in DB:</strong> {uniqueBloodBanks}</div>
            <div><strong>Total Stock Items:</strong> {bloodStock.length}</div>
            <div><strong>Filtered Items:</strong> {filteredStock.length}</div>
            <div><strong>Showing Banks:</strong> {showingBloodBanks}</div>
          </div>
        </div>
      )}

      {/* Emergency Information */}
      <div className="emergency-info">
        <h3>🆘 Emergency Blood Needs?</h3>
        <p>
          If you need blood urgently, please contact blood banks directly by phone for immediate assistance.
          For emergency situations, call the nearest blood bank directly.
        </p>
      </div>
    </div>
  );
};

export default BloodSearchDashboard;