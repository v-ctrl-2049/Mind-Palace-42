import React, { useState } from 'react';
import { CompactEditor, stripHtml } from './SimpleEditor';

const RELATIVE_TIME = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const handle = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={handle}
      style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, border: '1px solid var(--paper-3)', color: 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>
      {copied ? '✓' : label}
    </button>
  );
}

export default function ThoughtCard({ thought, book, books = [], thoughtTypes = [], onDelete, onUpdate, onTopicClick, onOpenArchive }) {
  const [mode, setMode] = useState('view');
  const [draft, setDraft] = useState({ ...thought });
  const [topicInput, setTopicInput] = useState('');

  const typeInfo = thoughtTypes.find(t => t.id === thought.type) || thoughtTypes[0] || { color: '#7a6a52', bg: '#f0e8d8', label: thought.type };
  const draftTypeInfo = thoughtTypes.find(t => t.id === draft.type) || thoughtTypes[0] || { color: '#7a6a52', bg: '#f0e8d8', label: draft.type };

  const handleSave = () => { onUpdate({ ...draft }); setMode('view'); };
  const handleCancel = () => { setDraft({ ...thought }); setTopicInput(''); setMode('view'); };
  const handleAddTopic = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && topicInput.trim()) {
      e.preventDefault();
      const tag = topicInput.trim().toLowerCase().replace(/,/g, '');
      if (!draft.topics.includes(tag)) setDraft(d => ({ ...d, topics: [...d.topics, tag] }));
      setTopicInput('');
    }
  };

  // ── VIEW ──────────────────────────────────────────────────
  if (mode === 'view') {
    return (
      <div style={{ background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${typeInfo.color}`, position: 'relative' }}
        onMouseEnter={e => { const el = e.currentTarget.querySelector('.card-actions'); if (el) el.style.opacity = '1'; }}
        onMouseLeave={e => { const el = e.currentTarget.querySelector('.card-actions'); if (el) el.style.opacity = '0'; }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, flexWrap: 'wrap', paddingRight: 70 }}>
          <button
            onClick={() => onOpenArchive?.(thought.bookId)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: onOpenArchive ? 'pointer' : 'default', padding: 0 }}
            title={onOpenArchive ? `Open notes for ${book?.title}` : undefined}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: book?.color || '#888', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', textDecoration: onOpenArchive ? 'underline' : 'none', textDecorationStyle: 'dotted', textUnderlineOffset: 2 }}>
              {book?.title || 'Unknown book'}
            </span>
          </button>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: typeInfo.bg + '33', color: typeInfo.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: `1px solid ${typeInfo.color}44` }}>
            {typeInfo.label}
          </span>
          {thought.page && <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>p.{thought.page}</span>}
          <span style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 'auto' }}>{RELATIVE_TIME(thought.createdAt)}</span>
        </div>

        {/* Quote block (if present and separate) */}
        {thought.quote && (
          <div style={{ borderLeft: '2px solid var(--paper-3)', paddingLeft: 10, marginBottom: 10, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.65, fontStyle: 'italic', flex: 1 }}>"{thought.quote}"</p>
              <CopyBtn text={thought.quote} label="Copy quote" />
            </div>
          </div>
        )}

        {/* Note / body */}
        {thought.text && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.65, flex: 1 }}
              dangerouslySetInnerHTML={{ __html: thought.text }} />
            <CopyBtn text={stripHtml(thought.text)} label="Copy" />
          </div>
        )}

        {/* Topics */}
        {thought.topics?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
            {thought.topics.map(topic => (
              <button key={topic} onClick={() => onTopicClick(topic)}
                style={{ fontSize: 10, padding: '2px 9px', borderRadius: 20, background: 'var(--paper-3)', color: 'var(--ink-3)', border: '1px solid var(--paper-3)', fontFamily: 'var(--font-mono)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper-3)'; e.currentTarget.style.color = 'var(--ink-3)'; }}>
                #{topic}
              </button>
            ))}
          </div>
        )}

        {/* Hover actions */}
        <div className="card-actions" style={{ position: 'absolute', top: 8, right: 10, display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}>
          <button onClick={() => setMode('edit')}
            style={{ fontSize: 10, padding: '2px 9px', borderRadius: 5, background: 'var(--paper-2)', color: 'var(--ink-2)', border: '1px solid var(--paper-3)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-2)'}>Edit</button>
          <button onClick={() => { if (window.confirm('Delete this thought?')) onDelete(thought.id); }}
            style={{ fontSize: 10, padding: '2px 9px', borderRadius: 5, background: 'var(--paper-2)', color: 'var(--ink-3)', border: '1px solid var(--paper-3)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}>✕</button>
        </div>
      </div>
    );
  }

  // ── EDIT ──────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--paper-card)', border: `1px solid ${draftTypeInfo.color}55`, borderRadius: 10, padding: '13px 14px', borderLeft: `3px solid ${draftTypeInfo.color}` }}>
      {/* Type selector */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {thoughtTypes.map(t => (
          <button key={t.id} onClick={() => setDraft(d => ({ ...d, type: t.id }))}
            style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, background: draft.type === t.id ? t.bg + '33' : 'transparent', color: draft.type === t.id ? t.color : 'var(--ink-4)', border: `1px solid ${draft.type === t.id ? t.color + '66' : 'var(--paper-3)'}`, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Quote */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginBottom: 4, letterSpacing: '0.05em' }}>QUOTE (optional)</div>
        <textarea autoFocus value={draft.quote || ''} onChange={e => setDraft(d => ({ ...d, quote: e.target.value }))} rows={2}
          placeholder="A passage from the text…"
          style={{ width: '100%', resize: 'vertical', padding: '6px 8px', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic', color: 'var(--ink-2)', background: 'var(--paper-2)', border: '1px solid var(--paper-3)', borderRadius: 6, fontFamily: 'var(--font-serif)' }} />
      </div>

      {/* Note */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginBottom: 4, letterSpacing: '0.05em' }}>NOTE / THOUGHT</div>
        <CompactEditor value={draft.text || ''} onChange={val => setDraft(d => ({ ...d, text: val }))}
          placeholder="Your thought, reaction, or question…"
          minHeight={72} />
      </div>

      {/* Book + page */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <select value={draft.bookId || ''} onChange={e => setDraft(d => ({ ...d, bookId: e.target.value }))}
          style={{ fontSize: 12, padding: '5px 28px 5px 8px', borderRadius: 6, flex: 1, minWidth: 140, background: 'var(--paper-2)', color: 'var(--ink)', border: '1px solid var(--paper-3)' }}>
          <option value="">No book</option>
          {books.filter(b => b.status === 'reading').length > 0 && (
            <optgroup label="Currently reading">
              {books.filter(b => b.status === 'reading').map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </optgroup>
          )}
          {books.filter(b => b.status !== 'reading').length > 0 && (
            <optgroup label="Other books">
              {books.filter(b => b.status !== 'reading').map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </optgroup>
          )}
        </select>
        <input type="number" value={draft.page || ''} onChange={e => setDraft(d => ({ ...d, page: e.target.value ? parseInt(e.target.value) : null }))}
          placeholder="p." style={{ width: 64, fontSize: 12, padding: '5px 8px', borderRadius: 6 }} />
      </div>

      {/* Tags */}
      <div style={{ border: '1px solid var(--paper-3)', borderRadius: 6, padding: '5px 8px', display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center', marginBottom: 10, background: 'var(--paper)' }}>
        {draft.topics.map(tag => (
          <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--paper-3)', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-mono)' }}>
            #{tag}
            <button onClick={() => setDraft(d => ({ ...d, topics: d.topics.filter(t => t !== tag) }))}
              style={{ fontSize: 9, color: 'var(--ink-3)', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </span>
        ))}
        <input value={topicInput} onChange={e => setTopicInput(e.target.value)} onKeyDown={handleAddTopic}
          placeholder="add topic…"
          style={{ border: 'none', outline: 'none', fontSize: 11, background: 'transparent', minWidth: 80, color: 'var(--ink)', fontFamily: 'var(--font-serif)' }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={handleCancel} style={{ fontSize: 12, padding: '5px 14px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSave} style={{ fontSize: 12, padding: '5px 16px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  );
}
