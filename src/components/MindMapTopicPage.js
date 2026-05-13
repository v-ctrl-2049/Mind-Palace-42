import React, { useState } from 'react';
import { getEdgeType } from '../data/mindmap';
import { v4 as uuidv4 } from 'uuid';
import NodeEditModal from './NodeEditModal';
import EdgeEditModal from './EdgeEditModal';
import { getEvidenceProfile } from '../utils/evidenceProfile';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: copied ? 'var(--green)' : 'var(--ink-3)', background: 'var(--paper-2)', cursor: 'pointer' }}>
      {copied ? '✓ Copied' : 'Copy all'}
    </button>
  );
}

function parseYear(y) {
  if (!y) return Infinity;
  const s = String(y).trim();
  if (s.match(/BCE/i)) return -(parseInt(s.replace(/[^0-9]/g,'')) || 0);
  const n = parseInt(s);
  return isNaN(n) ? Infinity : n;
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--paper-3)' }}>
      {children}
    </div>
  );
}

export default function MindMapTopicPage({ topic, allNodes, allEdges, books, nodeTypes, edgeTypes, onBack, onEditNode, onSelectNode, onManageNodeTypes, onManageEdgeTypes, onUpdateNodes, onUpdateEdges }) {
  const nt = nodeTypes.find(t => t.id === 'topic') || { color: '#2c3e50', bg: '#e8edf2', label: 'Topic' };
  const [activeTab, setActiveTab]     = useState('nodes'); // 'nodes' | 'development' | 'books'
  const [editingNode, setEditingNode] = useState(null);
  const [editingEdge, setEditingEdge] = useState(null);
  const [isNewNode, setIsNewNode]     = useState(false);
  const [isNewEdge, setIsNewEdge]     = useState(false);

  const handleSaveNode = (updated) => {
    if (isNewNode) onUpdateNodes(prev => [...prev, updated]);
    else onUpdateNodes(prev => prev.map(n => n.id === updated.id ? updated : n));
    setEditingNode(null);
  };
  const handleDeleteNode = (id) => {
    onUpdateNodes(prev => prev.filter(n => n.id !== id));
    onUpdateEdges(prev => prev.filter(e => e.source !== id && e.target !== id));
    setEditingNode(null);
  };
  const handleSaveEdge = (updated) => {
    if (isNewEdge) onUpdateEdges(prev => [...prev, updated]);
    else onUpdateEdges(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditingEdge(null);
  };
  const handleDeleteEdge = (id) => { onUpdateEdges(prev => prev.filter(e => e.id !== id)); setEditingEdge(null); };

  const addNode = (type = 'concept') => {
    setEditingNode({ id: uuidv4(), type, label: '', note: '', bookIds: [], year: '', x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 });
    setIsNewNode(true);
  };
  const addEdge = () => {
    setEditingEdge({ id: uuidv4(), source: topic.id, target: '', type: edgeTypes[0]?.id || 'related', label: '' });
    setIsNewEdge(true);
  };

  // Direct connections from this topic
  const directEdges = allEdges.filter(e => e.source === topic.id || e.target === topic.id);
  const connectedIds = new Set(directEdges.map(e => e.source === topic.id ? e.target : e.source));
  const connectedNodes = allNodes.filter(n => connectedIds.has(n.id) && n.id !== topic.id);

  // All related nodes (2-hop BFS)
  const allRelated = new Set(connectedIds);
  allEdges.forEach(e => {
    if (connectedIds.has(e.source)) allRelated.add(e.target);
    if (connectedIds.has(e.target)) allRelated.add(e.source);
  });
  allRelated.delete(topic.id);

  // Group connected nodes by type for left panel
  const byType = nodeTypes
    .filter(t => t.id !== 'topic')
    .map(t => ({ type: t, nodes: connectedNodes.filter(n => n.type === t.id) }))
    .filter(g => g.nodes.length > 0);

  // Development timeline: all related nodes with years
  const datedNodes = [...allRelated]
    .map(id => allNodes.find(n => n.id === id))
    .filter(n => n && n.year)
    .sort((a, b) => parseYear(a.year) - parseYear(b.year));

  // Book comparison: all books that appear across any connected node
  const allBookIds = [...new Set(
    [...allRelated, topic.id]
      .map(id => allNodes.find(n => n.id === id))
      .filter(Boolean)
      .flatMap(n => n.bookIds || [])
  )];
  const comparisonBooks = allBookIds.map(id => books.find(b => b.id === id)).filter(Boolean);

  // For each book, find which connected nodes it appears in
  const bookContributions = comparisonBooks.map(book => ({
    book,
    nodes: connectedNodes.filter(n => (n.bookIds || []).includes(book.id)),
  })).filter(bc => bc.nodes.length > 0);

  // Build export text
  const exportText = () => {
    const lines = [`TOPIC: ${topic.label}`, ''];
    if (topic.note) lines.push(topic.note, '');
    byType.forEach(({ type, nodes }) => {
      lines.push(`── ${type.label.toUpperCase()} ──`);
      nodes.forEach(n => { lines.push(`  • ${n.label}${n.year ? ` (${n.year})` : ''}`); if (n.note) lines.push(`    ${n.note}`); });
      lines.push('');
    });
    if (datedNodes.length) {
      lines.push('── DEVELOPMENT TIMELINE ──');
      datedNodes.forEach(n => { lines.push(`  ${n.year}  ${n.label}`); if (n.note) lines.push(`    ${n.note}`); });
      lines.push('');
    }
    if (bookContributions.length > 1) {
      lines.push('── BOOK COMPARISON ──');
      bookContributions.forEach(({ book, nodes }) => {
        lines.push(`\n  ${book.title}`);
        nodes.forEach(n => { lines.push(`    • ${n.label}`); if (n.note) lines.push(`      ${n.note}`); });
      });
    }
    return lines.join('\n');
  };

  const linkedBooks = books.filter(b => (topic.bookIds || []).includes(b.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 22px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: 'var(--paper-2)' }}>
        <button onClick={onBack} style={{ fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Mind map
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--paper-3)' }} />
        <div style={{ width: 12, height: 12, borderRadius: 3, background: nt.color, flexShrink: 0 }} />
        <h1 style={{ fontSize: 16, fontWeight: 600, color: nt.color, flex: 1 }}>{topic.label}</h1>
        <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 10, background: nt.color + '22', color: nt.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>TOPIC</span>
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{allRelated.size} nodes · {comparisonBooks.length} books</span>
        <CopyBtn text={exportText()} />
        <button onClick={() => onEditNode(topic)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-2)', background: 'transparent', cursor: 'pointer' }}>Edit topic</button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--paper-3)', flexShrink: 0, background: 'var(--paper-2)', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 }}>
        <div style={{ display: 'flex' }}>
          {[
            { id: 'nodes',       label: '◈ Nodes' },
            { id: 'development', label: '↔ Development' },
            { id: 'books',       label: '◎ Book perspectives' },
            { id: 'connections', label: '⊛ Connections' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ fontSize: 11, padding: '8px 18px', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? nt.color : 'transparent'}`, background: 'transparent', color: activeTab === tab.id ? nt.color : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em' }}>
              {tab.label}
            </button>
          ))}
        </div>
        {/* Add node / add connection buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => addEdge()}
            style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-2)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)'; e.currentTarget.style.color = 'var(--ink-3)'; }}>
            + connection
          </button>
          <button onClick={() => addNode()}
            style={{ fontSize: 11, padding: '4px 14px', borderRadius: 6, background: nt.color, color: '#fff', border: 'none', cursor: 'pointer' }}>
            + node
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>

      {/* NODES TAB */}
      {activeTab === 'nodes' && (
      <div style={{ overflowY: 'auto', height: '100%', padding: '18px 20px' }}>
          {/* Topic overview */}
          {(topic.note || linkedBooks.length > 0) && (
            <div style={{ background: nt.color + '11', border: `1px solid ${nt.color}33`, borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: nt.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>Overview</div>
              {topic.note && <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7, marginBottom: linkedBooks.length ? 10 : 0 }}>{topic.note}</p>}
              {linkedBooks.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {linkedBooks.map(b => <span key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: b.color }} />{b.title}</span>)}
                </div>
              )}
            </div>
          )}

          {/* Node groups */}
          {byType.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 13, lineHeight: 1.65 }}>
              No nodes connected yet.<br />Use "+ node" to add one, then "+ connection" to link it to this topic.
            </div>
          ) : byType.map(({ type, nodes }) => (
            <div key={type.id} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: type.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: type.color, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{type.label}</span>
                <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{nodes.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 8 }}>
                {nodes.map(n => {
                  const nBooks = books.filter(b => (n.bookIds || []).includes(b.id));
                  const edge = allEdges.find(e => (e.source === topic.id && e.target === n.id) || (e.target === topic.id && e.source === n.id));
                  const et = edge ? (edgeTypes.find(t => t.id === edge.type) || getEdgeType(edge.type)) : null;
                  return (
                    <div key={n.id}
                      style={{ background: 'var(--paper-card)', border: `1px solid var(--paper-3)`, borderLeft: `3px solid ${type.color}`, borderRadius: 8, padding: '10px 12px', position: 'relative' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = type.color + '66'; const a = e.currentTarget.querySelector('.node-edit'); if (a) a.style.opacity='1'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--paper-3)'; const a = e.currentTarget.querySelector('.node-edit'); if (a) a.style.opacity='0'; }}>
                      {/* Evidence profile badge */}
                      {(() => {
                        const ep = getEvidenceProfile(n, books);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                            <span title={ep.description}
                              style={{ fontSize: 9, padding: '1px 7px', borderRadius: 8, background: ep.color + '18', color: ep.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: `1px solid ${ep.color}33`, cursor: 'help' }}>
                              {ep.icon} {ep.label}
                            </span>
                            {ep.methodNarrow && (
                              <span title="All sources share the same methodological framework"
                                style={{ fontSize: 9, padding: '1px 6px', borderRadius: 8, background: '#faf0dc', color: '#b07d28', fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: '1px solid #b07d2833', cursor: 'help' }}>
                                ⚠ method narrow
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, paddingRight: 50 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', flex: 1, lineHeight: 1.3 }}>{n.label}</div>
                        {n.year && <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', flexShrink: 0 }}>{n.year}</span>}
                      </div>
                      {et && <span style={{ fontSize: 9, padding: '1px 7px', borderRadius: 10, background: et.color + '22', color: et.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', display: 'inline-block', marginBottom: n.note ? 4 : 0 }}>{et.label}</span>}
                      {n.note && <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 3 }}>{n.note.slice(0, 120)}{n.note.length > 120 ? '…' : ''}</p>}
                      {nBooks.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                          {nBooks.map(b => <span key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic' }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: b.color }} />{b.title}</span>)}
                        </div>
                      )}
                      {/* Edit button */}
                      <div className="node-edit" style={{ position: 'absolute', top: 8, right: 8, opacity: 0, transition: 'opacity 0.15s' }}>
                        <button onClick={() => { setEditingNode(n); setIsNewNode(false); }}
                          style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', background: 'var(--paper-card)', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}>✎</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
      )}

      {/* DEVELOPMENT TAB */}
      {activeTab === 'development' && (
      <div style={{ overflowY: 'auto', height: '100%', padding: '18px 20px', background: 'var(--paper-2)' }}>
          <SectionLabel>Development timeline</SectionLabel>

          {datedNodes.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.65, textAlign: 'center', padding: '20px 0' }}>
              Add years to nodes (e.g. "1781", "380 BCE") to see development over time.
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 20 }}>
              {/* Gradient spine */}
              <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${nt.color}, var(--paper-3))`, borderRadius: 2 }} />
              {datedNodes.map((n, i) => {
                const nodeType = nodeTypes.find(t => t.id === n.type) || { color: '#7a6a52', label: n.type };
                const nBooks = books.filter(b => (n.bookIds || []).includes(b.id));
                const edge = allEdges.find(e => (e.source === topic.id && e.target === n.id) || (e.target === topic.id && e.source === n.id));
                const et = edge ? (edgeTypes.find(t => t.id === edge.type) || getEdgeType(edge.type)) : null;
                return (
                  <div key={n.id} style={{ marginBottom: i < datedNodes.length - 1 ? 16 : 0, position: 'relative', cursor: 'pointer' }} onClick={() => onSelectNode(n.id)}>
                    {/* Spine dot */}
                    <div style={{ position: 'absolute', left: -16, top: 5, width: 10, height: 10, borderRadius: '50%', background: nodeType.color, border: '2px solid var(--paper-card)', zIndex: 1, boxShadow: '0 0 0 2px ' + nodeType.color + '33' }} />
                    {/* Year */}
                    <div style={{ fontSize: 10, color: nt.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontWeight: 700, marginBottom: 3, letterSpacing: '0.04em' }}>{n.year}</div>
                    {/* Card */}
                    <div style={{ background: 'var(--paper-card)', border: `1px solid ${nodeType.color}33`, borderRadius: 7, padding: '8px 10px' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 1, background: nodeType.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3, flex: 1 }}>{n.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: n.note ? 4 : 0 }}>
                        <span style={{ fontSize: 9, color: nodeType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{nodeType.label}</span>
                        {et && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 8, background: et.color + '22', color: et.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{et.label}</span>}
                      </div>
                      {n.note && <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: nBooks.length ? 4 : 0 }}>{n.note.slice(0, 100)}{n.note.length > 100 ? '…' : ''}</p>}
                      {nBooks.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {nBooks.map(b => <span key={b.id} style={{ fontSize: 9, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 2, fontStyle: 'italic' }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: b.color }} />{b.title}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>
      )}

      {/* BOOKS TAB */}
      {activeTab === 'books' && (
      <div style={{ overflowY: 'auto', height: '100%', padding: '18px 20px' }}>
          <SectionLabel>Book perspectives</SectionLabel>

          {bookContributions.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.65, textAlign: 'center', padding: '20px 0' }}>
              Link books to connected nodes to see how different sources discuss this topic.
            </div>
          ) : bookContributions.map(({ book, nodes: bNodes }) => (
            <div key={book.id} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${book.color}33` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: book.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: book.color, fontStyle: 'italic' }}>{book.title}</div>
                  {book.author && <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{book.author}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {bNodes.map(n => {
                  const nodeType = nodeTypes.find(t => t.id === n.type) || { color: '#7a6a52', label: n.type };
                  return (
                    <div key={n.id}
                      style={{ background: 'var(--paper-2)', border: `1px solid var(--paper-3)`, borderRadius: 7, padding: '7px 10px', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-card)'; e.currentTarget.style.borderColor = book.color + '55'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper-2)'; e.currentTarget.style.borderColor = 'var(--paper-3)'; }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: n.note ? 3 : 0 }}>
                        <span style={{ fontSize: 9, color: nodeType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>{nodeType.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{n.label}</span>
                        {n.year && <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginLeft: 'auto', flexShrink: 0 }}>{n.year}</span>}
                      </div>
                      {n.note && <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5 }}>{n.note.slice(0, 90)}{n.note.length > 90 ? '…' : ''}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
      )}

      {/* CONNECTIONS TAB */}
      {activeTab === 'connections' && (
      <div style={{ overflowY: 'auto', height: '100%', padding: '18px 20px' }}>

        {directEdges.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.65, textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 28, opacity: 0.1, marginBottom: 10, fontFamily: 'var(--font-display)' }}>◌</div>
            No connections yet. Use "+ connection" to link this topic to other concepts, works, or scholars.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Incoming — what feeds INTO this topic */}
            {(() => {
              const incoming = directEdges.filter(e => e.target === topic.id);
              if (!incoming.length) return null;
              return (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--accent-2)' }}>←</span> Origins & influences — what feeds into this topic
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {incoming.map(edge => {
                      const src = allNodes.find(n => n.id === edge.source);
                      const et  = edgeTypes.find(t => t.id === edge.type);
                      const nodeType = src ? nodeTypes.find(t => t.id === src.type) : null;
                      if (!src) return null;
                      return (
                        <div key={edge.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderLeft: `3px solid ${et?.color || 'var(--accent)'}`, borderRadius: 2 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: src.note ? 5 : 0 }}>
                              {nodeType && <span style={{ fontSize: 8, color: nodeType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{nodeType.label}</span>}
                              <span style={{ fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, color: 'var(--ink)' }}>{src.label}</span>
                              {src.year && <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginLeft: 'auto' }}>{src.year}</span>}
                            </div>
                            {src.note && <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5, margin: 0 }}>{src.note.slice(0, 120)}{src.note.length > 120 ? '…' : ''}</p>}
                            {edge.label && <div style={{ fontSize: 10, color: et?.color || 'var(--accent)', fontStyle: 'italic', marginTop: 4 }}>"{edge.label}"</div>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                            <span style={{ fontSize: 8, padding: '2px 8px', background: (et?.color||'var(--accent)') + '18', color: et?.color || 'var(--accent)', borderRadius: 2, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
                              {et?.label?.toUpperCase() || edge.type}
                            </span>
                            <button onClick={() => { setEditingEdge({...edge}); setIsNewEdge(false); }}
                              style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 2, cursor: 'pointer', padding: '2px 6px', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>✎</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Outgoing — what this topic leads to / spawns */}
            {(() => {
              const outgoing = directEdges.filter(e => e.source === topic.id);
              if (!outgoing.length) return null;
              return (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--accent-2)' }}>→</span> Leads to — what this topic spawns or connects forward
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {outgoing.map(edge => {
                      const tgt = allNodes.find(n => n.id === edge.target);
                      const et  = edgeTypes.find(t => t.id === edge.type);
                      const nodeType = tgt ? nodeTypes.find(t => t.id === tgt.type) : null;
                      if (!tgt) return null;
                      return (
                        <div key={edge.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderLeft: `3px solid ${et?.color || 'var(--accent)'}`, borderRadius: 2 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: tgt.note ? 5 : 0 }}>
                              {nodeType && <span style={{ fontSize: 8, color: nodeType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>{nodeType.label}</span>}
                              <span style={{ fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, color: 'var(--ink)' }}>{tgt.label}</span>
                              {tgt.year && <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginLeft: 'auto' }}>{tgt.year}</span>}
                            </div>
                            {tgt.note && <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5, margin: 0 }}>{tgt.note.slice(0, 120)}{tgt.note.length > 120 ? '…' : ''}</p>}
                            {edge.label && <div style={{ fontSize: 10, color: et?.color || 'var(--accent)', fontStyle: 'italic', marginTop: 4 }}>"{edge.label}"</div>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                            <span style={{ fontSize: 8, padding: '2px 8px', background: (et?.color||'var(--accent)') + '18', color: et?.color || 'var(--accent)', borderRadius: 2, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
                              {et?.label?.toUpperCase() || edge.type}
                            </span>
                            <button onClick={() => { setEditingEdge({...edge}); setIsNewEdge(false); }}
                              style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 2, cursor: 'pointer', padding: '2px 6px', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>✎</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* 2-hop network — the wider web */}
            {(() => {
              const secondHop = [...allRelated].filter(id => !connectedIds.has(id));
              if (!secondHop.length) return null;
              const secondHopNodes = secondHop.map(id => allNodes.find(n => n.id === id)).filter(Boolean);
              return (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px dashed var(--paper-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ opacity: 0.5 }}>◈</span> Wider web — connected via one degree of separation
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {secondHopNodes.map(n => {
                      const nodeType = nodeTypes.find(t => t.id === n.type);
                      return (
                        <div key={n.id} onClick={() => onSelectNode(n.id)}
                          style={{ fontSize: 11, padding: '5px 10px', border: `1px solid ${nodeType?.color || 'var(--paper-3)'}33`, borderRadius: 2, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-serif)', cursor: 'pointer', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', gap: 5 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-card)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--paper-2)'}>
                          {nodeType && <div style={{ width: 5, height: 5, borderRadius: '50%', background: nodeType.color, flexShrink: 0 }} />}
                          {n.label}
                          {n.year && <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{n.year}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>
      )}

      </div>{/* end tab content */}

      {/* Node/Edge modals */}
      {editingNode && (
        <NodeEditModal node={editingNode} books={books} nodeTypes={nodeTypes} isNew={isNewNode}
          onSave={handleSaveNode} onDelete={handleDeleteNode}
          onClose={() => setEditingNode(null)} onManageTypes={onManageNodeTypes} />
      )}
      {editingEdge && (
        <EdgeEditModal edge={editingEdge} nodes={allNodes} edgeTypes={edgeTypes} isNew={isNewEdge}
          onSave={handleSaveEdge} onDelete={handleDeleteEdge}
          onClose={() => setEditingEdge(null)} onManageTypes={onManageEdgeTypes} />
      )}
    </div>
  );
}
