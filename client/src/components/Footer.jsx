import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px var(--accent)' }} />
          DevAct
        </div>
        <div className="footer-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/github">GitHub</Link>
          <Link to="/cp">CP</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} DevAct. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
