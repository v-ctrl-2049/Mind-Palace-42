import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CompactEditor, stripHtml } from './SimpleEditor';
import LogCaptureModal from './LogCaptureModal';

const isRetro = (t) => t.source === 'archive';

// Catalogue number from item id
function catNum(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  const h2 = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  const classes = ['PR','PS','PQ','PA','CB','DA','DS','DT','GN','HM','HN','JC','ML','QA','Z'];
  const cls  = classes[Math.abs(h)  % classes.length];
  const num  = String(Math.abs(h2) % 9000 + 1000);
  const auth = String.fromCharCode(65 + Math.abs(h)  % 26) +
               String.fromCharCode(65 + Math.abs(h2) % 26);
  const year = String(1880 + Math.abs(h) % 145);
  return `${cls} ${num} .${auth}${year.slice(2)}`;
}
function catNumGlitch(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return 'FLATLINE:' + Math.abs(h).toString(16).toUpperCase().slice(0,6);
}

function GlitchCallNum({ id }) {
  const [glitching, setGlitching] = React.useState(false);
  const timer = React.useRef();
  const enter = () => { timer.current = setTimeout(() => { setGlitching(true); setTimeout(() => setGlitching(false), 300); }, 150); };
  const leave = () => { clearTimeout(timer.current); setGlitching(false); };
  return (
    <span onMouseEnter={enter} onMouseLeave={leave}
      style={{ fontSize:8, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing: glitching?'0.06em':'0.09em', color: glitching?'#00ff41':'var(--ink-4)', opacity: glitching?1:0.7, background: glitching?'#000':'transparent', padding: glitching?'0 3px':'0', borderRadius:2, cursor:'default', transition: glitching?'none':'all 0.3s', userSelect:'none' }}>
      {glitching ? catNumGlitch(id) : catNum(id)}
    </span>
  );
}


const RULED = 'repeating-linear-gradient(transparent, transparent 24px, rgba(100,80,50,0.05) 24px, rgba(100,80,50,0.05) 25px)';

function LoadFlicker({ show }) {
  if (!show) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.92)', pointerEvents:'none' }}>
      <div style={{ textAlign:'center', fontFamily:'DM Mono, monospace' }}>
        <div style={{ fontSize:11, color:'#00ff41', letterSpacing:'0.18em', marginBottom:6 }}>LoAdding...</div>
        <div style={{ fontSize:9, color:'#00ff4188', letterSpacing:'0.12em' }}>NEUROMANCER CONSTRUCT · METAVERSE ARCHIVE NODE</div>
      </div>
    </div>
  );
}


function CopyBtn({ text, label = 'COPY' }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setDone(true); setTimeout(() => setDone(false), 1400); }}
      style={{ fontSize: 8, color: done ? 'var(--green)' : 'var(--ink-4)', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 2, padding: '2px 8px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em' }}>
      {done ? '✓ COPIED' : label}
    </button>
  );
}

function NoteCard({ thought, thoughtTypes, onDelete, onUpdate, onCite }) {
  const typeInfo = thoughtTypes.find(t => t.id === thought.type) || { color: '#7a6a52', bg: '#f0e8d8', label: thought.type || 'note' };
  const retro = isRetro(thought);
  const copyText = [thought.quote && `"${thought.quote}"`, stripHtml(thought.text)].filter(Boolean).join('\n\n');
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(thought.text || '');
  const [draftQuote, setDraftQuote] = useState(thought.quote || '');

  const commitEdit = () => {
    if (onUpdate) onUpdate({ ...thought, text: draftText.trim(), quote: draftQuote.trim() });
    setEditing(false);
  };
  const cancelEdit = () => { setDraftText(thought.text || ''); setDraftQuote(thought.quote || ''); setEditing(false); };

  return (
    <div style={{ background: retro ? 'var(--paper-2)' : 'var(--paper-card)', border: '1px solid var(--paper-3)', borderLeft: `3px solid ${typeInfo.color}`, borderRadius: 8, padding: '12px 14px', position: 'relative' }}
      onMouseEnter={e => { const el = e.currentTarget.querySelector('.note-actions'); if (el) el.style.opacity = '1'; }}
      onMouseLeave={e => { const el = e.currentTarget.querySelector('.note-actions'); if (el) el.style.opacity = '0'; }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, paddingRight: 80 }}>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: typeInfo.bg + '33', color: typeInfo.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: `1px solid ${typeInfo.color}44` }}>
          {typeInfo.label}
        </span>
        {retro && (
          <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 10, background: '#2c5f8a', color: '#fff', fontFamily: 'var(--font-mono)', fontStyle: 'normal', opacity: 0.8 }}>
            retrospective
          </span>
        )}
        {thought.page && <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>p.{thought.page}</span>}
        {thought.topics?.map(t => <span key={t} style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>#{t}</span>)}
        <span style={{ fontSize: 10, color: 'var(--ink-4)', marginLeft: 'auto', fontStyle: 'italic' }}>
          {new Date(thought.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Content — view or edit mode */}
      {editing ? (
        <div>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Quote</div>
          <textarea value={draftQuote} onChange={e => setDraftQuote(e.target.value)} rows={2}
            placeholder="Quote…"
            style={{ width: '100%', resize: 'vertical', padding: '6px 9px', fontSize: 13, borderRadius: 6, fontStyle: 'italic', color: 'var(--ink-2)', background: 'var(--paper-2)', border: '1px solid var(--accent-2)', fontFamily: 'var(--font-serif)', marginBottom: 8 }} />
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Note</div>
          <CompactEditor value={draftText} onChange={setDraftText}
            placeholder="Note…" minHeight={72} autoFocus />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={commitEdit} style={{ fontSize: 11, padding: '4px 14px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Save</button>
            <button onClick={cancelEdit} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          {thought.quote && (
            <blockquote style={{ borderLeft: '2px solid var(--paper-3)', paddingLeft: 10, margin: '0 0 8px', fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.65 }}>
              "{thought.quote}"
            </blockquote>
          )}
          {thought.text && (
            <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: thought.text }} />
          )}
        </div>
      )}

      {/* Hover actions */}
      {!editing && (
        <div className="note-actions" style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5, opacity: 0, transition: 'opacity 0.15s' }}>
          <CopyBtn text={copyText} />
          {onCite && (thought.quote || thought.text) && (
            <button onClick={() => onCite(thought)}
              style={{ fontSize: 10, color: 'var(--ink-4)', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 5, padding: '2px 8px', cursor: 'pointer' }}
              title="Cite this — save to Reading Log"
              onMouseEnter={e => e.currentTarget.style.color = '#8a6a20'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>❝</button>
          )}
          <button onClick={() => setEditing(true)}
            style={{ fontSize: 10, color: 'var(--ink-4)', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 5, padding: '2px 8px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✎</button>
          <button onClick={() => onDelete(thought.id)}
            style={{ fontSize: 10, color: 'var(--ink-4)', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 5, padding: '2px 8px', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
        </div>
      )}
    </div>
  );
}

function RetroCaptureBar({ book, thoughtTypes, onAdd }) {
  const [text, setText] = useState('');
  const [quote, setQuote] = useState('');
  const [type, setType] = useState(() => {
    const retro = thoughtTypes.find(t => t.id === 'retrospective');
    return retro?.id || thoughtTypes[0]?.id || 'reaction';
  });
  const [topics, setTopics] = useState('');
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef();

  const handleSubmit = () => {
    if (!text.trim() && !quote.trim()) return;
    onAdd({
      id: uuidv4(),
      text: text.trim(),
      quote: quote.trim(),
      bookId: book.id,
      type,
      page: null,
      topics: topics.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
      source: 'archive',
      createdAt: new Date().toISOString(),
    });
    setText(''); setQuote(''); setTopics(''); setExpanded(false);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); };

  return (
    <div style={{ borderTop: '2px solid #2c5f8a', background: 'var(--paper-card)', padding: expanded ? '14px 20px' : '10px 20px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: expanded ? 10 : 0 }}>
        <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 10, background: '#2c5f8a', color: '#fff', fontFamily: 'var(--font-mono)', fontStyle: 'normal', opacity: 0.85, flexShrink: 0 }}>retrospective</span>
        {!expanded && (
          <input ref={textRef} value={text}
            onChange={e => { setText(e.target.value); if (e.target.value) setExpanded(true); }}
            onFocus={() => setExpanded(true)} onKeyDown={handleKeyDown}
            placeholder="Add a retrospective note…"
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: 'var(--ink)', outline: 'none', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }} />
        )}
      </div>
      {expanded && (
        <div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Quote (optional)</div>
            <textarea value={quote} onChange={e => setQuote(e.target.value)} rows={2} onKeyDown={handleKeyDown}
              placeholder="A passage you want to revisit…"
              style={{ width: '100%', resize: 'none', border: '1px solid var(--paper-3)', borderRadius: 6, padding: '6px 10px', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-2)', background: 'var(--paper-2)', fontFamily: 'var(--font-serif)' }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Note / reflection</div>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} onKeyDown={handleKeyDown} autoFocus
              placeholder="Looking back now, what do you think? How has your view changed?"
              style={{ width: '100%', resize: 'none', border: 'none', background: 'transparent', fontSize: 14, lineHeight: 1.65, color: 'var(--ink)', outline: 'none', fontFamily: 'var(--font-serif)' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={type} onChange={e => setType(e.target.value)}
              style={{ fontSize: 12, padding: '4px 22px 4px 8px', borderRadius: 6, background: 'var(--paper-2)', color: 'var(--ink)', border: '1px solid var(--paper-3)' }}>
              {thoughtTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <input value={topics} onChange={e => setTopics(e.target.value)}
              placeholder="topics, comma separated"
              style={{ flex: 1, minWidth: 120, padding: '4px 10px', fontSize: 12, borderRadius: 6 }} />
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button onClick={() => { setExpanded(false); setText(''); setQuote(''); }}
                style={{ fontSize: 12, padding: '5px 12px', border: '1px solid var(--paper-3)', borderRadius: 6, color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={handleSubmit}
                style={{ fontSize: 12, padding: '5px 16px', borderRadius: 6, background: '#2c5f8a', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Save <span style={{ opacity: 0.6, fontSize: 10 }}>⌘↵</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookArchivePanel({ book, thoughts, thoughtTypes, onClose, onAddThought, onDeleteThought, onUpdateThought, onAddLog }) {
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [flickering, setFlickering] = React.useState(false);
  const triggerFlicker = () => { setFlickering(true); setTimeout(() => setFlickering(false), 180); };
  const [logCapture, setLogCapture] = useState(null);

  const handleCite = (thought) => {
    const book_title = book.title;
    const attribution = `${book.author ? book.author + ', ' : ''}${book_title}${thought.page ? `, p.${thought.page}` : ''}`;
    setLogCapture({
      context: { label: book_title, sourceType: 'book', sourceId: book.id, sourceName: book_title },
      prefill: { type: 'quote', quote: thought.quote || thought.text || '', attribution },
    });
  };

  const allBookThoughts = thoughts.filter(t => t.bookId === book.id);
  const liveNotes  = allBookThoughts.filter(t => !isRetro(t));
  const retroNotes = allBookThoughts.filter(t => isRetro(t));

  const applyFilter = (list) => list
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => !search ||
      stripHtml(t.text)?.toLowerCase().includes(search.toLowerCase()) ||
      t.quote?.toLowerCase().includes(search.toLowerCase()) ||
      t.topics?.some(tp => tp.includes(search.toLowerCase())))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const filteredLive  = applyFilter(liveNotes);
  const filteredRetro = applyFilter(retroNotes);
  const usedTypes = [...new Set(allBookThoughts.map(t => t.type))];
  const totalCount = filteredLive.length + filteredRetro.length;

  const exportAll = () => {
    const renderNote = (t) => {
      const tp = thoughtTypes.find(x => x.id === t.type);
      const lines = [`### ${tp?.label || t.type}${t.page ? ` (p.${t.page})` : ''}${isRetro(t) ? ' · retrospective' : ''}`];
      if (t.quote) lines.push(`> "${t.quote}"`);
      if (t.text)  lines.push(stripHtml(t.text));
      if (t.topics?.length) lines.push(t.topics.map(x => `#${x}`).join(' '));
      return lines.join('\n');
    };
    const text = [
      `# ${book.title}`,
      `**Author:** ${book.author || ''}`,
      book.year ? `**Year:** ${book.year < 0 ? Math.abs(book.year) + ' BCE' : book.year}` : '',
      book.rating ? `**Rating:** ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}` : '',
      book.review ? `**Review:** "${book.review}"` : '',
      '',
      liveNotes.length  ? ['## Reading notes',      '', ...liveNotes.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).map(renderNote)].join('\n')  : '',
      retroNotes.length ? ['## Retrospective notes', '', ...retroNotes.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).map(renderNote)].join('\n') : '',
    ].filter(Boolean).join('\n');
    navigator.clipboard?.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <LoadFlicker show={flickering} />
      {/* ── MANUSCRIPT RECORD HEADER ───────────────────── */}
      <div style={{ padding: '11px 22px 9px', borderBottom: '2px solid var(--paper-3)', flexShrink: 0, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 72, color: book.color, opacity: 0.04, fontFamily: 'var(--font-display)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1, fontWeight: 700 }}>◊</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <button onClick={onClose}
            style={{ fontSize: 8, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 2, padding: '2px 9px', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--paper-3)'}>
            ← ARCHIVE
          </button>
          <GlitchCallNum id={book.id} />
          <div style={{ flex: 1 }} />
          {book.rating ? <span style={{ fontSize: 12, color: '#b07d28' }}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</span> : null}
          <button onClick={exportAll}
            style={{ fontSize: 8, padding: '3px 10px', borderRadius: 2, border: `1px solid ${copied ? 'var(--green)' : 'var(--paper-3)'}`, color: copied ? 'var(--green)' : 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em' }}>
            {copied ? '✓ COPIED' : 'COPY ALL'}
          </button>
        </div>
        <div style={{ height: 1, background: 'var(--paper-3)', marginBottom: 7 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 4, height: 40, background: book.color, borderRadius: 1, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', fontStyle: 'italic', lineHeight: 1.2 }}>{book.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 3 }}>
              {book.author}{book.year ? ` · ${book.year < 0 ? Math.abs(book.year) + ' BCE' : book.year}` : ''}
              {' · '}<span style={{ color: 'var(--ink-2)', fontStyle: 'normal', fontFamily: 'var(--font-mono)', fontSize: 10 }}>{liveNotes.length} notes · {retroNotes.length} retrospective</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review banner — as a librarian's annotation */}
      {book.review && (
        <div style={{ padding: '7px 22px', background: 'var(--accent-light)', borderBottom: '1px solid var(--accent-2)', display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 8, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>Librarian's note</span>
          <span style={{ fontSize: 12, color: 'var(--ink)', fontStyle: 'italic' }}>"{book.review}"</span>
        </div>
      )}

      {/* Filter strip */}
      <div style={{ padding: '7px 22px', borderBottom: '1px solid var(--paper-3)', display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterType('all')}
          style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, border: `1px solid ${filterType === 'all' ? 'var(--ink-3)' : 'var(--paper-3)'}`, background: filterType === 'all' ? 'var(--paper-3)' : 'transparent', color: filterType === 'all' ? 'var(--ink)' : 'var(--ink-3)', cursor: 'pointer' }}>
          All ({totalCount})
        </button>
        {usedTypes.map(tid => {
          const tp = thoughtTypes.find(t => t.id === tid);
          if (!tp) return null;
          const cnt = allBookThoughts.filter(t => t.type === tid).length;
          return (
            <button key={tid} onClick={() => setFilterType(filterType === tid ? 'all' : tid)}
              style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, border: `1px solid ${filterType === tid ? tp.color : 'var(--paper-3)'}`, background: filterType === tid ? tp.bg + '44' : 'transparent', color: filterType === tid ? tp.color : 'var(--ink-3)', cursor: 'pointer' }}>
              {tp.label} {cnt}
            </button>
          );
        })}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
          style={{ marginLeft: 'auto', width: 180, padding: '5px 10px', fontSize: 12 }} />
      </div>

      {/* Notes feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Live reading notes */}
        {filteredLive.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontStyle: 'normal', paddingBottom: 6, borderBottom: '1px solid var(--paper-3)', marginBottom: 10 }}>
              Reading notes <span style={{ fontWeight: 400 }}>({filteredLive.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredLive.map(t => <NoteCard key={t.id} thought={t} thoughtTypes={thoughtTypes} onDelete={onDeleteThought} onUpdate={onUpdateThought} onCite={onAddLog ? handleCite : null} />)}
            </div>
          </div>
        )}
        {filteredLive.length === 0 && !search && filterType === 'all' && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 13 }}>
            No live reading notes captured for this book.
          </div>
        )}

        {/* Retrospective notes */}
        <div style={{ marginTop: filteredLive.length > 0 ? 16 : 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#2c5f8a', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontStyle: 'normal', paddingBottom: 6, borderBottom: '2px solid #2c5f8a55', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            Retrospective notes <span style={{ fontWeight: 400 }}>({filteredRetro.length})</span>
            <span style={{ fontSize: 9, fontWeight: 400, color: 'var(--ink-4)', textTransform: 'none', letterSpacing: 0 }}>written after finishing</span>
          </div>
          {filteredRetro.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 13 }}>
              No retrospective entries. Add one below. notes yet — add one below.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredRetro.map(t => <NoteCard key={t.id} thought={t} thoughtTypes={thoughtTypes} onDelete={onDeleteThought} onUpdate={onUpdateThought} onCite={onAddLog ? handleCite : null} />)}
            </div>
          )}
        </div>

        {totalCount === 0 && (search || filterType !== 'all') && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-4)', fontStyle: 'italic' }}>No notes match.</div>
        )}
      </div>

      <RetroCaptureBar book={book} thoughtTypes={thoughtTypes} onAdd={onAddThought} />
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

// ── Item card used in both flat and grouped list ──────────────────
function ItemCard({ item, thoughts, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const allNotes   = thoughts.filter(t => t.bookId === item.id);
  const liveCount  = allNotes.filter(t => !isRetro(t)).length;
  const retro      = allNotes.filter(t => isRetro(t)).length;
  const quoteCount = allNotes.filter(t => t.quote).length;
  const finishedDate = item.finishedAt
    ? new Date(item.finishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const isPaper = item._itemType === 'article';
  const msNum = catNum(item.id);

  return (
    <div onClick={() => onSelect(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--paper-card)' : 'var(--paper-2)', border: `1px solid ${hovered ? item.color + '44' : 'var(--paper-3)'}`, borderLeft: `4px solid ${item.color}`, borderRadius: 2, padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.12s', boxShadow: hovered ? '1px 3px 10px rgba(100,70,20,0.10)' : 'none', transform: hovered ? 'translateX(2px)' : 'none' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <GlitchCallNum id={item.id} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-display)', fontStyle: 'italic', lineHeight: 1.2 }}>{item.title}</div>
          {isPaper && <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 2, background: '#e0f0f8', color: '#1a5c7a', fontFamily: 'var(--font-mono)', fontStyle: 'normal', flexShrink: 0, letterSpacing: '0.06em' }}>PAPER</span>}
          {item.status === 'dnf' && <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 2, background: '#faeae8', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>WITHDRAWN</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 3 }}>
          {item.author}
          {isPaper && item.journal ? <span style={{ color: 'var(--ink-4)' }}> · {item.journal}</span> : null}
          {item.year ? ` · ${item.year < 0 ? Math.abs(item.year) + ' BCE' : item.year}` : ''}
        </div>
        {item.review ? <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 5, paddingLeft: 8, borderLeft: '2px solid var(--accent-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{item.review}"</div> : null}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        {item.rating ? <div style={{ fontSize: 11, color: '#b07d28' }}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</div> : null}
        <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em' }}>
          <span style={{ color: 'var(--ink)' }}>{liveCount}</span> note{liveCount !== 1 ? 's' : ''}
          {retro > 0 ? <span style={{ color: '#2c5f8a' }}> · {retro} retro</span> : null}
          {quoteCount > 0 ? <span> · {quoteCount} quot{quoteCount !== 1 ? 'es' : 'e'}</span> : null}
        </div>
        {finishedDate ? <div style={{ fontSize: 9, color: 'var(--ink-4)', fontStyle: 'italic' }}>read {finishedDate}</div> : null}
      </div>
      <div style={{ fontSize: 12, color: item.color, opacity: 0.7 }}>→</div>
    </div>
  );
}

// ── Main ArchiveView ──────────────────────────────────────────────
export default function ArchiveView({ books, articles = [], thoughts, thoughtTypes, onAddThought, onDeleteThought, onUpdateThought, initialItemId, onClearInitial, onAddLog }) {
  const [selectedBookId, setSelectedBookId] = useState(initialItemId || null);
  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState('finished');
  const [typeFilter, setTypeFilter] = useState('all');
  const [groupBy, setGroupBy]   = useState('year');
  const [collapsedYears, setCollapsedYears] = useState({});
  const [flickering, setFlickering] = React.useState(false);
  const triggerFlicker = () => { setFlickering(true); setTimeout(() => setFlickering(false), 180); };

  const toggleYear = (yr) => setCollapsedYears(c => ({ ...c, [yr]: !c[yr] }));

  const finishedBooks    = books.filter(b => b.status === 'finished' || b.status === 'dnf').map(b => ({ ...b, _itemType: 'book' }));
  const finishedArticles = articles.filter(a => a.status === 'finished' || a.status === 'dnf').map(a => ({ ...a, _itemType: 'article' }));
  const allFinished = [...finishedBooks, ...finishedArticles];

  const filtered = allFinished
    .filter(item => typeFilter === 'all' || item._itemType === typeFilter)
    .filter(item => !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title')  return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'notes')  return thoughts.filter(t => t.bookId === b.id).length - thoughts.filter(t => t.bookId === a.id).length;
      return new Date(b.finishedAt || 0) - new Date(a.finishedAt || 0);
    });

  const selectedItem = allFinished.find(item => item.id === selectedBookId);

  if (selectedItem) {
    return (
      <BookArchivePanel
        book={selectedItem}
        thoughts={thoughts}
        thoughtTypes={thoughtTypes}
        onClose={() => { setSelectedBookId(null); onClearInitial?.(); }}
        onAddThought={onAddThought}
        onDeleteThought={onDeleteThought}
        onUpdateThought={onUpdateThought}
        onAddLog={onAddLog}
      />
    );
  }

  const totalNotes = thoughts.filter(t => allFinished.some(item => item.id === t.bookId)).length;
  const retroCount = thoughts.filter(t => isRetro(t) && allFinished.some(item => item.id === t.bookId)).length;

  // Build year groups
  const buildYearGroups = () => {
    const byYear = {};
    filtered.forEach(item => {
      const yr = item.finishedAt ? String(new Date(item.finishedAt).getFullYear()) : 'Unknown';
      if (!byYear[yr]) byYear[yr] = [];
      byYear[yr].push(item);
    });
    return Object.keys(byYear).sort((a, b) => {
      if (a === 'Unknown') return 1;
      if (b === 'Unknown') return -1;
      return Number(b) - Number(a);
    }).map(yr => ({ yr, items: byYear[yr] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <LoadFlicker show={flickering} />
      {/* ── MANUSCRIPT ROOM HEADER ─────────────────────── */}
      <div style={{ padding: '11px 22px 9px', borderBottom: '2px solid var(--paper-3)', flexShrink: 0, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>
        {/* Cyberpunk watermark — the seam in the illusion */}
        <div style={{ position: 'absolute', right: 240, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: 'var(--accent)', opacity: 0.14, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.2em', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
          NEUROMANCER CONSTRUCT · METAVERSE PUBLIC LIBRARY · MS. LIU'S BETTER UNITED NATIONS
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 2 }}>
              Read-only constructs · flatlined to ROM
            </div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
              The Archive
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginTop: 2, letterSpacing: '0.04em' }}>
              {finishedBooks.length} vol{finishedBooks.length!==1?'s':''} · {finishedArticles.length} paper{finishedArticles.length!==1?'s':''} · {totalNotes} notes archived · {retroCount} retrospective entries
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', border: '1px solid var(--paper-3)', borderRadius: 2, overflow: 'hidden' }}>
              {[['all','All'],['book','Books'],['article','Papers']].map(([val, label]) => (
                <button key={val} onClick={() => setTypeFilter(val)}
                  style={{ padding: '4px 10px', fontSize: 10, border: 'none', borderRight: val !== 'article' ? '1px solid var(--paper-3)' : 'none', background: typeFilter === val ? 'var(--ink)' : 'transparent', color: typeFilter === val ? 'var(--paper-card)' : 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>
                  {label}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ fontSize: 10, padding: '4px 22px 4px 8px', borderRadius: 2, background: 'var(--paper-2)', color: 'var(--ink-2)', border: '1px solid var(--paper-3)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
              <option value="finished">Date read</option>
              <option value="rating">Rating</option>
              <option value="notes">Note count</option>
              <option value="title">Title A–Z</option>
            </select>
            <div style={{ display: 'flex', border: '1px solid var(--paper-3)', borderRadius: 2, overflow: 'hidden' }}>
              {[['year','By year'],['none','All']].map(([val, label]) => (
                <button key={val} onClick={() => setGroupBy(val)}
                  style={{ padding: '4px 10px', fontSize: 10, border: 'none', borderRight: val === 'year' ? '1px solid var(--paper-3)' : 'none', background: groupBy === val ? 'var(--accent-light)' : 'transparent', color: groupBy === val ? 'var(--accent)' : 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
                  {label}
                </button>
              ))}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search archive…"
              style={{ width: 150, padding: '5px 10px', fontSize: 11, borderRadius: 2, fontStyle: 'italic' }} />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 14, lineHeight: 1.7 }}>
            {search ? 'No manuscripts match this search. The record is silent.' : <><div style={{fontSize:36,opacity:0.08,marginBottom:12,fontFamily:'var(--font-display)',lineHeight:1}}>◌</div>No volumes in the archive yet. Mark a book as finished to begin.</>}
          </div>
        ) : groupBy === 'none' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(item => <ItemCard key={item.id} item={item} thoughts={thoughts} onSelect={id => { triggerFlicker(); setTimeout(() => setSelectedBookId(id), 190); }} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {buildYearGroups().map(({ yr, items }) => (
              <div key={yr}>
                <button onClick={() => toggleYear(yr)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', marginBottom: collapsedYears[yr] ? 0 : 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 8, color: 'var(--ink-4)', display: 'inline-block', transition: 'transform 0.15s', transform: collapsedYears[yr] ? 'rotate(0deg)' : 'rotate(90deg)' }}>▶</span>
                  <span style={{ fontSize: 16, fontWeight: 600, fontStyle: 'italic', color: 'var(--ink-2)', fontFamily: 'var(--font-display)', letterSpacing: '0.01em' }}>{yr}</span>
                  <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{items.length} vol{items.length !== 1 ? 's' : ''}</span>
                </button>
                {!collapsedYears[yr] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map(item => <ItemCard key={item.id} item={item} thoughts={thoughts} onSelect={id => { triggerFlicker(); setTimeout(() => setSelectedBookId(id), 190); }} />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
