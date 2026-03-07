import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    githubUsername: user?.githubUsername || '',
    codeforcesHandle: user?.codeforcesHandle || '',
    leetcodeUsername: user?.leetcodeUsername || '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

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
            <h3>Connected Accounts</h3>
            <div className="form-group">
              <label htmlFor="githubUsername">GitHub Username</label>
              <input
                id="githubUsername"
                type="text"
                name="githubUsername"
                placeholder="e.g. octocat"
                value={formData.githubUsername}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="codeforcesHandle">Codeforces Handle</label>
              <input
                id="codeforcesHandle"
                type="text"
                name="codeforcesHandle"
                placeholder="e.g. tourist"
                value={formData.codeforcesHandle}
                onChange={handleChange}
              />
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
    </div>
  );
}

export default Profile;
