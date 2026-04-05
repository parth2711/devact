import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Github, Code2, BarChart2, RefreshCw, TrendingUp, Flame, Plus, Trash2, Check, Trophy, Clock, FileEdit, BookOpen, Package, Loader, Ghost } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


/* ─────────────────────────────────────────
   Streak Widget
───────────────────────────────────────── */
function StreakWidget() {
  const [streak, setStreak] = useState(null);
  useEffect(() => { API.get('/streak').then(r => setStreak(r.data)).catch(() => {}); }, []);
  if (!streak) return null;
  return (
    <div className="dashboard-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Flame size={18} style={{ color: streak.currentStreak > 0 ? '#f97316' : 'var(--text-muted)' }} />
          Coding Streak
        </h3>
        <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
          {[['Current', streak.currentStreak, streak.currentStreak > 0 ? '#f97316' : 'var(--text-muted)'],
            ['Best', streak.longestStreak, 'var(--text-secondary)'],
            ['Total Days', streak.totalActiveDays, 'var(--text-secondary)']].map(([label, val, color]) => (
            <div key={label}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
        {streak.last52.map(({ date, active }) => (
          <div key={date} title={date} style={{ width: '12px', height: '12px', borderRadius: '3px', background: active ? '#f97316' : 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
        ))}
      </div>
      {!streak.activeToday && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
          No activity yet today — commit, submit, or code to keep your streak alive.
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Goals Widget
───────────────────────────────────────── */
const GOAL_PRESETS = [
  { label: 'Solve 1 LC problem',    type: 'lc_solved',      target: 1 },
  { label: 'Solve 2 LC problems',   type: 'lc_solved',      target: 2 },
  { label: 'Submit on CF',          type: 'cf_submitted',   target: 1 },
  { label: 'Code for 2h (Waka)',    type: 'waka_hours',     target: 2 },
  { label: 'Code for 4h (Waka)',    type: 'waka_hours',     target: 4 },
  { label: 'Make 3 GitHub commits', type: 'github_commits', target: 3 },
];

function GoalsWidget() {
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    API.get('/goals').then(r => setGoals(r.data.goals || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const persist = async (list) => {
    const payload = list.map(({ id, label, type, target }) => ({ id, label, type, target, enabled: true }));
    await API.put('/goals', { goals: payload }).catch(() => {});
  };

  const addPreset = async (preset) => {
    const g = { id: crypto.randomUUID(), label: preset.label, type: preset.type, target: preset.target, current: 0, done: false };
    const updated = [...goals, g];
    setGoals(updated); setAdding(false); await persist(updated);
  };

  const addCustom = async () => {
    if (!customLabel.trim()) return;
    const g = { id: crypto.randomUUID(), label: customLabel.trim(), type: 'custom', target: 1, current: 0, done: false };
    const updated = [...goals, g];
    setGoals(updated); setCustomLabel(''); setAdding(false); await persist(updated);
  };

  const removeGoal = async (id) => { const u = goals.filter(g => g.id !== id); setGoals(u); await persist(u); };
  const toggleDone = async (id) => {
    // Optimistic update
    setGoals(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
    try {
      await API.patch(`/goals/${id}/toggle`);
    } catch {
      // Revert on failure
      setGoals(goals.map(g => g.id === id ? { ...g, done: !g.done } : g));
    }
  };

  const doneCount = goals.filter(g => g.done || (g.type !== 'custom' && (g.current || 0) >= g.target)).length;
  const allDone   = goals.length > 0 && doneCount === goals.length;

  if (loading) return null;

  return (
    <div className="dashboard-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Trophy size={18} style={{ color: allDone ? '#10b981' : 'var(--accent)' }} />
          Today's Goals
          {goals.length > 0 && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, background: allDone ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.15)', color: allDone ? '#10b981' : 'var(--accent)', borderRadius: '20px', padding: '0.15rem 0.6rem' }}>
              {doneCount}/{goals.length}
            </span>
          )}
        </h3>
        <button onClick={() => { setAdding(!adding); setTimeout(() => inputRef.current?.focus(), 50); }}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}>
          <Plus size={13} /> Add
        </button>
      </div>

      {goals.length === 0 && !adding && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No goals yet — add one to track your daily targets.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: adding ? '1rem' : 0 }}>
        {goals.map((g) => {
          const pct = g.type === 'custom' ? (g.done ? 100 : 0) : Math.min(100, Math.round(((g.current || 0) / g.target) * 100));
          const isDone = g.done || pct >= 100;
          return (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', background: isDone ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)', borderRadius: '8px', border: `1px solid ${isDone ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`, transition: 'all 0.2s' }}>
              <button onClick={() => g.type === 'custom' && toggleDone(g.id)}
                style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${isDone ? '#10b981' : 'var(--border)'}`, background: isDone ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: g.type === 'custom' ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                {isDone && <Check size={10} color="#fff" strokeWidth={3} />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.label}</div>
                {g.type !== 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                    <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: isDone ? '#10b981' : 'var(--accent)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>{g.current || 0}/{g.target}</span>
                  </div>
                )}
              </div>
              <button onClick={() => removeGoal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.1rem', flexShrink: 0 }}>
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {adding && (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Quick Add</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {GOAL_PRESETS.map(p => (
              <button key={p.label} onClick={() => addPreset(p)}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '0.3rem 0.8rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input ref={inputRef} value={customLabel} onChange={e => setCustomLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="write your own goal…"
              style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none' }} />
            <button className="btn btn-primary btn-sm" onClick={addCustom} disabled={!customLabel.trim()}>Add</button>
          </div>
        </div>
      )}
      {allDone && goals.length > 0 && (
        <p style={{ fontSize: '0.82rem', color: '#10b981', textAlign: 'center', marginTop: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}><Check size={14} /> All goals done for today!</p>
      )}
    </div>
  );
}

function Dashboard() {
  const { user }                        = useAuth();
  const [data, setData]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [syncing, setSyncing]           = useState(false);
  const [syncStatus, setSyncStatus]     = useState(null);
  const [snapshots, setSnapshots]       = useState([]);
  const [syncError, setSyncError] = useState('');
  const [shadowMode, setShadowMode]     = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchSyncStatus();
    fetchSnapshots();
  }, []);

  useEffect(() => {
    if (data?.syncing) {
      const interval = setInterval(async () => {
        const status = await API.get('/sync/status').then(r => r.data).catch(() => null);
        if (status?.synced) {
          clearInterval(interval);
          fetchDashboard();
          fetchSyncStatus();
          fetchSnapshots();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data?.syncing]);

  const fetchDashboard    = async () => { try { const r = await API.get('/dashboard'); setData(r.data); } catch {} finally { setLoading(false); } };
  const fetchSyncStatus   = async () => { try { const r = await API.get('/sync/status'); setSyncStatus(r.data); } catch {} };
  const fetchSnapshots    = async () => { try { const r = await API.get('/snapshots?days=30'); setSnapshots(r.data.snapshots || []); } catch {} };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      setSyncError('');
      await API.post('/sync/now');
      const initialSyncTime = syncStatus?.lastFullSync;
      const poll = setInterval(async () => {
        try {
          const r = await API.get('/sync/status');
          if (r.data.lastFullSync !== initialSyncTime) {
            clearInterval(poll);
            await fetchDashboard();
            setSyncStatus(r.data);
            await fetchSnapshots();
            setSyncing(false);
          }
        } catch {}
      }, 3000);
      setTimeout(() => { clearInterval(poll); setSyncing(false); }, 30000);
    } catch (err) {
      setSyncError(err.response?.data?.message || 'Sync failed — try again.');
      setSyncing(false);
    }
  };

  const formatSyncTime = (d) => d ? new Date(d).toLocaleString() : 'Never';
  const isStalled      = (t) => t && (new Date() - new Date(t)) > 600000;

  const hasAny = user?.githubUsername || user?.codeforcesHandle || user?.leetcodeUsername
    || user?.wakatimeConfiguredAt || user?.stackoverflowId
    || user?.npmPackages?.length > 0 || user?.pypiPackages?.length > 0;

  const hasTrendData = snapshots.length > 1;

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="page"><p className="loading">Loading dashboard…</p></div>;

  return (
    <div className={`page dashboard-page ${shadowMode ? 'shadow-mode' : ''}`}>
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div>
          <h2>{greeting}, {user?.name?.split(' ')[0]}</h2>
          <p className="dashboard-subtitle">Your developer activity at a glance</p>
        </div>
        <div className="dashboard-header-actions">
          <div className="sync-time">
            Last synced<br />
            {formatSyncTime(syncStatus?.lastFullSync || data?.lastSyncedAt)}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleSyncNow}
            disabled={syncing}
          >
            <RefreshCw size={13} className={syncing ? 'spinning' : ''} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
          <button
            className={`btn btn-sm ${shadowMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.4rem' }}
            title="Toggle Shadow Board"
            onClick={() => setShadowMode(!shadowMode)}
          >
            <Ghost size={16} />
          </button>
        </div>
      </header>

      {/* ── Notices ── */}
      {syncError && (
        <div className="dashboard-notice" style={{ borderColor: 'rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.06)' }}>
          <span style={{ color: 'var(--error)' }}>{syncError}</span>
        </div>
      )}
      {data?.syncing && (
        <div className="dashboard-notice" style={{ borderColor: 'rgba(108,142,191,0.3)', background: 'rgba(108,142,191,0.06)' }}>
          <span style={{ color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}><Loader size={14} className="spinning" /> Initial sync in progress — your data will appear shortly.</span>
        </div>
      )}
      {!hasAny && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>Get started — connect your accounts</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            DevAct can't show you anything until it knows where to pull data from.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { icon: '🐙', label: 'GitHub username',    done: !!user?.githubUsername,      desc: 'Commits, repos, stars' },
              { icon: '💙', label: 'Codeforces handle',  done: !!user?.codeforcesHandle,    desc: 'Rating, contests, submissions' },
              { icon: '🟡', label: 'LeetCode username',  done: !!user?.leetcodeUsername,    desc: 'Problems solved, ranking' },
              { icon: '⏱️', label: 'WakaTime API key',   done: !!user?.wakatimeConfiguredAt, desc: 'Coding hours per language' },
            ].map(({ icon, label, done, desc }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                background: done ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)',
                border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                borderRadius: '8px',
                opacity: done ? 0.75 : 1,
              }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: done ? '#10b981' : 'var(--text-primary)' }}>
                    {done ? '✓ ' : ''}{label}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/profile" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '1.25rem', fontSize: '0.88rem' }}>
            Set up my profile →
          </Link>
        </div>
      )}


      {/* ── Streak + Goals ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '0.5rem' }}>
        <StreakWidget />
        <GoalsWidget />
      </div>

      {/* ── WakaTime headline ── */}
      {data?.wakatime?.totalSeconds > 0 && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Clock size={20} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
            {Math.round(data.wakatime.totalSeconds / 3600)}h
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>coded this week</span>
        </div>
      )}

      {/* ── Stats Row ── */}
      {data && !data.syncing && (() => {
        // Compute deltas from snapshots (oldest → newest)
        const oldest = snapshots.length > 1 ? snapshots[0] : null;
        const newest = snapshots.length > 1 ? snapshots[snapshots.length - 1] : null;
        const delta = (newVal, oldVal) => {
          if (oldVal == null || newVal == null) return null;
          const d = newVal - oldVal;
          return d !== 0 ? d : null;
        };
        const DeltaBadge = ({ value }) => {
          if (value == null) return null;
          const positive = value > 0;
          return (
            <span style={{
              fontSize: '0.68rem', fontWeight: 600, fontFamily: 'var(--font-mono)',
              color: positive ? '#10b981' : '#ef4444',
              display: 'inline-flex', alignItems: 'center', gap: '0.15rem',
              marginTop: '0.3rem',
            }}>
              {positive ? '+' : ''}{value}
              <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>30d</span>
            </span>
          );
        };

        return (
          <>
            <p className="section-label">{shadowMode ? 'Anti-Metrics' : 'Overview'}</p>
            <div className="stats-grid dashboard-stats">
              {shadowMode && data.shadow ? (
                <>
                  <div className="stat-card shadow-card">
                    <span className="stat-value">{data.shadow.longestZeroStreak}</span>
                    <span className="stat-label">Longest Zero-Commit Streak (Days)</span>
                  </div>
                  <div className="stat-card shadow-card" style={{ gridColumn: 'span 2' }}>
                    <span className="stat-value" style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                      {data.shadow.oldestRepo?.name || 'None'}
                    </span>
                    <span className="stat-label">
                      Most Abandoned Repo {data.shadow.oldestRepo?.daysAgo ? `(${data.shadow.oldestRepo.daysAgo} days ago)` : ''}
                    </span>
                  </div>
                  <div className="stat-card shadow-card">
                    <span className="stat-value">{data.shadow.lcStruggle}</span>
                    <span className="stat-label">Recent Failed Submissions</span>
                  </div>
                </>
              ) : (
                <>
                  {data.github && (
                    <>
                      <div className="stat-card">
                        <span className="stat-value">{data.github.repos}</span>
                        <span className="stat-label">Repositories</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-value">{data.github.totalStars}</span>
                        <DeltaBadge value={delta(newest?.github?.stars, oldest?.github?.stars)} />
                        <span className="stat-label">Total Stars</span>
                      </div>
                      <div className="stat-card">
                        <span className="stat-value">{data.github.followers}</span>
                        <span className="stat-label">Followers</span>
                      </div>
                    </>
                  )}
                  {data.codeforces && (
                    <div className="stat-card blue">
                      <span className="stat-value">{data.codeforces.rating}</span>
                      <DeltaBadge value={delta(newest?.codeforces?.rating, oldest?.codeforces?.rating)} />
                      <span className="stat-label">CF Rating</span>
                    </div>
                  )}
                  {data.leetcode && (
                    <div className="stat-card green">
                      <span className="stat-value">{data.leetcode.totalSolved}</span>
                      <DeltaBadge value={delta(newest?.leetcode?.totalSolved, oldest?.leetcode?.totalSolved)} />
                      <span className="stat-label">LC Solved</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        );
      })()}


      {/* ── Trend Charts ── */}
      {hasTrendData && (
        <div className="trend-section">
          <div className="trend-section-header">
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <h3>Trends · Last 30 Days</h3>
          </div>
          <div className="dashboard-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              {snapshots[0]?.codeforces?.rating > 0 && (
                <div>
                  <p className="section-label">Codeforces Rating</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={snapshots}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="codeforces.rating" stroke="var(--accent-blue)" strokeWidth={2} dot={false} name="Rating" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {snapshots[0]?.leetcode?.totalSolved > 0 && (
                <div>
                  <p className="section-label">LeetCode Solved</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={snapshots}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="leetcode.totalSolved" stroke="var(--success)" strokeWidth={2} dot={false} name="Solved" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              {snapshots[0]?.github?.stars > 0 && (
                <div>
                  <p className="section-label">GitHub Stars</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={snapshots}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="github.stars" stroke="var(--accent)" strokeWidth={2} dot={false} name="Stars" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Feature Nav Cards ── */}
      <p className="section-label" style={{ marginTop: '2rem' }}>Explore</p>
      <div className="dashboard-grid">
        <Link to="/github" className="dashboard-card dashboard-card-link">
          <h3><Github size={18} style={{ color: 'var(--accent)' }} /> GitHub Activity</h3>
          <p>Monitor commits, PRs, and contribution streaks across your repositories.</p>
          {user?.githubUsername
            ? <span className="badge badge-connected">Connected: {user.githubUsername}</span>
            : <span className="badge">Not Connected</span>}
        </Link>

        <Link to="/cp" className="dashboard-card dashboard-card-link">
          <h3><Code2 size={18} style={{ color: 'var(--accent-blue)' }} /> CP Performance</h3>
          <p>Track Codeforces rating, LeetCode progress, and full contest history.</p>
          {user?.codeforcesHandle || user?.leetcodeUsername
            ? <span className="badge badge-connected">
                {[user?.codeforcesHandle && `CF: ${user.codeforcesHandle}`, user?.leetcodeUsername && `LC: ${user.leetcodeUsername}`].filter(Boolean).join(' / ')}
              </span>
            : <span className="badge">Not Connected</span>}
        </Link>

        <Link to="/repos" className="dashboard-card dashboard-card-link">
          <h3><BarChart2 size={18} style={{ color: 'var(--success)' }} /> Repo Visualizer</h3>
          <p>View language breakdowns, stars, and activity across your repositories.</p>
          {user?.githubUsername
            ? <span className="badge badge-connected">Connected</span>
            : <span className="badge">Not Connected</span>}
        </Link>

        <Link to="/practice" className="dashboard-card dashboard-card-link">
          <h3><FileEdit size={18} style={{ color: 'var(--accent)' }} /> Practice Review</h3>
          <p>Review problems you attempted but didn't solve, with editorial links.</p>
          <span className="badge">Review Queue</span>
        </Link>


        <Link to="/contests" className="dashboard-card dashboard-card-link">
          <h3><Trophy size={18} style={{ color: 'var(--warning)' }} /> Contest Calendar</h3>
          <p>Upcoming Codeforces and LeetCode contests with countdowns and register links.</p>
          <span className="badge badge-connected">CF + LC</span>
        </Link>

        <Link to="/journal" className="dashboard-card dashboard-card-link">
          <h3><BookOpen size={18} style={{ color: 'var(--accent-blue)' }} /> Dev Journal</h3>
          <p>Log what you worked on each day. Build a personal history of your growth.</p>
          <span className="badge">Daily Log</span>
        </Link>

        {/* LeetCode Summary */}
        {data?.leetcode && (
          <div className="dashboard-card">
            <h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--warning)' }}>
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.541l11.97 10.917c.182.165.41.25.645.24h.01a1.282 1.282 0 0 0 .869-.368l3.18-3.04a1.314 1.314 0 0 0 .354-.863 1.284 1.284 0 0 0-.343-.861l-6.284-6.66 4.498-.01c.219-.001.431-.073.61-.205.18-.133.313-.314.385-.522a1.298 1.298 0 0 0 .01-.871 1.3 1.3 0 0 0-.41-.611l-5.347-5.588-3.957-4.11a1.365 1.365 0 0 0-.95-.44zm-2.022 17.51a1.88 1.88 0 0 0-1.879-1.882h-6.14a1.88 1.88 0 1 0 0 3.763h6.14a1.88 1.88 0 0 0 1.879-1.881z" />
              </svg>
              LeetCode Progress
            </h3>
            <div className="lc-progress">
              <div className="lc-progress-item">
                <span className="lc-count lc-easy-text">{data.leetcode.easy}</span>
                <span className="lc-label">Easy</span>
              </div>
              <div className="lc-progress-item">
                <span className="lc-count lc-medium-text">{data.leetcode.medium}</span>
                <span className="lc-label">Medium</span>
              </div>
              <div className="lc-progress-item">
                <span className="lc-count lc-hard-text">{data.leetcode.hard}</span>
                <span className="lc-label">Hard</span>
              </div>
            </div>
          </div>
        )}

        {/* WakaTime */}
        {data?.wakatime && data.wakatime.totalSeconds > 0 ? (
          <div className="dashboard-card">
            <h3><Clock size={18} style={{ color: 'var(--text-secondary)' }} /> WakaTime Languages</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {data.wakatime.languages?.map((lang) => (
                <div key={lang.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {lang.percent}% · {Math.round(lang.total_seconds / 3600)}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : data?.wakatime && data.wakatime.totalSeconds === 0 ? (
          <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> No WakaTime activity this week.</p>
          </div>
        ) : user?.wakatimeConfiguredAt && !data?.wakatime ? (
          <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isStalled(user.wakatimeConfiguredAt)
              ? <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>WakaTime sync failed — try syncing manually.</p>
              : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Loader size={14} className="spinning" /> Syncing WakaTime…</p>
            }
          </div>
        ) : null}

        {/* Stack Overflow */}
        {data?.stackoverflow?.reputation > 0 ? (
          <div className="dashboard-card">
            <h3>
              <svg width="18" height="18" viewBox="0 0 120 120" fill="#f58025">
                <path d="M84.4 93.8V70.6h7.7v30.9H22.6V70.6h7.7v23.2z" />
                <path d="M38.8 68.4l37.8 7.9 1.6-7.6-37.8-7.9-1.6 7.6zm5-18l35 16.3 3.2-7-35-16.4-3.2 7.1zm9.7-17.2l29.7 24.7 4.9-5.9-29.7-24.7-4.9 5.9zm19.2-18.3l-6.2 4.6 23 31 6.2-4.6-23-31zM38 86h38.6v-7.7H38V86z" />
              </svg>
              Stack Overflow
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.75rem 0' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>{data.stackoverflow.reputation.toLocaleString()}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>reputation</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {data.stackoverflow.badges.gold   > 0 && <span style={{ color: '#f1b600', fontWeight: 600, fontSize: '0.875rem' }}>● {data.stackoverflow.badges.gold}</span>}
              {data.stackoverflow.badges.silver > 0 && <span style={{ color: '#b4b8bc', fontWeight: 600, fontSize: '0.875rem' }}>● {data.stackoverflow.badges.silver}</span>}
              {data.stackoverflow.badges.bronze > 0 && <span style={{ color: '#d1a684', fontWeight: 600, fontSize: '0.875rem' }}>● {data.stackoverflow.badges.bronze}</span>}
            </div>
            {data.stackoverflow.topAnswers?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <p className="section-label">Top Answers</p>
                {data.stackoverflow.topAnswers.map((ans, idx) => (
                  <a key={idx} href={ans.link} target="_blank" rel="noreferrer"
                    style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>+{ans.score}</span> {ans.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : user?.stackoverflowId && !data?.stackoverflow ? (
          <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isStalled(user.updatedAt)
              ? <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>Stack Overflow sync failed.</p>
              : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Loader size={14} className="spinning" /> Syncing Stack Overflow…</p>
            }
          </div>
        ) : null}

        {/* Packages */}
        {(data?.packages?.npm?.length > 0 || data?.packages?.pypi?.length > 0) ? (
          <div className="dashboard-card">
            <h3><Package size={18} style={{ color: 'var(--accent)' }} /> Open Source Impact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
              {data.packages.npm?.map(pkg => (
                <div key={`npm-${pkg.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#cb3837', color: 'white', fontWeight: 700 }}>npm</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pkg.name}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pkg.weeklyDownloads.toLocaleString()}/wk</span>
                </div>
              ))}
              {data.packages.pypi?.map(pkg => (
                <div key={`pypi-${pkg.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#3776ab', color: 'white', fontWeight: 700 }}>PyPI</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pkg.name}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pkg.weeklyDownloads.toLocaleString()}/wk</span>
                </div>
              ))}
            </div>
          </div>
        ) : ((user?.npmPackages?.length > 0 || user?.pypiPackages?.length > 0) && (!data?.packages?.npm && !data?.packages?.pypi)) ? (
          <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isStalled(user.updatedAt)
              ? <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>Packages sync failed.</p>
              : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Loader size={14} className="spinning" /> Syncing packages…</p>
            }
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Dashboard;
