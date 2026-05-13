import React, { useState } from 'react';
import SimpleEditor from './SimpleEditor';
import { parseEventDate } from '../data/timeline';
import { v4 as uuidv4 } from 'uuid';
import ArgumentMap from './ArgumentMap';
import InvestigationWriting from './InvestigationWriting';
import { getMapEvidenceSummary } from '../utils/evidenceProfile';
import MentionPicker, { renderMentions, stripMentions } from './MentionPicker';

const getInvType = (id, types) =>
  (types || []).find(t => t.id === id) || { id, label: id, color: '#8a8680', bg: '#f2f0ec' };

const STATUS_STYLES = {
  active: { color: '#c0392b', label: 'ACTIVE',  stamp: '#c0392b' },
  cold:   { color: '#7a6a52', label: 'COLD',    stamp: '#7a6a52' },
  closed: { color: '#2e7d5e', label: 'CLOSED',  stamp: '#2e7d5e' },
};

const LOG_TYPES = {
  opened:       { label: 'Case opened',          color: '#2c5f8a', icon: '◎' },
  evidence:     { label: 'Evidence added',        color: '#2e7d5e', icon: '⊕' },
  revised:      { label: 'Position revised',      color: '#b07d28', icon: '↺' },
  contradiction:{ label: 'Contradiction noted',   color: '#c0392b', icon: '⊘' },
  resolution:   { label: 'Contradiction resolved',color: '#2e7d5e', icon: '⊙' },
  insight:      { label: 'Insight',               color: '#7b3fa0', icon: '✦' },
  verdict:      { label: 'Verdict recorded',      color: '#1a5c3a', icon: '⊛' },
  note:         { label: 'Note',                  color: '#8a8680', icon: '·' },
};

// ── Small reusable bits ──────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ fontSize: 10, padding: '3px 10px', borderRadius: 5, border: '1px solid var(--paper-3)', color: copied ? 'var(--green)' : 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
      {copied ? '✓ copied' : 'copy all'}
    </button>
  );
}

function InlineText({ value, onChange, placeholder, style, multiline }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => { setEditing(false); if (draft !== value) onChange(draft); };
  if (editing) {
    const props = { autoFocus: true, value: draft, onChange: e => setDraft(e.target.value), onBlur: commit,
      onKeyDown: e => { if (!multiline && e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } },
      style: { ...style, background: 'var(--paper-2)', border: '1px solid var(--accent-2)', borderRadius: 5, padding: '4px 8px', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', width: '100%', resize: multiline ? 'vertical' : 'none' } };
    return multiline ? <textarea rows={3} {...props} /> : <input {...props} />;
  }
  return (
    <div onClick={() => { setDraft(value); setEditing(true); }} title="Click to edit"
      style={{ ...style, cursor: 'text', borderBottom: '1px dashed transparent', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderBottomColor = 'var(--accent-2)'}
      onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}>
      {value || <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>{placeholder}</span>}
    </div>
  );
}

function SL({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--paper-3)' }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{children}</span>
      {action && <div style={{ marginLeft: 'auto' }}>{action}</div>}
    </div>
  );
}

function TagChip({ tag, onRemove, onViewTimeline }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--paper-3)', color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
      #{tag}
      {onViewTimeline && <button onClick={() => onViewTimeline(tag)} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onMouseEnter={e => e.currentTarget.style.color='var(--accent)'} onMouseLeave={e => e.currentTarget.style.color='var(--ink-4)'}>→</button>}
      <button onClick={onRemove} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onMouseEnter={e => e.currentTarget.style.color='var(--red)'} onMouseLeave={e => e.currentTarget.style.color='var(--ink-4)'}>✕</button>
    </span>
  );
}

// ── Contradiction card with resolver ────────────────────────────
function ContradictionCard({ item, onDelete, onResolve }) {
  const [resolving, setResolving] = useState(false);
  const [winner, setWinner]       = useState('');
  const [reason, setReason]       = useState('');
  const resolved = !!item.resolution;

  const handleResolve = () => {
    if (!winner || !reason.trim()) return;
    onResolve(item.id, { winner, loser: winner === item.sourceA ? item.sourceB : item.sourceA, reason: reason.trim() });
    setResolving(false);
  };

  return (
    <div style={{ background: 'var(--paper-card)', border: `1px solid ${resolved ? '#2e7d5e33' : '#c0392b33'}`, borderLeft: `3px solid ${resolved ? '#2e7d5e' : '#c0392b'}`, borderRadius: 7, padding: '10px 12px', marginBottom: 8 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 9, color: resolved ? '#2e7d5e' : '#c0392b', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {resolved ? '⊙ Resolved' : '⊘ Contradiction'}
        </span>
        {item.sourceA && item.sourceB && (
          <span style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic' }}>{item.sourceA} vs {item.sourceB}</span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {!resolved && !resolving && (
            <button onClick={() => setResolving(true)}
              style={{ fontSize: 9, color: '#2e7d5e', background: 'none', border: '1px solid #2e7d5e55', borderRadius: 4, padding: '1px 8px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2e7d5e11'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              resolve →
            </button>
          )}
          <button onClick={() => onDelete(item.id)} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
        </div>
      </div>

      {/* Claim */}
      <p style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 8px' }}>{item.claim}</p>

      {/* Resolved state */}
      {resolved && (
        <div style={{ background: '#2e7d5e11', border: '1px solid #2e7d5e22', borderRadius: 5, padding: '7px 10px', marginTop: 6 }}>
          <div style={{ fontSize: 9, color: '#2e7d5e', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            ⊙ Judgment — {item.resolution.winner} found more credible
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{item.resolution.reason}"</p>
          <button onClick={() => onResolve(item.id, null)}
            style={{ marginTop: 6, fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>
            revise judgment
          </button>
        </div>
      )}

      {/* Resolver form */}
      {resolving && !resolved && (
        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--paper-3)', borderRadius: 6, padding: '10px 12px', marginTop: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Which source do you find more credible?
          </div>

          {/* Source buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[item.sourceA, item.sourceB].filter(Boolean).map(src => (
              <button key={src} onClick={() => setWinner(src)}
                style={{ flex: 1, padding: '8px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer', border: `2px solid ${winner === src ? '#2e7d5e' : 'var(--paper-3)'}`, background: winner === src ? '#2e7d5e22' : 'var(--paper-card)', color: winner === src ? '#2e7d5e' : 'var(--ink-2)', fontWeight: winner === src ? 600 : 400, transition: 'all 0.12s' }}>
                {src}
                {winner === src && <span style={{ display: 'block', fontSize: 9, fontWeight: 400, marginTop: 2, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>✓ more credible</span>}
              </button>
            ))}
            {/* Free-text winner if no named sources */}
            {(!item.sourceA || !item.sourceB) && (
              <input value={winner} onChange={e => setWinner(e.target.value)}
                placeholder="Which source?"
                style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 6 }} />
            )}
          </div>

          {/* Reason */}
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            Why? (this will be logged)
          </div>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Your reasoning — methodology, corroborating evidence, source bias, historiographic framing…"
            rows={3}
            style={{ width: '100%', resize: 'vertical', padding: '6px 8px', fontSize: 12, borderRadius: 5, fontFamily: 'var(--font-serif)', border: '1px solid var(--paper-3)', marginBottom: 8 }} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setResolving(false); setWinner(''); setReason(''); }}
              style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>
              Cancel
            </button>
            <button onClick={handleResolve} disabled={!winner || !reason.trim()}
              style={{ fontSize: 11, padding: '5px 16px', borderRadius: 6, background: winner && reason.trim() ? '#2e7d5e' : 'var(--paper-3)', color: winner && reason.trim() ? '#fff' : 'var(--ink-4)', border: 'none', cursor: winner && reason.trim() ? 'pointer' : 'default' }}>
              Record judgment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chain of custody log entry ───────────────────────────────────
function LogEntry({ entry, onEdit, onDelete }) {
  const lt = LOG_TYPES[entry.type] || LOG_TYPES.note;
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.note);

  const commit = () => {
    if (draft.trim() && draft !== entry.note) onEdit(entry.id, draft.trim());
    setEditing(false);
  };

  // Auto-generated entries (resolution, contradiction) shouldn't be freely edited
  const isAutoGenerated = entry.type === 'contradiction' || entry.type === 'resolution';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '20px 60px 1fr', gap: '0 8px', marginBottom: 12, alignItems: 'start' }}
      onMouseEnter={e => { const a = e.currentTarget.querySelector('.log-actions'); if (a) a.style.opacity = '1'; }}
      onMouseLeave={e => { const a = e.currentTarget.querySelector('.log-actions'); if (a) a.style.opacity = '0'; }}>
      <span style={{ color: lt.color, fontSize: 12, textAlign: 'center', paddingTop: 1 }}>{lt.icon}</span>
      <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', paddingTop: 2, lineHeight: 1.5 }}>{date}</span>
      <div style={{ position: 'relative' }}>
        <span style={{ fontSize: 9, color: lt.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>{lt.label}</span>
        {editing ? (
          <div>
            <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) commit(); if (e.key === 'Escape') { setDraft(entry.note); setEditing(false); } }}
              rows={3}
              style={{ width: '100%', resize: 'vertical', padding: '5px 7px', fontSize: 12, borderRadius: 5, fontFamily: 'var(--font-serif)', border: '1px solid var(--accent-2)', outline: 'none', lineHeight: 1.6 }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <button onClick={commit} style={{ fontSize: 10, padding: '2px 10px', borderRadius: 5, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Save</button>
              <button onClick={() => { setDraft(entry.note); setEditing(false); }} style={{ fontSize: 10, padding: '2px 10px', borderRadius: 5, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>{entry.note}</span>
        )}
        {/* Hover actions */}
        {!editing && (
          <div className="log-actions" style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}>
            {!isAutoGenerated && (
              <button onClick={() => { setDraft(entry.note); setEditing(true); }}
                style={{ fontSize: 9, color: 'var(--ink-4)', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✎</button>
            )}
            <button onClick={() => onDelete(entry.id)}
              style={{ fontSize: 9, color: 'var(--ink-4)', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 4, padding: '1px 6px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function InvestigationCasePage({ inv, books, events, invTypes = [], onUpdate, onDelete, onBack, onViewTimeline }) {
  const invType = getInvType(inv.type, invTypes);
  const ss      = STATUS_STYLES[inv.status] || STATUS_STYLES.active;
  const linkedBooks = books.filter(b => (inv.bookIds || []).includes(b.id));
  const isDark  = document.documentElement.getAttribute('data-theme') === 'dark';

  // New entry state
  const [newActor, setNewActor]   = useState('');
  const [newCause, setNewCause]   = useState('');
  const [newTag,   setNewTag]     = useState('');
  const [addingBook, setAddingBook] = useState(false);
  const [activeTab, setActiveTab]   = useState('case');    // 'case' | 'argmap' | 'writing'
  const [dossierTab, setDossierTab] = useState('overview'); // 'overview' | 'evidence' | 'custody' | 'verdict'

  // Contradiction form
  const [newContra, setNewContra] = useState({ sourceA: '', sourceB: '', claim: '' });
  const [showContraForm, setShowContraForm] = useState(false);

  // Custody log form
  const [newLogNote, setNewLogNote] = useState('');
  const [newLogType, setNewLogType] = useState('note');

  const set = (key, val) => onUpdate({ ...inv, [key]: val, updatedAt: new Date().toISOString() });

  const addToList = (field, val, setVal) => {
    if (!val.trim()) return;
    set(field, [...(inv[field] || []), val.trim()]);
    setVal('');
  };
  const removeFromList = (field, idx) => set(field, (inv[field] || []).filter((_, i) => i !== idx));

  const toggleBook = (bookId) => {
    const has = (inv.bookIds || []).includes(bookId);
    const newBookIds = has
      ? (inv.bookIds||[]).filter(id => id !== bookId)
      : [...(inv.bookIds||[]), bookId];
    // When adding a book, add one blank exhibit for it
    // When removing, remove all its exhibits
    const newBookNotes = has
      ? (inv.bookNotes||[]).filter(bn => bn.bookId !== bookId)
      : [...(inv.bookNotes||[]), { id: uuidv4(), bookId, quote: '', note: '', label: '' }];
    onUpdate({ ...inv, bookIds: newBookIds, bookNotes: newBookNotes, updatedAt: new Date().toISOString() });
  };

  const addExhibit = (bookId) => {
    const newNote = { id: uuidv4(), bookId, quote: '', note: '', label: '' };
    set('bookNotes', [...(inv.bookNotes||[]), newNote]);
  };

  const updateExhibit = (exhibitId, field, val) =>
    set('bookNotes', (inv.bookNotes||[]).map(bn => bn.id === exhibitId ? { ...bn, [field]: val } : bn));

  const removeExhibit = (exhibitId) => {
    const remaining = (inv.bookNotes||[]).filter(bn => bn.id !== exhibitId);
    // If a book has no more exhibits, also remove it from bookIds
    const bookIds = [...new Set(remaining.map(bn => bn.bookId))];
    onUpdate({ ...inv, bookNotes: remaining, bookIds, updatedAt: new Date().toISOString() });
  };

  const addContradiction = () => {
    if (!newContra.claim.trim()) return;
    const entry = { id: uuidv4(), ...newContra, createdAt: new Date().toISOString() };
    const updated = [...(inv.contradictions || []), entry];
    // Also log it
    const logEntry = { id: uuidv4(), type: 'contradiction', note: `${newContra.sourceA && newContra.sourceB ? `${newContra.sourceA} vs ${newContra.sourceB}: ` : ''}${newContra.claim.slice(0, 80)}`, createdAt: new Date().toISOString() };
    onUpdate({ ...inv, contradictions: updated, custodyLog: [...(inv.custodyLog||[]), logEntry], updatedAt: new Date().toISOString() });
    setNewContra({ sourceA: '', sourceB: '', claim: '' });
    setShowContraForm(false);
  };

  const removeContradiction = (id) => set('contradictions', (inv.contradictions||[]).filter(c => c.id !== id));

  const resolveContradiction = (id, resolution) => {
    const updated = (inv.contradictions||[]).map(c => c.id === id ? { ...c, resolution } : c);
    const logEntry = resolution
      ? { id: uuidv4(), type: 'resolution', note: `Resolved conflict between ${updated.find(c=>c.id===id)?.sourceA} and ${updated.find(c=>c.id===id)?.sourceB} — found ${resolution.winner} more credible. ${resolution.reason.slice(0,100)}`, createdAt: new Date().toISOString() }
      : { id: uuidv4(), type: 'revised', note: `Reopened contradiction — previous judgment revised.`, createdAt: new Date().toISOString() };
    onUpdate({ ...inv, contradictions: updated, custodyLog: [...(inv.custodyLog||[]), logEntry], updatedAt: new Date().toISOString() });
  };

  const addLogEntry = () => {
    if (!newLogNote.trim()) return;
    const entry = { id: uuidv4(), type: newLogType, note: newLogNote.trim(), createdAt: new Date().toISOString() };
    // If recording verdict, also save to verdict field
    const extra = newLogType === 'verdict' ? { verdict: newLogNote.trim() } : {};
    onUpdate({ ...inv, ...extra, custodyLog: [...(inv.custodyLog||[]), entry], updatedAt: new Date().toISOString() });
    setNewLogNote('');
  };

  const editLogEntry = (id, newNote) =>
    set('custodyLog', (inv.custodyLog||[]).map(e => e.id === id ? { ...e, note: newNote } : e));

  const deleteLogEntry = (id) =>
    set('custodyLog', (inv.custodyLog||[]).filter(e => e.id !== id));

  const relatedEvents = (events||[]).filter(e => e.tags?.some(tag => (inv.tags||[]).includes(tag)));

  // Export
  const exportText = [
    `# ${inv.caseNumber || ''} — ${inv.title}`,
    `Type: ${invType.label} · Status: ${ss.label}`,
    inv.dateRange ? `Period: ${inv.dateRange}` : '',
    '',
    inv.hypothesis ? `\n## Hypothesis\n**Status:** ${inv.hypothesisStatus || 'untested'}\n${inv.hypothesis}${inv.hypothesisNotes ? `\n\n**Assessment:** ${inv.hypothesisNotes}` : ''}` : '',
    inv.summary ? `## Question\n${inv.summary}` : '',
    inv.actors?.length ? `\n## Key Actors\n${inv.actors.map(a=>`- ${a}`).join('\n')}` : '',
    inv.causes?.length ? `\n## Causes\n${inv.causes.map(c=>`- ${c}`).join('\n')}` : '',
    linkedBooks.length ? `\n## Evidence\n${linkedBooks.map(book => {
      const exhibits = (inv.bookNotes||[]).filter(n => n.bookId === book.id);
      if (!exhibits.length) return `### ${book.title}\n(no notes)`;
      return `### ${book.title}\n${exhibits.map((ex, i) => {
        const label = String.fromCharCode(65 + i);
        return `**Exhibit ${label}**${ex.label ? ` — ${ex.label}` : ''}\n${ex.quote ? `> "${ex.quote}"\n` : ''}${ex.note || ''}`;
      }).join('\n\n')}`;
    }).join('\n\n')}` : '',
    inv.contradictions?.length ? `\n## Contradictions\n${inv.contradictions.map(c => {
      const base = `- [${c.sourceA || '?'} vs ${c.sourceB || '?'}] ${c.claim}`;
      if (c.resolution) return base + `\n  → Judgment: ${c.resolution.winner} found more credible — "${c.resolution.reason}"`;
      return base + '\n  → Unresolved';
    }).join('\n')}` : '',
    inv.analysis ? `\n## Analysis\n${inv.analysis.replace(/<[^>]*>/g,'')}` : '',
    inv.verdict ? `\n## Verdict\n${inv.verdict}` : '',
    inv.custodyLog?.length ? `\n## Chain of Custody\n${inv.custodyLog.map(l=>`[${new Date(l.createdAt).toLocaleDateString()}] ${LOG_TYPES[l.type]?.label||l.type}: ${l.note}`).join('\n')}` : '',
    inv.argMap?.nodes?.length ? `\n${(() => {
      const { nodes, edges } = inv.argMap;
      const lines = ['## Argument map'];
      const byType = {};
      nodes.forEach(n => { if (!byType[n.type]) byType[n.type] = []; byType[n.type].push(n); });
      ['cause','mechanism','claim','evidence','objection','verdict'].forEach(type => {
        if (!byType[type]) return;
        lines.push(`\n### ${type.charAt(0).toUpperCase()+type.slice(1)}s`);
        byType[type].forEach(n => {
          lines.push(`- ${n.text}`);
          edges.filter(e => e.source === n.id).forEach(e => {
            const tgt = nodes.find(nd => nd.id === e.target);
            if (tgt) lines.push(`  → (${e.type.replace('_',' ')}) ${tgt.text}`);
          });
        });
      });
      return lines.join('\n');
    })()}` : '',
  ].filter(Boolean).join('\n');

  const cardBg  = isDark ? '#272420' : '#fffdf7';
  const paperBg = isDark ? '#1e1c17' : '#faf6ee';
  const corkBg  = isDark ? '#1a1712' : '#f2ead8';

  // Days active
  const daysActive = Math.floor((Date.now() - new Date(inv.createdAt).getTime()) / 86400000);


  // Log type breakdown for custody summary
  const logBreakdown = Object.entries(LOG_TYPES).map(([k, v]) => ({
    ...v, key: k,
    count: (inv.custodyLog || []).filter(e => e.type === k).length,
  })).filter(x => x.count > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: paperBg }}>

      {/* HEADER */}
      <div style={{ padding: '10px 20px', borderBottom: `2px solid ${invType.color}55`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: isDark ? '#161410' : '#ede5d0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 160, top: -6, fontSize: 60, color: invType.color, opacity: 0.04, fontWeight: 900, fontFamily: 'var(--font-mono)', pointerEvents: 'none', userSelect: 'none' }}>
          {inv.caseNumber || 'CASE'}
        </div>
        <button onClick={onBack} style={{ fontSize: 11, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>← BACK</button>
        <div style={{ width: 1, height: 16, background: 'var(--paper-3)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <InlineText value={inv.caseNumber || ''} onChange={val => set('caseNumber', val)} placeholder="CASE-XXXX"
              style={{ fontSize: 10, color: invType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em' }} />
            <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>·</span>
            <select value={inv.type || ''} onChange={e => set('type', e.target.value)}
              style={{ fontSize: 10, padding: '1px 18px 1px 6px', borderRadius: 3, background: invType.color + '18', color: invType.color, border: `1px solid ${invType.color}44`, fontFamily: 'var(--font-mono)', fontStyle: 'normal', cursor: 'pointer' }}>
              {invTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <InlineText value={inv.dateRange || ''} onChange={val => set('dateRange', val)} placeholder="period…"
              style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }} />
          </div>
          <InlineText value={inv.title} onChange={val => set('title', val)} placeholder="Case title…"
            style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.3 }} />
        </div>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ border: `3px solid ${ss.stamp}`, borderRadius: 4, padding: '3px 10px', transform: 'rotate(-5deg)', display: 'inline-block', boxShadow: `0 0 0 1px ${ss.stamp}33` }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: ss.stamp, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.14em', opacity: 0.9 }}>{ss.label}</div>
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 4, justifyContent: 'center' }}>
            {Object.entries(STATUS_STYLES).map(([k, v]) => (
              <button key={k} onClick={() => set('status', k)}
                style={{ fontSize: 8, padding: '1px 5px', borderRadius: 3, background: inv.status===k?v.stamp+'33':'transparent', color: inv.status===k?v.stamp:'var(--ink-4)', border: `1px solid ${inv.status===k?v.stamp:'var(--paper-3)'}`, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          <CopyBtn text={exportText} />
          <button onClick={() => { if (window.confirm('Delete this case?')) { onDelete?.(inv.id); onBack(); } }}
            style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--paper-3)', color: 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--ink-4)'; e.currentTarget.style.borderColor='var(--paper-3)'; }}>✕</button>
        </div>
      </div>

      {/* OUTER TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--paper-3)', flexShrink: 0, background: isDark ? '#1a1712' : '#e8dfc8' }}>
        {[
          { id: 'case',    label: '◉ DOSSIER' },
          { id: 'argmap',  label: '⟶ ARGUMENT MAP' },
          { id: 'writing', label: '✍ WRITING' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ fontSize: 10, padding: '7px 16px', border: 'none', borderBottom: `3px solid ${activeTab === tab.id ? invType.color : 'transparent'}`, background: activeTab === tab.id ? (isDark ? '#1e1c17' : '#faf6ee') : 'transparent', color: activeTab === tab.id ? invType.color : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em', fontWeight: activeTab === tab.id ? 700 : 400 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ARGUMENT MAP */}
      {activeTab === 'argmap' && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ArgumentMap argMap={inv.argMap || { nodes: [], edges: [] }} onChange={argMap => set('argMap', argMap)} books={books} />
        </div>
      )}

      {/* WRITING */}
      {activeTab === 'writing' && (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <InvestigationWriting inv={inv} books={books} onUpdate={onUpdate} />
        </div>
      )}

      {/* DOSSIER */}
      {activeTab === 'case' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

          {/* Folder tabs */}
          <div style={{ display: 'flex', alignItems: 'flex-end', background: corkBg, paddingLeft: 12, paddingTop: 6, borderBottom: `1px solid ${invType.color}33`, flexShrink: 0 }}>
            {[
              { id: 'overview', label: '◎ Overview',  bg: isDark?'#1e1c17':'#faf6ee' },
              { id: 'evidence', label: '⊕ Evidence',  bg: isDark?'#1e1b16':'#f7f3e9' },
              { id: 'custody',  label: '↺ Custody',   bg: isDark?'#1c1a15':'#f5f0e4' },
              { id: 'verdict',  label: '⊛ Verdict',   bg: isDark?'#1b1e18':'#f2f8f0' },
            ].map(st => (
              <button key={st.id} onClick={() => setDossierTab(st.id)}
                style={{ fontSize: 10, padding: '5px 14px 7px', marginRight: 2, border: `1px solid ${dossierTab === st.id ? invType.color + '55' : 'var(--paper-3)'}`, borderBottom: 'none', borderRadius: '5px 5px 0 0', background: dossierTab === st.id ? st.bg : corkBg, color: dossierTab === st.id ? invType.color : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em', fontWeight: dossierTab === st.id ? 700 : 400, transform: dossierTab === st.id ? 'none' : 'translateY(2px)', transition: 'transform 0.1s' }}>
                {st.label}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', marginRight: 12, display: 'flex', gap: 12, alignItems: 'center', paddingBottom: 4 }}>
              <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{linkedBooks.length} source{linkedBooks.length !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{(inv.custodyLog||[]).length} log entries</span>
              <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{daysActive}d active</span>
            </div>
          </div>

          {/* OVERVIEW */}
          {dossierTab === 'overview' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 280px', background: isDark?'#1e1c17':'#faf6ee' }}>
              <div style={{ overflowY: 'auto', padding: '20px 24px', borderRight: `1px solid ${invType.color}22` }}>
                {(() => {
                  const statusConfig = { untested:{label:'Untested',color:'#8a8680',bg:'#f2f0ec',icon:'◌'}, confirmed:{label:'Confirmed',color:'#2e7d5e',bg:'#e4f4ec',icon:'⊕'}, complicated:{label:'Complicated',color:'#b07d28',bg:'#faf0dc',icon:'↺'}, refuted:{label:'Refuted',color:'#c0392b',bg:'#faeae8',icon:'⊘'} };
                  const sc = statusConfig[inv.hypothesisStatus || 'untested'];
                  return (
                    <div style={{ background: sc.bg + (isDark?'33':''), border: `1px solid ${sc.color}33`, borderLeft: `4px solid ${sc.color}`, borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: sc.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{sc.icon} Hypothesis</div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                          {Object.entries(statusConfig).map(([k, v]) => (
                            <button key={k} onClick={() => set('hypothesisStatus', k)}
                              style={{ fontSize: 8, padding: '1px 7px', borderRadius: 8, border: `1px solid ${inv.hypothesisStatus===k?v.color:'var(--paper-3)'}`, background: inv.hypothesisStatus===k?v.color+'22':'transparent', color: inv.hypothesisStatus===k?v.color:'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                              {v.icon} {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <InlineText value={inv.hypothesis||''} onChange={val=>set('hypothesis',val)} placeholder="State your hypothesis before examining the evidence…" multiline
                        style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, fontStyle: inv.hypothesis?'normal':'italic' }} />
                      {inv.hypothesisStatus !== 'untested' && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 10, color: sc.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Assessment</div>
                          <InlineText value={inv.hypothesisNotes||''} onChange={val=>set('hypothesisNotes',val)} placeholder="How has the evidence affected your hypothesis?" multiline
                            style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.65 }} />
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div style={{ background: invType.color + '0d', border: `1px solid ${invType.color}22`, borderLeft: `4px solid ${invType.color}`, borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: invType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>◉ Opening question</div>
                  <InlineText value={inv.summary||''} onChange={val=>set('summary',val)} placeholder="What is the central question of this case?" multiline
                    style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.75, fontStyle: 'italic' }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <SL>Key actors</SL>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {(inv.actors||[]).map((a,i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 12px', borderRadius: 20, background: cardBg, border: '1px solid var(--paper-3)', color: 'var(--ink-2)' }}>
                        {a}
                        <button onClick={()=>removeFromList('actors',i)} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onMouseEnter={e=>e.currentTarget.style.color='var(--red)'} onMouseLeave={e=>e.currentTarget.style.color='var(--ink-4)'}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={newActor} onChange={e=>setNewActor(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addToList('actors',newActor,setNewActor)} placeholder="Add actor…" style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 6 }} />
                    <button onClick={()=>addToList('actors',newActor,setNewActor)} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Add</button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <SL>Causes / contributing factors</SL>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
                    {(inv.causes||[]).map((c,i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, background: cardBg, border: '1px solid var(--paper-3)', borderRadius: 6, padding: '7px 10px' }}>
                        <span style={{ color: invType.color, fontWeight: 900, flexShrink: 0, fontSize: 14 }}>·</span>
                        <span style={{ flex: 1, fontSize: 13, color: 'var(--ink)', lineHeight: 1.55 }}>{c}</span>
                        <button onClick={()=>removeFromList('causes',i)} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onMouseEnter={e=>e.currentTarget.style.color='var(--red)'} onMouseLeave={e=>e.currentTarget.style.color='var(--ink-4)'}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={newCause} onChange={e=>setNewCause(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addToList('causes',newCause,setNewCause)} placeholder="Add a cause or factor…" style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 6 }} />
                    <button onClick={()=>addToList('causes',newCause,setNewCause)} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Add</button>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <SL>Analysis</SL>
                  <div style={{ background: cardBg, border: '1px solid var(--paper-3)', borderRadius: 8 }}>
                    <SimpleEditor value={inv.analysis||''} onChange={val=>set('analysis',val)} placeholder="Develop your analysis…" />
                  </div>
                </div>

                <div>
                  <SL>Tags</SL>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {(inv.tags||[]).map((tag,i) => <TagChip key={i} tag={tag} onRemove={()=>removeFromList('tags',i)} onViewTimeline={onViewTimeline} />)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={newTag} onChange={e=>setNewTag(e.target.value)}
                      onKeyDown={e=>(e.key==='Enter'||e.key===',')&&addToList('tags',newTag.replace(',','').toLowerCase(),setNewTag)}
                      placeholder="Add tag…" style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 6 }} />
                    <button onClick={()=>addToList('tags',newTag.replace(',','').toLowerCase(),setNewTag)} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Add</button>
                  </div>
                </div>
              </div>

              {/* Case file sidebar */}
              <div style={{ overflowY: 'auto', padding: '20px 18px', background: isDark?'#1a1712':'#ede5d0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: cardBg, border: `2px solid ${invType.color}44`, borderRadius: 8, padding: '16px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 20px 20px 0', borderColor: `transparent ${isDark?'#1a1712':'#ede5d0'} transparent transparent` }} />
                  <div style={{ fontSize: 9, color: invType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${invType.color}33` }}>Case file</div>
                  {[
                    { label: 'Case no.', value: inv.caseNumber || '—' },
                    { label: 'Type', value: invType.label },
                    { label: 'Status', value: ss.label },
                    { label: 'Period', value: inv.dateRange || '—' },
                    { label: 'Opened', value: new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                    { label: 'Active', value: `${daysActive} day${daysActive !== 1 ? 's' : ''}` },
                    { label: 'Sources', value: `${linkedBooks.length}` },
                    { label: 'Actors', value: `${(inv.actors||[]).length}` },
                    { label: 'Contradictions', value: `${(inv.contradictions||[]).length} (${(inv.contradictions||[]).filter(c=>!c.resolution).length} open)` },
                    { label: 'Log entries', value: `${(inv.custodyLog||[]).length}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', width: 90, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 10, color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {inv.hypothesis && (() => {
                  const sc = { untested:{color:'#8a8680',icon:'◌',label:'Untested'}, confirmed:{color:'#2e7d5e',icon:'⊕',label:'Confirmed'}, complicated:{color:'#b07d28',icon:'↺',label:'Complicated'}, refuted:{color:'#c0392b',icon:'⊘',label:'Refuted'} };
                  const s = sc[inv.hypothesisStatus||'untested'];
                  return (
                    <div style={{ background: cardBg, border: `1px solid ${s.color}44`, borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 9, color: s.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{s.icon} Hypothesis — {s.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.6 }}>"{inv.hypothesis.slice(0, 120)}{inv.hypothesis.length > 120 ? '…' : ''}"</div>
                    </div>
                  );
                })()}

                {(() => {
                  const argNodes = inv.argMap?.nodes || [];
                  if (!argNodes.length) return null;
                  const summary = getMapEvidenceSummary(argNodes, books);
                  if (!summary) return null;
                  return (
                    <div style={{ background: cardBg, border: `1px solid ${summary.color}44`, borderRadius: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: summary.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{summary.grade}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: summary.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Evidence — {summary.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>{summary.description}</div>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { id: 'evidence', icon: '⊕', label: 'View exhibits',      color: invType.color },
                    { id: 'custody',  icon: '↺', label: 'Reasoning journal',  color: '#b07d28' },
                    { id: 'verdict',  icon: '⊛', label: 'Verdict & judgment', color: '#2e7d5e' },
                  ].map(({ id, icon, label, color }) => (
                    <button key={id} onClick={() => setDossierTab(id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, border: `1px solid ${color}33`, background: color + '0d', color, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = color + '22'}
                      onMouseLeave={e => e.currentTarget.style.background = color + '0d'}>
                      <span style={{ fontSize: 14 }}>{icon}</span>{label} →
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EVIDENCE */}
          {dossierTab === 'evidence' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 300px', background: isDark?'#1e1b16':'#f7f3e9' }}>
              <div style={{ overflowY: 'auto', padding: '20px 24px', borderRight: `1px solid ${invType.color}22` }}>
                <SL action={<button onClick={()=>setAddingBook(s=>!s)} style={{ fontSize:10, color:'var(--ink-4)', background:'none', border:'1px solid var(--paper-3)', borderRadius:5, padding:'2px 8px', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{addingBook?'done':'+ source'}</button>}>Evidence</SL>
                {addingBook && (
                  <div style={{ marginBottom:14, display:'flex', flexWrap:'wrap', gap:5 }}>
                    {books.map(b => { const linked=(inv.bookIds||[]).includes(b.id); return (
                      <button key={b.id} onClick={()=>toggleBook(b.id)} style={{ fontSize:10, padding:'3px 10px', borderRadius:20, cursor:'pointer', border:`1px solid ${linked?b.color:'var(--paper-3)'}`, background:linked?b.color+'22':'transparent', color:linked?b.color:'var(--ink-3)' }}>
                        {linked?'✓ ':''}{b.title}
                      </button>
                    ); })}
                  </div>
                )}
                {(() => {
                  const methodologies = linkedBooks.map(b => b.methodology).filter(Boolean);
                  const uniqueMethodologies = [...new Set(methodologies)];
                  const showBlindSpot = linkedBooks.length >= 2 && methodologies.length === linkedBooks.length && uniqueMethodologies.length === 1;
                  return showBlindSpot ? (
                    <div style={{ background:'#faf0dc', border:'1px solid #b07d2844', borderRadius:6, padding:'7px 10px', marginBottom:12, fontSize:11, color:'#b07d28', lineHeight:1.55 }}>
                      <span style={{ fontFamily:'var(--font-mono)', fontStyle:'normal', fontWeight:700 }}>⚠ Methodology blind spot</span> — all sources use {uniqueMethodologies[0]}.
                    </div>
                  ) : null;
                })()}
                {linkedBooks.length === 0 ? (
                  <div style={{ fontSize:13, color:'var(--ink-4)', fontStyle:'italic', textAlign:'center', padding:'40px 0' }}>No sources yet — click "+ source" to add.</div>
                ) : (() => {
                  const allExhibits = (inv.bookNotes||[]);
                  let exhibitCounter = 0;
                  return linkedBooks.map(book => {
                    const bookExhibits = allExhibits.filter(bn => bn.bookId === book.id);
                    const exhibits = bookExhibits.length > 0 ? bookExhibits : [{ id: uuidv4(), bookId: book.id, quote:'', note:'', label:'' }];
                    const stcMap = { primary:{label:'PRIMARY',color:'#c0392b',bg:'#faeae8'}, secondary:{label:'SECONDARY',color:'#2c5f8a',bg:'#e8eff8'}, tertiary:{label:'TERTIARY',color:'#7a6a52',bg:'#f0e8d8'} };
                    const stc = book.sourceType ? stcMap[book.sourceType] : null;
                    return (
                      <div key={book.id} style={{ marginBottom:20 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, paddingBottom:6, borderBottom:`1px solid ${book.color}44` }}>
                          <div style={{ width:9, height:9, borderRadius:'50%', background:book.color, flexShrink:0 }} />
                          <span style={{ fontSize:12, fontWeight:600, color:book.color, fontStyle:'italic', flex:1 }}>{book.title}</span>
                          {stc && <span style={{ fontSize:8, padding:'1px 5px', borderRadius:3, background:stc.bg, color:stc.color, fontFamily:'var(--font-mono)', fontStyle:'normal', border:`1px solid ${stc.color}44` }}>{stc.label}</span>}
                          {book.methodology && <span style={{ fontSize:8, padding:'1px 5px', borderRadius:3, background:'var(--paper-3)', color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{book.methodology}</span>}
                          <button onClick={()=>addExhibit(book.id)} style={{ fontSize:9, color:book.color, background:'none', border:`1px solid ${book.color}44`, borderRadius:3, padding:'1px 6px', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>+ exhibit</button>
                          <button onClick={()=>toggleBook(book.id)} style={{ fontSize:9, color:'var(--ink-4)', background:'none', border:'none', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.color='var(--red)'} onMouseLeave={e=>e.currentTarget.style.color='var(--ink-4)'}>remove</button>
                        </div>
                        {exhibits.map(exhibit => {
                          const exhibitLabel = String.fromCharCode(65 + exhibitCounter++);
                          return (
                            <div key={exhibit.id} style={{ background:cardBg, border:`1px solid ${book.color}22`, borderRadius:8, padding:'12px 14px', marginBottom:10, position:'relative' }}>
                              <div style={{ position:'absolute', top:-9, right:12, fontSize:9, padding:'1px 8px', background:book.color, color:'#fff', borderRadius:3, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em' }}>EXHIBIT {exhibitLabel}</div>
                              <input value={exhibit.label||''} onChange={e=>updateExhibit(exhibit.id,'label',e.target.value)} placeholder="Label — e.g. 'p.42 on authority'"
                                style={{ width:'100%', padding:'3px 0', fontSize:10, border:'none', borderBottom:'1px dashed var(--paper-3)', background:'transparent', color:'var(--ink-3)', fontFamily:'var(--font-mono)', fontStyle:'normal', marginBottom:8, outline:'none' }} />
                              <div style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Quote</div>
                              <textarea value={exhibit.quote||''} onChange={e=>updateExhibit(exhibit.id,'quote',e.target.value)} placeholder="A passage from this source…" rows={2}
                                style={{ width:'100%', resize:'vertical', padding:'5px 7px', fontSize:12, borderRadius:5, fontStyle:'italic', color:'var(--ink-2)', background:isDark?'#1a1814':'#fff', border:'1px solid var(--paper-3)', fontFamily:'var(--font-serif)', marginBottom:7 }} />
                              <div style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>Field note</div>
                              <textarea value={exhibit.note||''} onChange={e=>updateExhibit(exhibit.id,'note',e.target.value)} placeholder="Your note on this passage…" rows={2}
                                style={{ width:'100%', resize:'vertical', padding:'5px 7px', fontSize:12, borderRadius:5, color:'var(--ink)', background:isDark?'#1a1814':'#fff', border:'1px solid var(--paper-3)', fontFamily:'var(--font-serif)' }} />
                              {exhibits.length > 1 && (
                                <button onClick={()=>removeExhibit(exhibit.id)} style={{ marginTop:5, fontSize:9, color:'var(--ink-4)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }} onMouseEnter={e=>e.currentTarget.style.color='var(--red)'} onMouseLeave={e=>e.currentTarget.style.color='var(--ink-4)'}>remove exhibit</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  });
                })()}
              </div>
              <div style={{ overflowY:'auto', padding:'20px 18px', background:isDark?'#1a1712':'#ede5d0' }}>
                <SL action={<button onClick={()=>setShowContraForm(s=>!s)} style={{ fontSize:10, color:'#c0392b', background:'none', border:'1px solid #c0392b44', borderRadius:4, padding:'2px 7px', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{showContraForm?'cancel':'+ contradiction'}</button>}>Contradictions</SL>
                <div style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.6, marginBottom:14 }}>Where sources conflict. Record the dispute, then force a judgment.</div>
                {showContraForm && (
                  <div style={{ background:cardBg, border:'1px solid #c0392b33', borderRadius:7, padding:'10px 12px', marginBottom:12 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:6 }}>
                      <input value={newContra.sourceA} onChange={e=>setNewContra(c=>({...c,sourceA:e.target.value}))} placeholder="Source A…" style={{ padding:'5px 8px', fontSize:11, borderRadius:5 }} />
                      <input value={newContra.sourceB} onChange={e=>setNewContra(c=>({...c,sourceB:e.target.value}))} placeholder="Source B…" style={{ padding:'5px 8px', fontSize:11, borderRadius:5 }} />
                    </div>
                    <textarea value={newContra.claim} onChange={e=>setNewContra(c=>({...c,claim:e.target.value}))} placeholder="What do they contradict?" rows={2}
                      style={{ width:'100%', padding:'5px 8px', fontSize:12, borderRadius:5, resize:'vertical', fontFamily:'var(--font-serif)', border:'1px solid var(--paper-3)', marginBottom:6 }} />
                    <button onClick={addContradiction} style={{ fontSize:11, padding:'5px 14px', borderRadius:6, background:'#c0392b', color:'#fff', border:'none', cursor:'pointer' }}>Record</button>
                  </div>
                )}
                {(inv.contradictions||[]).length === 0 && !showContraForm ? (
                  <div style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic', textAlign:'center', padding:'20px 0' }}>No contradictions noted yet.</div>
                ) : (inv.contradictions||[]).map(item => (
                  <ContradictionCard key={item.id} item={item} onDelete={removeContradiction} onResolve={resolveContradiction} />
                ))}
              </div>
            </div>
          )}

          {/* CUSTODY */}
          {dossierTab === 'custody' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 260px', background: isDark?'#1c1a15':'#f5f0e4' }}>
              <div style={{ overflowY:'auto', padding:'20px 24px', borderRight:`1px solid ${invType.color}22` }}>
                <SL>Chain of custody</SL>
                <div style={{ fontSize:12, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.65, marginBottom:18 }}>Your reasoning journal. Use @ to link books, events, or investigations.</div>
                <div style={{ background:cardBg, border:'1px solid var(--paper-3)', borderRadius:8, padding:'14px 16px', marginBottom:20 }}>
                  <select value={newLogType} onChange={e=>setNewLogType(e.target.value)} style={{ padding:'5px 8px', fontSize:11, borderRadius:5, fontFamily:'var(--font-mono)', border:'1px solid var(--paper-3)', background:'var(--paper-2)', color:'var(--ink)', marginBottom:10 }}>
                    {Object.entries(LOG_TYPES).filter(([k])=>k!=='contradiction').map(([k,v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                  <MentionPicker value={newLogNote} onChange={setNewLogNote} placeholder="Log a step in your reasoning… Type @ to link" rows={4} books={books} investigations={[]} events={[]} topics={[]} />
                  <button onClick={addLogEntry} style={{ marginTop:10, fontSize:12, padding:'6px 20px', borderRadius:6, background:'var(--accent)', color:'var(--paper-card)', border:'none', cursor:'pointer' }}>Add to log</button>
                </div>
                {(inv.custodyLog||[]).length === 0 ? (
                  <div style={{ fontSize:12, color:'var(--ink-4)', fontStyle:'italic', textAlign:'center', padding:'20px 0' }}>No entries yet.</div>
                ) : [...(inv.custodyLog||[])].reverse().map(entry => (
                  <LogEntry key={entry.id} entry={entry} onEdit={editLogEntry} onDelete={deleteLogEntry} />
                ))}
              </div>
              <div style={{ overflowY:'auto', padding:'20px 18px', background:isDark?'#1a1712':'#ede5d0' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14, paddingBottom:6, borderBottom:'1px solid var(--paper-3)' }}>Reasoning summary</div>
                <div style={{ marginBottom:18 }}>
                  <div style={{ fontSize:10, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', marginBottom:8 }}>Activity by type</div>
                  {logBreakdown.length === 0 ? (
                    <div style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic' }}>No log entries yet.</div>
                  ) : logBreakdown.map(({ key, label, color, icon, count }) => (
                    <div key={key} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:11, color, width:14, textAlign:'center', flexShrink:0 }}>{icon}</span>
                      <div style={{ flex:1, height:6, borderRadius:3, background:'var(--paper-3)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.min(100, count * 20)}%`, background:color, borderRadius:3 }} />
                      </div>
                      <span style={{ fontSize:10, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', width:20, textAlign:'right', flexShrink:0 }}>{count}</span>
                    </div>
                  ))}
                </div>
                {(inv.custodyLog||[]).length > 0 && (
                  <div>
                    <div style={{ fontSize:10, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', marginBottom:8 }}>Recent entries</div>
                    {[...(inv.custodyLog||[])].reverse().slice(0,3).map(entry => {
                      const lt = LOG_TYPES[entry.type] || LOG_TYPES.note;
                      return (
                        <div key={entry.id} style={{ borderLeft:`2px solid ${lt.color}`, paddingLeft:8, marginBottom:10 }}>
                          <div style={{ fontSize:9, color:lt.color, fontFamily:'var(--font-mono)', fontStyle:'normal', textTransform:'uppercase', marginBottom:2 }}>{lt.icon} {lt.label}</div>
                          <div style={{ fontSize:11, color:'var(--ink-3)', lineHeight:1.5 }}>{entry.note.slice(0,80)}{entry.note.length>80?'…':''}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ marginTop:16, padding:'10px 12px', background:cardBg, border:'1px solid var(--paper-3)', borderRadius:7 }}>
                  <div style={{ fontSize:10, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', marginBottom:6 }}>Case timeline</div>
                  <div style={{ fontSize:11, color:'var(--ink-3)' }}>
                    <div>Opened: {new Date(inv.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
                    <div>Updated: {new Date(inv.updatedAt||inv.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
                    <div style={{ marginTop:4, color:invType.color, fontFamily:'var(--font-mono)', fontStyle:'normal', fontSize:10 }}>{daysActive} days active</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VERDICT */}
          {dossierTab === 'verdict' && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 300px', background: isDark?'#1b1e18':'#f2f8f0' }}>
              <div style={{ overflowY:'auto', padding:'24px 28px', borderRight:'1px solid #2e7d5e22' }}>
                {(() => {
                  const argNodes = inv.argMap?.nodes || [];
                  const summary = argNodes.length ? getMapEvidenceSummary(argNodes, books) : null;
                  if (!summary) return (
                    <div style={{ background:'var(--paper-2)', border:'1px solid var(--paper-3)', borderRadius:8, padding:'14px 16px', marginBottom:22 }}>
                      <div style={{ fontSize:12, color:'var(--ink-4)', fontStyle:'italic' }}>Build your argument map to see evidence quality analysis.</div>
                    </div>
                  );
                  return (
                    <div style={{ background:summary.color+'0e', border:`1px solid ${summary.color}33`, borderRadius:8, padding:'16px 18px', marginBottom:22 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
                        <div style={{ width:48, height:48, borderRadius:'50%', background:summary.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 2px 8px ${summary.color}44` }}>
                          <span style={{ fontSize:22, fontWeight:900, color:'#fff', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{summary.grade}</span>
                        </div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:summary.color, fontFamily:'var(--font-mono)', fontStyle:'normal', textTransform:'uppercase', letterSpacing:'0.07em' }}>Evidence quality — {summary.label}</div>
                          <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:3, lineHeight:1.5 }}>{summary.description}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {[['primary','Primary','#2e7d5e'],['secondary','Secondary','#2c5f8a'],['mixed','Mixed','#2e7d5e'],['untyped','Untyped','#b07d28'],['bare','Unsourced','#c0392b']].filter(([k])=>summary.counts[k]>0).map(([k,label,color])=>(
                          <span key={k} style={{ fontSize:10, padding:'2px 9px', borderRadius:10, background:color+'22', color, fontFamily:'var(--font-mono)', fontStyle:'normal', border:`1px solid ${color}33` }}>{summary.counts[k]} {label}</span>
                        ))}
                      </div>
                      {summary.warnings.map((w,i)=><div key={i} style={{ fontSize:11, color:'#b07d28', fontStyle:'italic', marginTop:5 }}>⚠ {w}</div>)}
                    </div>
                  );
                })()}
                <div style={{ background:isDark?'#1b2418':'#eef6ea', border:'2px solid #2e7d5e55', borderRadius:10, padding:'20px 22px', marginBottom:22, position:'relative' }}>
                  <div style={{ position:'absolute', top:-13, right:18, width:28, height:28, borderRadius:'50%', background:'#2e7d5e', border:'3px solid #1a5c3a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,0.2)' }}>⊛</div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#2e7d5e', fontFamily:'var(--font-mono)', fontStyle:'normal', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:12 }}>Final verdict</div>
                  <InlineText value={inv.verdict||''} onChange={val=>{ set('verdict',val); if(val.trim()) { const entry={id:uuidv4(),type:'verdict',note:val.trim().slice(0,120),createdAt:new Date().toISOString()}; onUpdate({...inv,verdict:val,custodyLog:[...(inv.custodyLog||[]),entry],updatedAt:new Date().toISOString()}); } }}
                    placeholder="Based on the evidence, I conclude…" multiline
                    style={{ fontSize:14, color:'var(--ink)', lineHeight:1.85, fontStyle:inv.verdict?'normal':'italic' }} />
                  {!inv.verdict && <div style={{ fontSize:11, color:'#2e7d5e', opacity:0.6, marginTop:8, fontStyle:'italic' }}>Click to record your verdict.</div>}
                </div>
                {inv.hypothesis && (() => {
                  const sc = { untested:{color:'#8a8680',icon:'◌',label:'Untested'}, confirmed:{color:'#2e7d5e',icon:'⊕',label:'Confirmed'}, complicated:{color:'#b07d28',icon:'↺',label:'Complicated'}, refuted:{color:'#c0392b',icon:'⊘',label:'Refuted'} };
                  const s = sc[inv.hypothesisStatus||'untested'];
                  return (
                    <div style={{ background:cardBg, border:`1px solid ${s.color}33`, borderRadius:8, padding:'16px 18px' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:s.color, fontFamily:'var(--font-mono)', fontStyle:'normal', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>{s.icon} Hypothesis — {s.label}</div>
                      <div style={{ fontSize:13, color:'var(--ink-3)', fontStyle:'italic', lineHeight:1.65, marginBottom:inv.hypothesisNotes?10:0 }}>"{inv.hypothesis}"</div>
                      {inv.hypothesisNotes && <div style={{ fontSize:12, color:'var(--ink)', lineHeight:1.65, paddingTop:10, borderTop:`1px solid ${s.color}22` }}>{inv.hypothesisNotes}</div>}
                    </div>
                  );
                })()}
              </div>
              <div style={{ overflowY:'auto', padding:'20px 18px', background:isDark?'#1a1712':'#ede5d0' }}>
                <SL action={relatedEvents.length > 0 && onViewTimeline && (
                  <button onClick={()=>onViewTimeline(inv.tags?.[0])} style={{ fontSize:10, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>view all →</button>
                )}>Related events</SL>
                {relatedEvents.length === 0 ? (
                  <div style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.65 }}>No matching timeline events.</div>
                ) : relatedEvents.map(ev => {
                  const parsed = parseEventDate(ev.dateRaw);
                  const evBooks = books.filter(b=>(ev.bookIds||[]).includes(b.id));
                  const sharedTags = (ev.tags||[]).filter(t=>(inv.tags||[]).includes(t));
                  return (
                    <div key={ev.id} onClick={()=>onViewTimeline?.(sharedTags[0]||inv.tags?.[0])}
                      style={{ background:cardBg, border:'1px solid var(--paper-3)', borderRadius:7, padding:'10px 11px', marginBottom:8, cursor:'pointer' }}
                      onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent-2)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--paper-3)'; }}>
                      <div style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', marginBottom:2 }}>{parsed.display||ev.dateRaw}</div>
                      <div style={{ fontSize:12, fontWeight:500, color:'var(--ink)', lineHeight:1.35, marginBottom:evBooks.length?4:0 }}>{ev.title}</div>
                      {evBooks.length>0&&<div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:4 }}>{evBooks.map(b=><span key={b.id} style={{ display:'flex',alignItems:'center',gap:2,fontSize:9,color:b.color,fontStyle:'italic' }}><div style={{ width:4,height:4,borderRadius:'50%',background:b.color }} />{b.title}</span>)}</div>}
                      <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>{sharedTags.map(t=><span key={t} style={{ fontSize:9,padding:'1px 5px',borderRadius:6,background:'var(--accent-light)',color:'var(--accent)',fontFamily:'var(--font-mono)',fontStyle:'normal' }}>#{t}</span>)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
