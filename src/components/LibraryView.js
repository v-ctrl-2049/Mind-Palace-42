import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BookCard } from './BookCover';
import { STATUSES, getStatus } from '../data/library';
import { ACCENT_COLORS } from '../data/library';
import { stripHtml } from './SimpleEditor';

// ── GlitchCallNum — the uncanny slip ─────────────────────────────
function GlitchCallNum({ id }) {
  const [glitching, setGlitching] = React.useState(false);
  const timerRef = React.useRef();

  const handleEnter = () => {
    timerRef.current = setTimeout(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 280);
    }, 120);
  };
  const handleLeave = () => {
    clearTimeout(timerRef.current);
    setGlitching(false);
  };

  return (
    <span
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        fontSize: 8,
        fontFamily: glitching ? 'DM Mono, monospace' : 'var(--font-mono)',
        color: glitching ? '#00ff41' : 'var(--ink-4)',
        letterSpacing: glitching ? '0.06em' : '0.07em',
        opacity: glitching ? 1 : 0.65,
        cursor: 'default',
        transition: glitching ? 'none' : 'color 0.3s, opacity 0.3s',
        background: glitching ? '#000' : 'transparent',
        padding: glitching ? '0 3px' : '0',
        borderRadius: 2,
        userSelect: 'none',
      }}>
      {glitching ? catNumGlitch(id) : catNum(id)}
    </span>
  );
}


const RULED = 'repeating-linear-gradient(transparent, transparent 24px, rgba(100,80,50,0.05) 24px, rgba(100,80,50,0.05) 25px)';

// Catalogue number from book id
function catNum(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  const h2 = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  const classes = ['PR','PS','PQ','PE','PA','CB','DA','DS','DT','GN','HM','HN','JC','ML','NA','QA','QC','Z'];
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
  return '0x' + Math.abs(h).toString(16).toUpperCase().slice(0,4) + ':RAM';
}

const STATUS_GROUPS = [
  { id: 'reading',      label: 'On the Reading Desk',    cyber: 'Active construct · RAM loaded'          },
  { id: 'want-next',    label: 'Reserved — Next',        cyber: 'Queued · ice pending'                   },
  { id: 'want-someday', label: 'Want to Read',           cyber: 'Flagged for retrieval'                  },
  { id: 'want-meh',     label: 'Maybe Someday',          cyber: 'Low priority · surveillance mode'       },
  { id: 'finished',     label: 'Returned to Collection', cyber: 'Archived to ROM · cold storage'         },
  { id: 'dnf',          label: 'Did Not Finish',         cyber: 'Process terminated · flatlined'         },
];

function StarDisplay({ rating }) {
  if (!rating) return null;
  return <span style={{ color:'#b07d28', fontSize:11 }}>{'★'.repeat(rating)}{'☆'.repeat(5-rating)}</span>;
}

function ProgressBar({ book }) {
  if (!book.pages || book.status !== 'reading') return null;
  const pct = Math.min(100, Math.round((book.progress/book.pages)*100));
  return (
    <div style={{ marginTop:4 }}>
      <div style={{ height:2, background:'var(--paper-3)', borderRadius:1, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:'var(--accent-2)', borderRadius:1 }} />
      </div>
      <div style={{ fontSize:8, color:'var(--ink-4)', marginTop:2, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.04em' }}>
        p.{book.progress}/{book.pages} · {pct}%
      </div>
    </div>
  );
}

// ── LoadFlicker — the page-turn glitch ───────────────────────────
function LoadFlicker({ show }) {
  if (!show) return null;
  const addr = '0x' + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4,'0');
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.92)',
      pointerEvents: 'none',
    }}>
      <div style={{ textAlign: 'center', fontFamily: 'DM Mono, monospace' }}>
        <div style={{ fontSize: 11, color: '#00ff41', letterSpacing: '0.18em', marginBottom: 6 }}>
          LoAdding...
        </div>
        <div style={{ fontSize: 9, color: '#00ff4188', letterSpacing: '0.12em' }}>
          [{addr}] · BABEL CONTAINMENT · CIC NODE
        </div>
      </div>
    </div>
  );
}


// ── Quick capture panel ───────────────────────────────────────────
function QuickCapturePanel({ book, thoughtTypes, onAdd, onClose }) {
  const [text, setText] = useState('');
  const [type, setType] = useState(thoughtTypes[0]?.id || 'note');
  const [quote, setQuote] = useState('');
  const [page, setPage] = useState('');
  const inputRef = useRef();

  const submit = () => {
    if (!text.trim() && !quote.trim()) return;
    onAdd({
      text: text.trim(),
      quote: quote.trim(),
      bookId: book.id,
      sourceType: 'book',
      type,
      page: page ? parseInt(page,10) : null,
      topics: [],
    });
    setText(''); setQuote(''); setPage('');
    inputRef.current?.focus();
  };

  return (
    <div style={{ background:'var(--paper-2)', border:'1px solid var(--paper-3)', borderTop:`3px solid ${book.color}`, borderRadius:2, padding:'14px 16px', marginTop:10, position:'relative' }}>
      <div style={{ position:'absolute', top:8, right:10, fontSize:8, color:book.color, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', opacity:0.7, transform:'rotate(-4deg)', borderBottom:`1px solid ${book.color}55`, paddingBottom:1 }}>
        FIELD NOTE
      </div>
      <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>
        Quick capture — {book.title}
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:8 }}>
        <select value={type} onChange={e=>setType(e.target.value)}
          style={{ fontSize:10, padding:'3px 6px', borderRadius:2, border:'1px solid var(--paper-3)', background:'transparent', color:'var(--ink-3)', fontFamily:'var(--font-mono)', fontStyle:'normal', flexShrink:0 }}>
          {thoughtTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <input value={page} onChange={e=>setPage(e.target.value)} placeholder="p." style={{ width:48, padding:'3px 6px', fontSize:11, borderRadius:2, border:'1px solid var(--paper-3)', background:'transparent', fontFamily:'var(--font-mono)', fontStyle:'normal', textAlign:'center' }} />
      </div>
      <textarea value={quote} onChange={e=>setQuote(e.target.value)} placeholder="Quote from the text…" rows={1}
        style={{ width:'100%', resize:'none', padding:'5px 8px', fontSize:12, borderRadius:2, fontStyle:'italic', color:'var(--ink-2)', background:isDark?'#241e14':'#fefcf5', border:'1px solid var(--paper-3)', fontFamily:'var(--font-serif)', marginBottom:7, backgroundImage:RULED }} />
      <textarea ref={inputRef} value={text} onChange={e=>setText(e.target.value)}
        onKeyDown={e=>{ if(e.key==='Enter'&&e.metaKey) submit(); }}
        placeholder="Your observation… (⌘↵ to file)" rows={2}
        style={{ width:'100%', resize:'none', padding:'5px 8px', fontSize:13, borderRadius:2, color:'var(--ink)', background:isDark?'#241e14':'#fefcf5', border:'1px solid var(--paper-3)', fontFamily:'var(--font-serif)', backgroundImage:RULED }} />
      <div style={{ display:'flex', gap:6, marginTop:8 }}>
        <button onClick={submit} style={{ fontSize:9, padding:'3px 14px', borderRadius:2, background:book.color, color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>FILE NOTE</button>
        <button onClick={onClose} style={{ fontSize:9, padding:'3px 10px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-4)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>close</button>
      </div>
    </div>
  );
}

// isDark helper needed in QuickCapturePanel — extract at module level
const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

// ── Annotation panel ──────────────────────────────────────────────
function AnnotationPanel({ book, onSave, onClose }) {
  const [text, setText] = useState(book.librarianNote || '');
  return (
    <div style={{ background:'var(--paper-2)', border:'1px solid var(--paper-3)', borderTop:'3px solid var(--accent-2)', borderRadius:2, padding:'14px 16px', marginTop:10 }}>
      <div style={{ display:'flex', gap:12, marginBottom:10, paddingBottom:8, borderBottom:'1px dashed var(--paper-3)' }}>
        <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>CATALOGUE ANNOTATION</div>
        <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>REF: <GlitchCallNum id={book.id} /></div>
        <div style={{ marginLeft:'auto', fontSize:8, color:'var(--accent-2)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.09em' }}>LIBRARIAN'S NOTE</div>
      </div>
      <textarea value={text} onChange={e=>setText(e.target.value)}
        placeholder="Acquisition note, relevance to current research, connection to other works, critical assessment for the catalogue…"
        rows={4}
        style={{ width:'100%', resize:'vertical', padding:'6px 8px', fontSize:13, borderRadius:2, color:'var(--ink)', background:'transparent', border:'none', fontFamily:'var(--font-serif)', lineHeight:1.75, outline:'none', backgroundImage:RULED }} />
      <div style={{ display:'flex', gap:6, marginTop:8 }}>
        <button onClick={()=>{onSave(text);onClose();}} style={{ fontSize:9, padding:'3px 14px', borderRadius:2, background:'var(--accent)', color:'var(--paper-card)', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>CATALOGUE</button>
        <button onClick={onClose} style={{ fontSize:9, padding:'3px 10px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-4)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>cancel</button>
      </div>
    </div>
  );
}

// ── Group manager ─────────────────────────────────────────────────
function GroupManager({ groups, books, onUpdate, onClose }) {
  const [items, setItems] = useState(groups.map(g=>({...g})));
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(ACCENT_COLORS[0]);
  const add = () => { if(!newName.trim()) return; setItems(p=>[...p,{id:uuidv4(),name:newName.trim(),color:newColor}]); setNewName(''); };
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}>
      <div style={{ background:'var(--paper-card)', borderRadius:4, width:420, maxHeight:'80vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'var(--shadow-md)' }}>
        <div style={{ padding:'14px 18px 10px', borderBottom:'1px solid var(--paper-3)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--paper-2)' }}>
          <div>
            <div style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:2 }}>Reading Room</div>
            <span style={{ fontSize:14, fontFamily:'var(--font-display)', fontWeight:600, fontStyle:'italic', color:'var(--ink)' }}>Manage reading groups</span>
          </div>
          <button onClick={()=>{onUpdate(items);onClose();}} style={{ fontSize:9, padding:'3px 12px', borderRadius:2, background:'var(--ink)', color:'var(--paper-card)', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>SAVE</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 18px' }}>
          {items.map(g => {
            const count = books.filter(b=>b.groupId===g.id).length;
            return (
              <div key={g.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'6px 0', borderBottom:'1px solid var(--paper-3)' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:g.color, boxShadow:`0 0 0 2px ${g.color}44` }} />
                  <input type="color" value={g.color} onChange={e=>setItems(p=>p.map(x=>x.id===g.id?{...x,color:e.target.value}:x))}
                    style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }} />
                </div>
                <input value={g.name} onChange={e=>setItems(p=>p.map(x=>x.id===g.id?{...x,name:e.target.value}:x))}
                  style={{ flex:1, padding:'4px 8px', fontSize:12, borderRadius:2, fontFamily:'var(--font-serif)', fontStyle:'italic' }} />
                <span style={{ fontSize:10, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', width:24, textAlign:'right' }}>{count}</span>
                <button onClick={()=>setItems(p=>p.filter(x=>x.id!==g.id))} style={{ fontSize:11, color:'var(--ink-4)', cursor:'pointer', background:'none', border:'none' }}
                  onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--ink-4)'}>✕</button>
              </div>
            );
          })}
        </div>
        <div style={{ padding:'10px 18px', borderTop:'1px solid var(--paper-3)', display:'flex', gap:6, background:'var(--paper-2)' }}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
            placeholder="New reading group name…" style={{ flex:1, padding:'5px 8px', fontSize:12, borderRadius:2, fontStyle:'italic' }} />
          <div style={{ position:'relative' }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background:newColor, cursor:'pointer', border:'2px solid var(--paper-3)' }} />
            <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }} />
          </div>
          <button onClick={add} style={{ fontSize:9, padding:'5px 12px', borderRadius:2, background:'var(--accent)', color:'var(--paper-card)', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.06em' }}>ADD</button>
        </div>
      </div>
    </div>
  );
}

// ── Main LibraryView ──────────────────────────────────────────────
export default function LibraryView({ books, groups=[], onEdit, onAdd, onUpdateGroups, onOpenArchive, onAddThought, onUpdateBook, thoughtTypes=[] }) {
  const [displayMode, setDisplayMode]     = useState('list');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [filterGroup, setFilterGroup]     = useState('all');
  const [search, setSearch]               = useState('');
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [captureBookId, setCaptureBookId] = useState(null);
  const [annotateBookId, setAnnotateBookId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const toggleGroup = (id) => setCollapsedGroups(c=>({...c,[id]:!c[id]}));
  const [flickering, setFlickering] = React.useState(false);

  const triggerFlicker = () => {
    setFlickering(true);
    setTimeout(() => setFlickering(false), 180);
  };

  const filtered = books
    .filter(b=>filterStatus==='all'||b.status===filterStatus)
    .filter(b=>filterGroup==='all'||b.groupId===filterGroup)
    .filter(b=>!search||b.title.toLowerCase().includes(search.toLowerCase())||b.author?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    reading:  books.filter(b=>b.status==='reading').length,
    finished: books.filter(b=>b.status==='finished').length,
    want:     books.filter(b=>b.status?.startsWith('want')).length,
  };

  const handleAddThought = (data) => {
    if (onAddThought) onAddThought({ id:uuidv4(), createdAt:new Date().toISOString(), topics:[], ...data });
  };

  const handleSaveAnnotation = (bookId, text) => {
    if (onUpdateBook) {
      const book = books.find(b=>b.id===bookId);
      if (book) onUpdateBook({ ...book, librarianNote: text, updatedAt: new Date().toISOString() });
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--paper)' }}>
      <LoadFlicker show={flickering} />

      {/* ── READING ROOM HEADER ──────────────────────────── */}
      <div style={{ padding:'11px 20px 9px', borderBottom:'2px solid var(--paper-3)', flexShrink:0, background:'var(--paper-2)', position:'relative', overflow:'hidden' }}>
        {/* Faint dome watermark */}
        <div style={{ position:'absolute', right:230, top:'50%', transform:'translateY(-50%)', fontSize:9, color:'var(--accent)', opacity:0.14, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.2em', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap', textTransform:'uppercase' }}>
          LAGOS PROTOCOL · BABEL CONTAINMENT · CIC RESTRICTED NODE
        </div>

        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
          <div>
            <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:2 }}>
              General catalogue · {books.length} constructs indexed
            </div>
            <div style={{ fontSize:18, fontFamily:'var(--font-display)', fontWeight:700, color:'var(--ink)', lineHeight:1.2, letterSpacing:'0.01em' }}>
              The Library
            </div>
            <div style={{ fontSize:10, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', marginTop:2, letterSpacing:'0.04em' }}>
              {stats.reading} at reading desk · {stats.finished} archived · {stats.want} pending
            </div>
          </div>

          <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center', flexShrink:0, flexWrap:'wrap' }}>
            {/* View toggle */}
            <div style={{ display:'flex', border:'1px solid var(--paper-3)', borderRadius:2, overflow:'hidden' }}>
              {[['list','≡ Catalogue'],['covers','⊞ Shelves']].map(([mode,label]) => (
                <button key={mode} onClick={()=>setDisplayMode(mode)}
                  style={{ padding:'4px 10px', fontSize:10, border:'none', background:displayMode===mode?'var(--ink)':'transparent', color:displayMode===mode?'var(--paper-card)':'var(--ink-3)', cursor:'pointer', borderRight:mode==='list'?'1px solid var(--paper-3)':'none', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.06em' }}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowGroupManager(true)}
              style={{ fontSize:10, padding:'4px 10px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-2)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em' }}>
              ⊙ Groups
            </button>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search catalogue…"
              style={{ width:150, padding:'5px 10px', fontSize:11, borderRadius:2, fontStyle:'italic' }} />
            <button onClick={onAdd}
              style={{ fontSize:10, padding:'5px 14px', borderRadius:2, background:'var(--ink)', color:'var(--paper-card)', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>
              + Add book
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', alignItems:'center', marginTop:8, paddingTop:7, borderTop:'1px dashed var(--paper-3)' }}>
          <StatusPill id="all" label="All" count={books.length} active={filterStatus==='all'} color="var(--ink-3)" bg="var(--paper-3)" onClick={()=>setFilterStatus('all')} />
          {STATUSES.map(s => {
            const cnt = books.filter(b=>b.status===s.id).length;
            if (!cnt) return null;
            return <StatusPill key={s.id} id={s.id} label={s.label} count={cnt} active={filterStatus===s.id} color={s.color} bg={s.bg} onClick={()=>setFilterStatus(filterStatus===s.id?'all':s.id)} />;
          })}
          {groups.length > 0 && <div style={{ width:1, height:14, background:'var(--paper-3)' }} />}
          {groups.length > 0 && (
            <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)}
              style={{ fontSize:10, padding:'2px 20px 2px 7px', borderRadius:2, background:'var(--paper-2)', color:'var(--ink-2)', border:'1px solid var(--paper-3)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>
              <option value="all">All groups</option>
              {groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* ── CATALOGUE BODY ──────────────────────────────── */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>

        {/* ── LIST / CATALOGUE MODE ── */}
        {displayMode === 'list' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {STATUS_GROUPS.map(sg => {
              const sgBooks = filtered.filter(b=>b.status===sg.id);
              if (!sgBooks.length) return null;
              const st = getStatus(sg.id);
              return (
                <div key={sg.id}>
                  {/* Section header */}
                  <button onClick={()=>toggleGroup(sg.id)}
                    style={{ display:'flex', alignItems:'center', gap:10, marginBottom:collapsedGroups[sg.id]?0:10, width:'100%', background:'none', border:'none', cursor:'pointer', padding:'4px 0', textAlign:'left' }}>
                    <span style={{ fontSize:8, color:'var(--ink-4)', transition:'transform 0.15s', transform:collapsedGroups[sg.id]?'rotate(0deg)':'rotate(90deg)', display:'inline-block' }}>▶</span>
                    <div style={{ flex:1 }}>
                        <span title={sg.cyber} style={{ fontSize:13, fontFamily:'var(--font-display)', fontWeight:600, fontStyle:'italic', color:'var(--ink-2)', letterSpacing:'0.01em' }}>{sg.label}</span>
                    </div>
                    <span style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{sgBooks.length} vol{sgBooks.length!==1?'s':''}</span>
                  </button>

                  {!collapsedGroups[sg.id] && (
                    <div style={{ background:'var(--paper-card)', border:'1px solid var(--paper-3)', borderRadius:2, overflow:'hidden', boxShadow:'0 1px 4px rgba(100,70,20,0.07)' }}>
                      {sgBooks.map((b,i) => {
                        const group = groups.find(g=>g.id===b.groupId);
                        const isCapturing = captureBookId===b.id;
                        const isAnnotating = annotateBookId===b.id;
                        return (
                          <div key={b.id} style={{ borderBottom:i<sgBooks.length-1?'1px solid var(--paper-3)':'none' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'9px 1fr auto', alignItems:'start', gap:12, padding:'11px 16px', transition:'background 0.12s', cursor:'pointer' }}
                              onMouseEnter={e=>{ const row=e.currentTarget; if(!isCapturing&&!isAnnotating) row.style.background='var(--paper-2)'; row.querySelector('.book-actions')?.style&&(row.querySelector('.book-actions').style.opacity='1'); }}
                              onMouseLeave={e=>{ const row=e.currentTarget; row.style.background='transparent'; row.querySelector('.book-actions')?.style&&(row.querySelector('.book-actions').style.opacity='0'); }}>

                              {/* Colour spine */}
                              <div style={{ width:4, height:'100%', minHeight:36, borderRadius:1, background:b.color, flexShrink:0, cursor:'pointer', marginTop:2 }} onClick={()=>onEdit(b)} />

                              {/* Main content */}
                              <div onClick={()=>onEdit(b)}>
                                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                                  <GlitchCallNum id={b.id} />
                                  <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)', fontFamily:'var(--font-display)', fontStyle:'italic', lineHeight:1.2 }}>{b.title}</div>
                                  {b.sourceType && <span style={{ fontSize:8, padding:'1px 6px', borderRadius:2, background:b.sourceType==='primary'?'#faeae8':b.sourceType==='secondary'?'#e8eff8':'#f0e8d8', color:b.sourceType==='primary'?'#c0392b':b.sourceType==='secondary'?'#2c5f8a':'#7a6a52', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em', flexShrink:0 }}>{b.sourceType.toUpperCase()}</span>}
                                  {b.methodology && <span style={{ fontSize:8, padding:'1px 6px', borderRadius:2, background:'var(--paper-3)', color:'var(--ink-3)', fontFamily:'var(--font-mono)', fontStyle:'normal', flexShrink:0 }}>{b.methodology}</span>}
                                </div>
                                <div style={{ fontSize:12, color:'var(--ink-3)', fontStyle:'italic', marginTop:2 }}>
                                  {b.author}{b.year?` · ${b.year<0?Math.abs(b.year)+' BCE':b.year}`:''}
                                  {group?<span style={{ color:group.color, marginLeft:6 }}>· {group.name}</span>:''}
                                </div>
                                <ProgressBar book={b} />
                                {b.librarianNote && <div style={{ fontSize:11, color:'var(--ink-3)', fontStyle:'italic', marginTop:4, paddingLeft:8, borderLeft:'2px solid var(--accent-2)' }}>"{b.librarianNote.slice(0,100)}{b.librarianNote.length>100?'…':''}"</div>}
                                {b.review && <div style={{ fontSize:11, color:'var(--ink-3)', fontStyle:'italic', marginTop:3, opacity:0.8 }}>★ {b.review.slice(0,80)}{b.review.length>80?'…':''}</div>}
                              </div>

                              {/* Actions column */}
                              <div style={{ textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                                <StarDisplay rating={b.rating} />
                                {b.genre && <div style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{b.genre}</div>}
                                <div className="book-actions" style={{ display:'flex', gap:5, opacity:0, transition:'opacity 0.15s', flexDirection:'column', alignItems:'flex-end' }}>
                                  {onOpenArchive && (
                                    <button onClick={e=>{ e.stopPropagation(); onOpenArchive(b.id); }}
                                      style={{ fontSize:9, padding:'2px 8px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-3)', background:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em', whiteSpace:'nowrap' }}
                                      onMouseEnter={e=>{ e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--accent-2)'; }}
                                      onMouseLeave={e=>{ e.currentTarget.style.color='var(--ink-3)'; e.currentTarget.style.borderColor='var(--paper-3)'; }}>
                                      notes →
                                    </button>
                                  )}
                                  {onAddThought && (
                                    <button onClick={e=>{ e.stopPropagation(); if(!isCapturing) triggerFlicker(); setCaptureBookId(isCapturing?null:b.id); setAnnotateBookId(null); }}
                                      style={{ fontSize:9, padding:'2px 8px', borderRadius:2, border:`1px solid ${isCapturing?b.color:'var(--paper-3)'}`, color:isCapturing?b.color:'var(--ink-3)', background:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                                      ✎ capture
                                    </button>
                                  )}
                                  {onUpdateBook && (
                                    <button onClick={e=>{ e.stopPropagation(); setAnnotateBookId(isAnnotating?null:b.id); setCaptureBookId(null); }}
                                      style={{ fontSize:9, padding:'2px 8px', borderRadius:2, border:`1px solid ${isAnnotating?'var(--accent-2)':'var(--paper-3)'}`, color:isAnnotating?'var(--accent)':'var(--ink-3)', background:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>
                                      ◈ annotate
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Capture panel */}
                            {isCapturing && (
                              <div style={{ padding:'0 16px 14px', marginTop:-4 }}>
                                <QuickCapturePanel book={b} thoughtTypes={thoughtTypes} onAdd={handleAddThought} onClose={()=>setCaptureBookId(null)} />
                              </div>
                            )}
                            {/* Annotation panel */}
                            {isAnnotating && (
                              <div style={{ padding:'0 16px 14px', marginTop:-4 }}>
                                <AnnotationPanel book={b} onSave={(text)=>handleSaveAnnotation(b.id,text)} onClose={()=>setAnnotateBookId(null)} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── COVERS / SHELVES MODE ── */}
        {displayMode === 'covers' && (
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {STATUS_GROUPS.map(sg => {
              const sgBooks = filtered.filter(b=>b.status===sg.id);
              if (!sgBooks.length) return null;
              const st = getStatus(sg.id);
              return (
                <div key={sg.id}>
                  <button onClick={()=>toggleGroup(sg.id)}
                    style={{ display:'flex', alignItems:'center', gap:10, marginBottom:collapsedGroups[sg.id]?0:14, width:'100%', background:'none', border:'none', cursor:'pointer', padding:'4px 0', textAlign:'left' }}>
                    <span style={{ fontSize:8, color:'var(--ink-4)', display:'inline-block', transition:'transform 0.15s', transform:collapsedGroups[sg.id]?'rotate(0deg)':'rotate(90deg)' }}>▶</span>
                    <div style={{ flex:1 }}>
                    <span title={sg.cyber} style={{ fontSize:13, fontFamily:'var(--font-display)', fontWeight:600, fontStyle:'italic', color:'var(--ink-2)' }}>{sg.label}</span>
                    </div>
                    <span style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{sgBooks.length}</span>
                  </button>
                  {!collapsedGroups[sg.id] && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
                      {sgBooks.map(b => (
                        <div key={b.id} style={{ display:'flex', flexDirection:'column', gap:5, width:120 }}>
                          <BookCard book={b} status={st} onClick={()=>onEdit(b)} />
                          <div style={{ fontSize:11, color:'var(--ink)', fontFamily:'var(--font-display)', fontStyle:'italic', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.title}</div>
                          <div style={{ fontSize:10, color:'var(--ink-4)', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.author}</div>
                          <StarDisplay rating={b.rating} />
                          <div style={{ fontSize:8 }}><GlitchCallNum id={b.id} /></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'70px 0', color:'var(--ink-4)' }}>
            <div style={{ fontSize:44, opacity:0.08, marginBottom:14, fontFamily:'var(--font-display)', lineHeight:1 }}>◌</div>
            <div style={{ fontSize:13, fontStyle:'italic', lineHeight:1.85 }}>
              {search?'No volumes match this catalogue search. The record is silent.':<>Your library is empty.<br/><span style={{ fontSize:10, fontFamily:'var(--font-mono)', fontStyle:'normal', opacity:0.5, letterSpacing:'0.06em' }}>+ Add book to begin the collection.</span></>}
            </div>
          </div>
        )}
      </div>

      {showGroupManager && <GroupManager groups={groups} books={books} onUpdate={onUpdateGroups} onClose={()=>setShowGroupManager(false)} />}
    </div>
  );
}

function StatusPill({ label, count, active, color, bg, onClick }) {
  return (
    <button onClick={onClick}
      style={{ fontSize:9, padding:'2px 9px', borderRadius:2, border:`1px solid ${active?color:'var(--paper-3)'}`, background:active?bg+'44':'transparent', color:active?color:'var(--ink-3)', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:4 }}>
      {label} <span style={{ opacity:0.7 }}>{count}</span>
    </button>
  );
}
