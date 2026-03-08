import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Github, Code, BarChart2 } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setData(res.data);
    } catch (err) {
      // silently fail — show cards without data
    } finally {
      setLoading(false);
    }
  };

  const hasAny = user?.githubUsername || user?.codeforcesHandle || user?.leetcodeUsername;

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <h2>Welcome back, {user?.name}</h2>
        <p className="dashboard-subtitle">Your developer activity at a glance</p>
      </header>

      {!hasAny && (
        <div className="dashboard-notice">
          <p>Connect your accounts in <Link to="/profile">Profile</Link> to see real data here.</p>
        </div>
      )}

      {/* Quick Stats Row */}
      {data && (
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
      </div>
    </div>
  );
}

export default Dashboard;
