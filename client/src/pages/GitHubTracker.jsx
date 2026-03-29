import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Link as LinkIcon, AlertTriangle, Folder, Star, GitFork, BarChart2, Upload, GitPullRequest, Bug, PlusCircle, Trash2, MessageSquare, Bookmark } from 'lucide-react';

function GitHubTracker() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [activity, setActivity] = useState([]);
  const [contributions, setContributions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.githubUsername) {
      setLoading(false);
      return;
    }
    fetchGitHubData();
  }, [user]);

  const fetchGitHubData = async () => {
    try {
      const [statsRes, reposRes, activityRes, contribRes] = await Promise.allSettled([
        API.get('/github/stats'),
        API.get('/github/repos'),
        API.get('/github/activity'),
        API.get('/github/contributions'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (reposRes.status === 'fulfilled') setRepos(reposRes.value.data);
      if (activityRes.status === 'fulfilled') setActivity(activityRes.value.data);
      if (contribRes.status === 'fulfilled') setContributions(contribRes.value.data);
    } catch (err) {
      setError('Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page"><p className="loading">Loading GitHub data...</p></div>;
  }

  if (!user?.githubUsername) {
    return (
      <div className="page github-page">
        <div className="empty-state">
          <h2><LinkIcon size={24} style={{ marginRight: '8px' }}/>Connect GitHub</h2>
          <p>Set your GitHub username in your profile to start tracking.</p>
          <Link to="/profile" className="btn btn-primary">Go to Profile</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page github-page">
        <div className="empty-state">
          <h2><AlertTriangle size={24} style={{ marginRight: '8px', color: 'var(--error-color)' }}/>Error</h2>
          <p>{error}</p>
          <button onClick={fetchGitHubData} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page github-page">
      <h2 className="page-title">GitHub Tracker</h2>

      {/* Contribution Heatmap */}
      {contributions && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              contribution activity
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {contributions.totalContributions.toLocaleString()} contributions in the last year
            </span>
          </div>
          <ContributionHeatmap weeks={contributions.weeks} />
        </div>
      )}

      {/* stats overview */}
      {stats && (
        <div className="bento-grid">
          <div className="bento-card">
            <span className="stat-value">{stats.publicRepos}</span>
            <span className="stat-label">repositories</span>
          </div>
          <div className="bento-card">
            <span className="stat-value">{stats.followers}</span>
            <span className="stat-label">followers</span>
          </div>
          <div className="bento-card">
            <span className="stat-value">{stats.following}</span>
            <span className="stat-label">following</span>
          </div>
          <div className="bento-card">
            <span className="stat-value">
              {new Date(stats.createdAt).getFullYear()}
            </span>
            <span className="stat-label">joined</span>
          </div>
        </div>
      )}

      <div className="github-layout">
        {/* repositories */}
        <section className="github-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Folder size={20} /> repositories</h3>
          <div className="bento-grid">
            {repos.slice(0, 8).map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bento-card"
              >
                <div className="repo-header">
                  <span className="repo-name">{repo.name}</span>
                  {repo.language && <span className="repo-lang">{repo.language}</span>}
                </div>
                {repo.description && (
                  <p className="repo-desc">{repo.description}</p>
                )}
                <div className="repo-meta" style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} /> {repo.stars}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GitFork size={14} /> {repo.forks}</span>
                  <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* recent activity */}
        <section className="github-section">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={20} /> recent activity</h3>
          <div className="timeline">
            {activity.slice(0, 10).map((event) => (
              <div key={event.id} className="timeline-event">
                <div className="activity-info">
                  <span className="activity-icon">{getEventIcon(event.type)}</span>
                  <span className="activity-text">
                    <span className="activity-action">
                      {event.payload.action || event.type.replace('Event', '')}
                    </span>{' '}
                    <span className="activity-repo">{event.repo}</span>
                  </span>
                  <span className="activity-time">
                    {timeAgo(event.createdAt)}
                  </span>
                </div>
              </div>
            ))}
            {activity.length === 0 && <p className="text-muted">No recent activity found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function getEventIcon(type) {
  const icons = {
    PushEvent: <Upload size={16} style={{ color: 'var(--accent-secondary)' }} />,
    PullRequestEvent: <GitPullRequest size={16} style={{ color: '#22c55e' }} />,
    IssuesEvent: <Bug size={16} style={{ color: '#ef4444' }} />,
    CreateEvent: <PlusCircle size={16} style={{ color: 'var(--accent-primary)' }} />,
    WatchEvent: <Star size={16} style={{ color: '#eab308' }} />,
    ForkEvent: <GitFork size={16} style={{ color: '#8b5cf6' }} />,
    DeleteEvent: <Trash2 size={16} style={{ color: '#64748b' }} />,
    IssueCommentEvent: <MessageSquare size={16} style={{ color: '#0ea5e9' }} />,
  };
  return icons[type] || <Bookmark size={16} />;
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function ContributionHeatmap({ weeks }) {
  const [tooltip, setTooltip] = useState(null);

  const getColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.05)';
    if (count <= 2) return 'rgba(168,85,247,0.3)';
    if (count <= 5) return 'rgba(168,85,247,0.55)';
    if (count <= 9) return 'rgba(168,85,247,0.8)';
    return 'rgba(168,85,247,1)';
  };

  const months = [];
  if (weeks.length > 0) {
    let lastMonth = null;
    weeks.forEach((week, wi) => {
      const month = new Date(week.contributionDays[0].date).toLocaleString('default', { month: 'short' });
      if (month !== lastMonth) {
        months.push({ label: month, weekIndex: wi });
        lastMonth = month;
      }
    });
  }

  return (
    <div style={{ position: 'relative', overflowX: 'auto' }}>
      {/* Month labels */}
      <div style={{ display: 'flex', marginLeft: '20px', marginBottom: '4px', position: 'relative', height: '16px' }}>
        {months.map(({ label, weekIndex }) => (
          <span key={label + weekIndex} style={{
            position: 'absolute',
            left: `${weekIndex * 14}px`,
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
          }}>
            {label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-start' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
            <span key={i} style={{ fontSize: '0.6rem', color: 'var(--text-muted)', height: '12px', lineHeight: '12px' }}>{d}</span>
          ))}
        </div>

        {/* Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {week.contributionDays.map((day, di) => (
              <div
                key={di}
                onMouseEnter={(e) => setTooltip({ day, x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setTooltip(null)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  background: getColor(day.contributionCount),
                  cursor: 'default',
                  transition: 'opacity 0.15s',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Less</span>
        {[0, 2, 5, 9, 12].map((v) => (
          <div key={v} style={{ width: '12px', height: '12px', borderRadius: '2px', background: getColor(v) }} />
        ))}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 36,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '0.75rem',
          color: 'var(--text-primary)',
          pointerEvents: 'none',
          zIndex: 1000,
          whiteSpace: 'nowrap',
        }}>
          <strong>{tooltip.day.contributionCount}</strong> contributions on {new Date(tooltip.day.date).toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
    </div>
  );
}

export default GitHubTracker;