import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';

function CPTracker() {
  const { user } = useAuth();
  const [cfStats, setCfStats] = useState(null);
  const [cfSubmissions, setCfSubmissions] = useState([]);
  const [lcStats, setLcStats] = useState(null);
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
          API.get('/cp/leetcode').then((r) => setLcStats(r.data))
        );
      }

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
          <h2>🏆 Connect CP Accounts</h2>
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
          <h2>⚠️ Error</h2>
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
          <h3 className="section-title">🟦 Codeforces — {cfStats.userInfo.handle}</h3>
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
              <h4>📈 Recent Contests</h4>
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
              <h4>📝 Recent Submissions</h4>
              <div className="submissions-list">
                {cfSubmissions.slice(0, 10).map((sub) => (
                  <div key={sub.id} className="submission-item">
                    <div className="submission-info">
                      <span className="submission-problem">
                        {sub.problem.index}. {sub.problem.name}
                      </span>
                      {sub.problem.rating && (
                        <span className="submission-difficulty">★ {sub.problem.rating}</span>
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
          <h3 className="section-title lc-title">🟨 LeetCode — {lcStats.username}</h3>
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
        </>
      )}
    </div>
  );
}

export default CPTracker;
