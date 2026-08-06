/**
 * Skeleton loader components for each page.
 * Each skeleton mirrors the real page layout so there's zero layout shift.
 */

/* ── Reusable bone element ── */
function Bone({ width = '100%', height = '16px', borderRadius = '8px', style = {} }) {
  return (
    <div
      className="skeleton-bone"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

/* ── Dashboard Skeleton ── */
export function DashboardSkeleton() {
  return (
    <div className="page dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <Bone width="180px" height="32px" />
        </div>
        <div className="dashboard-header-actions">
          <Bone width="100px" height="28px" />
          <Bone width="90px" height="34px" borderRadius="8px" />
          <Bone width="34px" height="34px" borderRadius="8px" />
        </div>
      </header>

      {/* Streak + Goals row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="skeleton-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <Bone width="130px" height="20px" />
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Bone width="40px" height="36px" />
              <Bone width="40px" height="36px" />
              <Bone width="40px" height="36px" />
            </div>
          </div>
          {/* Streak grid dots */}
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
            {Array.from({ length: 52 }).map((_, i) => (
              <Bone key={i} width="12px" height="12px" borderRadius="3px" />
            ))}
          </div>
        </div>

        <div className="skeleton-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Bone width="120px" height="20px" />
            <Bone width="60px" height="30px" borderRadius="8px" />
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem', background: 'var(--bg-surface)', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid var(--border)' }}>
              <Bone width="18px" height="18px" borderRadius="50%" />
              <Bone width="60%" height="14px" />
            </div>
          ))}
        </div>
      </div>

      {/* Overview label */}
      <Bone width="80px" height="12px" style={{ marginBottom: '1rem' }} />

      {/* Stat cards */}
      <div className="stats-grid dashboard-stats">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-stat-card">
            <Bone width="50px" height="32px" />
            <Bone width="70px" height="10px" />
          </div>
        ))}
      </div>

      {/* Explore label */}
      <Bone width="60px" height="12px" style={{ marginTop: '2rem', marginBottom: '1rem' }} />

      {/* Feature nav cards */}
      <div className="dashboard-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Bone width="18px" height="18px" borderRadius="4px" />
              <Bone width="120px" height="16px" />
            </div>
            <Bone width="100%" height="12px" style={{ marginBottom: '0.4rem' }} />
            <Bone width="80%" height="12px" style={{ marginBottom: '1rem' }} />
            <Bone width="90px" height="22px" borderRadius="20px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── GitHub Tracker Skeleton ── */
export function GitHubSkeleton() {
  return (
    <div className="page github-page">
      <Bone width="200px" height="28px" style={{ marginBottom: '2rem' }} />

      {/* Contribution heatmap placeholder */}
      <div className="skeleton-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Bone width="160px" height="16px" />
          <Bone width="200px" height="14px" />
        </div>
        <Bone width="100%" height="100px" borderRadius="4px" />
      </div>

      {/* Bento stats */}
      <div className="skeleton-grid" style={{ marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-stat-card">
            <Bone width="50px" height="32px" />
            <Bone width="80px" height="10px" />
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Repos */}
        <div className="skeleton-card">
          <Bone width="100px" height="18px" style={{ marginBottom: '1rem' }} />
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.7rem 0', borderBottom: '1px solid var(--border)' }}>
              <Bone width="120px" height="14px" />
              <Bone width="40px" height="14px" />
            </div>
          ))}
        </div>
        {/* Activity */}
        <div className="skeleton-card">
          <Bone width="120px" height="18px" style={{ marginBottom: '1rem' }} />
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
              <Bone width="20px" height="20px" borderRadius="4px" />
              <div style={{ flex: 1 }}>
                <Bone width="90%" height="12px" style={{ marginBottom: '0.3rem' }} />
                <Bone width="60px" height="10px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CP Tracker Skeleton ── */
export function CPSkeleton() {
  return (
    <div className="page cp-page">
      <Bone width="260px" height="28px" style={{ marginBottom: '2rem' }} />

      {/* Section title */}
      <Bone width="200px" height="20px" style={{ marginBottom: '1.25rem' }} />

      {/* Stat cards */}
      <div className="stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-stat-card">
            <Bone width="50px" height="32px" />
            <Bone width="80px" height="10px" />
          </div>
        ))}
      </div>

      {/* Recent Contests */}
      <div className="skeleton-card" style={{ marginBottom: '1.5rem' }}>
        <Bone width="140px" height="18px" style={{ marginBottom: '1rem' }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <div>
              <Bone width="200px" height="14px" style={{ marginBottom: '0.3rem' }} />
              <Bone width="80px" height="10px" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bone width="45px" height="16px" borderRadius="4px" />
              <Bone width="60px" height="12px" />
            </div>
          </div>
        ))}
      </div>

      {/* Submissions table */}
      <div className="skeleton-card">
        <Bone width="180px" height="18px" style={{ marginBottom: '1rem' }} />
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
            <Bone width="180px" height="12px" />
            <Bone width="80px" height="12px" />
            <Bone width="60px" height="12px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Repo Visualizer Skeleton ── */
export function RepoVisualizerSkeleton() {
  return (
    <div className="page repo-page">
      <Bone width="180px" height="28px" style={{ marginBottom: '1.5rem' }} />

      {/* Repo selector */}
      <Bone width="100%" height="40px" borderRadius="8px" style={{ marginBottom: '1.5rem' }} />

      {/* Bento grid */}
      <div className="skeleton-grid" style={{ marginBottom: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-stat-card">
            <Bone width="20px" height="20px" borderRadius="4px" />
            <Bone width="40px" height="28px" />
            <Bone width="60px" height="10px" />
          </div>
        ))}
      </div>

      {/* Language + Activity charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="skeleton-card">
          <Bone width="120px" height="16px" style={{ marginBottom: '1rem' }} />
          <Bone width="140px" height="140px" borderRadius="50%" style={{ margin: '0 auto' }} />
        </div>
        <div className="skeleton-card">
          <Bone width="120px" height="16px" style={{ marginBottom: '1rem' }} />
          <Bone width="100%" height="140px" borderRadius="8px" />
        </div>
      </div>

      {/* File tree + README */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="skeleton-card">
          <Bone width="80px" height="16px" style={{ marginBottom: '1rem' }} />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', paddingLeft: `${(i % 3) * 1.5}rem` }}>
              <Bone width="14px" height="14px" borderRadius="3px" />
              <Bone width={`${80 - (i * 10)}%`} height="12px" />
            </div>
          ))}
        </div>
        <div className="skeleton-card">
          <Bone width="80px" height="16px" style={{ marginBottom: '1rem' }} />
          <Bone width="100%" height="12px" style={{ marginBottom: '0.5rem' }} />
          <Bone width="90%" height="12px" style={{ marginBottom: '0.5rem' }} />
          <Bone width="75%" height="12px" style={{ marginBottom: '0.5rem' }} />
          <Bone width="85%" height="12px" />
        </div>
      </div>
    </div>
  );
}

/* ── Repo Detail Skeleton (inline, not full-page) ── */
export function RepoDetailSkeleton() {
  return (
    <div className="skeleton-grid">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton-stat-card">
          <Bone width="20px" height="20px" borderRadius="4px" />
          <Bone width="40px" height="28px" />
          <Bone width="60px" height="10px" />
        </div>
      ))}
      <div className="skeleton-card" style={{ gridColumn: '1 / -1' }}>
        <Bone width="120px" height="16px" style={{ marginBottom: '1rem' }} />
        <Bone width="100%" height="120px" borderRadius="8px" />
      </div>
    </div>
  );
}

/* ── Practice Review Skeleton ── */
export function PracticeReviewSkeleton() {
  return (
    <div className="page cp-page">
      <Bone width="200px" height="28px" style={{ marginBottom: '0.5rem' }} />
      <Bone width="320px" height="14px" style={{ marginBottom: '2rem' }} />

      {/* Tab filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Bone width="70px" height="30px" borderRadius="20px" />
        <Bone width="90px" height="30px" borderRadius="20px" />
        <Bone width="80px" height="30px" borderRadius="20px" />
      </div>

      {/* Problem list */}
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-card" style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Bone width="220px" height="16px" style={{ marginBottom: '0.4rem' }} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Bone width="50px" height="20px" borderRadius="20px" />
                <Bone width="60px" height="20px" borderRadius="20px" />
              </div>
            </div>
            <Bone width="80px" height="30px" borderRadius="8px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Public Profile Skeleton ── */
export function PublicProfileSkeleton() {
  return (
    <div className="page" style={{ maxWidth: '660px' }}>
      {/* Header card */}
      <div className="skeleton-card" style={{ marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Bone width="56px" height="56px" borderRadius="50%" />
            <div>
              <Bone width="140px" height="22px" style={{ marginBottom: '0.3rem' }} />
              <Bone width="90px" height="12px" style={{ marginBottom: '0.25rem' }} />
              <Bone width="110px" height="10px" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Bone width="55px" height="28px" borderRadius="9999px" />
            <Bone width="70px" height="28px" borderRadius="9999px" />
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <Bone key={i} width="80px" height="50px" borderRadius="12px" />
        ))}
      </div>

      {/* Streak card */}
      <div className="skeleton-card" style={{ marginBottom: '0.85rem' }}>
        <Bone width="130px" height="16px" style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.75rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ textAlign: 'center' }}>
              <Bone width="40px" height="30px" style={{ marginBottom: '0.3rem' }} />
              <Bone width="60px" height="10px" />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <Bone key={i} width="10px" height="10px" borderRadius="2px" />
          ))}
        </div>
      </div>

      {/* Content cards */}
      {[1, 2].map(i => (
        <div key={i} className="skeleton-card" style={{ marginBottom: '0.85rem' }}>
          <Bone width="120px" height="16px" style={{ marginBottom: '1rem' }} />
          <Bone width="100%" height="12px" style={{ marginBottom: '0.5rem' }} />
          <Bone width="80%" height="12px" style={{ marginBottom: '0.5rem' }} />
          <Bone width="60%" height="12px" />
        </div>
      ))}
    </div>
  );
}

/* ── Contests Skeleton ── */
export function ContestsSkeleton() {
  return (
    <>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <Bone width="50px" height="30px" borderRadius="20px" />
        <Bone width="90px" height="30px" borderRadius="20px" />
        <Bone width="80px" height="30px" borderRadius="20px" />
      </div>

      {/* Contest cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Bone width="65px" height="20px" borderRadius="20px" />
                  <Bone width="200px" height="16px" />
                </div>
                <Bone width="160px" height="12px" style={{ marginBottom: '0.3rem' }} />
                <Bone width="100px" height="12px" />
              </div>
              <Bone width="85px" height="32px" borderRadius="8px" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Journal Entry Skeleton (inline, not full-page) ── */
export function JournalEntrySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '1rem 0' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <Bone width="18px" height="18px" borderRadius="4px" />
              <Bone width="180px" height="14px" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bone width="50px" height="20px" borderRadius="20px" />
              <Bone width="14px" height="14px" borderRadius="3px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Generic Page Skeleton (fallback for ProtectedRoute) ── */
export function GenericPageSkeleton() {
  return (
    <div className="page">
      <Bone width="200px" height="28px" style={{ marginBottom: '2rem' }} />
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card" style={{ marginBottom: '1rem' }}>
          <Bone width="140px" height="18px" style={{ marginBottom: '0.75rem' }} />
          <Bone width="100%" height="12px" style={{ marginBottom: '0.5rem' }} />
          <Bone width="85%" height="12px" style={{ marginBottom: '0.5rem' }} />
          <Bone width="70%" height="12px" />
        </div>
      ))}
    </div>
  );
}
