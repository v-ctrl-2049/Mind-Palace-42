import React, { useState, useRef, useEffect } from 'react';

const SOURCE_BADGE = {
  primary:   { label: 'P', color: '#c0392b', bg: '#faeae8' },
  secondary: { label: 'S', color: '#2c5f8a', bg: '#e8eff8' },
  tertiary:  { label: 'T', color: '#7a6a52', bg: '#f0e8d8' },
};

// ── Single book row ───────────────────────────────────────────────
function BookRow({ book, selected, onClick }) {
  const sb = book.sourceType ? SOURCE_BADGE[book.sourceType] : null;
  return (
    <button onClick={() => onClick(book.id)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: selected ? 'var(--accent-light)' : 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--paper-3)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: book.color, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: selected ? 500 : 400, color: selected ? 'var(--accent)' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.title}
        </div>
        {book.author && (
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author}</div>
        )}
      </div>
      {sb && (
        <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, background: sb.bg, color: sb.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', flexShrink: 0 }}>{sb.label}</span>
      )}
      {selected && <span style={{ fontSize: 11, color: 'var(--accent)', flexShrink: 0 }}>✓</span>}
    </button>
  );
}

// ── Main BookPicker ───────────────────────────────────────────────
// Props:
//   books        — all books (and/or articles)
//   selected     — array of selected book ids
//   onToggle     — (id) => void
//   multi        — true = multi-select (default), false = single-select
//   placeholder  — input placeholder
export default function BookPicker({ books = [], articles = [], selected = [], onToggle, multi = true, placeholder = 'Search books…' }) {
  const [tab, setTab]       = useState('reading');
  const [search, setSearch] = useState('');
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const allSources = [
    ...books.map(b => ({ ...b, _type: 'book' })),
    ...articles.map(a => ({ ...a, _type: 'article' })),
  ];

  const tabs = [
    { id: 'reading',  label: 'Reading',  items: allSources.filter(b => b.status === 'reading') },
    { id: 'finished', label: 'Finished', items: allSources.filter(b => b.status === 'finished' || b.status === 'dnf') },
    { id: 'papers',   label: 'Papers',   items: articles },
    { id: 'all',      label: 'All',      items: allSources },
  ].filter(t => t.items.length > 0 || t.id === 'all');

  const activeTab   = tabs.find(t => t.id === tab) || tabs[0];
  const filtered    = (activeTab?.items || []).filter(b =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ border: '1px solid var(--paper-3)', borderRadius: 8, overflow: 'hidden', background: 'var(--paper-card)' }}>
      {/* Search */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>🔍</span>
        <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: 'var(--ink)', outline: 'none' }} />
        {search && (
          <button onClick={() => setSearch('')} style={{ fontSize: 11, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
        )}
      </div>

      {/* Tabs — only show if no search active */}
      {!search && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--paper-3)', background: 'var(--paper-2)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '5px 4px', fontSize: 10, border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, background: 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', whiteSpace: 'nowrap' }}>
              {t.label}
              <span style={{ marginLeft: 3, opacity: 0.6 }}>({t.items.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Book list */}
      <div style={{ maxHeight: 220, overflowY: 'auto', padding: '4px 4px' }}>
        {filtered.length === 0 ? (
          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
            {search ? 'No books match.' : 'No books in this category.'}
          </div>
        ) : filtered.map(b => (
          <BookRow key={b.id} book={b} selected={selected.includes(b.id)} onClick={id => {
            if (!multi) { onToggle(id); return; }
            onToggle(id);
          }} />
        ))}
      </div>

      {/* Selected count */}
      {multi && selected.length > 0 && (
        <div style={{ padding: '5px 10px', borderTop: '1px solid var(--paper-3)', fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', background: 'var(--paper-2)' }}>
          {selected.length} selected
        </div>
      )}
    </div>
  );
}
