import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <Link to="/" className="app-logo-link">
        Plowing Service Booking
      </Link>
      <nav className="app-nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/dashboard/status">Request Status</Link>
        {user?.role === 'admin' && (
          <>
            <Link to="/admin/requests">Incoming requests</Link>
            <Link to="/admin/invoices">Invoices</Link>
            <Link to="/admin/crew">Crew</Link>
          </>
        )}
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </nav>
    </header>
  );
}

export default Header;
