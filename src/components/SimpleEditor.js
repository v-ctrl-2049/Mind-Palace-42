import React, { useRef, useEffect, useCallback } from 'react';

const TOOLS = [
  { cmd: 'bold',                icon: 'B',  style: { fontWeight: 700 } },
  { cmd: 'italic',              icon: 'I',  style: { fontStyle: 'italic' } },
  { cmd: 'insertUnorderedList', icon: '≡',  style: {} },
  { cmd: 'insertOrderedList',   icon: '1.', style: {} },
];

// Strip HTML tags for plain-text export/search
export const stripHtml = (html) =>
  (html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

// ── Compact inline editor (for note cards, capture bar) ──────────
export function CompactEditor({ value, onChange, placeholder, minHeight = 80, autoFocus }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
    if (autoFocus) ref.current.focus();
  }, []);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  }, [onChange]);

  const handleKeyDown = (e) => {
    // Tab inserts spaces rather than losing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
    }
  };

  const isEmpty = !value || value === '<br>' || value === '';

  return (
    <div style={{ position: 'relative' }}>
      {isEmpty && (
        <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 13, color: 'var(--ink-4)', fontStyle: 'italic', pointerEvents: 'none', lineHeight: 1.65 }}>
          {placeholder}
        </div>
      )}
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={handleInput} onKeyDown={handleKeyDown}
        style={{ minHeight, padding: '8px 10px', fontSize: 13, lineHeight: 1.65, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-serif)', border: '1px solid var(--paper-3)', borderRadius: 6, background: 'var(--paper-2)' }} />
      <div style={{ display: 'flex', gap: 6, padding: '4px 6px', background: 'var(--paper-2)', borderTop: '1px solid var(--paper-3)', borderRadius: '0 0 6px 6px' }}>
        {TOOLS.map(tool => (
          <button key={tool.cmd} type="button"
            onMouseDown={e => { e.preventDefault(); ref.current?.focus(); document.execCommand(tool.cmd, false, null); handleInput(); }}
            style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, border: '1px solid transparent', color: 'var(--ink-3)', background: 'none', cursor: 'pointer', ...tool.style }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            {tool.icon}
          </button>
        ))}
        <span style={{ fontSize: 9, color: 'var(--ink-4)', alignSelf: 'center', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginLeft: 'auto' }}>⌘B · ⌘I · ⌘⇧7</span>
      </div>
    </div>
  );
}

// ── Full editor (for analysis, writing tab) ──────────────────────
export default function SimpleEditor({ value, onChange, placeholder = 'Start writing…' }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || '';
    }
  }, []);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  }, [onChange]);

  const execCmd = (cmd) => {
    ref.current?.focus();
    document.execCommand(cmd, false, null);
    handleInput();
  };

  const isEmpty = !value || value === '<br>' || value === '';

  return (
    <div style={{ border: '1px solid var(--paper-3)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 2, padding: '6px 10px', borderBottom: '1px solid var(--paper-3)', background: 'var(--paper-2)' }}>
        {TOOLS.map(tool => (
          <button key={tool.cmd} type="button"
            onMouseDown={e => { e.preventDefault(); execCmd(tool.cmd); }}
            style={{ width: 28, height: 28, borderRadius: 5, fontSize: 12, color: 'var(--ink-2)', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', ...tool.style }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {tool.icon}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'var(--ink-4)', alignSelf: 'center', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>⌘B bold · ⌘I italic</span>
      </div>
      <div style={{ position: 'relative' }}>
        {isEmpty && (
          <div style={{ position: 'absolute', top: 14, left: 16, fontSize: 14, color: 'var(--ink-4)', fontStyle: 'italic', pointerEvents: 'none', lineHeight: 1.7 }}>
            {placeholder}
          </div>
        )}
        <div ref={ref} contentEditable suppressContentEditableWarning
          onInput={handleInput}
          style={{ minHeight: 200, padding: '14px 16px', fontSize: 14, lineHeight: 1.75, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-serif)' }} />
      </div>
    </div>
  );
}
