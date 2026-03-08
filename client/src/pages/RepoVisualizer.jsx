import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Go: '#00ADD8',
  Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138',
  Kotlin: '#A97BFF', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getColor(lang) {
  return LANG_COLORS[lang] || '#8b5cf6';
}

function FileTree({ tree }) {
  if (!tree || tree.length === 0) return <p className="text-muted">no files found.</p>;

  // build nested tree structure
  const root = { name: 'root', type: 'dir', children: {} };
  
  tree.forEach(item => {
    const parts = item.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: i === parts.length - 1 ? item.type : 'tree',
          children: {}
        };
      }
      current = current.children[part];
    }
  });

  const renderNode = (node, depth = 0) => {
    const entries = Object.values(node.children).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div key={node.name} style={{ marginLeft: depth > 0 ? '1.5rem' : '0' }}>
        {entries.map(child => (
          <div key={child.name} className="tree-node">
            <span className="tree-icon">{child.type === 'tree' ? '📁' : '📄'}</span>
            <span className={child.type === 'tree' ? 'tree-folder' : 'tree-file'}>
              {child.name}
            </span>
            {child.type === 'tree' && renderNode(child, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="file-tree-container">
      {renderNode(root)}
    </div>
  );
}

function RepoVisualizer() {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoDetails, setRepoDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.githubUsername) {
      setLoading(false);
      return;
    }
    fetchRepos();
  }, [user]);

  useEffect(() => {
    if (selectedRepo) fetchRepoDetails(selectedRepo);
  }, [selectedRepo]);

  const fetchRepos = async () => {
    try {
      const res = await API.get('/repos');
      setRepos(res.data);
      if (res.data.length > 0) setSelectedRepo(res.data[0]);
    } catch (err) {
      setError('failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoDetails = async (repo) => {
    setDetailsLoading(true);
    try {
      const owner = user.githubUsername;
      const res = await API.get(`/repos/${owner}/${repo.name}`);
      setRepoDetails({ ...repo, ...res.data });
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) return <div className="page"><p className="loading">loading repos...</p></div>;

  if (!user?.githubUsername) {
    return (
      <div className="page repo-page">
        <div className="empty-state">
          <h2>connect github</h2>
          <Link to="/profile" className="btn btn-primary">go to profile</Link>
        </div>
      </div>
    );
  }

  if (error) return <div className="page"><p className="text-muted">{error}</p></div>;

  // prep chart data
  let activityData = [];
  if (repoDetails?.activity?.all) {
    activityData = repoDetails.activity.all.map((count, i) => ({
      week: `week ${i + 1}`,
      commits: count
    }));
  }

  let languageData = [];
  if (repoDetails?.languages) {
    const totalBytes = Object.values(repoDetails.languages).reduce((a, b) => a + b, 0);
    languageData = Object.entries(repoDetails.languages)
      .map(([name, bytes]) => ({
        name,
        value: Math.round((bytes / totalBytes) * 100),
      }))
      .filter(l => l.value > 0);
  }

  return (
    <div className="page repo-page">
      <h2 className="page-title">repo visualizer</h2>

      <div className="repo-selector">
        <select 
          className="form-input"
          value={selectedRepo?.id || ''}
          onChange={(e) => {
            const r = repos.find(r => r.id === Number(e.target.value));
            setSelectedRepo(r);
          }}
        >
          {repos.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {detailsLoading ? (
        <p className="loading">crunching data...</p>
      ) : repoDetails ? (
        <div className="bento-grid">
          {/* stats */}
          <div className="bento-card">
            <span className="stat-value">{repoDetails.stars}</span>
            <span className="stat-label">stars</span>
          </div>
          <div className="bento-card">
            <span className="stat-value">{repoDetails.forks}</span>
            <span className="stat-label">forks</span>
          </div>
          <div className="bento-card">
            <span className="stat-value">{repoDetails.watchers || 0}</span>
            <span className="stat-label">watchers</span>
          </div>
          <div className="bento-card">
            <span className="stat-value">{repoDetails.openIssues || 0}</span>
            <span className="stat-label">open issues</span>
          </div>

          {/* repo info details */}
          <div className="bento-card" style={{ gridColumn: '1 / -1' }}>
            <h4 className="chart-title" style={{ marginBottom: '0.5rem' }}>repository details</h4>
            {repoDetails.description && <p className="text-muted" style={{ marginBottom: '1rem' }}>{repoDetails.description}</p>}
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {repoDetails.topics?.map(topic => (
                <span key={topic} style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                  #{topic}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div><strong>size:</strong> {formatBytes(repoDetails.size * 1024)}</div>
              <div><strong>branch:</strong> {repoDetails.defaultBranch}</div>
              <div><strong>created:</strong> {new Date(repoDetails.createdAt).toLocaleDateString()}</div>
              <div><strong>updated:</strong> {new Date(repoDetails.updatedAt).toLocaleDateString()}</div>
              <div><strong>visibility:</strong> {repoDetails.isPrivate ? 'private 🔒' : 'public 🌍'}</div>
              <div><a href={repoDetails.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>view on github ↗</a></div>
            </div>
          </div>

          {/* activity chart */}
          <div className="bento-card chart-card" style={{ gridColumn: '1 / -1', height: '300px' }}>
            <h4 className="chart-title">commit activity (last year)</h4>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e26', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="commits" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorCommits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* language chart */}
          {languageData.length > 0 && (
            <div className="bento-card chart-card" style={{ height: '300px' }}>
              <h4 className="chart-title">languages</h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ backgroundColor: '#1e1e26', border: '1px solid #333', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* file tree structure */}
          {repoDetails.tree && (
            <div className="bento-card" style={{ gridColumn: '1 / -1', maxHeight: '400px', overflowY: 'auto' }}>
              <h4 className="chart-title" style={{ marginBottom: '1rem' }}>repository structure</h4>
              <FileTree tree={repoDetails.tree} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default RepoVisualizer;
