import React, { useState, useEffect } from 'react';
import { NODE_TYPES } from '../data/mindmap';

export default function NodeEditPanel({ node, books, onUpdate, onDelete, onClose }) {
  const [draft, setDraft] = useState({ ...node });

  useEffect(() => { setDraft({ ...node }); }, [node.id]);

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const handleSave = () => { onUpdate(draft); };

  const nodeType = NODE_TYPES.find(t => t.id === draft.type) || NODE_TYPES[0];

  return (
    <div style={{
      width: 280, flexShrink: 0,
      borderLeft: '1px solid var(--paper-3)',
      background: 'var(--paper-2)',
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: nodeType.color }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>Edit node</span>
        </div>
        <button onClick={onClose} style={{ fontSize: 14, color: 'var(--ink-4)', padding: '2px 6px' }}>✕</button>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Label */}
        <div>
          <Label>Label</Label>
          <input value={draft.label} onChange={e => set('label', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper)', color: 'var(--ink)' }} />
        </div>

        {/* Node type */}
        <div>
          <Label>Node type</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NODE_TYPES.map(t => (
              <button key={t.id} onClick={() => set('type', t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 6, border: `1px solid ${draft.type === t.id ? t.color : 'var(--paper-3)'}`,
                background: draft.type === t.id ? t.color + '22' : 'transparent',
                color: draft.type === t.id ? t.color : 'var(--ink-3)',
                fontSize: 12, textAlign: 'left', cursor: 'pointer',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Book link */}
        <div>
          <Label>Link to book</Label>
          <select value={draft.bookId || ''} onChange={e => set('bookId', e.target.value)}
            style={{ width: '100%', padding: '7px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)' }}>
            <option value="">No book</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </div>

        {/* Note */}
        <div>
          <Label>Note</Label>
          <textarea value={draft.note || ''} onChange={e => set('note', e.target.value)}
            rows={5} placeholder="Your thinking on this node…"
            style={{ width: '100%', padding: '7px 10px', fontSize: 12, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper)', color: 'var(--ink)', resize: 'vertical', fontFamily: 'var(--font-serif)', lineHeight: 1.6 }} />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--paper-3)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={() => { if (window.confirm('Delete this node?')) onDelete(node.id); }}
          style={{ fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)' }}>
          Delete
        </button>
        <button onClick={handleSave}
          style={{ flex: 1, fontSize: 12, padding: '6px 0', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none' }}>
          Save
        </button>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--ink-4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{children}</div>;
}
