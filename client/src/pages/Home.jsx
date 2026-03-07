import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page home-page">
      <section className="hero">
        <h1>DevAct</h1>
        <p>Track your developer activity &amp; competitive programming journey — all in one place.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">Get Started</Link>
          <Link to="/login" className="btn btn-secondary">Login</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>🔗 GitHub Tracker</h3>
          <p>Monitor commits, PRs, and contribution streaks across all your repositories.</p>
        </div>
        <div className="feature-card">
          <h3>🏆 CP Tracker</h3>
          <p>Track your Codeforces rating, LeetCode progress, and contest history.</p>
        </div>
        <div className="feature-card">
          <h3>📊 Repo Visualizer</h3>
          <p>Visualize repository stats, language breakdown, and activity heatmaps.</p>
        </div>
        <div className="feature-card">
          <h3>📈 Dashboard</h3>
          <p>A unified dashboard bringing all your developer metrics together.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
