import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:5000' : '';
      const res = await fetch(`${baseUrl}/api/u/${username}`);
      const data = await res.json();

      if (res.status === 404) {
        setNotFound(true);
      } else if (res.status === 403 || data.private) {
        setIsPrivate(true);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: '#64748b', fontSize: '1.125rem' }}>Loading profile...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '1rem' }}>
        <h2 style={{ color: '#0f172a' }}>User Not Found</h2>
        <p style={{ color: '#64748b' }}>The user <strong>@{username}</strong> doesn&apos;t exist on DevAct.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '1rem' }}>
        <h2 style={{ color: '#0f172a' }}>🔒 Private Profile</h2>
        <p style={{ color: '#64748b' }}>
          <strong>@{username}</strong> has chosen to keep their profile private.
        </p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  const hasTrendData = profile.snapshots && profile.snapshots.length > 1;

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {profile.avatar && (
            <img src={profile.avatar} alt={profile.name} style={{ width: 64, height: 64, borderRadius: '50%' }} />
          )}
          <div>
            <h2 style={{ marginBottom: '0.25rem' }}>{profile.name}</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>@{profile.username}</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-grid dashboard-stats">
        {profile.github && (
          <>
            <div className="stat-card">
              <span className="stat-value">{profile.github.repos}</span>
              <span className="stat-label">Repositories</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{profile.github.totalStars}</span>
              <span className="stat-label">Stars</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{profile.github.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
          </>
        )}
        {profile.codeforces && (
          <div className="stat-card">
            <span className="stat-value">{profile.codeforces.rating}</span>
            <span className="stat-label">CF Rating ({profile.codeforces.rank})</span>
          </div>
        )}
        {profile.leetcode && (
          <div className="stat-card">
            <span className="stat-value">{profile.leetcode.totalSolved}</span>
            <span className="stat-label">LC Solved</span>
          </div>
        )}
      </div>

      {/* Trend Charts */}
      {hasTrendData && (
        <div className="dashboard-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📈 Activity Trends</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {profile.snapshots[0]?.codeforces?.rating > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Codeforces Rating</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={profile.snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="codeforces.rating" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {profile.snapshots[0]?.leetcode?.totalSolved > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>LeetCode Solved</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={profile.snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="leetcode.totalSolved" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LeetCode Breakdown */}
      {profile.leetcode && (
        <div className="dashboard-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>LeetCode Breakdown</h3>
          <div className="lc-progress">
            <div className="lc-progress-item">
              <span className="lc-count lc-easy-text">{profile.leetcode.easy}</span>
              <span className="lc-label">Easy</span>
            </div>
            <div className="lc-progress-item">
              <span className="lc-count lc-medium-text">{profile.leetcode.medium}</span>
              <span className="lc-label">Medium</span>
            </div>
            <div className="lc-progress-item">
              <span className="lc-count lc-hard-text">{profile.leetcode.hard}</span>
              <span className="lc-label">Hard</span>
            </div>
          </div>
        </div>
      )}

      {/* Languages */}
      {profile.github?.topLanguages?.length > 0 && (
        <div className="dashboard-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Top Languages</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {profile.github.topLanguages.map((lang) => (
              <span key={lang} className="badge badge-connected">{lang}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicProfile;
