import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ── Entry types mirrored from ReadingLog ──────────────────────────
const TYPES = {
  observation: { label: 'Observation', icon: '◎', color: '#2c5f8a' },
  quote:       { label: 'Quote',       icon: '"',  color: '#8a6a20' },
  question:    { label: 'Question',    icon: '?',  color: '#b07d28' },
  insight:     { label: 'Insight',     icon: '✦',  color: '#2e7d5e' },
  connection:  { label: 'Connection',  icon: '⟶', color: '#7b3fa0' },
  thread:      { label: 'Thread',      icon: '⊛',  color: '#1a5c3a' },
};

const RULED = 'repeating-linear-gradient(transparent, transparent 24px, rgba(100,80,50,0.06) 24px, rgba(100,80,50,0.06) 25px)';

// ── LogCaptureModal ───────────────────────────────────────────────
// Pre-filled context from wherever it's triggered.
// context: { label, sourceType, sourceId, sourceName }
// prefill: { quote, attribution, type }
export default function LogCaptureModal({ context, prefill = {}, onSubmit, onClose }) {
  const [type, setType]   = useState(prefill.type || 'observation');
  const [quote, setQuote] = useState(prefill.quote || '');
  const [text, setText]   = useState('');
  const [tags, setTags]   = useState('');
  const textRef = useRef();

  useEffect(() => { textRef.current?.focus(); }, []);

  const et = TYPES[type];

  const handleSubmit = () => {
    const trimmed = text.trim();
    const trimmedQ = quote.trim();
    if (!trimmed && !trimmedQ) return;

    const tagArr = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

    onSubmit({
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      type,
      text: trimmed || (trimmedQ ? `Re: "${trimmedQ.slice(0, 60)}${trimmedQ.length > 60 ? '…' : ''}"` : ''),
      quote: trimmedQ,
      attribution: prefill.attribution || '',
      tags: tagArr,
      sourceType: context?.sourceType || 'manual',
      sourceId:   context?.sourceId   || null,
      sourceName: context?.sourceName || null,
      contextLabel: context?.label    || null,
    });
    onClose();
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(10,8,4,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 2, width: 520, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', border: '1px solid var(--paper-3)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '12px 18px', background: 'var(--paper-2)', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
              → Field journal
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)' }}>
              Add to Reading Log
            </div>
          </div>
          {context?.label && (
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em', padding: '3px 8px', border: '1px solid var(--paper-3)', borderRadius: 2, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {context.label}
            </div>
          )}
          <button onClick={onClose} style={{ fontSize: 14, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Type selector */}
        <div style={{ display: 'flex', gap: 4, padding: '10px 18px', borderBottom: '1px solid var(--paper-3)', flexWrap: 'wrap' }}>
          {Object.entries(TYPES).map(([k, v]) => (
            <button key={k} onClick={() => setType(k)}
              style={{ fontSize: 9, padding: '3px 10px', borderRadius: 2, border: `1px solid ${type === k ? v.color : 'var(--paper-3)'}`, background: type === k ? v.color + '18' : 'transparent', color: type === k ? v.color : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{v.icon}</span> {v.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Quote field — shows if type is quote OR if prefill has quote */}
          {(type === 'quote' || quote) && (
            <div>
              <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>
                Quote
              </div>
              <textarea value={quote} onChange={e => setQuote(e.target.value)}
                placeholder="The exact words…"
                rows={2}
                style={{ width: '100%', resize: 'none', padding: '6px 10px', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-2)', background: 'var(--paper-2)', border: '1px solid var(--paper-3)', borderLeft: `3px solid ${et.color}`, borderRadius: 2, fontFamily: 'var(--font-serif)', backgroundImage: RULED, outline: 'none' }} />
              {prefill.attribution && (
                <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', marginTop: 4, paddingLeft: 12 }}>
                  — {prefill.attribution}
                </div>
              )}
            </div>
          )}

          {/* Main note */}
          <div>
            {(type === 'quote' || quote) && (
              <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>
                Your annotation
              </div>
            )}
            <textarea ref={textRef} value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit(); }}
              placeholder={type === 'quote' ? 'Why this quote matters…' : 'Your observation… (⌘↵ to file)'}
              rows={type === 'quote' || quote ? 3 : 4}
              style={{ width: '100%', resize: 'none', padding: '6px 10px', fontSize: 13, color: 'var(--ink)', background: 'var(--paper-2)', border: '1px solid var(--paper-3)', borderRadius: 2, fontFamily: 'var(--font-serif)', backgroundImage: RULED, outline: 'none' }} />
          </div>

          {/* Tags */}
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="Tags — comma separated"
            style={{ padding: '4px 10px', fontSize: 11, color: 'var(--ink-3)', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--paper-3)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', outline: 'none', letterSpacing: '0.03em' }} />
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--paper-2)' }}>
          <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
            {et.icon} {et.label} · {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onClose}
              style={{ fontSize: 10, padding: '5px 12px', borderRadius: 2, border: '1px solid var(--paper-3)', color: 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
              cancel
            </button>
            <button onClick={handleSubmit}
              style={{ fontSize: 10, padding: '5px 16px', borderRadius: 2, background: et.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em' }}>
              FILE TO LOG →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
