import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';

const GithubIcon = () => (
  <svg height="18" viewBox="0 0 16 16" width="18" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error
        || (typeof err.response?.data === 'string' ? err.response.data : 'Login failed');
      setError(typeof msg === 'string' ? msg.slice(0, 100) : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        {/* Left decorative panel */}
        <div className="auth-panel">
          <div className="auth-panel-brand">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
            DevAct
          </div>
          <div className="auth-panel-tagline">
            <h2>Welcome back.</h2>
            <p>Pick up right where you left off. Your stats are waiting.</p>
          </div>
          <div className="auth-panel-features">
            {['GitHub activity sync', 'CP ratings & contests', 'Coding time with WakaTime', 'Public developer profile'].map(f => (
              <div className="auth-panel-feature" key={f}>
                <span className="check"><Check size={14} /></span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <h2>Sign In</h2>
          <p className="auth-form-subtitle">Don't have an account? <Link to="/register">Create one free</Link></p>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" name="email"
                placeholder="email address"
                value={formData.email} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
                <Link to="/forgotpassword" className="forgot-link">Forgot password?</Link>
              </label>
              <input
                id="password" type="password" name="password"
                placeholder="password"
                value={formData.password} onChange={handleChange} required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <a
            href={import.meta.env.DEV ? 'http://localhost:5000/api/auth/github' : '/api/auth/github'}
            className="btn btn-secondary btn-full"
          >
            <GithubIcon />
            Continue with GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
