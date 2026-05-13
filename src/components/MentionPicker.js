import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Mention chip renderer ─────────────────────────────────────────
// Renders [[type:id:label]] syntax as styled chips in display HTML
export function renderMentions(text, onNavigate) {
  if (!text || !text.includes('[[')) return text;
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[\[(\w+):([^:]+):([^\]]+)\]\]$/);
    if (!match) return part;
    const [, type, id, label] = match;
    const colors = { book: '#2c5f8a', investigation: '#c0392b', event: '#b07d28', topic: '#2e7d5e', source: '#7b3fa0' };
    const color = colors[type] || '#8a8680';
    return (
      <span key={i}
        onClick={() => onNavigate?.(type, id)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '0 7px', borderRadius: 10, background: color + '18', color, border: `1px solid ${color}33`, fontSize: '0.9em', cursor: onNavigate ? 'pointer' : 'default', fontStyle: 'normal', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}
        title={`${type}: ${label}`}>
        {type === 'book' ? '▣' : type === 'investigation' ? '⊛' : type === 'event' ? '↔' : type === 'topic' ? '⊕' : '◎'}
        {label}
      </span>
    );
  });
}

// Strip mention syntax for plain text export
export function stripMentions(text) {
  return (text || '').replace(/\[\[\w+:[^:]+:([^\]]+)\]\]/g, '$1');
}

// ── MentionPicker component ───────────────────────────────────────
// Wraps a textarea and intercepts @ to show entity picker
// Props:
//   value, onChange — controlled textarea value (plain text with [[]] syntax)
//   placeholder, rows, style
//   books, investigations, events, topics — entity lists for @ picker
//   onNavigate — (type, id) => void for clicking mentions in display
export default function MentionPicker({ value, onChange, placeholder, rows = 3, style, books = [], investigations = [], events = [], topics = [] }) {
  const [showPicker, setShowPicker]   = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerPos, setPickerPos]     = useState({ top: 0, left: 0 });
  const [atIndex, setAtIndex]         = useState(-1); // where the @ was typed
  const textareaRef = useRef();
  const pickerRef   = useRef();

  // Build entity list
  const allEntities = [
    ...books.map(b =>        ({ type: 'book',          id: b.id,  label: b.title,  sub: b.author,     color: '#2c5f8a', icon: '▣' })),
    ...investigations.map(i =>({ type: 'investigation', id: i.id,  label: i.title,  sub: i.caseNumber, color: '#c0392b', icon: '⊛' })),
    ...events.map(e =>        ({ type: 'event',         id: e.id,  label: e.title,  sub: e.dateRaw,    color: '#b07d28', icon: '↔' })),
    ...topics.map(t =>        ({ type: 'topic',         id: t.id,  label: t.label || t.name, sub: '',  color: '#2e7d5e', icon: '⊕' })),
  ];

  const filtered = allEntities.filter(e =>
    !pickerSearch || (e.label && e.label.toLowerCase().includes(pickerSearch.toLowerCase())) || (e.sub && e.sub.toLowerCase().includes(pickerSearch.toLowerCase()))
  ).slice(0, 12);

  const handleKeyDown = useCallback((e) => {
    if (e.key === '@') {
      const ta = textareaRef.current;
      if (!ta) return;
      // Get cursor position for floating picker
      setAtIndex(ta.selectionStart);
      setPickerSearch('');
      setShowPicker(true);
      // Rough position estimate — textarea relative
      const rect = ta.getBoundingClientRect();
      setPickerPos({ top: rect.bottom + 4, left: rect.left });
    }
    if (showPicker && e.key === 'Escape') { setShowPicker(false); setAtIndex(-1); }
  }, [showPicker]);

  const handleInput = useCallback((e) => {
    const newVal = e.target.value;
    onChange(newVal);
    if (showPicker && atIndex >= 0) {
      // Extract search term after @
      const after = newVal.slice(atIndex + 1, e.target.selectionStart);
      if (after.includes(' ') || after.includes('\n')) { setShowPicker(false); setAtIndex(-1); return; }
      setPickerSearch(after);
    }
  }, [showPicker, atIndex, onChange]);

  const insertMention = (entity) => {
    const ta = textareaRef.current;
    if (!ta || atIndex < 0) return;
    const before = value.slice(0, atIndex);
    const after   = value.slice(ta.selectionStart);
    const mention = `[[${entity.type}:${entity.id}:${entity.label}]]`;
    const newVal  = before + mention + ' ' + after;
    onChange(newVal);
    setShowPicker(false);
    setAtIndex(-1);
    setPickerSearch('');
    // Restore focus
    setTimeout(() => {
      if (ta) { ta.focus(); const pos = before.length + mention.length + 1; ta.setSelectionRange(pos, pos); }
    }, 10);
  };

  // Close picker on outside click
  useEffect(() => {
    const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target) && e.target !== textareaRef.current) { setShowPicker(false); setAtIndex(-1); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <textarea ref={textareaRef} value={value} rows={rows}
        onChange={handleInput} onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{ width: '100%', resize: 'vertical', padding: '8px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)', fontFamily: 'var(--font-serif)', lineHeight: 1.65, ...style }} />
      <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginTop: 3, opacity: 0.7 }}>
        Type @ to link a book, investigation, event, or topic
      </div>

      {/* Floating picker */}
      {showPicker && (
        <div ref={pickerRef}
          style={{ position: 'fixed', top: pickerPos.top, left: pickerPos.left, width: 300, background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 10, boxShadow: 'var(--shadow-md)', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ padding: '7px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>@</span>
            <input autoFocus value={pickerSearch} onChange={e => setPickerSearch(e.target.value)}
              placeholder="Search books, investigations, events…"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: 'var(--ink)', outline: 'none' }} />
            <button onClick={() => { setShowPicker(false); setAtIndex(-1); }} style={{ fontSize: 11, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic' }}>No matches</div>
            ) : filtered.map(entity => (
              <button key={`${entity.type}-${entity.id}`} onClick={() => insertMention(entity)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'none', border: 'none', borderBottom: '1px solid var(--paper-3)', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <span style={{ fontSize: 12, color: entity.color, flexShrink: 0 }}>{entity.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entity.label}</div>
                  {entity.sub && <div style={{ fontSize: 10, color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entity.sub}</div>}
                </div>
                <span style={{ fontSize: 9, color: entity.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', flexShrink: 0 }}>{entity.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
