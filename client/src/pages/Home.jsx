import { Link } from 'react-router-dom';
import { Github, Code2, BarChart2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: <Github size={20} />,
    color: 'amber',
    title: 'GitHub Tracker',
    desc: 'Commits, PRs, issues, and your contribution calendar in one place.',
  },
  {
    icon: <Code2 size={20} />,
    color: 'blue',
    title: 'CP Tracker',
    desc: 'Codeforces rating history, LeetCode solve counts, and contest records.',
  },
  {
    icon: <BarChart2 size={20} />,
    color: 'green',
    title: 'Repo Visualizer',
    desc: 'Language breakdown, star counts, and activity across your repos.',
  },
  {
    icon: <LayoutDashboard size={20} />,
    color: 'orange',
    title: 'Unified Dashboard',
    desc: 'GitHub, CP ratings, coding time, and more — unified in one dashboard.',
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
          One place for all
          <span className="hero-accent"> your dev stats.</span>
        </h1>

        <p>
          GitHub, Codeforces, LeetCode, WakaTime — pulled together automatically.
          No manual updates.
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
