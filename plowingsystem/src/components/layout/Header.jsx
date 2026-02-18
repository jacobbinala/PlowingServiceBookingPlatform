import { Link, useNavigate } from 'react-router-dom';

/**
 * App header with logo/nav and Log Out control.
 * Log Out is a placeholder until auth is implemented (#22).
 */
function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO (#22): Colleague – terminate session (clear token/session, call logout API if any), then redirect
    // Example: clearStorage(); navigate('/login');
    navigate('/login');
  };

  return (
    <header className="app-header">
      <Link to="/" className="app-logo-link">
        Plowing Service Booking
      </Link>
      <nav className="app-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin/crew">Admin</Link>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </nav>
    </header>
  );
}

export default Header;
