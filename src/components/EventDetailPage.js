import React, { useState } from 'react';
import { parseEventDate, getRegion } from '../data/timeline';
import { v4 as uuidv4 } from 'uuid';
import LogCaptureModal from './LogCaptureModal';

const RULED = 'repeating-linear-gradient(transparent, transparent 24px, rgba(100,80,50,0.055) 24px, rgba(100,80,50,0.055) 25px)';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ fontSize: 8, padding: '3px 10px', borderRadius: 2, border: '1px solid #3a2a10', color: copied ? '#c8a870' : '#8a7a5a', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>
      {copied ? '✓ COPIED' : 'COPY REPORT'}
    </button>
  );
}

function BookNoteEditor({ bookNote, book, onChange, onDelete }) {
  return (
    <div style={{ background: '#fefcf5', backgroundImage: RULED, border: `1px solid ${book.color}33`, borderLeft: `3px solid ${book.color}`, borderRadius: 2, padding: '14px 16px', marginBottom: 12, position: 'relative', boxShadow: '1px 2px 6px rgba(26,20,10,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, paddingBottom: 8, borderBottom: `1px dashed ${book.color}33` }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: book.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: book.color, fontStyle: 'italic', flex: 1, fontFamily: 'var(--font-display)' }}>{book.title}</span>
        {book.author && <span style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic' }}>{book.author}</span>}
        <button onClick={onDelete} style={{ fontSize: 10, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
      </div>
      <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5 }}>Quoted passage</div>
      <textarea value={bookNote.quote || ''} onChange={e => onChange({ ...bookNote, quote: e.target.value })}
        placeholder="A passage from this source…" rows={2}
        style={{ width: '100%', resize: 'vertical', padding: '7px 10px', fontSize: 13, borderRadius: 2, fontStyle: 'italic', color: 'var(--ink-2)', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--paper-3)', fontFamily: 'var(--font-serif)', marginBottom: 10, outline: 'none', lineHeight: 1.65 }} />
      <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 5 }}>Field note</div>
      <textarea value={bookNote.note || ''} onChange={e => onChange({ ...bookNote, note: e.target.value })}
        placeholder="How does this author frame this event? What angle, what silences?" rows={3}
        style={{ width: '100%', resize: 'vertical', padding: '7px 10px', fontSize: 13, borderRadius: 2, color: 'var(--ink)', background: 'transparent', border: 'none', fontFamily: 'var(--font-serif)', outline: 'none', lineHeight: 1.75 }} />
    </div>
  );
}

function SourceCard({ bookNote, book, showIndex, index }) {
  const [copied, setCopied] = useState(false);
  const copyText = [bookNote.quote && `"${bookNote.quote}"`, bookNote.note].filter(Boolean).join('\n\n');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return (
    <div style={{ background: isDark ? '#241e14' : '#fefcf5', backgroundImage: RULED, border: `1px solid ${book.color}33`, borderTop: `3px solid ${book.color}`, borderRadius: 2, padding: '14px 16px 12px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: `1px 2px 10px rgba(100,70,20,0.10)`, position: 'relative', overflow: 'hidden' }}>
      {/* Faint compass-rose watermark */}
      <div style={{ position: 'absolute', bottom: -10, right: -10, fontSize: 80, color: book.color, opacity: 0.04, fontFamily: 'var(--font-display)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>◊</div>
      {/* Source type watermark */}
      {book.sourceType && (
        <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 7, color: book.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', opacity: 0.5, textTransform: 'uppercase' }}>
          {book.sourceType}
        </div>
      )}
      {(!showIndex || index === 0) && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingBottom: 10, borderBottom: `1px dashed ${book.color}33` }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: book.color, flexShrink: 0, marginTop: 2, boxShadow: `0 0 0 2px ${book.color}33` }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: book.color, fontStyle: 'italic', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{book.title}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{book.author}{book.year ? ` · ${book.year}` : ''}</div>
            {book.methodology && <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginTop: 2, letterSpacing: '0.06em' }}>{book.methodology.toUpperCase()}</div>}
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(copyText); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            style={{ fontSize: 8, color: copied ? 'var(--green)' : 'var(--ink-4)', cursor: 'pointer', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 2, padding: '2px 7px', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>
            {copied ? '✓' : 'copy'}
          </button>
        </div>
      )}
      {showIndex && index > 0 && (
        <div style={{ fontSize: 8, color: book.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em', opacity: 0.7 }}>NOTE {index + 1}</div>
      )}
      {bookNote.quote && (
        <blockquote style={{ borderLeft: `2px solid ${book.color}55`, paddingLeft: 12, margin: 0, fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.75, background: 'none', borderRadius: 0 }}>
          "{bookNote.quote}"
        </blockquote>
      )}
      {bookNote.note && <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.75, margin: 0 }}>{bookNote.note}</p>}
      {!bookNote.quote && !bookNote.note && (
        <p style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', margin: 0 }}>[No notes on record for this source.]</p>
      )}
    </div>
  );
}

export default function EventDetailPage({ event, books, eventTypes, onUpdate, onBack, onAddLog }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ ...event, bookNotes: event.bookNotes || [] });
  const [logCapture, setLogCapture] = useState(null);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const parsed      = parseEventDate(event.dateRaw);
  const region      = getRegion(event.region);
  const evType      = (eventTypes || []).find(t => t.id === event.type) || { label: event.type || 'Event', color: '#8a8680' };
  const linkedBooks = books.filter(b => (event.bookIds || []).includes(b.id));

  const isSingleWitness = linkedBooks.length === 1;
  const isCorroborated  = linkedBooks.length >= 3;

  const exportText = [
    `FIELD REPORT — ${event.title}`,
    `DATE: ${parsed.display || event.dateRaw}  |  REGION: ${region.label}  |  TYPE: ${evType.label}`,
    event.tags?.length ? `SUBJECTS: ${event.tags.map(t => '#' + t).join(' ')}` : '',
    `SOURCES: ${linkedBooks.map(b => b.title).join(', ')}`,
    '',
    ...linkedBooks.map(book => {
      const bns = (event.bookNotes || []).filter(n => n.bookId === book.id);
      const notesText = bns.length
        ? bns.map((n, i) => [bns.length > 1 ? `[Note ${i + 1}]` : '', n.quote ? `> "${n.quote}"` : '', n.note || ''].filter(Boolean).join('\n')).join('\n\n')
        : '[No notes]';
      return `== ${book.title} (${book.author}) ==\n${notesText}`;
    }),
    event.synthesis ? `\n== SYNTHESIS ==\n${event.synthesis}` : '',
  ].filter(Boolean).join('\n');

  const updateBookNote = (bookId, updated) =>
    setDraft(d => ({ ...d, bookNotes: d.bookNotes.map(bn => bn.bookId === bookId ? updated : bn) }));
  const addBookNote = (bookId) => {
    if (draft.bookNotes.find(bn => bn.bookId === bookId)) return;
    setDraft(d => ({ ...d, bookNotes: [...d.bookNotes, { bookId, quote: '', note: '' }], bookIds: [...new Set([...(d.bookIds || []), bookId])] }));
  };
  const removeBookNote = (bookId) => setDraft(d => ({
    ...d, bookNotes: d.bookNotes.filter(bn => bn.bookId !== bookId),
    bookIds: (d.bookIds || []).filter(id => id !== bookId),
  }));
  const handleSave = () => { onUpdate(draft); setEditing(false); };
  const unusedBooks = books.filter(b => !draft.bookNotes.find(bn => bn.bookId === b.id));

  // Evidence notes — analyst's own notes, separate from source notes
  const [evidenceNote, setEvidenceNote] = useState(event.evidenceNote || '');
  const [noteSaved, setNoteSaved] = useState(false);
  const saveEvidenceNote = (val) => {
    onUpdate({ ...event, evidenceNote: val });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: isDark ? '#18140e' : '#f5f0e4', fontFamily: 'var(--font-serif)' }}>

      {/* ── FIELD REPORT COVER ──────────────────────────────── */}
      <div style={{ background: isDark ? '#0e1a18' : '#1a3630', color: '#d4e8e0', padding: '14px 22px 14px', flexShrink: 0, position: 'relative',
        backgroundImage: `radial-gradient(ellipse at top left, ${isDark?'#162820':'#224838'} 0%, ${isDark?'#0e1a18':'#142e28'} 75%)`,
        borderBottom: `3px solid ${isDark?'#2a4a40':'#3a6050'}` }}>

        {/* Wax seal — fixed SVG with defs first, high enough opacity */}
        <div style={{ position: 'absolute', top: 10, right: 16, width: 72, height: 72, opacity: 0.55, pointerEvents: 'none', userSelect: 'none' }}>
          <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="sealCircle" d="M 36,36 m -26,0 a 26,26 0 1,1 52,0 a 26,26 0 1,1 -52,0" />
            </defs>
            <circle cx="36" cy="36" r="34" fill="none" stroke="#7ab8a0" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="36" cy="36" r="27" fill="none" stroke="#7ab8a0" strokeWidth="0.75" />
            <text>
              <textPath href="#sealCircle" style={{fontSize:'5px', fill:'#7ab8a0', fontFamily:'DM Mono, monospace', letterSpacing:'2.2px'}}>
                MISKATONIC UNIV · DEPT OF HISTORY ·
              </textPath>
            </text>
            <text x="36" y="42" textAnchor="middle" style={{fontSize:'18px', fill:'#7ab8a0', fontFamily:'Georgia, serif'}}>✦</text>
            <text x="36" y="52" textAnchor="middle" style={{fontSize:'4.5px', fill:'#7ab8a0', fontFamily:'DM Mono, monospace', letterSpacing:'1.5px'}}>EST. MDCXC</text>
          </svg>
        </div>

        {/* Corner marks */}
        <div style={{ position: 'absolute', top: 7, left: 14, width: 14, height: 14, borderTop: '1px solid #4a8070', borderLeft: '1px solid #4a8070', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 7, right: 96, width: 14, height: 14, borderBottom: '1px solid #4a8070', borderRight: '1px solid #4a8070', pointerEvents: 'none' }} />

        {/* Year watermark — verdigris tone */}
        <div style={{ position: 'absolute', right: 100, top: '50%', transform: 'translateY(-50%)', fontSize: 80, color: '#7ab8a0', opacity: isDark ? 0.06 : 0.1, fontFamily: 'var(--font-display)', fontWeight: 700, pointerEvents: 'none', userSelect: 'none', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {parsed.display?.split(' ').pop() || '—'}
        </div>

        {/* Classification header line */}
        <div style={{ fontSize: 8, color: '#7ab8a0', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.13em', marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#a0d8c0', letterSpacing: '0.18em' }}>MISKATONIC UNIVERSITY</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>CHRONOLOGICAL SURVEY</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span style={{ color: evType.color || '#a08050' }}>{evType.label?.toUpperCase()}</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span style={{ color: region.color, opacity: 0.9 }}>{region.label?.toUpperCase()}</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: '#e87070', letterSpacing: '0.14em', opacity: 0.9, fontSize: 7 }}>⚿ RESTRICTED</span>
          {onAddLog && (
            <button onClick={() => setLogCapture({ context: { label: event.title, sourceType: 'event', sourceId: event.id, sourceName: event.title }, prefill: {} })}
              style={{ fontSize: 8, color: '#7ab8a0', cursor: 'pointer', background: 'none', border: '1px solid #3a6050', borderRadius: 2, padding: '2px 9px', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#a0d8c0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3a6050'; }}>
              → Log
            </button>
          )}
          <button onClick={onBack}
            style={{ fontSize: 8, color: '#7ab8a0', cursor: 'pointer', background: 'none', border: '1px solid #3a6050', borderRadius: 2, padding: '2px 9px', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#a0d8c0'; e.currentTarget.style.color = '#d4f0e8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#3a6050'; e.currentTarget.style.color = '#7ab8a0'; }}>
            ← CHRONICLE
          </button>
        </div>

        {/* Thin double rule */}
        <div style={{ height: 1, background: '#3a6050', marginBottom: 2 }} />
        <div style={{ height: 1, background: '#2a4840', marginBottom: 10 }} />

        {/* Title */}
        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#e8f4ee', lineHeight: 1.2, marginBottom: 8, letterSpacing: '0.01em' }}>
          {event.title}
        </div>

        {/* Date + badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 14, color: '#a0d8c0', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
            {parsed.display || event.dateRaw || '—'}
          </span>
          {isSingleWitness && (
            <span style={{ fontSize: 8, padding: '1px 8px', border: '1px solid #c8902266', color: '#e0b040', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em', borderRadius: 2, background: '#b07d2822' }}>
              ◉ SINGLE WITNESS
            </span>
          )}
          {isCorroborated && (
            <span style={{ fontSize: 8, padding: '1px 8px', border: '1px solid #4aaa7a66', color: '#7addb0', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em', borderRadius: 2, background: '#2a6a4a22' }}>
              ⊕ CORROBORATED
            </span>
          )}
          {event.tags?.map(tag => (
            <span key={tag} style={{ fontSize: 9, color: '#b8a07a', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em' }}>#{tag}</span>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
            <CopyBtn text={exportText} />
            <button onClick={() => setEditing(e => !e)}
              style={{ fontSize: 8, padding: '3px 10px', borderRadius: 2, border: `1px solid ${editing ? '#c8a870' : '#3a2a10'}`, color: editing ? '#c8a870' : '#8a7a5a', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>
              {editing ? 'PREVIEW' : 'AMEND'}
            </button>
            {editing && (
              <button onClick={handleSave}
                style={{ fontSize: 8, padding: '3px 10px', borderRadius: 2, background: '#c8a870', color: '#1a1410', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em', fontWeight: 700 }}>
                FILE RECORD
              </button>
            )}
          </div>
        </div>

        {/* Source tape tabs */}
        {linkedBooks.length > 0 && (
          <div style={{ display: 'flex', gap: 4, paddingTop: 10, borderTop: '1px solid #3a6050', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 7, color: '#7ab8a0', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', marginRight: 4 }}>SOURCES ON RECORD:</span>
            {linkedBooks.map(b => (
              <span key={b.id} style={{ fontSize: 9, padding: '2px 10px', background: b.color + '28', color: b.color, border: `1px solid ${b.color}44`, borderRadius: 2, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                {b.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── BODY ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>

        {editing ? (
          <div>
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, paddingBottom: 8, borderBottom: '1px dashed var(--paper-3)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>Amend source notes</span>
              <span style={{ opacity: 0.4 }}>— all changes filed on save</span>
            </div>
            {draft.bookNotes.map(bn => {
              const book = books.find(b => b.id === bn.bookId);
              if (!book) return null;
              return <BookNoteEditor key={bn.bookId} bookNote={bn} book={book} onChange={u => updateBookNote(bn.bookId, u)} onDelete={() => removeBookNote(bn.bookId)} />;
            })}
            {unusedBooks.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--paper-3)' }}>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', marginBottom: 8 }}>Add another source's account:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {unusedBooks.map(b => (
                    <button key={b.id} onClick={() => addBookNote(b.id)}
                      style={{ fontSize: 10, padding: '3px 10px', borderRadius: 2, cursor: 'pointer', border: `1px solid ${b.color}55`, background: b.color + '11', color: b.color, display: 'flex', alignItems: 'center', gap: 5, fontStyle: 'italic' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: b.color }} />+ {b.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : linkedBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-4)', lineHeight: 1.75 }}>
            <div style={{ fontSize: 28, opacity: 0.15, marginBottom: 12, fontFamily: 'var(--font-display)' }}>◌</div>
            <div style={{ fontSize: 13, fontStyle: 'italic' }}>No sources on record for this entry.</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontStyle: 'normal', opacity: 0.5, marginTop: 6, letterSpacing: '0.06em' }}>Click AMEND to attach source perspectives.</div>
          </div>
        ) : (
          <div>
            {/* Source count memo header */}
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18, paddingBottom: 8, borderBottom: '1px dashed var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{linkedBooks.length} source{linkedBooks.length !== 1 ? 's' : ''} on record</span>
              {linkedBooks.length > 1 && <span style={{ fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, color: 'var(--ink-3)' }}>Comparing {linkedBooks.length} accounts</span>}
            </div>

            {/* Source cards */}
            {linkedBooks.length === 1 ? (
              <div style={{ maxWidth: 680 }}>
                {linkedBooks.map(book => {
                  const bns = (event.bookNotes || []).filter(n => n.bookId === book.id);
                  const notes = bns.length ? bns : [{ bookId: book.id, quote: '', note: '' }];
                  return notes.map((bn, idx) => <SourceCard key={bn.id || idx} bookNote={bn} book={book} showIndex={notes.length > 1} index={idx} />);
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(linkedBooks.length, 3)}, 1fr)`, gap: 14, alignItems: 'start' }}>
                {linkedBooks.map(book => {
                  const bns = (event.bookNotes || []).filter(n => n.bookId === book.id);
                  const notes = bns.length ? bns : [{ bookId: book.id, quote: '', note: '' }];
                  return (
                    <div key={book.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {notes.map((bn, idx) => <SourceCard key={bn.id || idx} bookNote={bn} book={book} showIndex={notes.length > 1} index={idx} />)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Synthesis — analyst's memo */}
            {linkedBooks.length > 1 && (
              <div style={{ marginTop: 24, background: isDark ? '#1e1a14' : '#fefcf5', backgroundImage: RULED, border: '1px solid var(--paper-3)', borderTop: '2px solid var(--accent-2)', borderRadius: 2, padding: '16px 20px', boxShadow: '1px 2px 8px rgba(26,20,10,0.06)' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, paddingBottom: 8, borderBottom: '1px dashed var(--paper-3)', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>TO: Research file</div>
                  <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>RE: {event.title}</div>
                  <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>DATE: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</div>
                  <div style={{ marginLeft: 'auto', fontSize: 8, color: 'var(--accent-2)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em' }}>MEMORANDUM — EYES ONLY</div>
                </div>
                <textarea defaultValue={event.synthesis || ''}
                  onBlur={e => onUpdate({ ...event, synthesis: e.target.value })}
                  placeholder="Where do these accounts agree? Where do they diverge? Which framing is more convincing, and why? What does the disagreement itself reveal?"
                  rows={5}
                  style={{ width: '100%', resize: 'vertical', padding: '4px 0', fontSize: 13, borderRadius: 0, background: 'transparent', border: 'none', color: 'var(--ink)', fontFamily: 'var(--font-serif)', lineHeight: 1.75, outline: 'none' }} />
              </div>
            )}

            {/* Evidence notes — always visible, analyst's own record */}
            <div style={{ marginTop: 20, background: isDark ? '#101e1c' : '#f0faf6', backgroundImage: RULED, border: '1px solid #2a6a4a33', borderLeft: '3px solid #2a6a4a', borderRadius: 2, padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -10, bottom: -10, fontSize: 80, color: '#2a6a4a', opacity: 0.04, fontFamily: 'var(--font-display)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>✦</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, paddingBottom: 8, borderBottom: '1px dashed #2a6a4a33' }}>
                <div style={{ fontSize: 8, color: '#2a6a4a', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', textTransform: 'uppercase', flex: 1 }}>⊕ Evidence notes — analyst's record</div>
                {noteSaved && <span style={{ fontSize: 8, color: '#2a6a4a', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>✓ saved</span>}
                <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                  {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                </div>
              </div>
              <textarea value={evidenceNote}
                onChange={e => setEvidenceNote(e.target.value)}
                onBlur={e => saveEvidenceNote(e.target.value)}
                placeholder="Your own analytical notes — significance, patterns, questions, connections to your investigations. This is your voice, not a source's account."
                rows={4}
                style={{ width: '100%', resize: 'vertical', padding: '4px 0', fontSize: 13, borderRadius: 0, background: 'transparent', border: 'none', color: 'var(--ink)', fontFamily: 'var(--font-serif)', lineHeight: 1.75, outline: 'none' }} />
              {evidenceNote.trim() && (
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => saveEvidenceNote(evidenceNote)}
                    style={{ fontSize: 9, padding: '3px 12px', borderRadius: 2, background: '#2a6a4a', color: '#e4f4ec', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>
                    FILE NOTE
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {logCapture && onAddLog && (
      <LogCaptureModal
        context={logCapture.context}
        prefill={logCapture.prefill}
        onSubmit={entry => { onAddLog(entry); setLogCapture(null); }}
        onClose={() => setLogCapture(null)} />
    )}
  </>
  );
}
