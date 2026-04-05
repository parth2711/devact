import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { User, Lock, Link2, Trash2, AlertTriangle } from 'lucide-react';

function ManageAccount() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [nameMsg, setNameMsg] = useState('');

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePwd, setDeletePwd] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameMsg('');
    try {
      const { data } = await API.patch('/account/name', { name });
      setUser(data);
      setNameMsg('Name updated successfully.');
    } catch (err) {
      setNameMsg(err.response?.data?.message || 'Failed to update name.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdError('');
    if (newPwd !== confirmPwd) return setPwdError('New passwords do not match.');
    try {
      await API.patch('/account/password', { currentPassword: currentPwd, newPassword: newPwd });
      setPwdMsg('Password updated successfully.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleDelete = async () => {
    if (!deletePwd) return setDeleteError('Please enter your password to confirm.');
    setDeleting(true);
    setDeleteError('');
    try {
      await API.delete('/account', { data: { password: deletePwd } });
      await logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Incorrect password.');
    } finally {
      setDeleting(false);
    }
  };

  const sectionStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  };

  const sectionTitle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--text-primary)',
    marginBottom: '1.25rem',
  };

  return (
    <div className="page" style={{ maxWidth: '680px' }}>
      <h2 className="page-title">Account Settings</h2>

      {/* Account Details */}
      <div style={sectionStyle}>
        <div style={sectionTitle}><User size={18} /> Account Details</div>
        <form onSubmit={handleUpdateName}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-input"
              type="email"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Email change coming soon — requires email verification.
            </p>
          </div>
          {nameMsg && <p style={{ color: nameMsg.includes('success') ? '#10b981' : '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{nameMsg}</p>}
          <button type="submit" className="btn btn-primary">Save Name</button>
        </form>
      </div>

      {/* Change Password */}
      <div style={sectionStyle}>
        <div style={sectionTitle}><Lock size={18} /> Change Password</div>
        {user?.githubId && !user?.password ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Your account uses GitHub login and doesn't have a password.
          </p>
        ) : (
          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input className="form-input" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input className="form-input" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required minLength={8} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input className="form-input" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required minLength={8} />
            </div>
            {pwdError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{pwdError}</p>}
            {pwdMsg && <p style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{pwdMsg}</p>}
            <button type="submit" className="btn btn-primary">Update Password</button>
          </form>
        )}
      </div>

      {/* Connected Platforms */}
      <div style={sectionStyle}>
        <div style={sectionTitle}><Link2 size={18} /> Connected Platforms</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { label: 'GitHub', value: user?.githubUsername, path: '/profile' },
            { label: 'Codeforces', value: user?.codeforcesHandle, path: '/profile' },
            { label: 'LeetCode', value: user?.leetcodeUsername, path: '/profile' },
            { label: 'Stack Overflow', value: user?.stackoverflowId ? `#${user.stackoverflowId}` : null, path: '/profile' },
            { label: 'WakaTime', value: user?.wakatimeConfiguredAt ? 'Configured' : null, path: '/profile' },
          ].map(({ label, value, path }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                  {value || <em style={{ opacity: 0.5 }}>Not connected</em>}
                </span>
              </div>
              <Link to={path} style={{ color: 'var(--accent)', fontSize: '0.8rem', textDecoration: 'none' }}>Manage →</Link>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ ...sectionStyle, border: '1px solid rgba(239, 68, 68, 0.4)' }}>
        <div style={{ ...sectionTitle, color: '#ef4444' }}><Trash2 size={18} /> Danger Zone</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Permanently delete your account, all sync data, and all activity history. This cannot be undone.
        </p>
        <button
          className="btn"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '440px',
            width: '100%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ef4444' }}>
              <AlertTriangle size={22} />
              <h3 style={{ margin: 0, fontWeight: 700 }}>Delete Account Permanently</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              This will permanently delete:
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
              <li>Your account and all credentials</li>
              <li>All synced platform data</li>
              <li>Your entire activity history</li>
            </ul>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enter your password to confirm</label>
              <input
                className="form-input"
                type="password"
                placeholder="enter password to confirm"
                value={deletePwd}
                onChange={(e) => setDeletePwd(e.target.value)}
                autoFocus
              />
            </div>
            {deleteError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{deleteError}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', flex: 1 }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { setShowDeleteModal(false); setDeletePwd(''); setDeleteError(''); }}
                style={{ flex: 1 }}
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

export default ManageAccount;
