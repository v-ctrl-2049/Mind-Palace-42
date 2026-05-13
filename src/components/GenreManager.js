import React, { useState } from 'react';

export default function GenreManager({ genres, onUpdate, onClose }) {
  const [items, setItems] = useState([...genres]);
  const [newGenre, setNewGenre] = useState('');
  const [editing, setEditing] = useState(null); // id of item being edited inline

  const add = () => {
    if (!newGenre.trim() || items.includes(newGenre.trim())) return;
    setItems(prev => [...prev, newGenre.trim()]);
    setNewGenre('');
  };

  const remove = (g) => setItems(prev => prev.filter(i => i !== g));

  const rename = (old, newName) => {
    if (!newName.trim() || items.includes(newName.trim())) return;
    setItems(prev => prev.map(i => i === old ? newName.trim() : i));
    setEditing(null);
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: '100%', maxWidth: 420, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>

        {/* Header */}
        <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Manage genres</span>
          <button onClick={onClose} style={{ fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Genre list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 18px' }}>
          {items.map(g => (
            <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--paper-3)' }}>
              {editing === g ? (
                <input autoFocus defaultValue={g}
                  onBlur={e => rename(g, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') rename(g, e.target.value); if (e.key === 'Escape') setEditing(null); }}
                  style={{ flex: 1, padding: '4px 8px', fontSize: 13, borderRadius: 5 }} />
              ) : (
                <span style={{ flex: 1, fontSize: 13, color: 'var(--ink)' }}>{g}</span>
              )}
              <button onClick={() => setEditing(g)} style={{ fontSize: 10, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: 'none', padding: '0 4px' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✎</button>
              <button onClick={() => remove(g)} style={{ fontSize: 11, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: 'none', padding: '0 4px' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
            </div>
          ))}
          {items.length === 0 && <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', padding: '12px 0' }}>No genres yet — add one below.</div>}
        </div>

        {/* Add new */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--paper-3)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input value={newGenre} onChange={e => setNewGenre(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="New genre name…"
              style={{ flex: 1, padding: '7px 10px', fontSize: 13, borderRadius: 6 }} />
            <button onClick={add} style={{ fontSize: 12, padding: '7px 16px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Add</button>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { onUpdate(items); onClose(); }} style={{ fontSize: 12, padding: '6px 18px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
