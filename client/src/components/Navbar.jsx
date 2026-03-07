import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const token = localStorage.getItem('devact_token');

  const handleLogout = () => {
    localStorage.removeItem('devact_token');
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">DevAct</span>
        </Link>
      </div>
      <div className="navbar-links">
        {token ? (
          <>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
