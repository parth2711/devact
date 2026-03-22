import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { ExternalLink, AlertTriangle, BookOpen, Trophy } from 'lucide-react';

function PracticeReview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasCF = !!user?.codeforcesHandle;
  const hasLC = !!user?.leetcodeUsername;

  useEffect(() => {
    if (!hasCF && !hasLC) {
      setLoading(false);
      return;
    }
    fetchPracticeReview();
  }, [user]);

  const fetchPracticeReview = async () => {
    try {
      const res = await API.get('/cp/practice-review');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page"><p className="loading">Loading practice review...</p></div>;

  // Empty state: no handles configured
  if (!hasCF && !hasLC) {
    return (
      <div className="page cp-page">
        <div className="empty-state">
          <BookOpen size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
          <h2>Practice Review</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Connect your Codeforces or LeetCode account in Profile settings to see practice review.
          </p>
          <Link to="/profile" className="btn btn-primary">Go to Profile</Link>
        </div>
      </div>
    );
  }

  const cfProblems = data?.codeforces || [];
  const lcProblems = data?.leetcode || [];
  const failedPlatforms = data?.failedPlatforms || [];
  const hasNoFailures = cfProblems.length === 0 && lcProblems.length === 0 && failedPlatforms.length === 0;

  return (
    <div className="page cp-page">
      <h2 className="page-title">Practice Review</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Problems you attempted but didn't solve. Review editorials and try again.
      </p>

      {/* Platform failure banners */}
      {failedPlatforms.map(p => (
        <div key={p} style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: '#ef4444',
        }}>
          <AlertTriangle size={16} />
          Could not load {p === 'codeforces' ? 'Codeforces' : 'LeetCode'} data. Try syncing again.
        </div>
      ))}

      {/* Empty state: no failures */}
      {hasNoFailures && (
        <div className="empty-state" style={{ paddingTop: '3rem' }}>
          <Trophy size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)' }}>No failed problems found — great work! 🎉</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Keep solving and your latest attempts will appear here after sync.
          </p>
        </div>
      )}

      {/* Codeforces Section */}
      {cfProblems.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Codeforces — Failed Problems
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cfProblems.map((p, i) => (
              <div key={`cf-${i}`} className="dashboard-card" style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {p.index}. {p.name}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.rating && <span>Rating: <strong>{p.rating}</strong></span>}
                    <span className={`verdict ${p.verdict === 'OK' ? 'accepted' : 'rejected'}`} style={{ fontSize: '0.75rem' }}>
                      {p.verdict}
                    </span>
                  </div>
                </div>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--accent-primary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  View Problem <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LeetCode Section */}
      {lcProblems.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="section-title lc-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            LeetCode — Failed Problems
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.7 }}>
            Shows failed problems from your last 20 LeetCode submissions.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lcProblems.map((p, i) => (
              <div key={`lc-${i}`} className="dashboard-card" style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {p.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span className="verdict rejected" style={{ fontSize: '0.75rem' }}>
                      {p.verdict}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: 'var(--accent-primary)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    Problem <ExternalLink size={14} />
                  </a>
                  <a
                    href={p.editorialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#10b981',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    Editorial <BookOpen size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.lastSyncedAt && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', opacity: 0.6 }}>
          Last synced: {new Date(data.lastSyncedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default PracticeReview;
