import React, { useState, useMemo } from 'react';

// ── BookSelect ────────────────────────────────────────────────────
// Filtered book/source selector used across Chronicle, META, Anatomy, Vault
// Props:
//   books        — full books array
//   value        — current selected book id (or '')
//   onChange     — (id) => void
//   placeholder  — string shown when no book selected
//   filter       — 'all' | 'reading' | 'finished' | 'pinned' (default: 'all')
//   showFilter   — show filter toggle (default: true)
//   style        — additional styles for the select element

const FILTERS = [
  { id: 'all',      label: 'All' },
  { id: 'pinned',   label: '📌 Pinned' },
  { id: 'reading',  label: 'Reading' },
  { id: 'finished', label: 'Finished' },
];

export default function BookSelect({ books = [], value = '', onChange, placeholder = 'Link to book…', defaultFilter = 'all', showFilter = true, style = {} }) {
  const [filter, setFilter] = useState(defaultFilter);

  const filtered = useMemo(() => {
    const pinned = books.filter(b => b.pinned);
    let pool = books;
    if (filter === 'pinned')   pool = books.filter(b => b.pinned);
    if (filter === 'reading')  pool = books.filter(b => b.status === 'reading');
    if (filter === 'finished') pool = books.filter(b => b.status === 'finished');

    // Always put pinned first
    const pinnedIds = new Set(pinned.map(b => b.id));
    return [
      ...pool.filter(b => pinnedIds.has(b.id)),
      ...pool.filter(b => !pinnedIds.has(b.id)),
    ];
  }, [books, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {showFilter && books.length > 3 && (
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ fontSize: 8, padding: '1px 7px', borderRadius: 2, border: `1px solid ${filter === f.id ? 'var(--accent-2)' : 'var(--paper-3)'}`, background: filter === f.id ? 'var(--nav-active-bg)' : 'transparent', color: filter === f.id ? 'var(--accent)' : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em' }}>
              {f.label}
            </button>
          ))}
        </div>
      )}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 2, background: 'transparent', fontStyle: 'italic', border: '1px solid var(--paper-3)', ...style }}>
        <option value="">{placeholder}</option>
        {filtered.map(b => (
          <option key={b.id} value={b.id}>
            {b.pinned ? '📌 ' : ''}{b.title}{b.author ? ` — ${b.author}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
