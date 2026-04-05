import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flame, Copy, Check, Github, ExternalLink } from 'lucide-react';

const CF_RANK_COLORS = {
  legendary: '#ff0000', grandmaster: '#ff3333', master: '#ff8c00',
  candidate: '#aa00aa', expert: '#0000ff', specialist: '#03a89e',
  pupil: '#008000', newbie: '#808080',
};
function cfColor(rank = '') {
  const key = Object.keys(CF_RANK_COLORS).find(k => rank.toLowerCase().includes(k));
  return key ? CF_RANK_COLORS[key] : '#808080';
}

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', Go: '#00ADD8', Rust: '#dea584',
  Ruby: '#701516', Swift: '#F05138', Kotlin: '#A97BFF',
  HTML: '#e34c26', CSS: '#563d7c', 'C#': '#178600', C: '#555555',
};
function langColor(lang) { return LANG_COLORS[lang] || '#8b5cf6'; }

function StatPill({ value, label, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '10px', padding: '0.9rem 1.1rem', textAlign: 'center', minWidth: '76px',
    }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: color || 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '0.85rem' }}>
      {title && <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>{title}</p>}
      {children}
    </div>
  );
}

export default function PublicProfile() {
  const { username } = useParams();
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [notFound,  setNotFound]  = useState(false);
  const [copied,    setCopied]    = useState(false);

  useEffect(() => {
    const base = import.meta.env.DEV ? 'http://localhost:5000' : '';
    fetch(`${base}/api/u/${username}`)
      .then(async r => {
        const d = await r.json();
        if (r.status === 404)      setNotFound(true);
        else if (r.status === 403) setIsPrivate(true);
        else                       setProfile(d);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="page auth-page"><p style={{ color: 'var(--text-muted)' }}>Loading…</p></div>;

  if (notFound) return (
    <div className="page auth-page" style={{ flexDirection: 'column', gap: '1rem' }}>
      <h2>User not found</h2>
      <p style={{ color: 'var(--text-muted)' }}>No one by the name <strong>@{username}</strong> here.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );

  if (isPrivate) return (
    <div className="page auth-page" style={{ flexDirection: 'column', gap: '1rem' }}>
      <h2>🔒 Private Profile</h2>
      <p style={{ color: 'var(--text-muted)' }}><strong>@{username}</strong> keeps this private.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );

  const { github, codeforces, leetcode, wakatime, stackoverflow, packages, streak } = profile;

  return (
    <div className="page" style={{ maxWidth: '660px' }}>

      {/* ── Header ── */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {profile.avatar
              ? <img src={profile.avatar} alt={profile.name} style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid var(--border)' }} />
              : <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 700, color: '#000' }}>{profile.name?.[0]?.toUpperCase()}</div>
            }
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, margin: 0, marginBottom: '0.1rem' }}>{profile.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>@{profile.username}</p>
              {github?.username && (
                <a href={`https://github.com/${github.username}`} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textDecoration: 'none' }}>
                  <Github size={12} /> {github.username}
                </a>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <a href="https://devact.vercel.app" target="_blank" rel="noreferrer"
              style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'none', padding: '0.3rem 0.65rem', border: '1px solid var(--border)', borderRadius: 'var(--r-pill)' }}>
              DevAct
            </a>
            <button onClick={share} style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: copied ? 'rgba(63,185,80,0.1)' : 'var(--bg-surface)',
              border: `1px solid ${copied ? 'rgba(63,185,80,0.4)' : 'var(--border)'}`,
              borderRadius: 'var(--r-pill)', padding: '0.3rem 0.8rem',
              cursor: 'pointer', fontSize: '0.75rem',
              color: copied ? 'var(--success)' : 'var(--text-secondary)',
              transition: 'var(--ease)',
            }}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </Card>

      {/* ── Stats row ── */}
      {(github || codeforces || leetcode || wakatime) && (
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
          {github && <>
            <StatPill value={github.repos}      label="Repos"     />
            <StatPill value={github.totalStars} label="Stars"     />
            <StatPill value={github.followers}  label="Followers" />
          </>}
          {codeforces && <StatPill value={codeforces.rating} label={codeforces.rank || 'CF Rating'} color={cfColor(codeforces.rank)} />}
          {leetcode   && <StatPill value={leetcode.totalSolved} label="LC Solved" color="var(--warning)" />}
          {wakatime?.totalSeconds > 0 && <StatPill value={`${Math.round(wakatime.totalSeconds / 3600)}h`} label="Coded/wk" color="var(--accent)" />}
        </div>
      )}

      {/* ── Streak ── */}
      {streak && (
        <Card title="Coding Streak">
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              ['Current', streak.currentStreak, streak.currentStreak > 0 ? '#f97316' : 'var(--text-muted)'],
              ['Best', streak.longestStreak, 'var(--text-secondary)'],
              ['Active Days', streak.totalActiveDays, 'var(--text-secondary)'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{val}</span>
                  {label === 'Current' && val > 0 && <Flame size={18} style={{ color: '#f97316' }} />}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── LeetCode ── */}
      {leetcode && (
        <Card title="LeetCode">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {[['Easy', leetcode.easy, 'var(--success)'], ['Medium', leetcode.medium, 'var(--warning)'], ['Hard', leetcode.hard, 'var(--error)']].map(([d, v, c]) => (
                <div key={d} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: c }}>{v}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{d}</div>
                </div>
              ))}
            </div>
            {leetcode.ranking > 0 && (
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Rank <strong style={{ color: 'var(--text-primary)' }}>#{leetcode.ranking.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── Codeforces ── */}
      {codeforces && (
        <Card title="Codeforces">
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: cfColor(codeforces.rank), lineHeight: 1 }}>{codeforces.rating}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'capitalize' }}>{codeforces.rank}</div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Peak <strong style={{ color: 'var(--text-primary)' }}>{codeforces.maxRating}</strong>
            </div>
          </div>
        </Card>
      )}

      {/* ── Languages ── */}
      {github?.topLanguages?.length > 0 && (
        <Card title="Top Languages">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {github.topLanguages.map(lang => (
              <span key={lang} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-pill)', padding: '0.25rem 0.7rem', fontSize: '0.78rem',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor(lang), flexShrink: 0 }} />
                {lang}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* ── WakaTime ── */}
      {wakatime?.totalSeconds > 0 && (
        <Card title="WakaTime · This Week">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {wakatime.languages?.slice(0, 6).map(lang => (
              <div key={lang.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.73rem' }}>{lang.percent}% · {Math.round(lang.total_seconds / 3600)}h</span>
                </div>
                <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
                  <div style={{ width: `${lang.percent}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Stack Overflow ── */}
      {stackoverflow?.reputation > 0 && (
        <Card title="Stack Overflow">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: '#f58025', lineHeight: 1 }}>{stackoverflow.reputation.toLocaleString()}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>Reputation</div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {stackoverflow.badges.gold   > 0 && <span style={{ color: '#f1b600', fontWeight: 700, fontSize: '0.875rem' }}>● {stackoverflow.badges.gold}</span>}
              {stackoverflow.badges.silver > 0 && <span style={{ color: '#b4b8bc', fontWeight: 700, fontSize: '0.875rem' }}>● {stackoverflow.badges.silver}</span>}
              {stackoverflow.badges.bronze > 0 && <span style={{ color: '#d1a684', fontWeight: 700, fontSize: '0.875rem' }}>● {stackoverflow.badges.bronze}</span>}
            </div>
          </div>
          {stackoverflow.topAnswers?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
              {stackoverflow.topAnswers.map((ans, i) => (
                <a key={i} href={ans.link} target="_blank" rel="noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', display: 'flex', gap: '0.4rem', alignItems: 'flex-start', textDecoration: 'none' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0 }}>+{ans.score}</span>
                  <span>{ans.title}</span>
                </a>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Packages ── */}
      {(packages?.npm?.length > 0 || packages?.pypi?.length > 0) && (
        <Card title="Open Source Packages">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[...(packages.npm || []).map(p => ({ ...p, platform: 'npm' })), ...(packages.pypi || []).map(p => ({ ...p, platform: 'pypi' }))].map(pkg => (
              <div key={`${pkg.platform}-${pkg.name}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: pkg.platform === 'npm' ? '#cb3837' : '#3776ab', color: 'white', fontWeight: 700 }}>{pkg.platform}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pkg.name}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pkg.weeklyDownloads.toLocaleString()}/wk</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingBottom: '0.5rem' }}>
        <a href="https://devact.vercel.app" target="_blank" rel="noreferrer"
          style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          tracked by <span style={{ color: 'var(--accent)', fontWeight: 700 }}>DevAct</span>
        </a>
      </div>
    </div>
  );
}
