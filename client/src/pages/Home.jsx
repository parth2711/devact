import { Link } from 'react-router-dom';
import { Github, Code, BarChart2, LayoutDashboard } from 'lucide-react';

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
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Github size={20} className="text-accent-primary" /> GitHub Tracker</h3>
          <p>Monitor commits, PRs, and contribution streaks across all your repositories.</p>
        </div>
        <div className="feature-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Code size={20} className="text-accent-primary" /> CP Tracker</h3>
          <p>Track your Codeforces rating, LeetCode progress, and contest history.</p>
        </div>
        <div className="feature-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={20} className="text-accent-primary" /> Repo Visualizer</h3>
          <p>Visualize repository stats, language breakdown, and activity heatmaps.</p>
        </div>
        <div className="feature-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LayoutDashboard size={20} className="text-accent-primary" /> Dashboard</h3>
          <p>A unified dashboard bringing all your developer metrics together.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
