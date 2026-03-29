import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>
          <span className="logo-text">DevAct</span>
        </Link>
      </div>
      
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
        {user ? (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')} onClick={closeMenu}>Dashboard</Link>
            <Link to="/github" className={isActive('/github')} onClick={closeMenu}>GitHub</Link>
            <Link to="/cp" className={isActive('/cp')} onClick={closeMenu}>CP</Link>
            <Link to="/repos" className={isActive('/repos')} onClick={closeMenu}>Repos</Link>
            <Link to="/practice" className={isActive('/practice')} onClick={closeMenu}>Practice</Link>
            <Link to="/profile" className={isActive('/profile')} onClick={closeMenu}>Profile</Link>
            <Link to="/account" className={isActive('/account')} onClick={closeMenu}>Account</Link>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm nav-logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')} onClick={closeMenu}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;