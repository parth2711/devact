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
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Loading profile...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '1rem' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>User Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The user <strong>@{username}</strong> doesn&apos;t exist on DevAct.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '1rem' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>🔒 Private Profile</h2>
        <p style={{ color: 'var(--text-muted)' }}>
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>@{profile.username}</p>
          </div>
        </div>
      </header>

      {/* WakaTime Headline Stat */}
      {profile.wakatime?.totalSeconds > 0 && (
        <div style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⏱️ {Math.round(profile.wakatime.totalSeconds / 3600)} hrs coded this week
        </div>
      )}

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
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Codeforces Rating</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={profile.snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
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
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>LeetCode Solved</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={profile.snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
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

      {/* Integrations Grid */}
      <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
        {/* WakaTime Integration Card */}
        {profile.wakatime?.totalSeconds > 0 && (
          <div className="dashboard-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏱️ WakaTime Languages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {profile.wakatime.languages?.map((lang) => (
                <div key={lang.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>{lang.name}</span>
                  <span style={{ fontWeight: 600 }}>{lang.percent}% ({Math.round(lang.total_seconds / 3600)}h)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stack Overflow Integration Card */}
        {profile.stackoverflow?.reputation > 0 && (
          <div className="dashboard-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 120 120" fill="currentColor" color="#f58025"><path d="M84.4 93.8V70.6h7.7v30.9H22.6V70.6h7.7v23.2z"/><path d="M38.8 68.4l37.8 7.9 1.6-7.6-37.8-7.9-1.6 7.6zm5-18l35 16.3 3.2-7-35-16.4-3.2 7.1zm9.7-17.2l29.7 24.7 4.9-5.9-29.7-24.7-4.9 5.9zm19.2-18.3l-6.2 4.6 23 31 6.2-4.6-23-31zM38 86h38.6v-7.7H38V86z"/></svg>
              Stack Overflow
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{profile.stackoverflow.reputation.toLocaleString()}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>reputation</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {profile.stackoverflow.badges.gold > 0 && <span style={{ color: '#f1b600', fontWeight: 600 }}>● {profile.stackoverflow.badges.gold}</span>}
              {profile.stackoverflow.badges.silver > 0 && <span style={{ color: '#b4b8bc', fontWeight: 600 }}>● {profile.stackoverflow.badges.silver}</span>}
              {profile.stackoverflow.badges.bronze > 0 && <span style={{ color: '#d1a684', fontWeight: 600 }}>● {profile.stackoverflow.badges.bronze}</span>}
            </div>
            {profile.stackoverflow.topAnswers?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Answers</h4>
                {profile.stackoverflow.topAnswers.map((ans, idx) => (
                  <a key={idx} href={ans.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: '#3b82f6', textDecoration: 'none', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>+{ans.score}</span> {ans.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Packages Integration Card */}
        {(profile.packages?.npm?.length > 0 || profile.packages?.pypi?.length > 0) && (
           <div className="dashboard-card" style={{ padding: '1.5rem' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               📦 Open Source Impact
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {profile.packages.npm?.map(pkg => (
                 <div key={`npm-${pkg.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#cb3837', color: 'white', fontWeight: 'bold' }}>npm</span>
                     <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{pkg.name}</span>
                   </div>
                   <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}><strong>{pkg.weeklyDownloads.toLocaleString()}</strong> /wk</span>
                 </div>
               ))}
               {profile.packages.pypi?.map(pkg => (
                 <div key={`pypi-${pkg.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#3776ab', color: 'white', fontWeight: 'bold' }}>PyPI</span>
                     <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{pkg.name}</span>
                   </div>
                   <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}><strong>{pkg.weeklyDownloads.toLocaleString()}</strong> /wk</span>
                 </div>
               ))}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfile;
