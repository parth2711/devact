import { Link } from 'react-router-dom';
import { Github, Code2, BarChart2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: <Github size={20} />,
    color: 'amber',
    title: 'GitHub Tracker',
    desc: 'Monitor commits, PRs, and contribution streaks across all your repositories in real time.',
  },
  {
    icon: <Code2 size={20} />,
    color: 'blue',
    title: 'CP Tracker',
    desc: 'Track your Codeforces rating, LeetCode progress, and full contest history.',
  },
  {
    icon: <BarChart2 size={20} />,
    color: 'green',
    title: 'Repo Visualizer',
    desc: 'Visualize language breakdowns, star growth, and repository activity at a glance.',
  },
  {
    icon: <LayoutDashboard size={20} />,
    color: 'orange',
    title: 'Unified Dashboard',
    desc: 'All your developer metrics — GitHub, CP ratings, coding time — in one place.',
  },
];

const INTEGRATIONS = [
  { label: 'GitHub' },
  { label: 'LeetCode' },
  { label: 'Codeforces' },
  { label: 'WakaTime' },
  { label: 'Stack Overflow' },
  { label: 'npm / PyPI' },
];

function Home() {
  const { user } = useAuth();

  return (
    <div className="page home-page">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="dot" />
          Developer Activity Tracker
        </div>

        <h1>
          Know your progress.<br />
          <span className="hero-accent">Every single day.</span>
        </h1>

        <p>
          DevAct aggregates your GitHub, competitive programming, and coding time
          metrics into one clean, honest view of your growth.
        </p>

        <div className="hero-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Get Started Free</Link>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
            </>
          )}
        </div>

        {/* Integration pills */}
        <div className="hero-integrations">
          <span className="hero-integration-label">Tracks activity across</span>
          {INTEGRATIONS.map((item) => (
            <span className="hero-pill" key={item.label}>{item.label}</span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <p className="features-heading">What DevAct tracks</p>
      <section className="features">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className={`feature-icon ${f.color}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
