import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Lua: '#000080',
  R: '#198CE7',
  Scala: '#c22d40',
};

function getColor(lang) {
  return LANG_COLORS[lang] || '#8b5cf6';
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function RepoVisualizer() {
  const { user } = useAuth();
  const [languages, setLanguages] = useState([]);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.githubUsername) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [langRes, repoRes] = await Promise.all([
        API.get('/repos/languages'),
        API.get('/repos'),
      ]);
      setLanguages(langRes.data);
      setRepos(repoRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch repo data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page"><p className="loading">Analyzing repositories...</p></div>;
  }

  if (!user?.githubUsername) {
    return (
      <div className="page repo-page">
        <div className="empty-state">
          <h2>Connect GitHub</h2>
          <p>Set your GitHub username in your profile to visualize your repositories.</p>
          <Link to="/profile" className="btn btn-primary">Go to Profile</Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page repo-page">
        <div className="empty-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchData} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks, 0);

  return (
    <div className="page repo-page">
      <h2 className="page-title">Repo Visualizer</h2>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{repos.length}</span>
          <span className="stat-label">Repositories</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{languages.length}</span>
          <span className="stat-label">Languages</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalStars}</span>
          <span className="stat-label">Total Stars</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalForks}</span>
          <span className="stat-label">Total Forks</span>
        </div>
      </div>

      <div className="repo-viz-layout">
        {/* Language Breakdown */}
        <section className="repo-viz-section">
          <h3>Language Breakdown</h3>

          {/* Language Bar */}
          {languages.length > 0 && (
            <div className="lang-bar-container">
              <div className="lang-bar">
                {languages.slice(0, 8).map((lang) => (
                  <div
                    key={lang.language}
                    className="lang-bar-segment"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: getColor(lang.language),
                    }}
                    title={`${lang.language}: ${lang.percentage}%`}
                  />
                ))}
              </div>
              <div className="lang-legend">
                {languages.slice(0, 8).map((lang) => (
                  <div key={lang.language} className="lang-legend-item">
                    <span
                      className="lang-dot"
                      style={{ backgroundColor: getColor(lang.language) }}
                    />
                    <span className="lang-name">{lang.language}</span>
                    <span className="lang-pct">{lang.percentage}%</span>
                    <span className="lang-bytes">{formatBytes(lang.bytes)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Top Repositories */}
        <section className="repo-viz-section">
          <h3>Top Repositories</h3>
          <div className="repo-viz-list">
            {repos.slice(0, 8).map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-viz-card"
              >
                <div className="repo-viz-header">
                  <span className="repo-viz-name">{repo.name}</span>
                  <div className="repo-viz-badges">
                    {repo.language && (
                      <span
                        className="repo-viz-lang"
                        style={{ color: getColor(repo.language) }}
                      >
                        {repo.language}
                      </span>
                    )}
                  </div>
                </div>
                {repo.description && (
                  <p className="repo-viz-desc">{repo.description}</p>
                )}
                <div className="repo-viz-stats">
                  <span>Stars: {repo.stars}</span>
                  <span>Forks: {repo.forks}</span>
                  <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RepoVisualizer;
