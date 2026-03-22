import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OAuthCallback() {
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await loginWithOAuth();
        navigate('/dashboard');
      } catch {
        navigate('/login?error=oauth_failed');
      }
    };
    handleCallback();
  }, [navigate, loginWithOAuth]);

  return (
    <div className="page auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h2>Authenticating...</h2>
        <p>Please wait while we log you in.</p>
      </div>
    </div>
  );
}

export default OAuthCallback;
