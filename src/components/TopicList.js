import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_DOMAINS, getHeat, heatColor, getDensityDots } from '../data/domains';

// ── Librarian floating note ───────────────────────────────────────
// Appears when a domain is selected, delivers one observation, fades
function LibrarianNote({ domain, topics, investigations, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [note, setNote]       = useState('');

  useEffect(() => {
    if (!domain) return;
    const domainTopics = topics.filter(t => t.domainId === domain.id);
    const notes = [];

    // Generate a data-aware observation
    const hotTopics  = domainTopics.filter(t => getHeat(t.updatedAt) === 'hot');
    const coldTopics = domainTopics.filter(t => getHeat(t.updatedAt) === 'cold' && t.updatedAt);
    const deepTopics = domainTopics.filter(t => (t.thoughtIds||[]).length > 10);
    const withContradictions = domainTopics.filter(t => (t.contradictions||[]).filter(c=>!c.resolution).length > 0);
    const linkedInv  = investigations.filter(i => (i.tags||[]).some(tag => domainTopics.some(t => t.title?.toLowerCase().includes(tag))));

    if (domainTopics.length === 0) {
      notes.push(`The record for ${domain.name} is empty. The Librarian notes: an empty domain is an open question.`);
    } else if (hotTopics.length > 0) {
      notes.push(`${hotTopics.length} subject file${hotTopics.length!==1?'s':''} in ${domain.name} edited today. The record is live.`);
    } else if (withContradictions.length > 0) {
      notes.push(`${withContradictions.length} subject file${withContradictions.length!==1?'s':''} in ${domain.name} contain unresolved scholarly controversies.`);
    } else if (coldTopics.length > domainTopics.length * 0.6) {
      notes.push(`The majority of ${domain.name} files have not been updated in over 30 days. The Librarian notes this without comment.`);
    } else if (deepTopics.length > 0) {
      notes.push(`${deepTopics.length} densely evidenced file${deepTopics.length!==1?'s':''} in ${domain.name}. The record suggests concentrated work.`);
    } else if (linkedInv.length > 0) {
      notes.push(`${linkedInv.length} active investigation${linkedInv.length!==1?'s':''} draw from ${domain.name}. The scholarly record and the analytical record are in dialogue.`);
    } else {
      notes.push(`${domain.name} — ${domainTopics.length} subject file${domainTopics.length!==1?'s':''}. The record is available for review.`);
    }

    setNote(notes[0]);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [domain?.id]);

  if (!visible || !note) return null;

  return (
    <div style={{ position:'absolute', bottom:12, left:12, right:12, zIndex:100,
      background:'var(--paper-card)', border:'1px solid var(--paper-3)',
      borderLeft:`3px solid var(--accent-2)`, borderRadius:2, padding:'10px 12px',
      boxShadow:'0 4px 20px rgba(0,0,0,0.15)',
      animation:'slideUp 0.25s ease',
    }}>
      <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', marginBottom:5, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span>◈ THE LIBRARIAN</span>
        <button onClick={() => { setVisible(false); onDismiss?.(); }}
          style={{ fontSize:10, color:'var(--ink-4)', background:'none', border:'none', cursor:'pointer', lineHeight:1 }}>✕</button>
      </div>
      <div style={{ fontSize:11, color:'var(--ink-3)', fontStyle:'italic', lineHeight:1.65 }}>{note}</div>
    </div>
  );
}

// ── Domain panel (left) ───────────────────────────────────────────
function DomainPanel({ domains, topics, selectedId, onSelect, onManage, collapsed, onToggleCollapse }) {
  const topicCount = (dId) => topics.filter(t => t.domainId === dId).length;
  const noteCount  = (dId) => topics.filter(t => t.domainId === dId)
    .reduce((acc, t) => acc + (t.thoughtIds||[]).length, 0);

  return (
    <div style={{ width: collapsed ? 36 : 180, flexShrink:0, borderRight:'1px solid var(--paper-3)', display:'flex', flexDirection:'column', height:'100%', transition:'width 0.2s', overflow:'hidden', background:'var(--paper-2)', position:'relative' }}>

      {/* Header */}
      <div style={{ padding: collapsed?'10px 4px':'10px 12px', borderBottom:'1px solid var(--paper-3)', display:'flex', alignItems:'center', justifyContent: collapsed?'center':'space-between', flexShrink:0 }}>
        {!collapsed && <div style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', textTransform:'uppercase' }}>Domains</div>}
        <button onClick={onToggleCollapse} title={collapsed?'Expand domains':'Collapse domains'}
          style={{ fontSize:10, color:'var(--ink-4)', background:'none', border:'none', cursor:'pointer', opacity:0.6, padding:2 }}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Domain list */}
      <div style={{ flex:1, overflowY:'auto', padding: collapsed?'4px 0':'6px 0' }}>
        {/* Uncategorised first if topics exist */}
        {topics.filter(t => !t.domainId).length > 0 && (
          <button onClick={() => onSelect('__uncategorised')}
            title="Uncategorised"
            style={{ display:'flex', alignItems:'center', gap: collapsed?0:8, width:'100%', padding: collapsed?'6px':'6px 12px', background: selectedId==='__uncategorised'?'var(--nav-active-bg)':'transparent', border:'none', borderLeft: selectedId==='__uncategorised'?'2px solid var(--ink-4)':'2px solid transparent', cursor:'pointer', textAlign:'left', justifyContent: collapsed?'center':'flex-start' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--ink-4)', flexShrink:0, opacity:0.4 }} />
            {!collapsed && <>
              <span style={{ fontSize:11, color:'var(--ink-4)', fontFamily:'var(--font-serif)', fontStyle:'italic', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Uncategorised</span>
              <span style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', opacity:0.6 }}>{topics.filter(t=>!t.domainId).length}</span>
            </>}
          </button>
        )}

        {domains.map(d => {
          const count = topicCount(d.id);
          const nCount = noteCount(d.id);
          const isSelected = selectedId === d.id;
          return (
            <button key={d.id} onClick={() => onSelect(d.id)}
              title={d.name}
              style={{ display:'flex', alignItems:'center', gap: collapsed?0:8, width:'100%', padding: collapsed?'7px':'6px 12px', background: isSelected?'var(--nav-active-bg)':'transparent', border:'none', borderLeft: isSelected?`2px solid ${d.color}`:'2px solid transparent', cursor:'pointer', textAlign:'left', justifyContent: collapsed?'center':'flex-start', transition:'all 0.1s' }}
              onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background='var(--nav-hover-bg)'; }}
              onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background='transparent'; }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:d.color, flexShrink:0, boxShadow: isSelected?`0 0 0 2px ${d.color}44`:undefined }} />
              {!collapsed && <>
                <span style={{ fontSize:11, color: isSelected?'var(--ink)':'var(--ink-2)', fontFamily:'var(--font-serif)', fontStyle:'italic', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight: isSelected?500:400 }}>{d.name}</span>
                <span style={{ fontSize:8, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', opacity:0.6 }}>{count}</span>
              </>}
            </button>
          );
        })}
      </div>

      {/* Manage button */}
      {!collapsed && (
        <div style={{ padding:'8px 12px', borderTop:'1px solid var(--paper-3)', flexShrink:0 }}>
          <button onClick={onManage}
            style={{ fontSize:9, color:'var(--ink-4)', background:'none', border:'1px dashed var(--paper-3)', borderRadius:2, cursor:'pointer', width:'100%', padding:'4px 0', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.05em' }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent-2)'; e.currentTarget.style.color='var(--accent)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--paper-3)'; e.currentTarget.style.color='var(--ink-4)'; }}>
            ⊙ MANAGE DOMAINS
          </button>
        </div>
      )}
    </div>
  );
}

// ── Topic row ─────────────────────────────────────────────────────
function TopicRow({ topic, depth=0, children, onClick, isActive, domain }) {
  const [hovered, setHovered] = useState(false);
  const heat   = getHeat(topic.updatedAt);
  const hColor = heatColor(heat);
  const notes  = (topic.thoughtIds||[]).length;
  const { filled, empty } = getDensityDots(notes);
  const contradictions = (topic.contradictions||[]).filter(c=>!c.resolution).length;
  const color  = domain?.color || 'var(--accent)';

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onClick(topic)}
        style={{ display:'flex', alignItems:'center', gap:6, padding:`5px 12px 5px ${14 + depth*14}px`, cursor:'pointer', background: isActive?'var(--nav-active-bg)':hovered?'var(--nav-hover-bg)':'transparent', borderLeft: isActive?`2px solid ${color}`:'2px solid transparent', transition:'all 0.1s', position:'relative' }}>

        {/* Depth indicator */}
        {depth > 0 && <div style={{ position:'absolute', left: 14+(depth-1)*14, top:0, bottom:0, width:1, background:'var(--paper-3)' }} />}

        {/* Title */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, color: isActive?'var(--ink)':'var(--ink-2)', fontFamily:'var(--font-serif)', fontStyle:'italic', fontWeight: isActive?500:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.3 }}>
            {topic.title || 'Untitled'}
          </div>
          {topic.summary && hovered && (
            <div style={{ fontSize:10, color:'var(--ink-4)', fontStyle:'normal', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {topic.summary.slice(0,60)}{topic.summary.length>60?'…':''}
            </div>
          )}
        </div>

        {/* Indicators */}
        <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
          {/* Density dots */}
          <span style={{ fontSize:7, letterSpacing:1, color:'var(--ink-4)' }}>
            {'●'.repeat(filled)}{'○'.repeat(empty)}
          </span>
          {/* Contradiction count */}
          {contradictions > 0 && (
            <span style={{ fontSize:8, color:'#c0392b', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>◈{contradictions}</span>
          )}
          {/* Heat */}
          <span style={{ fontSize:8, color:hColor, fontFamily:'var(--font-mono)', fontStyle:'normal', opacity:heat==='cold'?0.3:0.8 }}>
            {heat==='hot'?'↑':heat==='warm'?'·':heat==='cool'?'–':''}
          </span>
        </div>
      </div>

      {/* Children */}
      {children && children.length > 0 && (
        <div>{children}</div>
      )}
    </div>
  );
}

// ── Domain Manager modal ──────────────────────────────────────────
function DomainManager({ domains, onSave, onClose }) {
  const [items, setItems] = useState(domains.map(d=>({...d})));
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#5a5a5a');

  const add = () => {
    if (!newName.trim()) return;
    setItems(p => [...p, { id:uuidv4(), name:newName.trim(), color:newColor, order:p.length }]);
    setNewName('');
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:20 }}>
      <div style={{ background:'var(--paper-card)', borderRadius:3, width:420, maxHeight:'80vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'var(--shadow-md)' }}>
        <div style={{ padding:'14px 18px 10px', borderBottom:'1px solid var(--paper-3)', background:'var(--paper-2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.1em', marginBottom:2 }}>THE STACKS</div>
            <div style={{ fontSize:14, fontFamily:'var(--font-display)', fontWeight:600, fontStyle:'italic', color:'var(--ink)' }}>Manage domains</div>
          </div>
          <button onClick={()=>{onSave(items);onClose();}}
            style={{ fontSize:9, padding:'4px 14px', borderRadius:2, background:'var(--ink)', color:'var(--paper-card)', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em' }}>
            SAVE
          </button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 18px' }}>
          {items.map(d => (
            <div key={d.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'6px 0', borderBottom:'1px solid var(--paper-3)' }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <div style={{ width:16, height:16, borderRadius:'50%', background:d.color, cursor:'pointer', border:`2px solid ${d.color}55` }} />
                <input type="color" value={d.color} onChange={e=>setItems(p=>p.map(x=>x.id===d.id?{...x,color:e.target.value}:x))}
                  style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer', width:'100%', height:'100%' }} />
              </div>
              <input value={d.name} onChange={e=>setItems(p=>p.map(x=>x.id===d.id?{...x,name:e.target.value}:x))}
                style={{ flex:1, padding:'4px 8px', fontSize:12, borderRadius:2, fontFamily:'var(--font-serif)', fontStyle:'italic' }} />
              <button onClick={()=>setItems(p=>p.filter(x=>x.id!==d.id))}
                style={{ fontSize:11, color:'var(--ink-4)', cursor:'pointer', background:'none', border:'none' }}
                onMouseEnter={e=>e.currentTarget.style.color='var(--red)'}
                onMouseLeave={e=>e.currentTarget.style.color='var(--ink-4)'}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 18px', borderTop:'1px solid var(--paper-3)', display:'flex', gap:6, background:'var(--paper-2)' }}>
          <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}
            placeholder="New domain…" style={{ flex:1, padding:'5px 8px', fontSize:12, borderRadius:2, fontStyle:'italic' }} />
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

// ── Main TopicList ────────────────────────────────────────────────
export default function TopicList({
  topics = [], selectedTopicId, onSelect, onCreateTopic,
  domains: domainsProp, onUpdateDomains,
  thoughts = [],
  investigations = [],
}) {
  // Seed domains from localStorage or defaults
  const domains = useMemo(() => {
    if (domainsProp && domainsProp.length > 0) return [...domainsProp].sort((a,b)=>a.order-b.order);
    return DEFAULT_DOMAINS;
  }, [domainsProp]);

  const [selectedDomainId, setSelectedDomainId] = useState(domains[0]?.id || null);
  const [search, setSearch]             = useState('');
  const [showDomainManager, setShowDomainManager] = useState(false);
  const [domainsCollapsed, setDomainsCollapsed]   = useState(false);

  const selectedDomain = domains.find(d => d.id === selectedDomainId) || null;

  // Topics in selected domain
  const domainTopics = useMemo(() => {
  const inDomain = selectedDomainId === '__uncategorised'
    ? topics.filter(t => !t.domainId)
    : topics.filter(t => t.domainId === selectedDomainId);
  
  // Also include subtopics whose parent is in this domain
  const inDomainIds = new Set(inDomain.map(t => t.id));
  const subtopics = topics.filter(t => t.parentId && inDomainIds.has(t.parentId) && !inDomainIds.has(t.id));
  
  let pool = [...inDomain, ...subtopics];
  if (search) pool = pool.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));
  return pool;
}, [topics, selectedDomainId, search]);

  // Build tree — roots + children
  const roots    = domainTopics.filter(t => !t.parentId);
  const getChildren = (pid) => domainTopics.filter(t => t.parentId === pid);

  function renderTree(topic, depth=0) {
    const children = getChildren(topic.id);
    const noteCount = thoughts.filter(th => (topic.thoughtIds||[]).includes(th.id)).length;
    return (
      <TopicRow key={topic.id} topic={{...topic, thoughtIds: Array(noteCount).fill(0)}}
        depth={depth} onClick={onSelect}
        isActive={selectedTopicId === topic.id}
        domain={selectedDomain}>
        {children.length > 0 ? children.map(c => renderTree(c, depth+1)) : null}
      </TopicRow>
    );
  }

  return (
    <div style={{ display:'flex', height:'100%', position:'relative' }}>

      {/* ── DOMAIN PANEL ─────────────────────────────────── */}
      <DomainPanel
        domains={domains}
        topics={topics}
        selectedId={selectedDomainId}
        onSelect={setSelectedDomainId}
        onManage={() => setShowDomainManager(true)}
        collapsed={domainsCollapsed}
        onToggleCollapse={() => setDomainsCollapsed(c => !c)}
      />

      {/* ── TOPIC PANEL ──────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Domain header */}
        <div style={{ padding:'10px 14px 8px', borderBottom:'1px solid var(--paper-3)', flexShrink:0, background:'var(--paper-2)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            {selectedDomain && <div style={{ width:10, height:10, borderRadius:'50%', background:selectedDomain.color, flexShrink:0 }} />}
            <div style={{ fontSize:15, fontFamily:'var(--font-display)', fontWeight:700, fontStyle:'italic', color:'var(--ink)', flex:1 }}>
              {selectedDomain?.name || 'Uncategorised'}
            </div>
            <span style={{ fontSize:9, color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontStyle:'normal' }}>
              {domainTopics.length} file{domainTopics.length!==1?'s':''}
            </span>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search files…"
              style={{ flex:1, padding:'4px 8px', fontSize:11, borderRadius:2, fontStyle:'italic' }} />
            <button onClick={() => onCreateTopic({ domainId: selectedDomainId })}
              style={{ fontSize:9, padding:'4px 12px', borderRadius:2, background: selectedDomain?.color||'var(--ink)', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.06em', whiteSpace:'nowrap', opacity:0.9 }}>
              + FILE
            </button>
          </div>
        </div>

        {/* Topic tree */}
        <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
          {roots.length === 0 ? (
            <div style={{ padding:'30px 16px', textAlign:'center' }}>
              <div style={{ fontSize:28, opacity:0.08, marginBottom:10, fontFamily:'var(--font-display)', lineHeight:1 }}>◌</div>
              <div style={{ fontSize:12, color:'var(--ink-4)', fontStyle:'italic', lineHeight:1.7 }}>
                {search ? 'No files match this search.' : `No subject files in ${selectedDomain?.name||'this domain'} yet.`}
              </div>
              {!search && <button onClick={() => onCreateTopic({ domainId: selectedDomainId })}
                style={{ marginTop:12, fontSize:10, padding:'5px 14px', borderRadius:2, background: selectedDomain?.color||'var(--accent)', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.06em', opacity:0.85 }}>
                + Create first file
              </button>}
            </div>
          ) : (
            roots.map(t => renderTree(t, 0))
          )}
        </div>
      </div>

      {/* Librarian floating note */}
      <LibrarianNote
        domain={selectedDomain}
        topics={topics}
        investigations={investigations}
        onDismiss={() => {}}
      />

      {/* Domain manager modal */}
      {showDomainManager && (
        <DomainManager
          domains={domains}
          onSave={onUpdateDomains}
          onClose={() => setShowDomainManager(false)}
        />
      )}
    </div>
  );
}
