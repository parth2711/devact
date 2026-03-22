import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Github, Code, BarChart2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchSyncStatus();
    fetchSnapshots();
  }, []);

  // Poll for sync completion if data shows syncing state
  useEffect(() => {
    if (data?.syncing) {
      const interval = setInterval(async () => {
        const status = await API.get('/sync/status').then(r => r.data).catch(() => null);
        if (status?.synced) {
          clearInterval(interval);
          fetchDashboard();
          fetchSyncStatus();
          fetchSnapshots();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data?.syncing]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setData(res.data);
    } catch (err) {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await API.get('/sync/status');
      setSyncStatus(res.data);
    } catch (err) {}
  };

  const fetchSnapshots = async () => {
    try {
      const res = await API.get('/snapshots?days=30');
      setSnapshots(res.data.snapshots || []);
    } catch (err) {}
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await API.post('/sync/now');
      
      // True polling: check every 3 seconds until lastFullSync updates
      const initialSyncTime = syncStatus?.lastFullSync;
      const pollInterval = setInterval(async () => {
        try {
          const res = await API.get('/sync/status');
          if (res.data.lastFullSync !== initialSyncTime) {
            clearInterval(pollInterval);
            await fetchDashboard();
            setSyncStatus(res.data);
            await fetchSnapshots();
            setSyncing(false);
          }
        } catch (pollErr) {
          // ignore transient poll errors
        }
      }, 3000);

      // Failsafe timeout after 30s
      setTimeout(() => {
        clearInterval(pollInterval);
        setSyncing(false);
      }, 30000);

    } catch (err) {
      const msg = err.response?.data?.message || 'Sync failed';
      alert(msg);
      setSyncing(false);
    }
  };

  const formatSyncTime = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  const isStalled = (configuredAt) => {
    if (!configuredAt) return false;
    // 10 minutes in ms = 600000
    return (new Date() - new Date(configuredAt)) > 600000;
  };

  const hasAny = user?.githubUsername || user?.codeforcesHandle || user?.leetcodeUsername || user?.wakatimeConfiguredAt || user?.stackoverflowId || user?.npmPackages?.length > 0 || user?.pypiPackages?.length > 0;
  const hasTrendData = snapshots.length > 1;

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <h2>Welcome back, {user?.name}</h2>
          <p className="dashboard-subtitle">Your developer activity at a glance</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Last synced: {formatSyncTime(syncStatus?.lastFullSync || data?.lastSyncedAt)}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleSyncNow}
            disabled={syncing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={14} className={syncing ? 'spinning' : ''} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </header>

      {/* WakaTime Headline Stat */}
      {data?.wakatime?.totalSeconds > 0 && (
        <div style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⏱️ {Math.round(data.wakatime.totalSeconds / 3600)} hrs coded this week
        </div>
      )}

      {data?.syncing && (
        <div className="dashboard-notice" style={{ background: '#eff6ff', borderColor: '#3b82f6' }}>
          <p style={{ color: '#1e40af' }}>⏳ Initial sync in progress. Your data will appear shortly...</p>
        </div>
      )}

      {!hasAny && (
        <div className="dashboard-notice">
          <p>Connect your accounts in <Link to="/profile">Profile</Link> to see real data here.</p>
        </div>
      )}

      {/* Quick Stats Row */}
      {data && !data.syncing && (
        <div className="stats-grid dashboard-stats">
          {data.github && (
            <>
              <div className="stat-card">
                <span className="stat-value">{data.github.repos}</span>
                <span className="stat-label">Repositories</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data.github.totalStars}</span>
                <span className="stat-label">Total Stars</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{data.github.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
            </>
          )}
          {data.codeforces && (
            <div className="stat-card">
              <span className="stat-value">{data.codeforces.rating}</span>
              <span className="stat-label">CF Rating</span>
            </div>
          )}
          {data.leetcode && (
            <div className="stat-card">
              <span className="stat-value">{data.leetcode.totalSolved}</span>
              <span className="stat-label">LC Solved</span>
            </div>
          )}
        </div>
      )}

      {/* Trend Charts */}
      {hasTrendData && (
        <div className="dashboard-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📈 Trends (Last 30 Days)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {snapshots[0]?.codeforces?.rating > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Codeforces Rating</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="codeforces.rating" stroke="#3b82f6" strokeWidth={2} dot={false} name="Rating" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {snapshots[0]?.leetcode?.totalSolved > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>LeetCode Solved</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="leetcode.totalSolved" stroke="#10b981" strokeWidth={2} dot={false} name="Total Solved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {snapshots[0]?.github?.stars > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>GitHub Stars</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={snapshots}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="github.stars" stroke="#f59e0b" strokeWidth={2} dot={false} name="Stars" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div className="dashboard-grid">
        <Link to="/github" className="dashboard-card dashboard-card-link">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Github size={20} className="text-accent-primary" /> GitHub Activity</h3>
          <p>Monitor commits, PRs, and contribution streaks across your repositories.</p>
          {user?.githubUsername ? (
            <span className="badge badge-connected">Connected: {user.githubUsername}</span>
          ) : (
            <span className="badge">Not Connected</span>
          )}
        </Link>

        <Link to="/cp" className="dashboard-card dashboard-card-link">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Code size={20} className="text-accent-primary" /> CP Performance</h3>
          <p>Track your Codeforces rating, LeetCode progress, and contest history.</p>
          {user?.codeforcesHandle || user?.leetcodeUsername ? (
            <span className="badge badge-connected">
              {[user?.codeforcesHandle && `CF: ${user.codeforcesHandle}`, user?.leetcodeUsername && `LC: ${user.leetcodeUsername}`].filter(Boolean).join(' / ')}
            </span>
          ) : (
            <span className="badge">Not Connected</span>
          )}
        </Link>

        <Link to="/repos" className="dashboard-card dashboard-card-link">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={20} className="text-accent-primary" /> Repo Visualizer</h3>
          <p>View language breakdowns, stars, and activity across your repos.</p>
          {user?.githubUsername ? (
            <span className="badge badge-connected">Connected</span>
          ) : (
            <span className="badge">Not Connected</span>
          )}
        </Link>

        <Link to="/practice" className="dashboard-card dashboard-card-link">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📝 Practice Review</h3>
          <p>Review problems you attempted but didn't solve, with links to editorials.</p>
          {user?.codeforcesHandle || user?.leetcodeUsername ? (
            <span className="badge badge-connected">
              {[user?.codeforcesHandle && `CF: ${user.codeforcesHandle}`, user?.leetcodeUsername && `LC: ${user.leetcodeUsername}`].filter(Boolean).join(' / ')}
            </span>
          ) : (
            <span className="badge">Not Connected</span>
          )}
        </Link>

        {/* LeetCode Summary Card */}
        {data?.leetcode && (
          <div className="dashboard-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-accent-primary"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.541l11.97 10.917c.182.165.41.25.645.24h.01a1.282 1.282 0 0 0 .869-.368l3.18-3.04a1.314 1.314 0 0 0 .354-.863 1.284 1.284 0 0 0-.343-.861l-6.284-6.66 4.498-.01c.219-.001.431-.073.61-.205.18-.133.313-.314.385-.522a1.298 1.298 0 0 0 .01-.871 1.3 1.3 0 0 0-.41-.611l-5.347-5.588-3.957-4.11a1.365 1.365 0 0 0-.95-.44zm-2.022 17.51a1.88 1.88 0 0 0-1.879-1.882h-6.14a1.88 1.88 0 1 0 0 3.763h6.14a1.88 1.88 0 0 0 1.879-1.881z"/></svg> 
              LeetCode Progress
            </h3>
            <div className="lc-progress">
              <div className="lc-progress-item">
                <span className="lc-count lc-easy-text">{data.leetcode.easy}</span>
                <span className="lc-label">Easy</span>
              </div>
              <div className="lc-progress-item">
                <span className="lc-count lc-medium-text">{data.leetcode.medium}</span>
                <span className="lc-label">Medium</span>
              </div>
              <div className="lc-progress-item">
                <span className="lc-count lc-hard-text">{data.leetcode.hard}</span>
                <span className="lc-label">Hard</span>
              </div>
            </div>
          </div>
        )}

        {/* WakaTime Integration Card */}
        {data?.wakatime?.totalSeconds > 0 ? (
          <div className="dashboard-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⏱️ WakaTime Languages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.wakatime.languages?.map((lang) => (
                <div key={lang.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>{lang.name}</span>
                  <span style={{ fontWeight: 600 }}>{lang.percent}% ({Math.round(lang.total_seconds / 3600)}h)</span>
                </div>
              ))}
            </div>
          </div>
        ) : user?.wakatimeConfiguredAt && !data?.wakatime ? (
          <div className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isStalled(user.wakatimeConfiguredAt) ? (
              <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>WakaTime Sync failed — try manually syncing.</p>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }} className="spinning">⏳ Syncing WakaTime...</p>
            )}
          </div>
        ) : null}

        {/* Stack Overflow Integration Card */}
        {data?.stackoverflow?.reputation > 0 ? (
          <div className="dashboard-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 120 120" fill="currentColor" color="#f58025"><path d="M84.4 93.8V70.6h7.7v30.9H22.6V70.6h7.7v23.2z"/><path d="M38.8 68.4l37.8 7.9 1.6-7.6-37.8-7.9-1.6 7.6zm5-18l35 16.3 3.2-7-35-16.4-3.2 7.1zm9.7-17.2l29.7 24.7 4.9-5.9-29.7-24.7-4.9 5.9zm19.2-18.3l-6.2 4.6 23 31 6.2-4.6-23-31zM38 86h38.6v-7.7H38V86z"/></svg>
              Stack Overflow
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>{data.stackoverflow.reputation.toLocaleString()}</span>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>reputation</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {data.stackoverflow.badges.gold > 0 && <span style={{ color: '#f1b600', fontWeight: 600 }}>● {data.stackoverflow.badges.gold}</span>}
              {data.stackoverflow.badges.silver > 0 && <span style={{ color: '#b4b8bc', fontWeight: 600 }}>● {data.stackoverflow.badges.silver}</span>}
              {data.stackoverflow.badges.bronze > 0 && <span style={{ color: '#d1a684', fontWeight: 600 }}>● {data.stackoverflow.badges.bronze}</span>}
            </div>
            {data.stackoverflow.topAnswers?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Top Answers</h4>
                {data.stackoverflow.topAnswers.map((ans, idx) => (
                  <a key={idx} href={ans.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: '#3b82f6', textDecoration: 'none', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>+{ans.score}</span> {ans.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : user?.stackoverflowId && !data?.stackoverflow ? (
          <div className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isStalled(user.updatedAt) ? (
              <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Stack Overflow Sync failed.</p>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }} className="spinning">⏳ Syncing Stack Overflow...</p>
            )}
          </div>
        ) : null}

        {/* Packages Integration Card */}
        {(data?.packages?.npm?.length > 0 || data?.packages?.pypi?.length > 0) ? (
           <div className="dashboard-card" style={{ padding: '1.5rem' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               📦 Open Source Impact
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {data.packages.npm?.map(pkg => (
                 <div key={`npm-${pkg.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#cb3837', color: 'white', fontWeight: 'bold' }}>npm</span>
                     <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{pkg.name}</span>
                   </div>
                   <span style={{ fontSize: '0.875rem', color: '#64748b' }}><strong>{pkg.weeklyDownloads.toLocaleString()}</strong> /wk</span>
                 </div>
               ))}
               {data.packages.pypi?.map(pkg => (
                 <div key={`pypi-${pkg.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#3776ab', color: 'white', fontWeight: 'bold' }}>PyPI</span>
                     <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{pkg.name}</span>
                   </div>
                   <span style={{ fontSize: '0.875rem', color: '#64748b' }}><strong>{pkg.weeklyDownloads.toLocaleString()}</strong> /wk</span>
                 </div>
               ))}
             </div>
           </div>
        ) : ((user?.npmPackages?.length > 0 || user?.pypiPackages?.length > 0) && (!data?.packages?.npm && !data?.packages?.pypi)) ? (
          <div className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {isStalled(user.updatedAt) ? (
              <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>Packages Sync failed.</p>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }} className="spinning">⏳ Syncing Packages...</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Dashboard;
