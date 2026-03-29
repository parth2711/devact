import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Calendar, ExternalLink, Clock, Trophy } from 'lucide-react';

const PLATFORM_COLORS = {
  codeforces: { bg: 'rgba(30,120,255,0.12)', border: 'rgba(30,120,255,0.35)', text: '#3b82f6', label: 'Codeforces' },
  leetcode:   { bg: 'rgba(255,161,22,0.12)',  border: 'rgba(255,161,22,0.35)',  text: '#f59e0b', label: 'LeetCode'   },
};

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatCountdown(startTime) {
  const diff = new Date(startTime) - Date.now();
  if (diff <= 0) return 'Starting now';
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0)  return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

function ContestCard({ contest }) {
  const style = PLATFORM_COLORS[contest.platform] || PLATFORM_COLORS.codeforces;
  const startDate = new Date(contest.startTime);
  const [countdown, setCountdown] = useState(formatCountdown(contest.startTime));

  useEffect(() => {
    const t = setInterval(() => setCountdown(formatCountdown(contest.startTime)), 60000);
    return () => clearInterval(t);
  }, [contest.startTime]);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid var(--border-color)`,
      borderLeft: `3px solid ${style.text}`,
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
      transition: 'all 0.2s',
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        {/* Platform badge */}
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: style.text,
          background: style.bg,
          border: `1px solid ${style.border}`,
          borderRadius: '20px',
          padding: '0.15rem 0.6rem',
          marginBottom: '0.5rem',
          display: 'inline-block',
        }}>
          {style.label}
        </span>

        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
          {contest.name}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={13} />
            {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            {' · '}
            {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={13} />
            {formatDuration(contest.durationSeconds)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--accent-primary)',
        }}>
          {countdown}
        </span>
        <a
          href={contest.registerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.4rem 1rem' }}
        >
          Register <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    API.get('/contests')
      .then((r) => setContests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? contests : contests.filter((c) => c.platform === filter);

  return (
    <div className="page" style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>Contest Calendar</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Upcoming contests from Codeforces &amp; LeetCode</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'codeforces', 'leetcode'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${filter === f ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: '20px',
                padding: '0.35rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="loading">Fetching contests...</p>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <Trophy size={40} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
          <h3>No upcoming contests found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Check back soon — contests are usually announced a few days in advance.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((c) => (
          <ContestCard key={`${c.platform}-${c.id}`} contest={c} />
        ))}
      </div>
    </div>
  );
}

export default Contests;
