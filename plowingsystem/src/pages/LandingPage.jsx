import { Link } from 'react-router-dom';

/**
 * Landing page: role entry – Property Owner vs Plowing Company Admin.
 * No auth yet; routing and visible entry points only.
 */
function LandingPage() {
  return (
    <div className="landing-page">
      <h1>Plowing Service Booking Platform</h1>
      <p>Secure reliable snow removal when you need it most.</p>
      <div className="landing-actions">
        <Link to="/login" className="landing-btn primary">
          Book plowing (Property Owner)
        </Link>
        <Link to="/admin/requests" className="landing-btn secondary">
          Company admin (Plowing Company)
        </Link>
      </div>
      <p className="landing-register">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}

export default LandingPage;
