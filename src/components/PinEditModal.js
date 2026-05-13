import React, { useState } from 'react';
import { PIN_TYPES } from '../data/worldmap';

export default function PinEditModal({ pin, books, onSave, onDelete, onClose, isNew }) {
  const [draft, setDraft] = useState({ ...pin });
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.label.trim()) return;
    onSave(draft);
    onClose();
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{isNew ? 'Add map pin' : 'Edit pin'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && (
              <button onClick={() => { if (window.confirm('Delete this pin?')) { onDelete(pin.id); onClose(); }}}
                style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)', cursor: 'pointer' }}>
                Delete
              </button>
            )}
            <button onClick={onClose} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Pin type */}
          <div>
            <div style={FL}>Pin type</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {PIN_TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => set('type', t.id)} style={{
                  fontSize: 11, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${draft.type === t.id ? t.color : 'var(--paper-3)'}`,
                  background: draft.type === t.id ? t.bg + '55' : 'transparent',
                  color: draft.type === t.id ? t.color : 'var(--ink-3)',
                  fontWeight: draft.type === t.id ? 500 : 400,
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <div style={FL}>Place / event name *</div>
            <input autoFocus required value={draft.label} onChange={e => set('label', e.target.value)}
              placeholder="e.g. Battle of Marathon, Athens, Königsberg…"
              style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6 }} />
          </div>

          {/* Coordinates */}
          <div>
            <div style={FL}>Coordinates</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 4, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>Latitude (−90 to 90)</div>
                <input type="number" step="0.01" min="-90" max="90"
                  value={draft.lat ?? ''} onChange={e => set('lat', parseFloat(e.target.value))}
                  placeholder="e.g. 38.1"
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 4, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>Longitude (−180 to 180)</div>
                <input type="number" step="0.01" min="-180" max="180"
                  value={draft.lng ?? ''} onChange={e => set('lng', parseFloat(e.target.value))}
                  placeholder="e.g. 24.0"
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6 }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 5, fontStyle: 'italic' }}>
              Tip: Google Maps shows lat/lng when you right-click any location.
            </div>
          </div>

          {/* Book */}
          <div>
            <div style={FL}>Linked book</div>
            <select value={draft.bookId || ''} onChange={e => set('bookId', e.target.value)}
              style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6 }}>
              <option value="">No book</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title} — {b.author}</option>)}
            </select>
          </div>

          {/* Event tag (for timeline link) */}
          <div>
            <div style={FL}>Timeline tag (optional)</div>
            <input value={draft.eventTag || ''} onChange={e => set('eventTag', e.target.value)}
              placeholder="e.g. persia, silk road — links to timeline events with same tag"
              style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6 }} />
          </div>

          {/* Note */}
          <div>
            <div style={FL}>Note</div>
            <textarea value={draft.note || ''} onChange={e => set('note', e.target.value)}
              placeholder="What happened here? What's the significance?"
              rows={3} style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ fontSize: 13, padding: '8px 24px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>
              {isNew ? 'Add pin' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const FL = {
  fontSize: 11, fontWeight: 500, color: 'var(--ink-3)',
  fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
  textTransform: 'uppercase', marginBottom: 6, fontStyle: 'normal',
};
