import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SimpleEditor from './SimpleEditor';
import { getEvidenceProfile } from '../utils/evidenceProfile';
import { getLibrarianNotes } from '../data/archivistQuotes';
import LogCaptureModal from './LogCaptureModal';

const RULED = 'repeating-linear-gradient(transparent, transparent 24px, rgba(100,80,50,0.055) 24px, rgba(100,80,50,0.055) 25px)';

// Subject codes from id
function subjectCode(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return `MU-${String(Math.abs(h % 9999) + 1).padStart(4,'0')}`;
}

// Status config
const STATUS_CONFIG = {
  nascent:      { label:'NASCENT',      color:'#8a8680', bg:'#f2f0ec', desc:'Inquiry opened — evidence gathering' },
  active:       { label:'ACTIVE',       color:'#2a4a7a', bg:'#e8eff8', desc:'Investigation in progress'           },
  synthesising: { label:'SYNTHESISING', color:'#b07d28', bg:'#faf0dc', desc:'Drawing conclusions from evidence'   },
  concluded:    { label:'CONCLUDED',    color:'#2a6a4a', bg:'#e4f4ec', desc:'Thesis established'                  },
};

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ fontSize: 8, padding: '2px 9px', borderRadius: 2, border: '1px solid var(--paper-3)', color: copied ? 'var(--green)' : 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em' }}>
      {copied ? '✓' : 'COPY'}
    </button>
  );
}

// ── Field note card ───────────────────────────────────────────────
function FieldNoteCard({ thought, book, thoughtTypes, onDetach }) {
  const typeInfo = (thoughtTypes||[]).find(t => t.id === thought.type) || { color:'#7a6a52', bg:'#f0e8d8', label: thought.type||'note' };
  const isDark   = document.documentElement.getAttribute('data-theme') === 'dark';
  return (
    <div style={{ background: isDark?'#241e14':'#fefcf5', backgroundImage: RULED, border:`1px solid var(--paper-3)`, borderLeft:`3px solid ${typeInfo.color}`, borderRadius:2, padding:'10px 12px', marginBottom:8, position:'relative', overflow:'hidden', boxShadow:'0 1px 4px rgba(100,70,20,0.07)' }}>
      <div style={{ position:'absolute', top:5, right:7, fontSize:7, color:typeInfo.color, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', opacity:0.6, transform:'rotate(-5deg)', borderBottom:`1px solid ${typeInfo.color}55`, paddingBottom:1 }}>
        {typeInfo.label?.toUpperCase().slice(0,4)}.
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, paddingRight:40, flexWrap:'wrap' }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:book?.color||'#888', flexShrink:0 }} />
        <span style={{ fontSize:10, color:book?.color||'var(--ink-3)', fontStyle:'italic' }}>{book?.title}</span>
        {thought.page && <span style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>p.{thought.page}</span>}
        <button onClick={()=>onDetach(thought.id)} style={{ marginLeft:'auto', fontSize:9, color:'var(--ink-4)', cursor:'pointer', background:'none', border:'none' }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--ink-4)'}>✕</button>
      </div>
      {thought.quote && <blockquote style={{ borderLeft:'2px solid var(--paper-3)', paddingLeft:10, margin:'0 0 6px', fontSize:12, color:'var(--ink-2)', fontStyle:'italic', lineHeight:1.65, background:'none', borderRadius:0 }}>"{thought.quote}"</blockquote>}
      <div style={{ fontSize:13, color:'var(--ink)', lineHeight:1.65 }} dangerouslySetInnerHTML={{ __html: thought.text||'' }} />
    </div>
  );
}

// ── Contradiction card ────────────────────────────────────────────
function ContradictionCard({ item, onDelete, onResolve }) {
  const [resolving, setResolving] = useState(false);
  const [resText, setResText]     = useState('');
  return (
    <div style={{ background:'var(--paper-card)', border:'1px solid #c0392b22', borderLeft:'3px solid #c0392b', borderRadius:2, padding:'10px 12px', marginBottom:8, position:'relative' }}>
      {item.resolution
        ? <div style={{ position:'absolute', top:6, right:8, fontSize:7, color:'#2a6a4a', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', border:'1px solid #2a6a4a44', padding:'1px 6px', borderRadius:2 }}>RESOLVED</div>
        : <div style={{ position:'absolute', top:6, right:8, fontSize:7, color:'#c0392b', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', border:'1px solid #c0392b44', padding:'1px 6px', borderRadius:2, transform:'rotate(-2deg)' }}>DISPUTED</div>
      }
      <div style={{ display:'flex', gap:8, marginBottom:5, paddingRight:70, fontSize:10 }}>
        <span style={{ color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>Source A:</span>
        <span style={{ color:'var(--ink-2)', fontStyle:'italic' }}>{item.sourceA}</span>
        <span style={{ color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>vs.</span>
        <span style={{ color:'var(--ink-2)', fontStyle:'italic' }}>{item.sourceB}</span>
      </div>
      <p style={{ fontSize:13, color:'var(--ink)', lineHeight:1.6, margin:'0 0 6px' }}>{item.claim}</p>
      {item.resolution && <p style={{ fontSize:11, color:'#2a6a4a', lineHeight:1.6, fontStyle:'italic', borderLeft:'2px solid #2a6a4a44', paddingLeft:8, margin:0 }}>{item.resolution}</p>}
      {!item.resolution && !resolving && (
        <div style={{ display:'flex', gap:5, marginTop:5 }}>
          <button onClick={()=>setResolving(true)} style={{ fontSize:9, padding:'2px 8px', borderRadius:2, border:'1px solid #2a6a4a55', color:'#2a6a4a', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>resolve</button>
          <button onClick={()=>onDelete(item.id)} style={{ fontSize:9, padding:'2px 8px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-4)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}
            onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--ink-4)'}>remove</button>
        </div>
      )}
      {resolving && (
        <div style={{ marginTop:8 }}>
          <textarea value={resText} onChange={e=>setResText(e.target.value)} placeholder="How is this resolved? Which source is more credible and why?" rows={2}
            style={{ width:'100%', padding:'5px 8px', fontSize:12, borderRadius:2, resize:'vertical', fontFamily:'var(--font-serif)', border:'1px solid var(--paper-3)', marginBottom:5 }} />
          <div style={{ display:'flex', gap:5 }}>
            <button onClick={()=>{ if(resText.trim()) { onResolve(item.id, resText); setResolving(false); }}} style={{ fontSize:9, padding:'2px 10px', borderRadius:2, background:'#2a6a4a', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>FILE</button>
            <button onClick={()=>setResolving(false)} style={{ fontSize:9, padding:'2px 8px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-4)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main TopicPage ────────────────────────────────────────────────
// ── Quote types ───────────────────────────────────────────────────
const QUOTE_TYPES = {
  defines:      { label: 'Defines',      color: '#2a4a7a', icon: '◈' },
  supports:     { label: 'Supports',     color: '#2e7d5e', icon: '⊕' },
  complicates:  { label: 'Complicates',  color: '#b07d28', icon: '⊛' },
  exemplifies:  { label: 'Exemplifies',  color: '#4a2a6a', icon: '◎' },
  contradicts:  { label: 'Contradicts',  color: '#c0392b', icon: '✕' },
};

function EvidenceTab({ topic, onUpdate, isDark }) {
  const quotes = topic.quotes || [];
  const [adding, setAdding] = useState(false);
  const [draft, setDraft]   = useState({ text: '', attribution: '', gloss: '', type: 'defines', page: '' });

  const addQuote = () => {
    if (!draft.text.trim()) return;
    const q = { id: Date.now().toString(), ...draft, createdAt: new Date().toISOString() };
    onUpdate({ ...topic, quotes: [...quotes, q], updatedAt: new Date().toISOString() });
    setDraft({ text: '', attribution: '', gloss: '', type: 'defines', page: '' });
    setAdding(false);
  };

  const deleteQuote = (id) => {
    onUpdate({ ...topic, quotes: quotes.filter(q => q.id !== id), updatedAt: new Date().toISOString() });
  };

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', background:isDark?'#1a1712':'#faf6ee' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, paddingBottom:10, borderBottom:'1px dashed var(--paper-3)' }}>
        <div>
          <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:3 }}>Evidence · {quotes.length} quote{quotes.length!==1?'s':''}</div>
          <div style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic' }}>The quotes that substantiate this concept. Curate — not everything, the essential.</div>
        </div>
        <button onClick={() => setAdding(a => !a)}
          style={{ fontSize:10, padding:'5px 14px', borderRadius:2, border:'1px solid var(--paper-3)', color:adding?'var(--red)':'var(--ink-3)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.06em' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-2)'; e.currentTarget.style.color='var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--paper-3)'; e.currentTarget.style.color=adding?'var(--red)':'var(--ink-3)'; }}>
          {adding ? '✕ cancel' : '+ quote'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background:isDark?'#211e16':'#f0e8d4', border:'1px solid var(--paper-3)', borderRadius:2, padding:'16px 18px', marginBottom:20 }}>
          <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>File new evidence</div>

          {/* Quote text */}
          <textarea value={draft.text} onChange={e => setDraft(d => ({...d, text: e.target.value}))}
            placeholder="The quote — exact words, exactly as written…"
            rows={4}
            style={{ width:'100%', resize:'vertical', padding:'8px 10px', fontSize:13, fontStyle:'italic', fontFamily:'var(--font-serif)', lineHeight:1.7, border:'1px solid var(--paper-3)', borderRadius:2, background:'transparent', marginBottom:10 }} />

          {/* Attribution + page */}
          <div style={{ display:'flex', gap:10, marginBottom:10 }}>
            <input value={draft.attribution} onChange={e => setDraft(d => ({...d, attribution: e.target.value}))}
              placeholder="Author, Work, Year…"
              style={{ flex:1, padding:'6px 8px', fontSize:11, fontStyle:'italic', borderRadius:2, border:'1px solid var(--paper-3)', background:'transparent' }} />
            <input value={draft.page} onChange={e => setDraft(d => ({...d, page: e.target.value}))}
              placeholder="p. 42"
              style={{ width:70, padding:'6px 8px', fontSize:11, fontFamily:'var(--font-mono)', fontStyle:'normal', borderRadius:2, border:'1px solid var(--paper-3)', background:'transparent' }} />
          </div>

          {/* Gloss */}
          <textarea value={draft.gloss} onChange={e => setDraft(d => ({...d, gloss: e.target.value}))}
            placeholder="Your gloss — one sentence on why this quote matters for this concept…"
            rows={2}
            style={{ width:'100%', resize:'none', padding:'6px 8px', fontSize:11, fontFamily:'var(--font-serif)', lineHeight:1.6, border:'1px solid var(--paper-3)', borderRadius:2, background:'transparent', marginBottom:10 }} />

          {/* Type selector */}
          <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
            {Object.entries(QUOTE_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setDraft(d => ({...d, type:k}))}
                style={{ fontSize:9, padding:'3px 10px', borderRadius:2, border:`1px solid ${draft.type===k?v.color:'var(--paper-3)'}`, background:draft.type===k?v.color+'18':'transparent', color:draft.type===k?v.color:'var(--ink-4)', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em' }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          <button onClick={addQuote}
            style={{ fontSize:10, padding:'6px 18px', borderRadius:2, background:'var(--ink)', color:'var(--paper-card)', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>
            FILE EVIDENCE
          </button>
        </div>
      )}

      {/* Quote list */}
      {quotes.length === 0 && !adding ? (
        <div style={{ textAlign:'center', padding:'40px 0' }}>
          <div style={{ fontSize:28, opacity:0.07, marginBottom:10 }}>❝</div>
          <div style={{ fontSize:12, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.8 }}>
            No evidence filed yet.<br/>
            The quote is where the neural signal becomes an argument.
          </div>
        </div>
      ) : quotes.map((q, i) => {
        const qt = QUOTE_TYPES[q.type] || QUOTE_TYPES.defines;
        return (
          <div key={q.id} style={{ marginBottom:18, padding:'14px 16px', background:isDark?'#1e1b13':'#fefcf5', border:'1px solid var(--paper-3)', borderLeft:`3px solid ${qt.color}`, borderRadius:2, position:'relative' }}>
            {/* Type badge */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:8, padding:'2px 8px', border:`1px solid ${qt.color}44`, borderRadius:2, color:qt.color, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em', textTransform:'uppercase' }}>{qt.icon} {qt.label}</span>
              {q.attribution && <span style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>— {q.attribution}{q.page ? `, ${q.page}` : ''}</span>}
              <button onClick={() => deleteQuote(q.id)}
                style={{ marginLeft:'auto', fontSize:10, color:'var(--ink-4)', background:'none', border:'none', cursor:'pointer', opacity:0.4 }}
                onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.color='var(--red)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='0.4'; e.currentTarget.style.color='var(--ink-4)'; }}>✕</button>
            </div>
            {/* Quote */}
            <div style={{ fontSize:13, fontStyle:'italic', fontFamily:'var(--font-serif)', color:'var(--ink)', lineHeight:1.75, marginBottom:q.gloss?10:0 }}>
              "{q.text}"
            </div>
            {/* Gloss */}
            {q.gloss && (
              <div style={{ fontSize:11, color:'var(--ink-3)', lineHeight:1.6, paddingTop:8, borderTop:'1px dashed var(--paper-3)', fontFamily:'var(--font-serif)' }}>
                {q.gloss}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TopicPage({
  topic, thoughts, books = [], articles = [], allThoughts, thoughtTypes,
  investigations = [], events = [], domains = [], anatomy = [],
  onUpdate, onDelete, onBack, onCreateSubTopic, onViewInvestigation, onAddLog, onReturnToMeta,
}) {
  const [activeTab, setActiveTab]         = useState('record');
  const [editingTitle, setEditingTitle]   = useState(false);
  const [titleDraft, setTitleDraft]       = useState(topic.title);
  const [showAttachPicker, setShowAttachPicker] = useState(false);
  const [attachSearch, setAttachSearch]   = useState('');
  const [showContraForm, setShowContraForm] = useState(false);
  const [newContra, setNewContra]         = useState({ sourceA:'', sourceB:'', claim:'' });
  const [logCapture, setLogCapture]       = useState(null);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const domain = domains.find(d => d.id === topic.domainId) || null;
  const domainColor = domain?.color || 'var(--accent)';

  const [savedAt, setSavedAt] = useState(null);
  const set = (k, v) => {
    onUpdate({ ...topic, [k]: v, updatedAt: new Date().toISOString() });
    setSavedAt(new Date());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const attachedThoughts = thoughts;
  const bookIds   = [...new Set(attachedThoughts.map(t => t.bookId))];
  const byBook    = bookIds.map(bid => ({ book: books.find(b => b.id === bid), thoughts: attachedThoughts.filter(t => t.bookId === bid) }));
  const allSources = [...books, ...articles];
  const unattached = allThoughts.filter(t =>
    !topic.thoughtIds.includes(t.id) &&
    (attachSearch==='' || (t.text||'').toLowerCase().includes(attachSearch.toLowerCase()) || t.topics?.some(tp=>tp.includes(attachSearch.toLowerCase())))
  );

  const handleTitleSave = () => { setEditingTitle(false); if (titleDraft.trim()) onUpdate({...topic, title:titleDraft.trim(), updatedAt:new Date().toISOString()}); };
  const handleDetach = (id) => set('thoughtIds', topic.thoughtIds.filter(tid=>tid!==id));
  const handleAttach = (id) => { set('thoughtIds', [...topic.thoughtIds, id]); setAttachSearch(''); };

  // Contradictions
  const contradictions = topic.contradictions || [];
  const addContradiction = () => {
    if (!newContra.claim.trim()) return;
    set('contradictions', [...contradictions, { id:uuidv4(), ...newContra, createdAt:new Date().toISOString() }]);
    setNewContra({sourceA:'',sourceB:'',claim:''}); setShowContraForm(false);
  };
  const removeContradiction = (id) => set('contradictions', contradictions.filter(c=>c.id!==id));
  const resolveContradiction = (id, resolution) => set('contradictions', contradictions.map(c=>c.id===id?{...c,resolution}:c));

  // Evidence grade from linked books
  const linkedBooks = bookIds.map(id => books.find(b=>b.id===id)).filter(Boolean);
  const evidenceGrade = useMemo(() => {
    if (!linkedBooks.length) return null;
    const profiles = linkedBooks.map(b => getEvidenceProfile({ bookIds:[b.id] }, books));
    const hasPrimary = profiles.some(p=>p.grade==='primary');
    const allSecondary = profiles.every(p=>p.grade==='secondary');
    const hasBare = profiles.some(p=>p.grade==='bare');
    if (hasPrimary && !hasBare) return { grade:'A', color:'#2a6a4a', label:'Well-evidenced' };
    if (allSecondary)           return { grade:'B', color:'#2a4a7a', label:'Secondary sources' };
    if (hasBare)                return { grade:'C', color:'#b07d28', label:'Partial evidence' };
    return { grade:'B', color:'#2a4a7a', label:'Sourced' };
  }, [linkedBooks]);

  // Methodology summary
  const methodologies = [...new Set(linkedBooks.map(b=>b.methodology).filter(Boolean))];

  // Connections — linked investigations, events and anatomy entries
  const linkedInvestigations = investigations.filter(inv =>
    (inv.tags||[]).some(t => topic.title.toLowerCase().includes(t) || t.toLowerCase().includes(topic.title.toLowerCase().slice(0,5))) ||
    (inv.title||'').toLowerCase().includes(topic.title.toLowerCase().slice(0,6))
  );
  const linkedEvents = events.filter(ev =>
    (ev.tags||[]).some(t => topic.title.toLowerCase().includes(t) || t.toLowerCase().includes(topic.title.toLowerCase().slice(0,5)))
  );
  const linkedAnatomy = anatomy.filter(a =>
    (a.topicIds || []).includes(topic.id)
  );

  const code = subjectCode(topic.id);
  const ss = STATUS_CONFIG[topic.status||'nascent'];
  const lastUpdated = new Date(topic.updatedAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});

  // Librarian marginalia — computed from actual data
  const librarianNotes = useMemo(() => getLibrarianNotes({
    topic, thoughts: attachedThoughts, books, investigations, events, topics: [], readingLog: [],
  }), [topic, attachedThoughts, investigations, events]);

  const buildExport = () => {
    const lines = [`SUBJECT FILE — ${topic.title}`, `REF: ${code} · STATUS: ${ss.label}`, ''];
    if (topic.researchQuestion) lines.push('RESEARCH QUESTION:', topic.researchQuestion, '');
    if (topic.summary) lines.push('THESIS:', topic.summary, '');
    if (topic.essay) { const p=topic.essay.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim(); if(p) lines.push('ANALYSIS:', p, ''); }
    if (contradictions.length) { lines.push('CONTESTED POINTS:',''); contradictions.forEach(c=>{ lines.push(`• ${c.claim} (${c.sourceA} vs ${c.sourceB})`); if(c.resolution) lines.push(`  Resolution: ${c.resolution}`); lines.push(''); }); }
    return lines.join('\n');
  };

  const TABS = [
    { id:'record',      label:'◎ The Record'  },
    { id:'sources',     label:'◧ Sources'     },
    { id:'debates',     label:'⊛ Contested'   },
    { id:'connections', label:'↔ Synapses'    },
    { id:'evidence',    label:'❝ Evidence'    },
    { id:'analyst',     label:'✎ The Analyst' },
  ];

  return (
  <>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:isDark?'#18140e':'#f5f0e4', fontFamily:'var(--font-serif)' }}>

      {/* ── SUBJECT FILE HEADER ────────────────────────── */}
      <div style={{ padding:'11px 22px 9px', borderBottom:`2px solid ${domainColor}44`, flexShrink:0, background:isDark?'#1c1914':'#e8dfc8', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', fontSize:72, color:domainColor, opacity:0.05, fontFamily:'var(--font-display)', pointerEvents:'none', userSelect:'none', lineHeight:1 }}>◊</div>

        {/* Top line */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
          <button onClick={onBack}
            style={{ fontSize:8, color:'var(--ink-4)', cursor:'pointer', background:'none', border:'1px solid var(--paper-3)', borderRadius:2, padding:'2px 9px', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em' }}
            onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-2)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='var(--paper-3)'}>
            ← THE STACKS
          </button>
          {onReturnToMeta && (
            <button onClick={onReturnToMeta}
              style={{ fontSize:8, color:'#00ff41', cursor:'pointer', background:'none', border:'1px solid #00ff4133', borderRadius:2, padding:'2px 9px', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='#00ff41'; e.currentTarget.style.background='#00ff4111'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#00ff4133'; e.currentTarget.style.background='none'; }}>
              ← META
            </button>
          )}
          {/* Domain breadcrumb */}
          {domain && (
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:domain.color, flexShrink:0 }} />
              <span style={{ fontSize:8, color:domain.color, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em', opacity:0.9 }}>{domain.name}</span>
            </div>
          )}
          <span style={{ fontSize:8, color:'var(--accent)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', opacity:0.8 }}>{code}</span>
          {topic.parentId && <span style={{ fontSize:7, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', border:'1px solid var(--paper-3)', padding:'0 5px', borderRadius:2, letterSpacing:'0.08em' }}>SUB-FILE</span>}

          <div style={{ flex:1 }} />
          <span style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{lastUpdated}</span>
          <CopyBtn text={buildExport()} />
          {onAddLog && (
            <button onClick={() => setLogCapture({ context: { label: topic.title, sourceType: 'topic', sourceId: topic.id, sourceName: topic.title }, prefill: {} })}
              style={{ fontSize:8, padding:'2px 9px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-3)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent-2)'; e.currentTarget.style.color='var(--accent)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--paper-3)'; e.currentTarget.style.color='var(--ink-3)'; }}>
              → Log
            </button>
          )}
          {onCreateSubTopic && !topic.parentId && (
            <button onClick={()=>onCreateSubTopic(topic.id)} style={{ fontSize:8, padding:'2px 9px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-3)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>+ SUB-FILE</button>
          )}
          <button onClick={()=>{ if(window.confirm('Delete this subject file?')) onDelete(topic.id); }}
            style={{ fontSize:8, padding:'2px 9px', borderRadius:2, border:'1px solid var(--paper-3)', color:'var(--ink-4)', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}
            onMouseEnter={e=>{ e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='var(--red)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.color='var(--ink-4)'; e.currentTarget.style.borderColor='var(--paper-3)'; }}>
            DESTROY
          </button>
        </div>


        {/* Title */}
        {editingTitle ? (
          <input autoFocus value={titleDraft} onChange={e=>setTitleDraft(e.target.value)} onBlur={handleTitleSave} onKeyDown={e=>e.key==='Enter'&&handleTitleSave()}
            style={{ fontSize:20, fontFamily:'var(--font-display)', fontWeight:700, fontStyle:'italic', border:'none', background:'transparent', outline:'1px dashed var(--accent-2)', color:'var(--ink)', width:'100%', letterSpacing:'0.01em' }} />
        ) : (
          <div onClick={()=>setEditingTitle(true)} title="Click to rename"
            style={{ fontSize:20, fontFamily:'var(--font-display)', fontWeight:700, fontStyle:'italic', color:'var(--ink)', cursor:'text', letterSpacing:'0.01em', lineHeight:1.25 }}>
            {topic.title}
          </div>
        )}

        {/* Source dots */}
        {byBook.length > 0 && (
          <div style={{ display:'flex', gap:6, marginTop:6, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em' }}>SOURCES:</span>
            {byBook.map(({book}) => book && (
              <span key={book.id} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:book.color, fontStyle:'italic' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:book.color, boxShadow:`0 0 0 1.5px ${book.color}44` }} />
                {book.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── FILE TABS — folder tab style ──────────────── */}
      <div style={{ display:'flex', alignItems:'flex-end', background:isDark?'#1a1712':'#e0d5c0', paddingLeft:10, paddingTop:5, borderBottom:'1px solid var(--paper-3)', flexShrink:0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            style={{ fontSize:10, padding:'5px 14px 7px', marginRight:2, border:`1px solid ${activeTab===tab.id?'var(--paper-3)':'transparent'}`, borderBottom:'none', borderRadius:'3px 3px 0 0', background:activeTab===tab.id?(isDark?'#1e1c17':'#faf6ee'):'transparent', color:activeTab===tab.id?'var(--ink)':'var(--ink-4)', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em', fontWeight:activeTab===tab.id?600:400, transform:activeTab===tab.id?'none':'translateY(2px)', transition:'all 0.1s' }}>
            {tab.label}
          </button>
        ))}
        {/* Rerum motto + saved indicator in tab bar */}
        <div style={{ marginLeft:'auto', marginRight:12, marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
          {savedAt && <span style={{ fontSize:8, color:'var(--green)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.06em', opacity:0.8 }}>✓ saved</span>}
          <span style={{ fontSize:9, color:'var(--ink-4)', fontStyle:'italic', fontFamily:'var(--font-display)', opacity:0.8 }}>rerum cognoscere causas</span>
        </div>
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────── */}
      {activeTab === 'record' && (
        <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 320px' }}>

          {/* Left — research question, thesis, status, methodology */}
          <div style={{ overflowY:'auto', padding:'20px 24px', borderRight:`1px solid var(--paper-3)`, background:isDark?'#1c1810':'#faf6ee' }}>

            {/* Memo header */}
            <div style={{ display:'flex', gap:12, marginBottom:16, paddingBottom:10, borderBottom:'1px dashed var(--paper-3)', flexWrap:'wrap' }}>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>RE: {topic.title}</div>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>REF: {code}</div>
              <div style={{ marginLeft:'auto', fontSize:8, color:'var(--accent-2)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em' }}>SUBJECT OVERVIEW</div>
            </div>

            {/* Research question */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
                Opening research question
              </div>
              <textarea value={topic.researchQuestion||''} onChange={e=>set('researchQuestion',e.target.value)}
                placeholder="What is the question driving this inquiry? State it before you know the answer — the question is the compass."
                rows={2}
                style={{ width:'100%', resize:'vertical', padding:'7px 10px', fontSize:13, lineHeight:1.7, color:'var(--ink)', border:'1px solid var(--paper-3)', borderRadius:2, background:'transparent', fontFamily:'var(--font-serif)', outline:'none', backgroundImage:RULED, fontStyle:topic.researchQuestion?'normal':'italic' }} />
            </div>

            {/* Thesis */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
                Working thesis — current best answer
              </div>
              <textarea value={topic.summary||''} onChange={e=>set('summary',e.target.value)}
                placeholder="The core idea this subject is circling — rerum cognoscere causas…"
                rows={2}
                style={{ width:'100%', resize:'vertical', padding:'7px 10px', fontSize:13, lineHeight:1.7, color:'var(--ink-2)', border:'1px solid var(--paper-3)', borderRadius:2, background:'transparent', fontFamily:'var(--font-serif)', outline:'none', backgroundImage:RULED, fontStyle:'italic' }} />
            </div>

            {/* Status selector */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>Stage of inquiry</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                  <button key={k} onClick={()=>set('status',k)}
                    style={{ fontSize:9, padding:'3px 12px', borderRadius:2, border:`2px solid ${(topic.status||'nascent')===k?v.color:'var(--paper-3)'}`, background:(topic.status||'nascent')===k?v.color+'18':'transparent', color:(topic.status||'nascent')===k?v.color:'var(--ink-4)', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em', transform:(topic.status||'nascent')===k?'rotate(-2deg)':'none', transition:'all 0.1s' }}>
                    {v.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:10, color:'var(--ink-4)', fontStyle:'italic', marginTop:5 }}>{ss.desc}</div>
            </div>

            {/* Methodology notes */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>Methodological notes</div>
              {methodologies.length > 0 && (
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
                  {methodologies.map(m => <span key={m} style={{ fontSize:9, padding:'2px 8px', borderRadius:2, background:'var(--paper-2)', color:'var(--ink-3)', fontFamily:'var(--font-mono)', fontStyle:'normal', border:'1px solid var(--paper-3)', letterSpacing:'0.04em' }}>{m}</span>)}
                </div>
              )}
              <textarea value={topic.methodologyNotes||''} onChange={e=>set('methodologyNotes',e.target.value)}
                placeholder="Are there methodological blind spots in your sources? Schools of thought not represented? This is where to note them."
                rows={2}
                style={{ width:'100%', resize:'vertical', padding:'6px 10px', fontSize:12, lineHeight:1.65, color:'var(--ink-3)', border:'1px solid var(--paper-3)', borderRadius:2, background:'transparent', fontFamily:'var(--font-serif)', outline:'none', fontStyle:'italic' }} />
            </div>
          </div>

          {/* Right — evidence grade + contradictions */}
          <div style={{ overflowY:'auto', padding:'20px 18px', background:isDark?'#1a1712':'#e8dfc8' }}>

            {/* Evidence grade card */}
            {evidenceGrade ? (
              <div style={{ background:'var(--paper-card)', border:`1px solid ${evidenceGrade.color}44`, borderRadius:2, padding:'14px 16px', marginBottom:16, boxShadow:'1px 2px 5px rgba(100,70,20,0.08)' }}>
                <div style={{ fontSize:8, color:evidenceGrade.color, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10, paddingBottom:7, borderBottom:`1px dashed ${evidenceGrade.color}44` }}>Evidence quality</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:evidenceGrade.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 2px 8px ${evidenceGrade.color}44` }}>
                    <span style={{ fontSize:18, fontWeight:900, color:'#fff', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>{evidenceGrade.grade}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:evidenceGrade.color, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em', textTransform:'uppercase' }}>{evidenceGrade.label}</div>
                    <div style={{ fontSize:10, color:'var(--ink-4)', marginTop:3, lineHeight:1.55 }}>{linkedBooks.length} source{linkedBooks.length!==1?'s':''} · {attachedThoughts.length} field note{attachedThoughts.length!==1?'s':''}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background:'var(--paper-card)', border:'1px solid var(--paper-3)', borderRadius:2, padding:'12px 14px', marginBottom:16, fontSize:11, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.6 }}>
                No sources linked yet. Add field notes to assess evidence quality.
              </div>
            )}

            {/* Contradictions */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', textTransform:'uppercase', flex:1 }}>
                  ⊘ Contested points ({contradictions.length})
                </div>
                <button onClick={()=>setShowContraForm(s=>!s)} style={{ fontSize:8, padding:'2px 8px', borderRadius:2, border:'1px solid #c0392b44', color:'#c0392b', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>
                  {showContraForm?'cancel':'+ dispute'}
                </button>
              </div>

              {showContraForm && (
                <div style={{ background:'var(--paper-card)', border:'1px solid #c0392b22', borderRadius:2, padding:'10px 12px', marginBottom:10 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:6 }}>
                    <input value={newContra.sourceA} onChange={e=>setNewContra(c=>({...c,sourceA:e.target.value}))} placeholder="Source A…" style={{ padding:'5px 7px', fontSize:11, borderRadius:2, fontStyle:'italic' }} />
                    <input value={newContra.sourceB} onChange={e=>setNewContra(c=>({...c,sourceB:e.target.value}))} placeholder="Source B…" style={{ padding:'5px 7px', fontSize:11, borderRadius:2, fontStyle:'italic' }} />
                  </div>
                  <textarea value={newContra.claim} onChange={e=>setNewContra(c=>({...c,claim:e.target.value}))} placeholder="What is disputed between them?" rows={2}
                    style={{ width:'100%', padding:'5px 7px', fontSize:12, borderRadius:2, resize:'vertical', fontFamily:'var(--font-serif)', border:'1px solid var(--paper-3)', marginBottom:6 }} />
                  <button onClick={addContradiction} style={{ fontSize:9, padding:'3px 14px', borderRadius:2, background:'#c0392b', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.06em' }}>RECORD DISPUTE</button>
                </div>
              )}

              {contradictions.length === 0 && !showContraForm ? (
                <div style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.65, paddingLeft:8, borderLeft:'2px solid var(--paper-3)' }}>No contested points recorded. Disagreement between sources is evidence — note it here.</div>
              ) : contradictions.map(item => (
                <ContradictionCard key={item.id} item={item} onDelete={removeContradiction} onResolve={resolveContradiction} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTESTED TAB ───────────────────────────────── */}
      {activeTab === 'debates' && (
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', background:isDark?'#1a1712':'#faf6ee' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, paddingBottom:10, borderBottom:'1px dashed var(--paper-3)' }}>
            <div>
              <div style={{ fontSize:8, color:'#c0392b', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:3 }}>⊘ Contested — {contradictions.length} dispute{contradictions.length!==1?'s':''}</div>
              <div style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic' }}>Where sources disagree. Disagreement is evidence — file it here.</div>
            </div>
            <button onClick={()=>setShowContraForm(s=>!s)}
              style={{ fontSize:9, padding:'4px 12px', borderRadius:2, border:'1px solid #c0392b44', color:'#c0392b', background:'transparent', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em' }}
              onMouseEnter={e=>e.currentTarget.style.background='#c0392b11'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              {showContraForm ? 'cancel' : '+ dispute'}
            </button>
          </div>

          {showContraForm && (
            <div style={{ background:isDark?'#211810':'#fdf0ec', border:'1px solid #c0392b22', borderRadius:2, padding:'14px 16px', marginBottom:16 }}>
              <div style={{ fontSize:8, color:'#c0392b', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Record a dispute</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
                <input value={newContra.sourceA} onChange={e=>setNewContra(c=>({...c,sourceA:e.target.value}))} placeholder="Source A…" style={{ padding:'6px 8px', fontSize:11, borderRadius:2, fontStyle:'italic', border:'1px solid var(--paper-3)', background:'transparent' }} />
                <input value={newContra.sourceB} onChange={e=>setNewContra(c=>({...c,sourceB:e.target.value}))} placeholder="Source B…" style={{ padding:'6px 8px', fontSize:11, borderRadius:2, fontStyle:'italic', border:'1px solid var(--paper-3)', background:'transparent' }} />
              </div>
              <textarea value={newContra.claim} onChange={e=>setNewContra(c=>({...c,claim:e.target.value}))} placeholder="What is disputed between them?" rows={3}
                style={{ width:'100%', padding:'6px 8px', fontSize:12, borderRadius:2, resize:'vertical', fontFamily:'var(--font-serif)', border:'1px solid var(--paper-3)', background:'transparent', marginBottom:8 }} />
              <button onClick={addContradiction} style={{ fontSize:9, padding:'4px 16px', borderRadius:2, background:'#c0392b', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>RECORD DISPUTE</button>
            </div>
          )}

          {contradictions.length === 0 && !showContraForm ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ fontSize:28, opacity:0.07, marginBottom:10 }}>⊘</div>
              <div style={{ fontSize:12, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.8 }}>
                No contested points recorded yet.<br/>
                Disagreement between sources is evidence — note it here.
              </div>
            </div>
          ) : contradictions.map(item => (
            <ContradictionCard key={item.id} item={item} onDelete={removeContradiction} onResolve={resolveContradiction} />
          ))}
        </div>
      )}

      {/* ── FIELD NOTES TAB ─────────────────────────────── */}
      {activeTab === 'sources' && (
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', background:isDark?'#18140e':'#f5f0e4' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase' }}>
              Field notes from sources — {attachedThoughts.length} note{attachedThoughts.length!==1?'s':''}
            </div>
            <button onClick={()=>setShowAttachPicker(p=>!p)}
              style={{ fontSize:9, padding:'3px 10px', borderRadius:2, background:showAttachPicker?'var(--accent)':'transparent', color:showAttachPicker?'var(--paper-card)':'var(--ink-3)', border:'1px solid var(--paper-3)', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.06em' }}>
              {showAttachPicker?'DONE':'+ ATTACH NOTE'}
            </button>
          </div>

          {showAttachPicker && (
            <div style={{ background:'var(--paper-2)', border:'1px solid var(--paper-3)', borderRadius:2, padding:'10px 12px', marginBottom:16, maxWidth:600 }}>
              <input autoFocus value={attachSearch} onChange={e=>setAttachSearch(e.target.value)} placeholder="Search field notes…"
                style={{ width:'100%', padding:'5px 8px', fontSize:12, marginBottom:8, borderRadius:2, fontStyle:'italic' }} />
              <div style={{ maxHeight:200, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                {unattached.slice(0,15).map(t => {
                  const b = allSources.find(bk=>bk.id===t.bookId);
                  return (
                    <div key={t.id} onClick={()=>handleAttach(t.id)}
                      style={{ padding:'6px 10px', borderRadius:2, cursor:'pointer', background:'var(--paper-card)', border:'1px solid var(--paper-3)', fontSize:12, color:'var(--ink)', lineHeight:1.5 }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-2)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--paper-3)'}>
                      <span style={{ color:b?.color, fontSize:10, fontStyle:'italic', display:'block', marginBottom:2 }}>{b?.title}</span>
                      {(t.text||'').replace(/<[^>]+>/g,'').slice(0,100)}{(t.text||'').length>100?'…':''}
                    </div>
                  );
                })}
                {unattached.length===0 && <div style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic' }}>No further notes available.</div>}
              </div>
            </div>
          )}

          {byBook.length === 0 ? (
            <div style={{ textAlign:'center', padding:'50px 0', color:'var(--ink-4)' }}>
              <div style={{ fontSize:36, opacity:0.08, marginBottom:12, fontFamily:'var(--font-display)', lineHeight:1 }}>◌</div>
              <div style={{ fontSize:13, fontStyle:'italic', lineHeight:1.8 }}>No field notes attached yet.<br/><span style={{ fontSize:10, fontFamily:'var(--font-mono)', fontStyle:'normal', opacity:0.5 }}>Use + ATTACH NOTE to file evidence.</span></div>
            </div>
          ) : (
            <div style={{ maxWidth:720 }}>
              {byBook.map(({book, thoughts:bThoughts}) => book && (
                <div key={book.id} style={{ marginBottom:24 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10, paddingBottom:6, borderBottom:`2px solid ${book.color}33` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:book.color, boxShadow:`0 0 0 2px ${book.color}33` }} />
                    <span style={{ fontSize:13, fontWeight:600, color:book.color, fontStyle:'italic', fontFamily:'var(--font-display)', flex:1 }}>{book.title}</span>
                    {book.author && <span style={{ fontSize:10, color:'var(--ink-4)', fontStyle:'italic' }}>{book.author}</span>}
                    {book.sourceType && <span style={{ fontSize:7, color:book.color, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em', opacity:0.7, border:`1px solid ${book.color}44`, padding:'1px 5px', borderRadius:2 }}>{book.sourceType.toUpperCase()}</span>}
                  </div>
                  {bThoughts.map(t => <FieldNoteCard key={t.id} thought={t} book={book} thoughtTypes={thoughtTypes} onDetach={handleDetach} />)}
                </div>
              ))}

              {/* ── Librarian marginalia ── */}
              {librarianNotes.length > 0 && (
                <div style={{ marginTop:28, borderTop:'1px dashed var(--paper-3)', paddingTop:16 }}>
                  <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                    <span>◈ The Librarian</span>
                    <span style={{ opacity:0.4, fontSize:7 }}>— observations from the record</span>
                  </div>
                  {librarianNotes.map((note, i) => (
                    <div key={i} style={{ fontSize:11, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.7, marginBottom:6, paddingLeft:10, borderLeft:'1px solid var(--paper-3)' }}>
                      {note}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CONNECTIONS TAB ─────────────────────────────── */}
      {activeTab === 'connections' && (
        <>
          <div style={{ flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 1fr', background:isDark?'#18140e':'#f5f0e4' }}>

            {/* Linked investigations */}
            <div style={{ overflowY:'auto', padding:'20px 24px', borderRight:'1px solid var(--paper-3)' }}>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14, paddingBottom:8, borderBottom:'1px dashed var(--paper-3)' }}>
                ⊛ Related investigations — {linkedInvestigations.length}
              </div>
              {linkedInvestigations.length === 0 ? (
                <div style={{ fontSize:12, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.75, paddingLeft:8, borderLeft:'2px solid var(--paper-3)' }}>
                  No investigations share tags with this subject yet.<br/>
                  <span style={{ fontSize:10, fontFamily:'var(--font-mono)', fontStyle:'normal', opacity:0.6 }}>Tag your investigations to surface connections.</span>
                </div>
              ) : linkedInvestigations.map(inv => (
                <div key={inv.id}
                  style={{ background:'var(--paper-card)', border:'1px solid var(--paper-3)', borderLeft:'3px solid var(--accent)', borderRadius:2, padding:'10px 13px', marginBottom:8, cursor:'pointer', boxShadow:'0 1px 4px rgba(100,70,20,0.07)', transition:'transform 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateX(2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                    {inv.caseNumber && <span style={{ fontSize:8, color:'var(--accent)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.09em' }}>{inv.caseNumber}</span>}
                    <span style={{ fontSize:9, padding:'1px 6px', borderRadius:2, background:inv.status==='active'?'#e4f4ec':'var(--paper-2)', color:inv.status==='active'?'#2a6a4a':'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>{inv.status?.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)', fontFamily:'var(--font-display)', fontStyle:'italic', lineHeight:1.3, marginBottom:inv.summary?4:0 }}>{inv.title}</div>
                  {inv.summary && <p style={{ fontSize:11, color:'var(--ink-3)', lineHeight:1.55, fontStyle:'italic', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{inv.summary}</p>}
                </div>
              ))}
            </div>

            {/* Linked timeline events */}
            <div style={{ overflowY:'auto', padding:'20px 24px' }}>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14, paddingBottom:8, borderBottom:'1px dashed var(--paper-3)' }}>
                ↔ Related timeline events — {linkedEvents.length}
              </div>
              {linkedEvents.length === 0 ? (
                <div style={{ fontSize:12, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.75, paddingLeft:8, borderLeft:'2px solid var(--paper-3)' }}>
                  No timeline events share tags with this subject yet.<br/>
                  <span style={{ fontSize:10, fontFamily:'var(--font-mono)', fontStyle:'normal', opacity:0.6 }}>Tag your events to surface connections.</span>
                </div>
              ) : linkedEvents.map(ev => {
                const evBooks = books.filter(b=>(ev.bookIds||[]).includes(b.id));
                return (
                  <div key={ev.id} style={{ background:'var(--paper-card)', border:'1px solid var(--paper-3)', borderLeft:'3px solid var(--amber)', borderRadius:2, padding:'10px 13px', marginBottom:8, boxShadow:'0 1px 4px rgba(100,70,20,0.07)', transition:'transform 0.1s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateX(2px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                    <div style={{ fontSize:9, color:'var(--amber)', fontFamily:'var(--font-mono)', fontStyle:'normal', marginBottom:3 }}>{ev.dateRaw}</div>
                    <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)', fontFamily:'var(--font-display)', fontStyle:'italic', lineHeight:1.3, marginBottom:4 }}>{ev.title}</div>
                    {evBooks.length > 0 && (
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {evBooks.map(b=><span key={b.id} style={{ display:'flex', alignItems:'center', gap:3, fontSize:9, color:b.color, fontStyle:'italic' }}><div style={{ width:4, height:4, borderRadius:'50%', background:b.color }} />{b.title}</span>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {linkedAnatomy.length > 0 && (
            <div style={{ padding:'16px 24px', borderTop:'1px solid var(--paper-3)', background:isDark?'#18140e':'#f5f0e4', flexShrink:0 }}>
              <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12, paddingBottom:8, borderBottom:'1px dashed var(--paper-3)' }}>
                ◈ Teatro Anatomico — {linkedAnatomy.length} linked entr{linkedAnatomy.length === 1 ? 'y' : 'ies'}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {linkedAnatomy.map(a => {
                  const typeColor = a.type === 'concept' ? '#2a4a7a' : a.type === 'scholar' ? '#4a2a6a' : '#1a5c3a';
                  const typeIcon  = a.type === 'concept' ? '◈' : a.type === 'scholar' ? '⊕' : '✦';
                  return (
                    <div key={a.id} style={{ background:'var(--paper-card)', border:'1px solid var(--paper-3)', borderLeft:`3px solid ${typeColor}`, borderRadius:2, padding:'8px 12px', minWidth:160, maxWidth:280 }}>
                      <div style={{ fontSize:8, color:typeColor, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:3 }}>{typeIcon} {a.type}</div>
                      <div style={{ fontSize:11, fontFamily:'var(--font-serif)', fontWeight:600, color:'var(--ink)', letterSpacing:'0.02em', textTransform:'uppercase', marginBottom:a.definition?4:0 }}>{a.title}</div>
                      {a.definition && <div style={{ fontSize:10, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.5, marginBottom:a.keyQuote?6:0 }}>{a.definition.slice(0,80)}{a.definition.length>80?'…':''}</div>}
                      {a.keyQuote && (
                        <div style={{ fontSize:10, color:'var(--ink-3)', fontStyle:'italic', lineHeight:1.55, borderLeft:`2px solid ${typeColor}44`, paddingLeft:7, marginTop:4 }}>
                          "{a.keyQuote.slice(0,100)}{a.keyQuote.length>100?'…':''}"
                          {a.keyQuoteAttribution && <div style={{ fontSize:8, color:typeColor, fontFamily:'var(--font-mono)', fontStyle:'normal', marginTop:3, opacity:0.7 }}>{a.keyQuoteAttribution}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── EVIDENCE TAB ────────────────────────────────── */}
      {activeTab === 'evidence' && (
        <EvidenceTab topic={topic} onUpdate={onUpdate} isDark={isDark} />
      )}

      {/* ── ANALYSIS TAB ────────────────────────────────── */}
      {activeTab === 'analyst' && (
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', background:isDark?'#1c1810':'#faf6ee' }}>

          {/* Memo header */}
          <div style={{ display:'flex', gap:14, marginBottom:16, paddingBottom:10, borderBottom:'1px dashed var(--paper-3)', flexWrap:'wrap' }}>
            <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>RE: {topic.title}</div>
            <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>DATE: {lastUpdated}</div>
            <div style={{ marginLeft:'auto', fontSize:8, color:'var(--accent-2)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em' }}>ANALYSIS FILE — EYES ONLY</div>
          </div>

          {/* Argument scaffold */}
          <div style={{ background:isDark?'#1a1712':'#ede5d0', border:'1px solid var(--paper-3)', borderRadius:2, padding:'16px 18px', marginBottom:20 }}>
            <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:12 }}>
              Argument scaffold — the logical chain
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr auto 1fr auto 1fr', gap:6, alignItems:'center' }}>
              {['Observation','→','Claim','→','Evidence','→','Conclusion'].map((step, i) => {
                const isArrow = step==='→';
                if (isArrow) return <div key={i} style={{ textAlign:'center', fontSize:16, color:'var(--paper-3)' }}>→</div>;
                const fieldKey = `scaffold_${step.toLowerCase()}`;
                return (
                  <div key={i}>
                    <div style={{ fontSize:7, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>{step}</div>
                    <textarea value={topic[fieldKey]||''} onChange={e=>set(fieldKey,e.target.value)}
                      placeholder={step==='Observation'?'What do the sources show?':step==='Claim'?'What do you assert?':step==='Evidence'?'Which evidence supports this?':'What follows?'}
                      rows={3}
                      style={{ width:'100%', resize:'vertical', padding:'6px 8px', fontSize:11, borderRadius:2, background:isDark?'#241e14':'#fefcf5', border:'1px solid var(--paper-3)', color:'var(--ink)', fontFamily:'var(--font-serif)', lineHeight:1.6, outline:'none' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Long-form essay */}
          <div>
            <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>
              Extended analysis — rerum cognoscere causas
            </div>
            <SimpleEditor value={topic.essay||''} onChange={val=>set('essay',val)} placeholder="Develop your thinking here — let the evidence guide you. The goal is to know the causes of things." />
          </div>
        </div>
      )}
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
