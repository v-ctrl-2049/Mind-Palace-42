import React, { useState } from 'react';
import { EDGE_TYPES } from '../data/mindmap';

export default function EdgeEditModal({ edge, nodes, edgeTypes, onSave, onDelete, onClose, isNew, onManageTypes }) {
  const [draft, setDraft] = useState({ ...edge });
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.source || !draft.target) return;
    onSave(draft);
    onClose();
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{isNew ? 'Add connection' : 'Edit connection'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && (
              <button onClick={() => { onDelete(edge.id); onClose(); }}
                style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)' }}>Delete</button>
            )}
            <button onClick={onClose} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)' }}>Cancel</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* From → To */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr', gap: 8, alignItems: 'center' }}>
            <div>
              <div style={fieldLabel}>From</div>
              <select value={draft.source} onChange={e => set('source', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: 12, borderRadius: 6 }}>
                <option value="">Select…</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </div>
            <div style={{ textAlign: 'center', fontSize: 16, color: 'var(--ink-3)', paddingTop: 18 }}>→</div>
            <div>
              <div style={fieldLabel}>To</div>
              <select value={draft.target} onChange={e => set('target', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: 12, borderRadius: 6 }}>
                <option value="">Select…</option>
                {nodes.filter(n => n.id !== draft.source).map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
            </div>
          </div>

          {/* Connection type */}
          <div>
            <div style={fieldLabel}>Connection type</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {edgeTypes.map(t => (
                <button key={t.id} type="button" onClick={() => set('type', t.id)} style={{
                  fontSize: 11, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${draft.type === t.id ? t.color : 'var(--paper-3)'}`,
                  background: draft.type === t.id ? t.color + '22' : 'transparent',
                  color: draft.type === t.id ? t.color : 'var(--ink-3)',
                  fontWeight: draft.type === t.id ? 500 : 400,
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Optional label */}
          <div>
            <div style={fieldLabel}>Label (optional)</div>
            <input value={draft.label || ''} onChange={e => set('label', e.target.value)}
              placeholder="e.g. 'timeless vs temporal'"
              style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ fontSize: 13, padding: '8px 24px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>
              {isNew ? 'Add connection' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const fieldLabel = {
  fontSize: 11, fontWeight: 500, color: 'var(--ink-3)',
  fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
  textTransform: 'uppercase', marginBottom: 6, fontStyle: 'normal',
};
