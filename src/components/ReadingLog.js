import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CompactEditor, stripHtml } from './SimpleEditor';
import MentionPicker from './MentionPicker';
import { XiaoHuaSVG, XiaoHuaIcon } from './XiaoHua';
import { getDailyQuote, getDailyNotice, getBellflowerNotice, getLibrarianNotes } from '../data/archivistQuotes';

// ── Entry types ───────────────────────────────────────────────────
const ENTRY_TYPES = {
  observation: { label: 'Observation', icon: '◎', color: '#2c5f8a',  bg: '#e8eff8', stamp: 'OBS.'  },
  quote:       { label: 'Quote',       icon: '"',  color: '#8a6a20',  bg: '#f8f0dc', stamp: 'QUO.'  },
  connection:  { label: 'Connection',  icon: '⟶', color: '#7b3fa0',  bg: '#f0e8f8', stamp: 'CONN.' },
  question:    { label: 'Question',    icon: '?',  color: '#b07d28',  bg: '#faf0dc', stamp: 'QST.'  },
  insight:     { label: 'Insight',     icon: '✦',  color: '#2e7d5e',  bg: '#e4f4ec', stamp: 'INS.'  },
  revision:    { label: 'Revision',    icon: '↺',  color: '#c0392b',  bg: '#faeae8', stamp: 'REV.'  },
  thread:      { label: 'Thread',      icon: '⊛',  color: '#1a5c3a',  bg: '#e0f0e8', stamp: 'THR.'  },
};

// Seeded deterministic rotation
function seedRotation(id, range = 1.4) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return ((h % 7) - 3) * (range / 3);
}

// Ruled-line CSS background for reflection cards
const RULED_BG = `repeating-linear-gradient(
  transparent,
  transparent 24px,
  rgba(100,80,50,0.07) 24px,
  rgba(100,80,50,0.07) 25px
)`;

// Roman numeral for volume
function toRoman(n) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let r = '';
  for (let i = 0; i < vals.length; i++) while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  return r || 'I';
}

// ── Promote modal ─────────────────────────────────────────────────
function PromoteModal({ entry, investigations, onPromoteToExisting, onPromoteNew, onClose }) {
  const [mode, setMode]             = useState('existing');
  const [selectedInv, setSelectedInv] = useState('');
  const [logType, setLogType]       = useState('insight');
  const [newTitle, setNewTitle]     = useState('');

  const LOG_TYPES_SIMPLE = [
    { id: 'note',     label: 'Note' },
    { id: 'insight',  label: 'Insight' },
    { id: 'revised',  label: 'Position revised' },
    { id: 'evidence', label: 'Evidence added' },
  ];

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 20 }}>
      <div style={{ background: '#faf6ee', border: '1px solid #c8b99a', borderRadius: 10, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden', fontFamily: 'Georgia, serif' }}>
        {/* Header — like a case transfer slip */}
        <div style={{ padding: '12px 18px', background: '#1a1410', color: '#f0e8d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', letterSpacing: '0.14em', color: '#8a7a5a', marginBottom: 2 }}>FIELD NOTES → INVESTIGATION</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>TRANSFER SLIP</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 14, color: '#8a7a5a', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ padding: '16px 18px' }}>
          {/* Entry preview — like a quoted exhibit */}
          <div style={{ background: '#fff8e8', border: '1px solid #c8b99a', borderLeft: '3px solid #b07d28', borderRadius: 5, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: '#5a4a2a', lineHeight: 1.7, fontStyle: 'italic', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -8, right: 10, fontSize: 8, background: '#b07d28', color: '#fff', padding: '1px 7px', borderRadius: 3, fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}>SOURCE NOTE</div>
            {stripHtml(entry.text).slice(0, 150)}{stripHtml(entry.text).length > 150 ? '…' : ''}
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', border: '1px solid #c8b99a', borderRadius: 6, overflow: 'hidden', marginBottom: 14 }}>
            {[['existing','Add to existing case'],['new','Open as new case']].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex: 1, padding: '7px 8px', fontSize: 11, border: 'none', borderRight: m==='existing'?'1px solid #c8b99a':'none', background: mode===m?'#1a1410':'transparent', color: mode===m?'#f0e8d8':'#5a4a2a', cursor: 'pointer', fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
                {label}
              </button>
            ))}
          </div>

          {mode === 'existing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select value={selectedInv} onChange={e => setSelectedInv(e.target.value)}
                style={{ padding: '8px 10px', fontSize: 13, borderRadius: 5, border: '1px solid #c8b99a', background: '#fff8e8', color: '#2a1a0a', fontFamily: 'Georgia, serif' }}>
                <option value="">Select a case…</option>
                {investigations.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.caseNumber ? `${inv.caseNumber} — ` : ''}{inv.title}</option>
                ))}
              </select>
              <select value={logType} onChange={e => setLogType(e.target.value)}
                style={{ padding: '8px 10px', fontSize: 13, borderRadius: 5, border: '1px solid #c8b99a', background: '#fff8e8', color: '#2a1a0a', fontFamily: 'DM Mono, monospace' }}>
                {LOG_TYPES_SIMPLE.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <button disabled={!selectedInv} onClick={() => onPromoteToExisting(selectedInv, logType)}
                style={{ padding: '9px 16px', borderRadius: 6, background: selectedInv?'#1a1410':'#c8b99a', color: '#f0e8d8', border: 'none', cursor: selectedInv?'pointer':'not-allowed', fontSize: 12, fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>
                FILE TO CUSTODY LOG →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Case title…"
                style={{ padding: '8px 10px', fontSize: 13, borderRadius: 5, border: '1px solid #c8b99a', background: '#fff8e8', color: '#2a1a0a', fontFamily: 'Georgia, serif' }} />
              <button disabled={!newTitle.trim()} onClick={() => onPromoteNew(newTitle)}
                style={{ padding: '9px 16px', borderRadius: 6, background: newTitle.trim()?'#1a1410':'#c8b99a', color: '#f0e8d8', border: 'none', cursor: newTitle.trim()?'pointer':'not-allowed', fontSize: 12, fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>
                OPEN NEW CASE →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Entry card ────────────────────────────────────────────────────
function EntryCard({ entry, books, investigations, onDelete, onUpdate, onPromote }) {
  const et  = ENTRY_TYPES[entry.type] || ENTRY_TYPES.observation;
  const rot = seedRotation(entry.id);
  const linkedBooks = books.filter(b => (entry.bookIds||[]).includes(b.id));
  const [editing, setEditing]     = useState(false);
  const [draftText, setDraftText] = useState(entry.text || '');
  const [hovered, setHovered]     = useState(false);
  const isQuick = entry.quickCapture;
  const isConnection = entry.type === 'connection';

  const promotedInv = entry.promoted?.investigationId
    ? investigations.find(i => i.id === entry.promoted.investigationId)
    : null;

  const commitEdit = () => {
    onUpdate({ ...entry, text: draftText, updatedAt: new Date().toISOString() });
    setEditing(false);
  };

  const dateStr = new Date(entry.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const timeStr = new Date(entry.createdAt).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isQuick
          ? `${et.bg}`
          : '#fefcf5',
        backgroundImage: isQuick ? 'none' : RULED_BG,
        border: `1px solid ${isQuick ? et.color + '44' : '#c8b99a'}`,
        borderTop: isQuick ? `3px solid ${et.color}` : `1px solid #c8b99a`,
        borderRadius: isQuick ? 4 : 2,
        padding: isQuick ? '10px 12px 10px' : '16px 16px 14px',
        position: 'relative',
        transform: `rotate(${rot}deg)`,
        transition: 'transform 0.18s cubic-bezier(.2,.8,.3,1), box-shadow 0.18s',
        boxShadow: hovered
          ? '3px 6px 18px rgba(0,0,0,0.16), 0 0 0 1px rgba(100,80,50,0.15)'
          : '1px 3px 7px rgba(0,0,0,0.09)',
        cursor: 'default',
        breakInside: 'avoid',
        fontFamily: 'Georgia, serif',
      }}
      onMouseOver={e => {
        e.currentTarget.style.transform = 'rotate(0deg) scale(1.015) translateY(-2px)';
        e.currentTarget.style.zIndex = '10';
        e.currentTarget.style.boxShadow = '4px 8px 24px rgba(0,0,0,0.18)';
      }}
      onMouseOut={e => {
        e.currentTarget.style.transform = `rotate(${rot}deg)`;
        e.currentTarget.style.zIndex = '1';
        e.currentTarget.style.boxShadow = '1px 3px 7px rgba(0,0,0,0.09)';
      }}>

      {/* Classification stamp — rotated corner mark */}
      <div style={{
        position: 'absolute', top: isQuick ? 6 : 10, right: isQuick ? 8 : 12,
        fontSize: 8, color: et.color, fontFamily: 'DM Mono, monospace', fontStyle: 'normal',
        letterSpacing: '0.1em', opacity: 0.65,
        transform: 'rotate(-8deg)',
        borderBottom: `1px solid ${et.color}55`,
        paddingBottom: 1,
      }}>
        {et.stamp}
      </div>

      {/* Connection visual — two source dots joined by line */}
      {isConnection && linkedBooks.length >= 2 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: linkedBooks[0].color, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${linkedBooks[0].color}, ${linkedBooks[1]?.color || et.color})`, borderRadius: 1 }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: linkedBooks[1]?.color || et.color, flexShrink: 0 }} />
        </div>
      )}

      {/* Date/time — handwritten feel, top left */}
      {!isQuick && (
        <div style={{ fontSize: 9, color: '#8a7060', fontStyle: 'italic', marginBottom: 10, letterSpacing: '0.02em' }}>
          {dateStr} · {timeStr}
        </div>
      )}

      {/* Content */}
      {editing ? (
        <div>
          <CompactEditor value={draftText} onChange={setDraftText} minHeight={60} autoFocus />
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={commitEdit}
              style={{ fontSize: 11, padding: '4px 14px', borderRadius: 4, background: '#1a1410', color: '#f0e8d8', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}>
              Save
            </button>
            <button onClick={() => { setDraftText(entry.text); setEditing(false); }}
              style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #c8b99a', color: '#8a7060', cursor: 'pointer', background: 'transparent', fontFamily: 'DM Mono, monospace' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Quote display — italic, left-bordered */}
          {entry.quote && (
            <div style={{ fontSize: 13, fontStyle: 'italic', color: '#3a2a10', lineHeight: 1.7, marginBottom: 6, paddingLeft: 10, borderLeft: `3px solid ${et.color}` }}>
              "{entry.quote}"
              {entry.attribution && (
                <div style={{ fontSize: 10, color: '#8a7060', fontStyle: 'normal', marginTop: 3, fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
                  — {entry.attribution}
                </div>
              )}
            </div>
          )}
          <div style={{ fontSize: isQuick ? 12 : 13.5, color: '#1a1008', lineHeight: isQuick ? 1.6 : 1.75, paddingTop: isQuick ? 0 : 2 }}
            dangerouslySetInnerHTML={{ __html: entry.text || '' }} />
          {/* Context label — where this was captured from */}
          {entry.contextLabel && (
            <div style={{ fontSize: 9, color: '#8a7060', fontFamily: 'DM Mono, monospace', fontStyle: 'normal', letterSpacing: '0.05em', marginTop: 6, opacity: 0.7 }}>
              ↳ {entry.contextLabel}
            </div>
          )}
        </div>
      )}

      {/* Quick capture date — bottom right */}
      {isQuick && !editing && (
        <div style={{ fontSize: 9, color: '#8a7060', fontStyle: 'italic', marginTop: 6, textAlign: 'right', letterSpacing: '0.02em' }}>
          {dateStr}
        </div>
      )}

      {/* Linked books — not connection type, show as coloured refs */}
      {linkedBooks.length > 0 && !editing && !isConnection && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8, paddingTop: 6, borderTop: '1px dashed rgba(100,80,50,0.2)' }}>
          {linkedBooks.map(b => (
            <span key={b.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, color: b.color, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
              {b.title}
            </span>
          ))}
        </div>
      )}

      {/* Connection books label */}
      {isConnection && linkedBooks.length > 0 && !editing && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {linkedBooks.slice(0,2).map(b => (
            <span key={b.id} style={{ fontSize: 9, color: b.color, fontStyle: 'italic', maxWidth: '48%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
          ))}
        </div>
      )}

      {/* Tags */}
      {entry.tags?.length > 0 && !editing && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
          {entry.tags.map(t => (
            <span key={t} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: 'rgba(100,80,50,0.12)', color: '#5a4a2a', fontFamily: 'DM Mono, monospace', fontStyle: 'normal', letterSpacing: '0.04em' }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Promoted badge */}
      {promotedInv && (
        <div style={{ marginTop: 7, fontSize: 9, color: '#2e7d5e', fontFamily: 'DM Mono, monospace', fontStyle: 'normal', display: 'flex', alignItems: 'center', gap: 4, borderTop: '1px solid #2e7d5e22', paddingTop: 5 }}>
          <span>⊛</span><span>→ {promotedInv.caseNumber || promotedInv.title}</span>
        </div>
      )}

      {/* Hover actions */}
      {!editing && hovered && (
        <div style={{ position: 'absolute', bottom: 8, right: 10, display: 'flex', gap: 4 }}>
          <button onClick={() => setEditing(true)}
            style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, border: '1px solid #c8b99a', color: '#8a7060', background: '#faf6ee', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
            onMouseEnter={e => e.currentTarget.style.color = '#2c5f8a'}
            onMouseLeave={e => e.currentTarget.style.color = '#8a7060'}>✎</button>
          {!entry.promoted && (
            <button onClick={() => onPromote(entry)}
              style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, border: '1px solid #c8b99a', color: '#8a7060', background: '#faf6ee', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
              onMouseEnter={e => e.currentTarget.style.color = '#2e7d5e'}
              onMouseLeave={e => e.currentTarget.style.color = '#8a7060'}>→ case</button>
          )}
          <button onClick={() => onDelete(entry.id)}
            style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, border: '1px solid #c8b99a', color: '#8a7060', background: '#faf6ee', cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
            onMouseLeave={e => e.currentTarget.style.color = '#8a7060'}>✕</button>
        </div>
      )}
    </div>
  );
}

// ── Notepad composer (slide-up) ───────────────────────────────────
function NotepadComposer({ books, investigations, topics, onSubmit, onClose }) {
  const [compText, setCompText]     = useState('');
  const [compType, setCompType]     = useState('observation');
  const [compBookIds, setCompBookIds] = useState([]);
  const [compTags, setCompTags]     = useState('');
  const [title, setTitle]           = useState('');

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const et = ENTRY_TYPES[compType];

  const handleSubmit = () => {
    if (!stripHtml(compText).trim()) return;
    const tags = compTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    onSubmit({ type: compType, text: compText, bookIds: compBookIds, tags, quickCapture: false });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      background: 'rgba(15,10,5,0.55)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fefcf0',
        backgroundImage: RULED_BG,
        borderTop: '3px solid #1a1410',
        maxHeight: '72vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.22s cubic-bezier(.2,.8,.3,1)',
      }}>
        {/* Notepad header */}
        <div style={{ padding: '10px 20px 8px', borderBottom: '1px solid #c8b99a', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: '#1a1410' }}>
          <div>
            <div style={{ fontSize: 8, color: '#8a7a5a', fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em', marginBottom: 1 }}>FIELD NOTES — {today.toUpperCase()}</div>
            <div style={{ fontSize: 11, color: '#f0e8d8', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>NEW REFLECTION</div>
          </div>
          {/* Type selector as stamp buttons */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            {Object.entries(ENTRY_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setCompType(k)}
                style={{ fontSize: 9, padding: '2px 8px', borderRadius: 2, border: `1px solid ${compType===k?v.color:'#3a3020'}`, background: compType===k?v.color:'transparent', color: compType===k?'#fff':v.color, cursor: 'pointer', fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em', transform: compType===k?'none':'rotate(-1deg)', transition: 'all 0.1s' }}>
                {v.icon} {v.stamp}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ fontSize: 13, color: '#8a7a5a', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}>✕</button>
        </div>

        {/* Notepad body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {/* Optional title line */}
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Title (optional)…"
            style={{ width: '100%', fontSize: 15, fontWeight: 600, fontFamily: 'Georgia, serif', color: '#1a1008', background: 'transparent', border: 'none', borderBottom: '1px solid #c8b99a', padding: '0 0 6px', marginBottom: 14, outline: 'none', letterSpacing: '0.01em' }} />

          {/* Source links */}
          {books.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {books.map(b => (
                <button key={b.id} onClick={() => setCompBookIds(prev => prev.includes(b.id) ? prev.filter(x => x !== b.id) : [...prev, b.id])}
                  style={{ fontSize: 10, padding: '2px 9px', borderRadius: 20, border: `1px solid ${compBookIds.includes(b.id)?b.color:'#c8b99a'}`, background: compBookIds.includes(b.id)?b.color+'22':'transparent', color: compBookIds.includes(b.id)?b.color:'#8a7060', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: compBookIds.includes(b.id)?b.color:'#c8b99a' }} />
                  {b.title}
                </button>
              ))}
            </div>
          )}

          {/* Main text — MentionPicker with notepad style */}
          <div style={{ position: 'relative' }}>
            <MentionPicker
              value={compText} onChange={setCompText}
              placeholder="Write your reflection… Type @ to link books, investigations, or events"
              rows={8} books={books} investigations={investigations} topics={topics} events={[]}
              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #c8b99a55', borderRadius: 0, padding: '4px 0', fontSize: 14, fontFamily: 'Georgia, serif', lineHeight: 1.75, color: '#1a1008', resize: 'none' }} />
          </div>

          {/* Tags */}
          <input value={compTags} onChange={e => setCompTags(e.target.value)}
            placeholder="Tags — comma separated (e.g. empire, decline, methodology)"
            style={{ width: '100%', marginTop: 12, fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#5a4a2a', background: 'transparent', border: 'none', borderBottom: '1px dashed #c8b99a', padding: '3px 0', outline: 'none', letterSpacing: '0.03em' }} />
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 24px', borderTop: '1px solid #c8b99a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: '#f5f0e4' }}>
          <span style={{ fontSize: 10, color: '#8a7060', fontFamily: 'DM Mono, monospace', fontStyle: 'normal' }}>
            {et.icon} {et.label} · {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button onClick={handleSubmit}
            style={{ fontSize: 12, padding: '7px 22px', borderRadius: 4, background: '#1a1410', color: '#f0e8d8', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono, monospace', letterSpacing: '0.07em' }}>
            PIN TO LOG →
          </button>
        </div>
      </div>

      <style>{`@keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Sticky note (for right panel) ────────────────────────────────
function StickyNote({ text, color, rot, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background: color, padding: '8px 10px', borderRadius: 2, boxShadow: '2px 3px 8px rgba(0,0,0,0.13)', transform: `rotate(${rot}deg)`, cursor: onClick?'pointer':'default', fontSize: 11, color: '#1a1008', lineHeight: 1.55, fontFamily: 'Georgia, serif', transition: 'transform 0.15s', marginBottom: 2 }}
      onMouseEnter={e => { if(onClick) e.currentTarget.style.transform='rotate(0deg) scale(1.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=`rotate(${rot}deg)`; }}>
      {text}
    </div>
  );
}

// ── Main ReadingLog ───────────────────────────────────────────────
export default function ReadingLog({ entries = [], books = [], articles = [], investigations = [], topics = [], onAdd, onDelete, onUpdate, onUpdateInvestigations }) {
  const [quickText, setQuickText]       = useState('');
  const [quickType, setQuickType]       = useState('observation');
  const [quickBookId, setQuickBookId]   = useState('');
  const [quickTags, setQuickTags]       = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [filterType, setFilterType]     = useState('all');
  const [filterTag, setFilterTag]       = useState('');
  const [search, setSearch]             = useState('');
  const [promotingEntry, setPromotingEntry] = useState(null);
  const quickRef = useRef();

  const allSources = [...books, ...articles];

  const allTags = useMemo(() => {
    const tagMap = {};
    entries.forEach(e => (e.tags||[]).forEach(t => { tagMap[t] = (tagMap[t]||0)+1; }));
    return Object.entries(tagMap).sort((a,b) => b[1]-a[1]);
  }, [entries]);

  const filtered = useMemo(() => entries
    .filter(e => filterType === 'all' || e.type === filterType)
    .filter(e => !filterTag || (e.tags||[]).includes(filterTag))
    .filter(e => !search || stripHtml(e.text||'').toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
  , [entries, filterType, filterTag, search]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return entries.filter(e => new Date(e.createdAt).toDateString() === today).length;
  }, [entries]);

  const openQuestions  = entries.filter(e => e.type === 'question' && !e.promoted);
  const threadEntries  = entries.filter(e => e.type === 'thread');
  const volNum = Math.floor(entries.length / 40) + 1;

  const submitQuick = useCallback(() => {
    if (!quickText.trim()) return;
    const tags = quickTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    onAdd({
      id: uuidv4(), type: quickType, text: quickText.trim(), quickCapture: true,
      bookIds: quickBookId ? [quickBookId] : [], tags, promoted: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    setQuickText(''); setQuickTags(''); setQuickBookId('');
    quickRef.current?.focus();
  }, [quickText, quickType, quickBookId, quickTags, onAdd]);

  const submitReflection = useCallback(({ type, text, bookIds, tags }) => {
    onAdd({
      id: uuidv4(), type, text, quickCapture: false,
      bookIds, tags, promoted: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
  }, [onAdd]);

  const handlePromoteExisting = (invId, logType) => {
    const inv = investigations.find(i => i.id === invId);
    if (!inv) return;
    const entry = promotingEntry;
    const custodyEntry = { id: uuidv4(), type: logType, note: stripHtml(entry.text).slice(0,300), createdAt: new Date().toISOString() };
    const updated = { ...inv, custodyLog: [...(inv.custodyLog||[]), custodyEntry], updatedAt: new Date().toISOString() };
    onUpdateInvestigations(prev => prev.map(i => i.id === invId ? updated : i));
    onUpdate({ ...entry, promoted: { investigationId: invId, custodyEntryId: custodyEntry.id } });
    setPromotingEntry(null);
  };

  const handlePromoteNew = (title) => {
    const entry = promotingEntry;
    const invId = uuidv4();
    const custodyEntry = { id: uuidv4(), type: 'note', note: `Opened from reading log: ${stripHtml(entry.text).slice(0,200)}`, createdAt: new Date().toISOString() };
    const newInv = {
      id: invId, caseNumber: `CASE-${String(investigations.length+1).padStart(4,'0')}`,
      title, type: investigations[0]?.type || '', status: 'active',
      summary: stripHtml(entry.text), hypothesis: '', hypothesisStatus: 'untested', hypothesisNotes: '',
      bookIds: entry.bookIds||[], bookNotes: [], actors: [], causes: [],
      tags: entry.tags||[], analysis: '', verdict: '', contradictions: [],
      custodyLog: [custodyEntry], argMap: { nodes:[], edges:[] },
      writing: { sections:[], thesisStatement:'' },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    onUpdateInvestigations(prev => [...prev, newInv]);
    onUpdate({ ...entry, promoted: { investigationId: invId, custodyEntryId: custodyEntry.id } });
    setPromotingEntry(null);
  };

  const today = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'column', background: '#f0e8d4', overflow: 'hidden', fontFamily: 'Georgia, serif' }}>

      {/* ── JOURNAL HEADER ───────────────────────────────────── */}
      <div style={{ padding: '8px 20px', background: '#1a1410', borderBottom: '2px solid #3a2a10', display: 'flex', alignItems: 'baseline', gap: 12, flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: '#c8a870', fontFamily: 'DM Mono, monospace', letterSpacing: '0.14em' }}>FIELD NOTES</div>
        <div style={{ fontSize: 10, color: '#5a4a2a', fontFamily: 'DM Mono, monospace' }}>·</div>
        <div style={{ fontSize: 10, color: '#8a7a5a', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}>VOL. {toRoman(volNum)}</div>
        <div style={{ fontSize: 10, color: '#5a4a2a', fontFamily: 'DM Mono, monospace' }}>·</div>
        <div style={{ fontSize: 10, color: '#8a7a5a', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em', fontStyle: 'italic' }}>{today.toUpperCase()}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
          <span style={{ fontSize: 10, color: '#5a4a2a', fontFamily: 'DM Mono, monospace' }}>{entries.length} entries</span>
          {openQuestions.length > 0 && <span style={{ fontSize: 10, color: '#b07d28', fontFamily: 'DM Mono, monospace' }}>{openQuestions.length} open questions</span>}
          {threadEntries.length > 0 && <span style={{ fontSize: 10, color: '#1a5c3a', fontFamily: 'DM Mono, monospace' }}>{threadEntries.length} threads</span>}
        </div>
      </div>

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT: capture + feed ──────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Quick capture strip */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #c8b99a', background: '#e8dfc8', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <select value={quickType} onChange={e => setQuickType(e.target.value)}
                style={{ fontSize: 10, padding: '5px 6px', borderRadius: 3, border: `1px solid ${ENTRY_TYPES[quickType].color}55`, background: ENTRY_TYPES[quickType].bg, color: ENTRY_TYPES[quickType].color, fontFamily: 'DM Mono, monospace', fontStyle: 'normal', flexShrink: 0, cursor: 'pointer' }}>
                {Object.entries(ENTRY_TYPES).map(([k,v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>

              <input ref={quickRef} value={quickText} onChange={e => setQuickText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuick(); } }}
                placeholder="Capture a quick thought… (Enter to save)"
                style={{ flex: 1, padding: '6px 10px', fontSize: 13, borderRadius: 3, border: '1px solid #c8b99a', background: '#fefcf5', color: '#1a1008', fontFamily: 'Georgia, serif', outline: 'none', fontStyle: 'italic' }} />

              <select value={quickBookId} onChange={e => setQuickBookId(e.target.value)}
                style={{ fontSize: 10, padding: '5px 6px', borderRadius: 3, border: '1px solid #c8b99a', background: '#fefcf5', color: '#5a4a2a', maxWidth: 130, flexShrink: 0, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                <option value="">No source</option>
                {allSources.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>

              <button onClick={submitQuick}
                style={{ fontSize: 11, padding: '6px 12px', borderRadius: 3, background: '#1a1410', color: '#f0e8d8', border: 'none', cursor: 'pointer', flexShrink: 0, fontFamily: 'DM Mono, monospace', letterSpacing: '0.06em' }}>
                ↵ PIN
              </button>

              <button onClick={() => setShowComposer(true)}
                style={{ fontSize: 10, padding: '6px 12px', borderRadius: 3, border: '1px solid #c8b99a', color: '#5a4a2a', background: 'transparent', cursor: 'pointer', flexShrink: 0, fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a1410'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                ✎ REFLECT
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ padding: '6px 16px', borderBottom: '1px solid #c8b99a', display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, background: '#e0d5c0' }}>
            <button onClick={() => { setFilterType('all'); setFilterTag(''); }}
              style={{ fontSize: 9, padding: '2px 9px', borderRadius: 2, border: `1px solid ${filterType==='all'&&!filterTag?'#1a1410':'#c8b99a'}`, background: filterType==='all'&&!filterTag?'#1a1410':'transparent', color: filterType==='all'&&!filterTag?'#f0e8d8':'#5a4a2a', cursor: 'pointer', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>
              ALL {entries.length}
            </button>
            {Object.entries(ENTRY_TYPES).map(([k, v]) => {
              const cnt = entries.filter(e => e.type === k).length;
              if (!cnt) return null;
              return (
                <button key={k} onClick={() => setFilterType(filterType===k?'all':k)}
                  style={{ fontSize: 9, padding: '2px 9px', borderRadius: 2, border: `1px solid ${filterType===k?v.color:'#c8b99a'}`, background: filterType===k?v.color+'22':'transparent', color: filterType===k?v.color:'#5a4a2a', cursor: 'pointer', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>
                  {v.icon} {v.stamp} {cnt}
                </button>
              );
            })}
            <div style={{ marginLeft: 'auto' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search log…"
                style={{ padding: '3px 8px', fontSize: 10, borderRadius: 2, border: '1px solid #c8b99a', background: '#fefcf5', color: '#1a1008', width: 120, fontFamily: 'Georgia, serif', fontStyle: 'italic' }} />
            </div>
          </div>

          {/* Pinboard feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px', background: '#f0e8d4',
            backgroundImage: 'radial-gradient(circle, rgba(100,80,50,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8a7060' }}>
                <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.25 }}>◎</div>
                <div style={{ fontSize: 13, fontStyle: 'italic', lineHeight: 1.7, color: '#8a7060' }}>
                  {entries.length === 0
                    ? 'The field notes are empty.\nCapture your first observation above.'
                    : 'No entries match.'}
                </div>
              </div>
            ) : (
              <div style={{ columns: '260px', columnGap: 14 }}>
                {filtered.map(entry => (
                  <div key={entry.id} style={{ marginBottom: 14, breakInside: 'avoid' }}>
                    <EntryCard
                      entry={entry} books={books} investigations={investigations}
                      onDelete={onDelete} onUpdate={onUpdate} onPromote={setPromotingEntry} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: inquiry board ──────────────────────────── */}
        <div style={{ width: 230, borderLeft: '1px solid #c8b99a', overflowY: 'auto', background: '#e8dfc8', padding: '14px 12px', flexShrink: 0 }}>

          {/* Today's dispatch — moved here from Sidebar */}
          {(() => {
            const quote = getDailyQuote(books, []);
            return (
              <div style={{ background: '#fefcf5', border: '1px solid #c8b99a', borderRadius: 2, padding: '10px 12px', marginBottom: 12, boxShadow: '1px 2px 5px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 7, color: '#8a7060', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span>Today's dispatch</span>
                  <span style={{ fontSize: 7, fontStyle: 'italic', fontFamily: 'Georgia, serif', textTransform: 'none', letterSpacing: '0.02em', opacity: 0.7 }}>rerum cognoscere causas</span>
                </div>
                <div style={{ fontSize: 10, color: '#3a2a18', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 4, borderLeft: '2px solid #b8944a', paddingLeft: 7 }}>
                  "{quote.text.slice(0, 100)}{quote.text.length > 100 ? '…' : ''}"
                </div>
                <div style={{ fontSize: 8, color: '#8a7060', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>— {quote.attribution}</div>
              </div>
            );
          })()}

          {/* Reading room ambient notice */}
          {(() => {
            const notice = getDailyNotice(books, investigations, [], []);
            if (!notice) return null;
            return (
              <div style={{ background: '#fefcf5', border: '1px solid #c8b99a', borderRadius: 2, padding: '10px 12px', marginBottom: 12, boxShadow: '1px 2px 5px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 7, color: '#8a7060', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>Reading room</div>
                <div style={{ fontSize: 10, color: '#3a2a18', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 4 }}>
                  "{notice.text.slice(0, 100)}{notice.text.length > 100 ? '…' : ''}"
                </div>
                <div style={{ fontSize: 8, color: '#8a7060', fontFamily: 'DM Mono, monospace', letterSpacing: '0.04em' }}>
                  — {notice.residentName}
                  {notice.residentSeat && <span style={{ opacity: 0.5 }}> · {notice.residentSeat}</span>}
                </div>
              </div>
            );
          })()}

          {/* 小花 / Bellflower */}
          {(() => {
            const notice = getBellflowerNotice('reading');
            return (
              <div style={{ background: '#fff8e8', border: '1px solid #c8b99a', borderRadius: 2, padding: '10px 12px', marginBottom: 12, boxShadow: '1px 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 7, color: '#8a7060', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <XiaoHuaIcon size={16} />
                  <span>小花</span>
                  <span style={{ opacity: 0.5 }}>· Bellflower</span>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <XiaoHuaSVG size={56} style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: 10, color: '#3a2a18', fontStyle: 'italic', lineHeight: 1.65 }}>{notice}</div>
                </div>
              </div>
            );
          })()}

          {/* Librarian marginalia — from reading log tag threads */}
          {(() => {
            const notes = getLibrarianNotes({ topic: null, thoughts: [], books, investigations, events: [], topics: [], readingLog: entries });
            if (!notes.length) return null;
            return (
              <div style={{ background: '#fefcf5', border: '1px solid #c8b99a', borderRadius: 2, padding: '10px 12px', marginBottom: 12, boxShadow: '1px 2px 5px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 7, color: '#8a7060', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>◈ The Librarian</span>
                </div>
                {notes.map((note, i) => (
                  <div key={i} style={{ fontSize: 10, color: '#5a4a2a', fontStyle: 'italic', lineHeight: 1.65, marginBottom: i < notes.length-1 ? 6 : 0, paddingLeft: 7, borderLeft: '1px solid #c8b99a' }}>
                    {note}
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Daily tally */}
          <div style={{ background: '#fefcf5', border: '1px solid #c8b99a', borderRadius: 2, padding: '10px 12px', marginBottom: 14, boxShadow: '1px 2px 5px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 8, color: '#8a7060', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 5 }}>{new Date().toLocaleDateString('en-GB', { weekday:'long' }).toUpperCase()} · TODAY</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1008', fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>{todayCount}</div>
            <div style={{ fontSize: 10, color: '#8a7060', fontStyle: 'italic', marginTop: 3 }}>entries logged</div>
            <div style={{ marginTop: 7, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {Object.entries(ENTRY_TYPES).map(([k,v]) => {
                const cnt = entries.filter(e => e.type===k && new Date(e.createdAt).toDateString()===new Date().toDateString()).length;
                if (!cnt) return null;
                return <span key={k} style={{ fontSize: 10, color: v.color, fontFamily: 'DM Mono, monospace', fontStyle: 'normal' }}>{v.icon}{cnt}</span>;
              })}
            </div>
          </div>

          {/* Open questions — amber stickies */}
          {openQuestions.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 8, color: '#b07d28', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #b07d2844', textTransform: 'uppercase' }}>
                ? Open questions — {openQuestions.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {openQuestions.slice(0,5).map((e, i) => (
                  <StickyNote key={e.id}
                    text={stripHtml(e.text).slice(0,65) + (stripHtml(e.text).length>65?'…':'')}
                    color="#fff3b0"
                    rot={seedRotation(e.id, 4)}
                    onClick={() => setFilterType('question')} />
                ))}
              </div>
            </div>
          )}

          {/* Threads — vertical timeline */}
          {threadEntries.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 8, color: '#1a5c3a', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #1a5c3a44', textTransform: 'uppercase' }}>
                ⊛ Active threads — {threadEntries.length}
              </div>
              <div style={{ position: 'relative', paddingLeft: 14 }}>
                <div style={{ position: 'absolute', left: 5, top: 4, bottom: 4, width: 1, background: 'linear-gradient(to bottom, #1a5c3a, transparent)' }} />
                {threadEntries.slice(0,4).map((e, i) => (
                  <div key={e.id} style={{ position: 'relative', marginBottom: 8 }}>
                    <div style={{ position: 'absolute', left: -12, top: 5, width: 5, height: 5, borderRadius: '50%', background: '#1a5c3a', border: '1px solid #1a5c3a' }} />
                    <div style={{ fontSize: 11, color: '#1a3a20', lineHeight: 1.5, fontStyle: 'italic', background: '#e8f4e8', padding: '5px 8px', borderRadius: 2, border: '1px solid #1a5c3a22' }}>
                      {stripHtml(e.text).slice(0,60)}{stripHtml(e.text).length>60?'…':''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags index */}
          {allTags.length > 0 && (
            <div>
              <div style={{ fontSize: 8, color: '#5a4a2a', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #c8b99a', textTransform: 'uppercase' }}>
                # Index of subjects
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {allTags.map(([tag, count]) => (
                  <button key={tag} onClick={() => setFilterTag(filterTag===tag?'':tag)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', borderRadius: 2, border: `1px solid ${filterTag===tag?'#5a4a2a':'transparent'}`, background: filterTag===tag?'#1a1410':'transparent', color: filterTag===tag?'#f0e8d8':'#5a4a2a', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                    <span style={{ fontSize: 11, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{tag}</span>
                    <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', opacity: 0.6 }}>{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-up notepad composer */}
      {showComposer && (
        <NotepadComposer
          books={books} investigations={investigations} topics={topics}
          onSubmit={submitReflection}
          onClose={() => setShowComposer(false)} />
      )}

      {/* Promote modal */}
      {promotingEntry && (
        <PromoteModal
          entry={promotingEntry}
          investigations={investigations}
          onPromoteToExisting={handlePromoteExisting}
          onPromoteNew={handlePromoteNew}
          onClose={() => setPromotingEntry(null)} />
      )}
    </div>
  );
}
