import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await API.post('/auth/forgotpassword', { email });
      setMessage(data.message || 'Password reset link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center' }}>
          Enter your email address to receive a password reset link.
        </p>
        
        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
