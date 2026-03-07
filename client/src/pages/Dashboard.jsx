import { useEffect, useState } from 'react';
import API from '../api/axios';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get('/auth/me');
        setUser(data);
      } catch {
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('devact_token');
    window.location.href = '/';
  };

  if (loading) {
    return <div className="page"><p className="loading">Loading...</p></div>;
  }

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <h2>Welcome back, {user?.name} 👋</h2>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>🔗 GitHub Activity</h3>
          <p>Connect your GitHub to see commits, PRs, and streaks.</p>
          <span className="badge">Coming Soon</span>
        </div>

        <div className="dashboard-card">
          <h3>🏆 CP Performance</h3>
          <p>Link your Codeforces / LeetCode to track ratings and submissions.</p>
          <span className="badge">Coming Soon</span>
        </div>

        <div className="dashboard-card">
          <h3>📊 Repo Visualizer</h3>
          <p>View language breakdowns, stars, and activity across your repos.</p>
          <span className="badge">Coming Soon</span>
        </div>

        <div className="dashboard-card">
          <h3>📈 Weekly Summary</h3>
          <p>Your aggregated developer activity at a glance.</p>
          <span className="badge">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
