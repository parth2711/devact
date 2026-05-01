import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';

import GithubIcon from '../components/GithubIcon';
function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <h2>Connect your accounts.<br />See everything.</h2>
            <p>Links up with GitHub, Codeforces, LeetCode, and WakaTime. Takes about two minutes.</p>
          </div>
          <div className="auth-panel-features">
            {['GitHub commits & repos', 'Codeforces + LeetCode', 'WakaTime coding time', 'Stack Overflow & packages'].map(f => (
              <div className="auth-panel-feature" key={f}>
                <span className="check"><Check size={14} /></span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <h2>Create Account</h2>
          <p className="auth-form-subtitle">Already have an account? <Link to="/login">Sign in</Link></p>

          {error && <p className="error-msg">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name" type="text" name="name"
                placeholder="full name"
                value={formData.name} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" name="email"
                placeholder="email address"
                value={formData.email} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" name="password"
                placeholder="password"
                value={formData.password} onChange={handleChange} required minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
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

export default Register;
