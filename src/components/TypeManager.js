import React, { useState } from 'react';
import { TYPE_COLORS } from '../data/types';

// Universal type editor modal — works for thought types, event types, node types, edge types
export default function TypeManager({ title, types = [], onUpdate, onClose, hasColor = true, hasDash = false }) {
  const [items, setItems] = useState((types || []).map(t => ({ ...t })));
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(TYPE_COLORS[0]);
  const [newDash, setNewDash] = useState(false);

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const id = newLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (items.find(t => t.id === id)) return;
    const bg = newColor + '22';
    setItems(prev => [...prev, { id, label: newLabel.trim(), color: newColor, bg, dash: newDash }]);
    setNewLabel('');
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(t => t.id !== id));
  };

  const handleLabelChange = (id, label) => {
    setItems(prev => prev.map(t => t.id === id ? { ...t, label } : t));
  };

  const handleColorChange = (id, color) => {
    setItems(prev => prev.map(t => t.id === id ? { ...t, color, bg: color + '22' } : t));
  };

  const handleSave = () => {
    onUpdate(items);
    onClose();
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: '100%', maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Manage {title}</span>
          <button onClick={onClose} style={{ fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Existing types */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {items.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 0', borderBottom: '1px solid var(--paper-3)' }}>
              {hasColor && (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: t.color, cursor: 'pointer' }} />
                  <input type="color" value={t.color} onChange={e => handleColorChange(t.id, e.target.value)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                </div>
              )}
              {hasDash && (
                <button onClick={() => setItems(prev => prev.map(i => i.id === t.id ? { ...i, dash: !i.dash } : i))}
                  style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, border: `1px solid ${t.dash ? t.color : 'var(--paper-3)'}`, color: t.dash ? t.color : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', background: 'transparent', flexShrink: 0 }}>
                  {t.dash ? 'dashed' : 'solid'}
                </button>
              )}
              <input value={t.label} onChange={e => handleLabelChange(t.id, e.target.value)}
                style={{ flex: 1, padding: '5px 8px', fontSize: 13, borderRadius: 5 }} />
              <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', minWidth: 60 }}>{t.id}</span>
              <button onClick={() => handleDelete(t.id)}
                style={{ fontSize: 11, color: 'var(--ink-4)', cursor: 'pointer', padding: '0 4px', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--paper-3)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 8, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add new type</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            {hasColor && (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: newColor, cursor: 'pointer', border: '2px solid var(--paper-3)' }} />
                <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              </div>
            )}
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Type label…"
              style={{ flex: 1, padding: '7px 10px', fontSize: 13, borderRadius: 6 }} />
            {hasDash && (
              <button onClick={() => setNewDash(d => !d)}
                style={{ fontSize: 11, padding: '6px 10px', borderRadius: 6, border: `1px solid ${newDash ? 'var(--accent)' : 'var(--paper-3)'}`, color: newDash ? 'var(--accent)' : 'var(--ink-3)', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                {newDash ? 'dashed' : 'solid'}
              </button>
            )}
            <button onClick={handleAdd}
              style={{ fontSize: 12, padding: '7px 16px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              Add
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ fontSize: 12, padding: '7px 16px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ fontSize: 12, padding: '7px 20px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
