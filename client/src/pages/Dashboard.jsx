import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';

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
          <h3>GitHub Activity</h3>
          <p>Monitor commits, PRs, and contribution streaks across your repositories.</p>
          {user?.githubUsername ? (
            <span className="badge badge-connected">Connected: {user.githubUsername}</span>
          ) : (
            <span className="badge">Not Connected</span>
          )}
        </Link>

        <Link to="/cp" className="dashboard-card dashboard-card-link">
          <h3>CP Performance</h3>
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
          <h3>Repo Visualizer</h3>
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
            <h3>LeetCode Progress</h3>
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
