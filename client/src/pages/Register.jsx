import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';

const GithubIcon = () => (
  <svg height="18" viewBox="0 0 16 16" width="18" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

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
            <h2>Start tracking<br />your dev journey.</h2>
            <p>Free forever. No credit card required. Connect your accounts and go.</p>
          </div>
          <div className="auth-panel-features">
            {['GitHub commits & PRs', 'Codeforces & LeetCode', 'WakaTime coding hours', 'Stack Overflow & npm'].map(f => (
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
                placeholder="Your name"
                value={formData.name} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email" type="email" name="email"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" name="password"
                placeholder="Min. 6 characters"
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
