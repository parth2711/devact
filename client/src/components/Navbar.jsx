import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="logo-text">DevAct</span>
        </Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
            <Link to="/cp" className={isActive('/cp')}>CP</Link>
            <Link to="/repos" className={isActive('/repos')}>Repos</Link>
            <Link to="/profile" className={isActive('/profile')}>Profile</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
