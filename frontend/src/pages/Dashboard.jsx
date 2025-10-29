import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleSearchBlood = () => {
    navigate("/blood-search");
  };

  return (
    <div className="dashboard">

      {/* Hero Section */}
      <section className="hero">
        <h1>Donate Blood, Save Lives</h1>
        <p>Every drop counts! Your small act can make a big difference.</p>
        <div className="cta-buttons">
          <button className="btn search" onClick={handleSearchBlood}>
            🔍 Search Blood
          </button>
          <Link to="/register">
            <button className="btn donor">Become a Donor</button>
          </Link>
        </div>
      </section>

      {/* Quick Blood Search Preview */}
      <section className="quick-search">
        <h2>Need Blood Urgently?</h2>
        <p>Find available blood units from registered blood banks instantly</p>
        <div className="search-features">
          <div className="feature-card">
            <div className="feature-icon">🩸</div>
            <h3>Real-time Availability</h3>
            <p>Live blood stock updates from all blood banks</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Location Based</h3>
            <p>Find blood banks near you with available stock</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Search</h3>
            <p>Filter by blood type, location, and stock levels</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📞</div>
            <h3>Direct Contact</h3>
            <p>Get blood bank contact details instantly</p>
          </div>
        </div>
        <button className="btn search-large" onClick={handleSearchBlood}>
          🔍 Search Blood Availability Now
        </button>
      </section>

      {/* Blood Compatibility */}
      <section className="compatibility">
        <h2>Blood Group Compatibility Chart</h2>
        <div className="compatibility-note">
          <p>💡 <strong>Tip:</strong> Use our blood search feature to find compatible blood types available near you!</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Blood Group</th>
              <th>Can Donate To</th>
              <th>Can Receive From</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>O−</td><td>All blood groups</td><td>O−</td></tr>
            <tr><td>O+</td><td>All positive blood groups</td><td>O+, O−</td></tr>
            <tr><td>A−</td><td>A−, A+, AB−, AB+</td><td>A−, O−</td></tr>
            <tr><td>A+</td><td>A+, AB+</td><td>A+, A−, O+, O−</td></tr>
            <tr><td>B−</td><td>B−, B+, AB−, AB+</td><td>B−, O−</td></tr>
            <tr><td>B+</td><td>B+, AB+</td><td>B+, B−, O+, O−</td></tr>
            <tr><td>AB−</td><td>AB−, AB+</td><td>A−, B−, AB−, O−</td></tr>
            <tr><td>AB+</td><td>AB+</td><td>All blood groups</td></tr>
          </tbody>
        </table>
      </section>

      {/* Post Donation Guidelines */}
      <section className="guidelines">
        <h2>Post-Donation Guidelines</h2>
        <ul>
          <li>Rest for at least 10–15 minutes after donating.</li>
          <li>Drink plenty of water or juice to stay hydrated.</li>
          <li>Avoid heavy exercise for 24 hours.</li>
          <li>Eat a healthy meal after donation.</li>
          <li>Contact a doctor if you feel dizzy or weak.</li>
        </ul>
      </section>

      {/* Emergency Section */}
      <section className="emergency-section">
        <div className="emergency-content">
          <h2>🆘 Emergency Blood Need?</h2>
          <p>If you need blood urgently, use our search feature to find available blood units and contact blood banks directly.</p>
          <button className="btn emergency" onClick={handleSearchBlood}>
            🚨 Search Emergency Blood
          </button>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;