import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Star, Activity } from 'lucide-react';

function SkillDecayWidget({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="cp-section">
      <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} style={{ color: 'var(--accent)' }}/> 
        Rusty Skills Monitor
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Skills you haven't used recently will begin to fade. Keep them sharp!
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
        {items.map((skill, i) => {
          const isHealthy = skill.daysSince <= 10;
          const isDecaying = skill.daysSince > 10 && skill.daysSince <= 30;
          const isRusty = skill.daysSince > 30;
          
          let color = '#10b981'; // green
          let fillPct = 100;
          let opacity = 1;
          
          if (isDecaying) {
            color = '#f59e0b'; // yellow
            fillPct = Math.max(30, 100 - ((skill.daysSince - 10) / 20) * 70);
            opacity = 0.8;
          } else if (isRusty) {
            color = '#ef4444'; // red
            fillPct = Math.max(5, 30 - ((skill.daysSince - 30) / 30) * 25);
            opacity = Math.max(0.3, 1 - (skill.daysSince / 100));
          }

          return (
            <div key={i} style={{ 
              display: 'flex', alignItems: 'center', gap: '1rem', 
              background: 'var(--bg-secondary)', padding: '0.8rem 1rem', 
              borderRadius: 'var(--r-md)', border: '1px solid var(--border)',
              opacity, transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = opacity; }}
            >
              <div style={{ width: '100px', flexShrink: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={skill.name}>
                  {skill.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {skill.type === 'tag' ? 'Tag' : 'Lang'} · {skill.daysSince} days
                </div>
              </div>

              <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${fillPct}%`, height: '100%', background: color, transition: 'width 1s ease' }} />
              </div>

              {skill.daysSince > 10 && (
                <a href={skill.recommendation} target="_blank" rel="noopener noreferrer" 
                   className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', flexShrink: 0 }}>
                  Refresh
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CPTracker() {
  const { user } = useAuth();
  const [cfStats, setCfStats] = useState(null);
  const [cfSubmissions, setCfSubmissions] = useState([]);
  const [lcStats, setLcStats] = useState(null);
  const [lcSubmissions, setLcSubmissions] = useState([]);
  const [skillDecay, setSkillDecay] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasCF = !!user?.codeforcesHandle;
  const hasLC = !!user?.leetcodeUsername;

  useEffect(() => {
    if (!hasCF && !hasLC) {
      setLoading(false);
      return;
    }
    fetchCPData();
  }, [user]);

  const fetchCPData = async () => {
    try {
      const promises = [];

      if (hasCF) {
        promises.push(
          API.get('/cp/stats').then((r) => setCfStats(r.data)),
          API.get('/cp/submissions').then((r) => setCfSubmissions(r.data))
        );
      }

      if (hasLC) {
        promises.push(
          API.get('/cp/leetcode').then((r) => setLcStats(r.data)),
          API.get('/cp/leetcode/submissions').then((r) => setLcSubmissions(r.data)).catch(() => {})
        );
      }

      promises.push(
        API.get('/cp/skills/decay').then(r => setSkillDecay(r.data)).catch(() => {})
      );

      await Promise.allSettled(promises);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch CP data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page"><p className="loading">Loading CP data...</p></div>;
  }

  if (!hasCF && !hasLC) {
    return (
      <div className="page cp-page">
        <div className="empty-state">
          <h2>Connect CP Accounts</h2>
          <p>Set your Codeforces handle or LeetCode username in your profile to start tracking.</p>
          <Link to="/profile" className="btn btn-primary">Go to Profile</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page cp-page">
        <div className="empty-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchCPData} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page cp-page">
      <h2 className="page-title">Competitive Programming</h2>

      {/* Codeforces Section */}
      {hasCF && cfStats && (
        <>
          <h3 className="section-title">Codeforces — {cfStats.userInfo.handle}</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{cfStats.userInfo.rating}</span>
              <span className="stat-label">Current Rating</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{cfStats.userInfo.maxRating}</span>
              <span className="stat-label">Max Rating</span>
            </div>
            <div className="stat-card">
              <span className="stat-value cf-rank">{cfStats.userInfo.rank}</span>
              <span className="stat-label">Rank</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{cfStats.ratingHistory.length}</span>
              <span className="stat-label">Contests</span>
            </div>
          </div>

          {/* Recent Rating Changes */}
          {cfStats.ratingHistory.length > 0 && (
            <div className="cp-section">
              <h4>Recent Contests</h4>
              <div className="contest-list">
                {cfStats.ratingHistory.slice(-5).reverse().map((c) => (
                  <div key={c.contestId} className="contest-item">
                    <div className="contest-info">
                      <span className="contest-name">{c.contestName}</span>
                      <span className="contest-rank">Rank #{c.rank}</span>
                    </div>
                    <div className="contest-rating">
                      <span className={`rating-change ${c.ratingChange >= 0 ? 'positive' : 'negative'}`}>
                        {c.ratingChange >= 0 ? '+' : ''}{c.ratingChange}
                      </span>
                      <span className="new-rating">→ {c.newRating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Submissions */}
          {cfSubmissions.length > 0 && (
            <div className="cp-section">
              <h4>Recent Submissions</h4>
              <div className="submissions-list">
                {cfSubmissions.slice(0, 10).map((sub) => (
                  <div key={sub.id} className="submission-item">
                    <div className="submission-info">
                      <span className="submission-problem">
                        {sub.problem.index}. {sub.problem.name}
                      </span>
                      {sub.problem.rating && (
                        <span className="submission-difficulty" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Star size={12} /> {sub.problem.rating}</span>
                      )}
                    </div>
                    <div className="submission-meta">
                      <span className={`verdict ${sub.verdict === 'OK' ? 'accepted' : 'rejected'}`}>
                        {sub.verdict === 'OK' ? 'Accepted' : sub.verdict}
                      </span>
                      <span className="submission-lang">{sub.language}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* LeetCode Section */}
      {hasLC && lcStats && (
        <>
          <h3 className="section-title lc-title">LeetCode — {lcStats.username}</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{lcStats.solved.all}</span>
              <span className="stat-label">Total Solved</span>
            </div>
            <div className="stat-card lc-easy">
              <span className="stat-value">{lcStats.solved.easy}</span>
              <span className="stat-label">Easy</span>
            </div>
            <div className="stat-card lc-medium">
              <span className="stat-value">{lcStats.solved.medium}</span>
              <span className="stat-label">Medium</span>
            </div>
            <div className="stat-card lc-hard">
              <span className="stat-value">{lcStats.solved.hard}</span>
              <span className="stat-label">Hard</span>
            </div>
          </div>

          {lcStats.ranking > 0 && (
            <div className="lc-ranking">
              <span>Global Ranking: <strong>#{lcStats.ranking.toLocaleString()}</strong></span>
            </div>
          )}

          {/* LeetCode Recent Submissions */}
          {lcSubmissions.length > 0 && (
            <div className="cp-section">
              <h4>Recent Submissions</h4>
              <div className="submissions-list">
                {lcSubmissions.slice(0, 10).map((sub, i) => (
                  <a
                    key={i}
                    href={sub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="submission-item"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="submission-info">
                      <span className="submission-problem">{sub.title}</span>
                      <span className="submission-lang">{sub.lang}</span>
                    </div>
                    <div className="submission-meta">
                      <span className={`verdict ${sub.status === 'Accepted' ? 'accepted' : 'rejected'}`}>
                        {sub.status}
                      </span>
                      <span className="submission-lang" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {timeAgo(sub.submittedAt)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Rusty Skills Monitor */}
      <SkillDecayWidget items={skillDecay.items} />
    </div>
  );
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default CPTracker;