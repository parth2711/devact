import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <h2>Welcome back, {user?.name}</h2>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>GitHub Activity</h3>
          <p>Monitor commits, PRs, and contribution streaks across your repositories.</p>
          {user?.githubUsername ? (
            <span className="badge badge-connected">Connected: {user.githubUsername}</span>
          ) : (
            <span className="badge">Not Connected</span>
          )}
        </div>

        <div className="dashboard-card">
          <h3>CP Performance</h3>
          <p>Track your Codeforces rating, LeetCode progress, and contest history.</p>
          {user?.codeforcesHandle ? (
            <span className="badge badge-connected">CF: {user.codeforcesHandle}</span>
          ) : (
            <span className="badge">Not Connected</span>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Repo Visualizer</h3>
          <p>View language breakdowns, stars, and activity across your repos.</p>
          <span className="badge">Coming Soon</span>
        </div>

        <div className="dashboard-card">
          <h3>Weekly Summary</h3>
          <p>Your aggregated developer activity at a glance.</p>
          <span className="badge">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
