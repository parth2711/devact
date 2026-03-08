import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';

function GitHubTracker() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [repos, setRepos] = useState([]);
  const [activity, setActivity] = useState([]);
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
      const [statsRes, reposRes, activityRes] = await Promise.all([
        API.get('/github/stats'),
        API.get('/github/repos'),
        API.get('/github/activity'),
      ]);
      setStats(statsRes.data);
      setRepos(reposRes.data);
      setActivity(activityRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch GitHub data');
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
          <h2>🔗 Connect GitHub</h2>
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
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchGitHubData} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page github-page">
      <h2 className="page-title">GitHub Tracker</h2>

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
          <h3>📁 repositories</h3>
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
                <div className="repo-meta">
                  <span>⭐ {repo.stars}</span>
                  <span>🍴 {repo.forks}</span>
                  <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* recent activity */}
        <section className="github-section">
          <h3>📊 recent activity</h3>
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
    PushEvent: '📤',
    PullRequestEvent: '🔀',
    IssuesEvent: '🐛',
    CreateEvent: '✨',
    WatchEvent: '⭐',
    ForkEvent: '🍴',
    DeleteEvent: '🗑️',
    IssueCommentEvent: '💬',
  };
  return icons[type] || '📌';
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default GitHubTracker;
