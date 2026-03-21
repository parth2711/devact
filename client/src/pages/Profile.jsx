import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    isPublicProfile: user?.isPublicProfile || false,
    githubUsername: user?.githubUsername || '',
    codeforcesHandle: user?.codeforcesHandle || '',
    leetcodeUsername: user?.leetcodeUsername || '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  // Verification state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      await updateProfile(formData);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleInitiateVerify = async () => {
    try {
      setVerifying(true);
      setVerifyMessage('');
      const { data } = await API.get('/cp/codeforces/verify/init');
      setVerifyToken(data.token);
      setVerifyModalOpen(true);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to initiate verification' });
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckVerify = async () => {
    try {
      setVerifying(true);
      setVerifyMessage('');
      const { data } = await API.post('/cp/codeforces/verify/check');
      setVerifyMessage(data.message);
      if (data.verified) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      setVerifyMessage(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="page profile-page">
      <div className="profile-card">
        <h2>Profile Settings</h2>
        <p className="profile-subtitle">Connect your accounts to unlock tracking features</p>

        {status.message && (
          <p className={status.type === 'success' ? 'success-msg' : 'error-msg'}>
            {status.message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Info</h3>
            <div className="form-group">
              <label htmlFor="name">Display Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Public Profile</h3>
            <div className="form-group">
              <label htmlFor="username">Username (for public URL)</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="e.g. parth2711"
                value={formData.username}
                onChange={handleChange}
                pattern="[a-z0-9_]{3,20}"
                title="3-20 lowercase letters, numbers, or underscores"
              />
              {formData.username && (
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Your profile URL: <strong>{window.location.origin}/u/{formData.username}</strong>
                </p>
              )}
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                id="isPublicProfile"
                type="checkbox"
                name="isPublicProfile"
                checked={formData.isPublicProfile}
                onChange={(e) => setFormData({ ...formData, isPublicProfile: e.target.checked })}
                disabled={!formData.username}
                style={{ width: 'auto' }}
              />
              <label htmlFor="isPublicProfile" style={{ margin: 0, cursor: formData.username ? 'pointer' : 'not-allowed', color: formData.username ? '#0f172a' : '#94a3b8' }}>
                Make my profile public
              </label>
            </div>
            {!formData.username && formData.isPublicProfile === false && (
              <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Set a username above to enable public profiles.</p>
            )}
          </div>

          <div className="form-section">
            <h3>Connected Accounts</h3>
            <div className="form-group">
              <label htmlFor="githubUsername" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>GitHub Username</span>
                {user?.isGithubVerified ? (
                  <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>✓ Verified via OAuth</span>
                ) : (
                  <a href={import.meta.env.DEV ? 'http://localhost:5000/api/auth/github' : '/api/auth/github'} style={{ color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>
                    Connect Account
                  </a>
                )}
              </label>
              <input
                id="githubUsername"
                type="text"
                name="githubUsername"
                placeholder="e.g. octocat"
                value={formData.githubUsername}
                onChange={handleChange}
                disabled={user?.isGithubVerified} // disable if authenticated via oauth to prevent mismatch
                style={user?.isGithubVerified ? { backgroundColor: '#f1f5f9', color: '#64748b' } : {}}
              />
            </div>
            <div className="form-group">
              <label htmlFor="codeforcesHandle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Codeforces Handle</span>
                {user?.isCodeforcesVerified ? (
                  <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>✓ Verified</span>
                ) : user?.codeforcesHandle && (
                  <button type="button" onClick={handleInitiateVerify} disabled={verifying} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.875rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                    Verify Account
                  </button>
                )}
              </label>
              <input
                id="codeforcesHandle"
                type="text"
                name="codeforcesHandle"
                placeholder="e.g. tourist"
                value={formData.codeforcesHandle}
                onChange={handleChange}
                disabled={user?.isCodeforcesVerified}
                style={user?.isCodeforcesVerified ? { backgroundColor: '#f1f5f9', color: '#64748b' } : {}}
              />
              {!user?.isCodeforcesVerified && user?.codeforcesHandle && (
                 <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Save changes, then click Verify to prove ownership.</p>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="leetcodeUsername">LeetCode Username</label>
              <input
                id="leetcodeUsername"
                type="text"
                name="leetcodeUsername"
                placeholder="e.g. lee215"
                value={formData.leetcodeUsername}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {verifyModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', maxWidth: '450px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Verify Codeforces Account</h3>
            <p style={{ color: '#334155', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              To prove ownership of <strong>{user?.codeforcesHandle}</strong>, please temporarily update your Codeforces <strong>First Name</strong> or <strong>Last Name</strong> to the following token:
            </p>
            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.25rem', marginBottom: '1.5rem', border: '1px dashed #cbd5e1', fontWeight: 'bold', color: '#3b82f6' }}>
              {verifyToken}
            </div>
            {verifyMessage && (
              <p className={verifyMessage.includes('success') ? 'success-msg' : 'error-msg'} style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '0.75rem', borderRadius: '6px' }}>
                {verifyMessage}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={handleCheckVerify}
                disabled={verifying}
              >
                {verifying ? 'Checking...' : 'Check Verification'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setVerifyModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
