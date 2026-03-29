import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NotFound() {
  const { user } = useAuth();

  return (
    <div className="page auth-page">
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '6rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: '1rem',
        }}>
          404
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to={user ? '/dashboard' : '/'} className="btn btn-primary">
          {user ? 'Back to Dashboard' : 'Go Home'}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;