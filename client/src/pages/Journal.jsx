import { useState, useEffect } from 'react';
import API from '../api/axios';
import { BookOpen, Save, Trash2, Tag, ChevronDown, ChevronUp, Check } from 'lucide-react';

const MOODS = [
  { value: 'great', label: 'Great' },
  { value: 'good',  label: 'Good'  },
  { value: 'okay',  label: 'Okay'  },
  { value: 'bad',   label: 'Rough' },
];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function Journal() {
  const [todayEntry, setTodayEntry] = useState(null);
  const [content, setContent]       = useState('');
  const [mood, setMood]             = useState('');
  const [tagInput, setTagInput]     = useState('');
  const [tags, setTags]             = useState([]);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [history, setHistory]       = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    API.get('/journal/today').then((r) => {
      if (r.data) {
        setTodayEntry(r.data);
        setContent(r.data.content);
        setMood(r.data.mood || '');
        setTags(r.data.tags || []);
      }
    }).catch(() => {});

    API.get('/journal').then((r) => {
      setHistory(r.data);
    }).catch(() => {}).finally(() => setHistLoading(false));
  }, []);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const r = await API.put('/journal/today', { content, mood, tags });
      setTodayEntry(r.data);
      setHistory(prev => {
        const others = prev.filter(e => e.date !== r.data.date);
        return [r.data, ...others].sort((a,b) => b.date.localeCompare(a.date));
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete today's entry?")) return;
    await API.delete('/journal/today').catch(() => {});
    setTodayEntry(null);
    setContent('');
    setMood('');
    setTags([]);
    setHistory(prev => prev.filter(e => e.date !== todayStr()));
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  return (
    <div className="page" style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 className="page-title" style={{ marginBottom: '0.25rem' }}>Dev Journal</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          {formatDate(todayStr())}
        </p>
      </div>

      {/* Today's entry */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} /> Today
          </span>
          {todayEntry && (
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Mood selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? '' : m.value)}
              style={{
                background: mood === m.value ? 'rgba(168,85,247,0.15)' : 'var(--bg-secondary)',
                border: `1px solid ${mood === m.value ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                borderRadius: '20px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Text area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you build, break, or figure out today?"
          rows={5}
          maxLength={2000}
          style={{
            width: '100%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            lineHeight: 1.6,
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          {content.length}/2000
        </div>

        {/* Tags */}
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
            {tags.map((t) => (
              <span key={t} style={{
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: '20px',
                padding: '0.2rem 0.65rem',
                fontSize: '0.75rem',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}>
                <Tag size={10} /> {t}
                <button onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', padding: 0, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="tag it — press Enter to add (e.g. graphs, contest, debug)"
            style={{
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={14} />
            {saving ? 'Saving...' : saved ? <><Check size={14} /> Saved</> : 'Save Entry'}
          </button>
        </div>
      </div>

      {/* Recent entries */}
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>Recent Entries</h3>

      {histLoading && <p className="loading" style={{ padding: '2rem 0' }}>Loading entries...</p>}

      {!histLoading && history.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '2rem 0' }}>
          No entries yet. Start writing daily!
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {history.map((entry) => {
          const isOpen = expandedId === entry._id;
          return (
            <div
              key={entry._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setExpandedId(isOpen ? null : entry._id)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '0.9rem 1.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatDate(entry.date)}</span>
                  {entry.mood && <span style={{ fontSize: '0.8rem' }}>{MOODS.find((m) => m.value === entry.mood)?.label}</span>}
                  {entry.tags?.length > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {entry.tags.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isOpen && (
                <div style={{
                  padding: '0 1.2rem 1rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  lineHeight: 1.7,
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.9rem',
                  whiteSpace: 'pre-wrap',
                }}>
                  {entry.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Journal;
