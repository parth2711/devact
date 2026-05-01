import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';

import GithubIcon from '../components/GithubIcon';
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
            <h2>Back at it.</h2>
            <p>Your data syncs automatically. Just sign in.</p>
          </div>
          <div className="auth-panel-features">
            {['GitHub + Codeforces + LeetCode', 'WakaTime coding hours', 'Contest calendar', 'Public dev profile'].map(f => (
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
