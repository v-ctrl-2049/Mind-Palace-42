import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SimpleEditor from './SimpleEditor';
import BookSelect from './BookSelect';
import { GHOST_FACULTY, getTriggeredNotices } from '../data/ghostFaculty';

// ── Entry types ───────────────────────────────────────────────────
const ENTRY_TYPES = {
  concept:   { label: 'Concept',   icon: '◈', color: '#2a4a7a', bg: '#e8eff8', stamp: 'CONC.' },
  scholar:   { label: 'Scholar',   icon: '⊕', color: '#4a2a6a', bg: '#f0e8f8', stamp: 'SCHOL.' },
  construct: { label: 'Construct', icon: '✦', color: '#1a5c3a', bg: '#e0f0e8', stamp: 'CNST.' },
};

// ── Watermark ─────────────────────────────────────────────────────
const WATERMARK = 'TEATRO ANATOMICO · PADUA 1594 · CORPUS SCIENTIÆ';

// ── Ghost Faculty notice ──────────────────────────────────────────
function FacultyNotice({ faculty, notice, onDismiss }) {
  return (
    <div style={{ background: 'var(--paper-2)', border: '1px solid var(--paper-3)', borderLeft: `3px solid ${faculty.id === 'xiaohua' ? '#5a7028' : 'var(--accent-2)'}`, borderRadius: 2, padding: '10px 12px', marginBottom: 10, position: 'relative' }}>
      <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>◈ {faculty.name} · {faculty.dates}</span>
        {onDismiss && <button onClick={onDismiss} style={{ fontSize: 10, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.65 }}>{notice}</div>
      <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginTop: 5, opacity: 0.6 }}>{faculty.mode}</div>
    </div>
  );
}

// ── Entry card — encyclopedia row ─────────────────────────────────
function EntryCard({ entry, isSelected, onClick }) {
  const et = ENTRY_TYPES[entry.type] || ENTRY_TYPES.concept;
  return (
    <div onClick={() => onClick(entry)}
      style={{ padding: '7px 12px', cursor: 'pointer', borderBottom: '1px solid var(--paper-3)', background: isSelected ? 'var(--nav-active-bg)' : 'transparent', borderLeft: isSelected ? `2px solid ${et.color}` : '2px solid transparent', transition: 'all 0.1s' }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--nav-hover-bg)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 8, color: et.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{et.icon}</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-serif)', fontWeight: 600, color: isSelected ? 'var(--ink)' : 'var(--ink-2)', letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: 11 }}>{entry.title}</span>
        {entry.domains?.length > 0 && (
          <span style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.domains[0]}</span>
        )}
      </div>
      {entry.definition && (
        <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 16 }}>
          {entry.definition.slice(0, 70)}{entry.definition.length > 70 ? '…' : ''}
        </div>
      )}
      {entry.keyQuote && (
        <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: 16, opacity: 0.6 }}>
          ❝ {entry.keyQuote.slice(0, 60)}{entry.keyQuote.length > 60 ? '…' : ''}
        </div>
      )}
    </div>
  );
}

// ── Entry editor (right panel) ────────────────────────────────────
function EntryEditor({ entry, allEntries, topics, books = [], investigations, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState({ ...entry });
  const [saved, setSaved]   = useState(false);
  const [dismissedNotices, setDismissedNotices] = useState([]);

  const et = ENTRY_TYPES[draft.type] || ENTRY_TYPES.concept;

  const set = (k, v) => {
    const updated = { ...draft, [k]: v, updatedAt: new Date().toISOString() };
    setDraft(updated);
    onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  // Get triggered Ghost Faculty notices
  const notices = useMemo(() => {
    const triggered = getTriggeredNotices(draft.body || '', draft.title || '', 2);
    return triggered.filter(n => !dismissedNotices.includes(n.faculty.id));
  }, [draft.title, draft.body, dismissedNotices]);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: isDark ? '#1a1814' : '#faf6ee' }}>

      {/* Header */}
      <div style={{ padding: '12px 20px 10px', borderBottom: `2px solid ${et.color}44`, flexShrink: 0, background: isDark ? '#1c1a14' : '#f0e8d8', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 64, color: et.color, opacity: 0.04, fontFamily: 'var(--font-display)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>◊</div>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button onClick={onClose} style={{ fontSize: 8, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 2, padding: '2px 9px', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>← INDEX</button>
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.entries(ENTRY_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => set('type', k)}
                style={{ fontSize: 8, padding: '2px 8px', borderRadius: 2, border: `1px solid ${draft.type === k ? v.color : 'var(--paper-3)'}`, background: draft.type === k ? v.color + '18' : 'transparent', color: draft.type === k ? v.color : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {saved && <span style={{ fontSize: 8, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>✓ saved</span>}
          <span style={{ fontSize: 7, color: et.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', border: `1px solid ${et.color}44`, padding: '1px 6px', borderRadius: 2 }}>{et.stamp}</span>
          <button onClick={() => { if (window.confirm('Delete this entry?')) onDelete(entry.id); }}
            style={{ fontSize: 8, padding: '2px 9px', borderRadius: 2, border: '1px solid var(--paper-3)', color: 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-4)'; e.currentTarget.style.borderColor = 'var(--paper-3)'; }}>
            REMOVE
          </button>
        </div>

        {/* Headword */}
        <input value={draft.title} onChange={e => set('title', e.target.value)}
          placeholder="HEADWORD"
          style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', background: 'transparent', border: 'none', outline: 'none', width: '100%', letterSpacing: '0.04em', textTransform: 'uppercase' }} />

        {/* Definition */}
        <input value={draft.definition || ''} onChange={e => set('definition', e.target.value)}
          placeholder="Brief scholarly definition…"
          style={{ fontSize: 12, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--ink-3)', background: 'transparent', border: 'none', outline: 'none', width: '100%', marginTop: 4 }} />

        {/* Key quote */}
        <div style={{ marginTop: 12, borderTop: `1px dashed ${et.color}44`, paddingTop: 10 }}>
          <div style={{ fontSize: 7, color: et.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5, opacity: 0.7 }}>❝ Key quote</div>
          <textarea value={draft.keyQuote || ''} onChange={e => set('keyQuote', e.target.value)}
            placeholder="The single most important quote for this concept — the one you would cite first…"
            rows={2}
            style={{ width: '100%', resize: 'none', fontSize: 12, fontStyle: 'italic', fontFamily: 'var(--font-serif)', lineHeight: 1.65, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink-2)', padding: 0 }} />
          {draft.keyQuote && (
            <input value={draft.keyQuoteAttribution || ''} onChange={e => set('keyQuoteAttribution', e.target.value)}
              placeholder="— Author, Work, p. …"
              style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontStyle: 'normal', color: et.color, background: 'transparent', border: 'none', outline: 'none', width: '100%', marginTop: 2, opacity: 0.8 }} />
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Ghost Faculty notices */}
        {notices.length > 0 && (
          <div>
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>◈ Faculty marginalia</div>
            {notices.map(({ faculty, notice }) => (
              <FacultyNotice key={faculty.id} faculty={faculty} notice={notice}
                onDismiss={() => setDismissedNotices(d => [...d, faculty.id])} />
            ))}
          </div>
        )}

        {/* Extended body */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Corpus</div>
          <SimpleEditor value={draft.body || ''} onChange={val => set('body', val)}
            placeholder="Develop the entry — scholarly genealogy, key debates, how the concept operates…" />
        </div>

        {/* Domains */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Domains</div>
          <input value={(draft.domains || []).join(', ')} onChange={e => set('domains', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="History (EU), Philosophy, Medicine (History)…"
            style={{ width: '100%', padding: '5px 8px', fontSize: 11, borderRadius: 2, fontStyle: 'italic' }} />
        </div>

        {/* Tags */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Tags</div>
          <input value={(draft.tags || []).join(', ')} onChange={e => set('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Tags, comma separated…"
            style={{ width: '100%', padding: '5px 8px', fontSize: 11, borderRadius: 2, fontStyle: 'normal', fontFamily: 'var(--font-mono)' }} />
        </div>

        {/* Echoes */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Echoes
            <span style={{ fontSize: 7, color: 'var(--ink-4)', marginLeft: 8, opacity: 0.6 }}>[RAM: {(draft.relatedIds || []).length} linked]</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
            {(draft.relatedIds || []).map(id => {
              const related = allEntries.find(e => e.id === id);
              if (!related) return null;
              return (
                <span key={id} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--paper-3)', borderRadius: 2, color: 'var(--ink-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {related.title}
                  <button onClick={() => set('relatedIds', (draft.relatedIds || []).filter(r => r !== id))}
                    style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
                </span>
              );
            })}
          </div>
          <select onChange={e => { if (e.target.value) set('relatedIds', [...new Set([...(draft.relatedIds || []), e.target.value])]); e.target.value = ''; }}
            style={{ fontSize: 11, padding: '4px 8px', borderRadius: 2, background: 'transparent', fontStyle: 'italic' }}>
            <option value="">See also…</option>
            {allEntries.filter(e => e.id !== entry.id && !(draft.relatedIds || []).includes(e.id)).map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {/* Threads */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Threads</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
            {(draft.topicIds || []).map(id => {
              const t = topics.find(t => t.id === id);
              if (!t) return null;
              return (
                <span key={id} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--paper-3)', borderRadius: 2, color: 'var(--ink-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {t.title}
                  <button onClick={() => set('topicIds', (draft.topicIds || []).filter(r => r !== id))} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
                </span>
              );
            })}
          </div>
          {topics.length > 0 ? (
            <select onChange={e => { if (e.target.value) set('topicIds', [...new Set([...(draft.topicIds || []), e.target.value])]); e.target.value = ''; }}
              style={{ fontSize: 11, padding: '4px 8px', borderRadius: 2, background: 'transparent', fontStyle: 'italic' }}>
              <option value="">Link to topic…</option>
              {topics.filter(t => !(draft.topicIds || []).includes(t.id)).map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic' }}>No topics yet — create topics in The Stacks first.</div>
          )}
        </div>

        {/* Linked Books */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Bound Volumes</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
            {(draft.bookIds || []).map(id => {
              const b = books.find(b => b.id === id);
              if (!b) return null;
              return (
                <span key={id} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--paper-3)', borderRadius: 2, color: 'var(--ink-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5, borderLeft: `2px solid ${b.color}` }}>
                  {b.title}
                  <button onClick={() => set('bookIds', (draft.bookIds || []).filter(r => r !== id))} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
                </span>
              );
            })}
          </div>
          <BookSelect books={books} value="" onChange={id => { if (id) set('bookIds', [...new Set([...(draft.bookIds || []), id])]); }} placeholder="Bind a volume…" defaultFilter="all" />
        </div>

        {/* RAM occurrence count — cyberpunk slip */}
        <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', opacity: 0.4, borderTop: '1px dashed var(--paper-3)', paddingTop: 10, letterSpacing: '0.1em' }}>
          RAM INDEX · {draft.type?.toUpperCase()} · {(draft.tags || []).length} TAGS · {(draft.relatedIds || []).length} CROSS-REF · {(draft.topicIds || []).length} TOPIC LINKS
        </div>
      </div>
    </div>
  );
}

// ── Main Teatro Anatomico view ────────────────────────────────────
export default function AnatomyView({ entries = [], onUpdate, topics = [], investigations = [], books = [] }) {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy]         = useState('alpha');
  const [showFacultyPanel, setShowFacultyPanel] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // selectedEntry — check entries first, fall back to pending
  const selectedEntry = entries.find(e => e.id === selectedId) || (pendingEntry?.id === selectedId ? pendingEntry : null);

  const handleCreate = (type = 'concept') => {
    const entry = {
      id: uuidv4(),
      type,
      title: '',
      definition: '',
      body: '',
      domains: [],
      tags: [],
      relatedIds: [],
      topicIds: [],
      investigationIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdate(prev => [entry, ...prev]);
    setSelectedId(entry.id);
    setPendingEntry(entry);
  };

  const handleSave = (updated) => {
    onUpdate(prev => prev.map(e => e.id === updated.id ? updated : e));
    setPendingEntry(null);
  };

  const handleDelete = (id) => {
    onUpdate(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) { setSelectedId(null); setPendingEntry(null); }
  };

  const filtered = useMemo(() => {
    let pool = entries;
    if (filterType !== 'all') pool = pool.filter(e => e.type === filterType);
    if (search) pool = pool.filter(e =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.definition?.toLowerCase().includes(search.toLowerCase()) ||
      (e.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    if (sortBy === 'alpha') pool = [...pool].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (sortBy === 'recent') pool = [...pool].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return pool;
  }, [entries, filterType, search, sortBy]);


  // Group alphabetically for two-column layout
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const letter = (e.title || '?')[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(e);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>

      {/* ── LEFT: Index panel ──────────────────────────────── */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--paper-3)', display: 'flex', flexDirection: 'column', background: 'var(--paper-2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 42, color: 'var(--accent-2)', opacity: 0.06, fontFamily: 'var(--font-display)', pointerEvents: 'none', userSelect: 'none' }}>◊</div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Teatro Anatomico</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 2 }}>Index</div>
          <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>
            {entries.length} entries · {entries.filter(e => e.type === 'concept').length} concepts · {entries.filter(e => e.type === 'scholar').length} scholars
          </div>
        </div>

        {/* Search + filters */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search index…"
            style={{ width: '100%', padding: '5px 8px', fontSize: 11, borderRadius: 2, marginBottom: 6, fontStyle: 'italic' }} />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[['all', 'All'], ['concept', '◈ Concepts'], ['scholar', '⊕ Scholars'], ['construct', '✦ Constructs']].map(([v, l]) => (
              <button key={v} onClick={() => setFilterType(v)}
                style={{ fontSize: 8, padding: '2px 7px', borderRadius: 2, border: `1px solid ${filterType === v ? 'var(--accent-2)' : 'var(--paper-3)'}`, background: filterType === v ? 'var(--nav-active-bg)' : 'transparent', color: filterType === v ? 'var(--accent)' : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Add buttons */}
        <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', gap: 5, flexShrink: 0 }}>
          {Object.entries(ENTRY_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => handleCreate(k)}
              style={{ flex: 1, fontSize: 8, padding: '4px 0', borderRadius: 2, border: `1px solid ${v.color}44`, color: v.color, background: v.color + '0d', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em' }}
              onMouseEnter={e => e.currentTarget.style.background = v.color + '22'}
              onMouseLeave={e => e.currentTarget.style.background = v.color + '0d'}>
              + {v.label}
            </button>
          ))}
        </div>

        {/* Alphabetical index */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {grouped.length === 0 ? (
            <div style={{ padding: '24px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, opacity: 0.08, marginBottom: 8, fontFamily: 'var(--font-display)' }}>◌</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.7 }}>
                {search ? 'No entries match.' : 'The index is empty.\nAdd your first concept or scholar.'}
              </div>
            </div>
          ) : grouped.map(([letter, letterEntries]) => (
            <div key={letter}>
              <div style={{ padding: '4px 12px 2px', fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', background: 'var(--paper-3)', textTransform: 'uppercase' }}>{letter}</div>
              {letterEntries.map(entry => (
                <EntryCard key={entry.id} entry={entry} isSelected={selectedId === entry.id} onClick={e => setSelectedId(e.id)} />
              ))}
            </div>
          ))}
        </div>

        {/* Faculty panel toggle */}
        <div style={{ padding: '6px 10px', borderTop: '1px solid var(--paper-3)', flexShrink: 0 }}>
          <button onClick={() => setShowFacultyPanel(s => !s)}
            style={{ width: '100%', fontSize: 9, padding: '4px 0', border: '1px dashed var(--paper-3)', borderRadius: 2, color: 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-2)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)'; e.currentTarget.style.color = 'var(--ink-4)'; }}>
            {showFacultyPanel ? '✕ Close Faculty' : '◈ Ghost Faculty roster'}
          </button>
        </div>
      </div>

      {/* ── RIGHT: Entry editor or Faculty panel ────────────── */}
      {showFacultyPanel ? (
        <FacultyRoster onClose={() => setShowFacultyPanel(false)} />
      ) : selectedEntry ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <EntryEditor
            key={selectedEntry.id}
            entry={selectedEntry}
            allEntries={entries}
            topics={topics}
            books={books}
            investigations={investigations}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => setSelectedId(null)} />
        </div>
      ) : (
        <EmptyState onCreate={handleCreate} isDark={isDark} />
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────
function EmptyState({ onCreate, isDark }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: isDark ? '#1a1814' : '#faf6ee', position: 'relative', overflow: 'hidden' }}>
      {/* Watermark */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.2em', opacity: 0.12, textTransform: 'uppercase', pointerEvents: 'none', userSelect: 'none' }}>
        {WATERMARK}
      </div>
      <div style={{ fontSize: 40, opacity: 0.07, fontFamily: 'var(--font-display)', lineHeight: 1 }}>◊</div>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 8 }}>Teatro Anatomico</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.8, marginBottom: 4 }}>
          Padua, 1594. The oldest surviving anatomy theatre.<br />
          The dissection table is below. The Ghost Faculty are in the galleries.
        </div>
        <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em', opacity: 0.6, marginBottom: 20 }}>
          Select an entry from the index, or create a new one.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(ENTRY_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => onCreate(k)}
              style={{ fontSize: 11, padding: '8px 18px', borderRadius: 2, border: `1px solid ${v.color}55`, color: v.color, background: v.color + '0d', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}
              onMouseEnter={e => e.currentTarget.style.background = v.color + '22'}
              onMouseLeave={e => e.currentTarget.style.background = v.color + '0d'}>
              {v.icon} New {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Ghost Faculty roster panel ────────────────────────────────────
function FacultyRoster({ onClose }) {
  const [search, setSearch] = useState('');
  const filtered = GHOST_FACULTY.filter(f =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.domain.toLowerCase().includes(search.toLowerCase())
  );
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: isDark ? '#1a1814' : '#faf6ee', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, background: isDark ? '#1c1a14' : '#f0e8d8' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Teatro Anatomico</div>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)' }}>Ghost Faculty · {GHOST_FACULTY.length} members</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search faculty…"
          style={{ width: 160, padding: '4px 8px', fontSize: 11, borderRadius: 2, fontStyle: 'italic' }} />
        <button onClick={onClose} style={{ fontSize: 11, color: 'var(--ink-4)', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 2, cursor: 'pointer', padding: '4px 10px' }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <div style={{ columns: '2', columnGap: 20 }}>
          {filtered.map(f => (
            <div key={f.id} style={{ breakInside: 'avoid', marginBottom: 14, padding: '10px 12px', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 2 }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{f.name}</div>
              <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em', marginBottom: 4 }}>{f.dates} · {f.domain}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.55 }}>{f.mode}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
