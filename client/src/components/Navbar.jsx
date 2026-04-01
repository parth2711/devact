import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, Github, Code2, BarChart2, FileEdit, Trophy, BookOpen, User, Settings, LogOut } from 'lucide-react';

function NavDropdown({ label, items, closeMenu }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  const isChildActive = items.some(item => location.pathname === item.path);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="nav-dropdown" ref={ref}>
      <button
        className={`nav-dropdown-trigger ${isChildActive ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown size={14} className={`nav-chevron ${open ? 'rotated' : ''}`} />
      </button>
      {open && (
        <div className="nav-dropdown-menu">
          {items.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { setOpen(false); closeMenu(); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const trackersItems = [
    { path: '/github', label: 'GitHub Activity', icon: <Github size={15} /> },
    { path: '/cp', label: 'CP Performance', icon: <Code2 size={15} /> },
    { path: '/repos', label: 'Repo Visualizer', icon: <BarChart2 size={15} /> },
  ];

  const toolsItems = [
    { path: '/practice', label: 'Practice Review', icon: <FileEdit size={15} /> },
    { path: '/contests', label: 'Contests', icon: <Trophy size={15} /> },
    { path: '/journal', label: 'Dev Journal', icon: <BookOpen size={15} /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>
          <span className="logo-dot" />
          <span className="logo-text">DevAct</span>
        </Link>
      </div>

      <button
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
        {user ? (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')} onClick={closeMenu}>Dashboard</Link>
            <NavDropdown label="Trackers" items={trackersItems} closeMenu={closeMenu} />
            <NavDropdown label="Tools" items={toolsItems} closeMenu={closeMenu} />
            <div className="nav-dropdown nav-user-dropdown" ref={null}>
              <NavDropdown
                label={user.name?.split(' ')[0] || 'Account'}
                items={[
                  { path: '/profile', label: 'Profile', icon: <User size={15} /> },
                  { path: '/account', label: 'Settings', icon: <Settings size={15} /> },
                ]}
                closeMenu={closeMenu}
              />
            </div>
            <button onClick={handleLogout} className="nav-logout-btn">
              <LogOut size={14} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive('/login')} onClick={closeMenu}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;