import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getBellflowerNotice } from '../data/archivistQuotes';
import { XiaoHuaIcon } from './XiaoHua';
import { getEdgeType } from '../data/mindmap';
import NodeEditModal from './NodeEditModal';
import EdgeEditModal from './EdgeEditModal';
import MindMapTopicPage from './MindMapTopicPage';

// ── Brain palette ─────────────────────────────────────────────────
const BRAIN_BG   = '#0a0908';
const BRAIN_GRID = 'rgba(255,255,255,0.03)';

// ── Node radius by connection degree ─────────────────────────────
function nodeRadius(nodeId, edges, baseR = 24, minR = 16, maxR = 52) {
  const degree = edges.filter(e => e.source === nodeId || e.target === nodeId).length;
  return Math.min(maxR, Math.max(minR, baseR + degree * 5));
}

// ── Node centre (for edge routing) ───────────────────────────────
function nodeCentre(node, edges) {
  if (node.type === 'topic') {
    // Topic nodes are circles too now — centred at x,y with dynamic radius
    const r = nodeRadius(node.id, edges, 32, 24, 60);
    return { x: node.x + r, y: node.y + r };
  }
  const r = nodeRadius(node.id, edges, 20, 14, 40);
  return { x: node.x + r, y: node.y + r };
}

// ── SVG glow filter ids ───────────────────────────────────────────
const GLOW_FILTERS = {
  foundation:  'glow-green',
  influence:   'glow-amber',
  tension:     'glow-red',
  extends:     'glow-blue',
  refutes:     'glow-orange',
  related:     'glow-grey',
  synthesises: 'glow-gold',
};

// ── Brain node — circle, sized by degree, glowing ─────────────────
function BrainNode({ node, edges, nodeTypes, selected, books, onMouseDown, onDoubleClick }) {
  const isTopic = node.type === 'topic';
  const nt = nodeTypes.find(t => t.id === node.type) || { color: '#7a6a52', label: node.type };
  const r  = nodeRadius(node.id, edges, isTopic ? 32 : 20, isTopic ? 24 : 14, isTopic ? 60 : 40);
  const cx = node.x + r;
  const cy = node.y + r;
  const linkedBooks = isTopic ? books.filter(b => (node.bookIds||[]).includes(b.id)) : [];
  const degree = edges.filter(e => e.source === node.id || e.target === node.id).length;

  return (
    <g onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      style={{ cursor: isTopic ? 'pointer' : 'grab', userSelect: 'none' }}>

      {/* Outer glow ring — selection or always-on for hubs */}
      {(selected || degree > 3) && (
        <circle cx={cx} cy={cy} r={r + (selected ? 10 : 6)}
          fill="none" stroke={nt.color}
          strokeWidth={selected ? 1.5 : 0.8}
          opacity={selected ? 0.5 : 0.2} />
      )}

      {/* Pulse ring for topics with many connections */}
      {isTopic && degree > 5 && (
        <circle cx={cx} cy={cy} r={r + 16}
          fill="none" stroke={nt.color}
          strokeWidth={0.5} opacity={0.1} />
      )}

      {/* Main circle */}
      <circle cx={cx} cy={cy} r={r}
        fill={selected ? nt.color + '30' : nt.color + '18'}
        stroke={nt.color}
        strokeWidth={selected ? 2 : 1}
        opacity={0.9} />

      {/* Inner dot */}
      <circle cx={cx} cy={cy} r={isTopic ? 4 : 3}
        fill={nt.color} opacity={0.8} />

      {/* Degree number for busy nodes */}
      {degree > 0 && isTopic && (
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={8} fill={nt.color} opacity={0.5}
          fontFamily="DM Mono, monospace" style={{ pointerEvents: 'none' }}>
          {degree}
        </text>
      )}

      {/* Label — outside the circle, orbital */}
      <text x={cx} y={cy + r + (isTopic ? 14 : 11)}
        textAnchor="middle"
        fontSize={isTopic ? 12 : 10}
        fontWeight={isTopic ? 500 : 400}
        fill={isTopic ? '#e8e4dc' : nt.color}
        fontFamily={isTopic ? 'Lora, Georgia, serif' : 'DM Mono, monospace'}
        fontStyle={isTopic ? 'italic' : 'normal'}
        opacity={isTopic ? 0.9 : 0.75}
        style={{ pointerEvents: 'none' }}>
        {node.label.length > 18 ? node.label.slice(0, 18) + '…' : node.label}
      </text>

      {/* Year under label for non-topics */}
      {!isTopic && node.year && (
        <text x={cx} y={cy + r + 22}
          textAnchor="middle" fontSize={8}
          fill={nt.color} opacity={0.45}
          fontFamily="DM Mono, monospace"
          style={{ pointerEvents: 'none' }}>
          {node.year}
        </text>
      )}

      {/* Book dots orbiting — tiny coloured sparks */}
      {isTopic && linkedBooks.slice(0, 5).map((b, i) => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const orbitR = r + 4;
        return (
          <circle key={b.id}
            cx={cx + Math.cos(angle) * orbitR}
            cy={cy + Math.sin(angle) * orbitR}
            r={2.5} fill={b.color} opacity={0.7} />
        );
      })}

      {/* Selected hint */}
      {selected && isTopic && (
        <text x={cx} y={cy + r + 26}
          textAnchor="middle" fontSize={7}
          fill={nt.color} opacity={0.5}
          fontFamily="DM Mono, monospace"
          style={{ pointerEvents: 'none' }}>
          double-click → open
        </text>
      )}
    </g>
  );
}

// ── Brain edge — organic curve with glow ─────────────────────────
function BrainEdge({ edge, srcNode, tgtNode, selected, edgeTypes, allEdges, onSelect, onEdit }) {
  if (!srcNode || !tgtNode) return null;
  const et  = edgeTypes.find(t => t.id === edge.type) || getEdgeType(edge.type);
  const src = nodeCentre(srcNode, allEdges);
  const tgt = nodeCentre(tgtNode, allEdges);
  const srcR = nodeRadius(srcNode.id, allEdges, srcNode.type==='topic'?32:20, srcNode.type==='topic'?24:14, srcNode.type==='topic'?60:40);
  const tgtR = nodeRadius(tgtNode.id, allEdges, tgtNode.type==='topic'?32:20, tgtNode.type==='topic'?24:14, tgtNode.type==='topic'?60:40);

  const dx = tgt.x - src.x, dy = tgt.y - src.y;
  const dist = Math.sqrt(dx*dx + dy*dy) || 1;
  const ux = dx/dist, uy = dy/dist;
  const x1 = src.x + ux*(srcR+3), y1 = src.y + uy*(srcR+3);
  const x2 = tgt.x - ux*(tgtR+8), y2 = tgt.y - uy*(tgtR+8);

  // Organic curve — perpendicular bow + slight randomness seeded by edge id
  let seed = 0;
  for (let i = 0; i < edge.id.length; i++) seed = (seed * 31 + edge.id.charCodeAt(i)) | 0;
  const bow = 0.18 + (Math.abs(seed % 100) / 100) * 0.22;
  const perpX = -(y2-y1) * bow;
  const perpY =  (x2-x1) * bow;
  const cpx = (x1+x2)/2 + perpX;
  const cpy = (y1+y2)/2 + perpY;
  const pathD = `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`;

  const col = selected ? '#d4a020' : et.color;
  const arrowId = `arr-${edge.id}`;
  const glowId  = GLOW_FILTERS[edge.type] || 'glow-grey';
  const w = selected ? 2.5 : 1.2;

  return (
    <g onClick={e => { e.stopPropagation(); onSelect(edge.id); }}
       onDoubleClick={e => { e.stopPropagation(); onEdit(edge); }}
       style={{ cursor: 'pointer' }}>
      <defs>
        <marker id={arrowId} markerWidth={6} markerHeight={5} refX={6} refY={2.5} orient="auto">
          <path d="M0,0 L6,2.5 L0,5 Z" fill={col} opacity={0.9} />
        </marker>
      </defs>
      {/* Glow layer */}
      <path d={pathD} stroke={et.color} strokeWidth={w+4}
        fill="none" opacity={selected ? 0.18 : 0.08}
        filter={`url(#${glowId})`} />
      {/* Transparent hit area */}
      <path d={pathD} stroke="transparent" strokeWidth={18} fill="none" />
      {/* Main stroke */}
      <path d={pathD} stroke={col} strokeWidth={w}
        strokeDasharray={et.dash ? '5 4' : undefined}
        fill="none" markerEnd={`url(#${arrowId})`}
        opacity={selected ? 0.95 : 0.55} />
      {/* Edge type label */}
      {(selected || edge.label) && (
        <text x={cpx} y={cpy - 7}
          textAnchor="middle" fontSize={8}
          fill={et.color} opacity={0.7}
          fontFamily="DM Mono, monospace"
          style={{ pointerEvents: 'none' }}>
          {edge.label || et.label}
        </text>
      )}
    </g>
  );
}

// ── Main MindMapView ─────────────────────────────────────────────
export default function MindMapView({ nodes, edges, books, nodeTypes, edgeTypes, onUpdateNodes, onUpdateEdges, onManageNodeTypes, onManageEdgeTypes }) {
  const svgRef = useRef(null);
  const [transform, setTransform]       = useState({ x: 80, y: 60, scale: 1 });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [editingNode, setEditingNode]   = useState(null);
  const [editingEdge, setEditingEdge]   = useState(null);
  const [isNewNode, setIsNewNode]       = useState(false);
  const [isNewEdge, setIsNewEdge]       = useState(false);
  const [isPanning, setIsPanning]       = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [activeTab, setActiveTab]       = useState('map');
  const panStart = useRef(null);

  const topicNodes = useMemo(() => nodes.filter(n => n.type === 'topic'), [nodes]);
  const allNodeIds = useMemo(() => new Set(nodes.map(n => n.id)), [nodes]);
  const topicEdges = useMemo(() => edges.filter(e => allNodeIds.has(e.source) && allNodeIds.has(e.target)), [edges, allNodeIds]);
  const activeTopic = activeTopicId ? nodes.find(n => n.id === activeTopicId) : null;

  // ── Pan ──────────────────────────────────────────────────────
  const handleSvgMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setSelectedNodeId(null); setSelectedEdgeId(null);
    setIsPanning(true);
    panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  }, [transform]);

  useEffect(() => {
    const onMove = e => { if (!isPanning || !panStart.current) return; setTransform(t => ({ ...t, x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y })); };
    const onUp = () => setIsPanning(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isPanning]);

  // ── Zoom ─────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    setTransform(t => { const ns = Math.max(0.2, Math.min(4, t.scale * factor)); return { scale: ns, x: px - (px - t.x) * (ns / t.scale), y: py - (py - t.y) * (ns / t.scale) }; });
  }, []);

  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Drag ─────────────────────────────────────────────────────
  const makeDragHandler = useCallback((node) => (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedNodeId(node.id);
    const r   = nodeRadius(node.id, edges, node.type==='topic'?32:20, node.type==='topic'?24:14, node.type==='topic'?60:40);
    const startX = e.clientX, startY = e.clientY;
    const origX = node.x, origY = node.y;
    const onMove = (me) => {
      onUpdateNodes(prev => prev.map(n => n.id === node.id
        ? { ...n, x: origX + (me.clientX - startX) / transform.scale, y: origY + (me.clientY - startY) / transform.scale }
        : n));
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [edges, onUpdateNodes, transform.scale]);

  // ── Fit view ─────────────────────────────────────────────────
  const fitView = () => {
    if (!nodes.length || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const margin = 80;
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const minX = Math.min(...xs) - margin, maxX = Math.max(...xs) + 120 + margin;
    const minY = Math.min(...ys) - margin, maxY = Math.max(...ys) + 120 + margin;
    const scale = Math.min(rect.width/(maxX-minX), rect.height/(maxY-minY), 1.5);
    setTransform({ scale, x: -minX*scale + (rect.width-(maxX-minX)*scale)/2, y: -minY*scale + (rect.height-(maxY-minY)*scale)/2 });
  };

  // ── Add node ─────────────────────────────────────────────────
  const cols = 4;
  const handleAddTopic = () => {
    const idx = topicNodes.length;
    const col = idx % cols, row = Math.floor(idx / cols);
    setEditingNode({ id: uuidv4(), type: 'topic', label: '', note: '', bookIds: [], year: '', x: 80 + col * 180, y: 80 + row * 180 });
    setIsNewNode(true);
  };

  const handleSaveNode = updated => { if (isNewNode) onUpdateNodes(prev => [...prev, updated]); else onUpdateNodes(prev => prev.map(n => n.id === updated.id ? updated : n)); };
  const handleDeleteNode = id => { onUpdateNodes(prev => prev.filter(n => n.id !== id)); onUpdateEdges(prev => prev.filter(e => e.source !== id && e.target !== id)); setSelectedNodeId(null); };
  const handleSaveEdge = updated => { if (isNewEdge) onUpdateEdges(prev => [...prev, updated]); else onUpdateEdges(prev => prev.map(e => e.id === updated.id ? updated : e)); };
  const handleDeleteEdge = id => { onUpdateEdges(prev => prev.filter(e => e.id !== id)); setSelectedEdgeId(null); };

  // ── Topic page (double-click) ─────────────────────────────────
  if (activeTopic) {
    return (
      <MindMapTopicPage
        topic={activeTopic} allNodes={nodes} allEdges={edges}
        books={books} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        onBack={() => setActiveTopicId(null)}
        onEditNode={n => { setActiveTopicId(null); setEditingNode(n); setIsNewNode(false); }}
        onSelectNode={id => { setActiveTopicId(null); setSelectedNodeId(id); }}
        onManageNodeTypes={onManageNodeTypes}
        onManageEdgeTypes={onManageEdgeTypes}
        onUpdateNodes={onUpdateNodes}
        onUpdateEdges={onUpdateEdges}
      />
    );
  }

  // ── Interconnection data for Connections tab ──────────────────
  const connectionMatrix = topicNodes.map(node => {
    const out = topicEdges.filter(e => e.source === node.id);
    const inc = topicEdges.filter(e => e.target === node.id);
    return {
      node,
      connections: [
        ...out.map(e => { const t = nodes.find(n => n.id === e.target); const et = edgeTypes.find(t => t.id === e.type); return { direction:'out', other:t, edge:e, typeLabel:et?.label||e.type, color:et?.color||'#7a6a52' }; }),
        ...inc.map(e => { const s = nodes.find(n => n.id === e.source); const et = edgeTypes.find(t => t.id === e.type); return { direction:'in', other:s, edge:e, typeLabel:et?.label||e.type, color:et?.color||'#7a6a52' }; }),
      ].filter(c => c.other),
    };
  }).filter(n => n.connections.length > 0).sort((a,b) => b.connections.length - a.connections.length);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>

      {/* ── META HEADER ────────────────────────────────── */}
      <div style={{ padding:'11px 20px 9px', borderBottom:'2px solid #1a1814', flexShrink:0, background:'#0e0c0a', position:'relative', overflow:'hidden' }}>
        {/* Watermark */}
        <div style={{ position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', fontSize:9, color:'#00ff41', opacity:0.07, fontFamily:'DM Mono, monospace', letterSpacing:'0.2em', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap', textTransform:'uppercase' }}>
          METAVERSE · LAGOS PROTOCOL · NEURAL CONSTRUCT LAYER
        </div>
        <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
          <div>
            <div style={{ fontSize:8, color:'#00ff41', fontFamily:'DM Mono, monospace', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:2, opacity:0.6 }}>
              Neural construct · connection layer
            </div>
            <div style={{ fontSize:22, fontFamily:'DM Mono, monospace', fontWeight:700, color:'#e8e4dc', lineHeight:1.1, letterSpacing:'0.18em', textShadow:'0 0 12px rgba(0,255,65,0.2)' }}>
              META
            </div>
            <div style={{ fontSize:10, color:'#5a5650', fontFamily:'DM Mono, monospace', marginTop:2, letterSpacing:'0.04em' }}>
              {nodes.length} node{nodes.length!==1?'s':''} · {topicEdges.length} connection{topicEdges.length!==1?'s':''}
            </div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center' }}>
            {/* Tab toggle */}
            <div style={{ display:'flex', border:'1px solid #2a2824', borderRadius:2, overflow:'hidden' }}>
              {[['map','⊛ Map'],['connections','↔ Connections']].map(([t,label]) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  style={{ padding:'5px 12px', fontSize:10, border:'none', borderRight:t==='map'?'1px solid #2a2824':'none', background:activeTab===t?'#1a1814':'transparent', color:activeTab===t?'#e8e4dc':'#5a5650', cursor:'pointer', fontFamily:'DM Mono, monospace', letterSpacing:'0.06em' }}>
                  {label}
                </button>
              ))}
            </div>
            {activeTab === 'map' && <>
              <ToolBtn onClick={fitView}>⊡ Fit</ToolBtn>
              <ToolBtn onClick={() => setTransform(t => ({ ...t, scale: Math.min(t.scale*1.2, 4) }))}>＋</ToolBtn>
              <ToolBtn onClick={() => setTransform(t => ({ ...t, scale: Math.max(t.scale*0.83, 0.2) }))}>－</ToolBtn>
              <div style={{ width:1, height:18, background:'#2a2824' }} />
              <ToolBtn onClick={() => { setEditingEdge({ id:uuidv4(), source:selectedNodeId||'', target:'', type:edgeTypes[0]?.id||'related', label:'' }); setIsNewEdge(true); }}>+ Link</ToolBtn>
              {selectedEdgeId && (() => { const e = edges.find(e => e.id === selectedEdgeId); return e ? <ToolBtn onClick={() => { setEditingEdge({...e}); setIsNewEdge(false); }}>✎ Edit link</ToolBtn> : null; })()}
              <ToolBtn onClick={onManageEdgeTypes}>⊙ Link types</ToolBtn>
              <button onClick={handleAddTopic}
                style={{ fontSize:10, padding:'5px 16px', borderRadius:2, background:'#00ff41', color:'#0a0908', border:'none', cursor:'pointer', fontFamily:'DM Mono, monospace', letterSpacing:'0.07em', fontWeight:700 }}>
                + NODE
              </button>
            </>}
          </div>
        </div>
      </div>

      {/* ── MAP TAB ──────────────────────────────────────── */}
      {activeTab === 'map' && (
      <div style={{ flex:1, position:'relative', overflow:'hidden', background:BRAIN_BG }}>
        <svg ref={svgRef} width="100%" height="100%"
          onMouseDown={handleSvgMouseDown}
          style={{ cursor:isPanning?'grabbing':'default', display:'block' }}>

          <defs>
            {/* Glow filters for each edge type */}
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.9  0 0 0 0 0.3  0 0 0 0.8 0" result="col"/>
              <feMerge><feMergeNode in="col"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.5  0 0 0 0 0.1  0 0 0 0.8 0" result="col"/>
              <feMerge><feMergeNode in="col"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.8 0" result="col"/>
              <feMerge><feMergeNode in="col"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.3  0 0 0 0 0.9  0 0 0 0.8 0" result="col"/>
              <feMerge><feMergeNode in="col"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.4  0 0 0 0 0.1  0 0 0 0.8 0" result="col"/>
              <feMerge><feMergeNode in="col"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-grey" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.8  0 0 0 0 0.6  0 0 0 0 0.1  0 0 0 0.8 0" result="col"/>
              <feMerge><feMergeNode in="col"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            {/* Very faint dot grid */}
            <pattern id="neural-grid" width={40*transform.scale} height={40*transform.scale}
              patternTransform={`translate(${transform.x%(40*transform.scale)},${transform.y%(40*transform.scale)})`}
              patternUnits="userSpaceOnUse">
              <circle cx={0} cy={0} r={0.5} fill={BRAIN_GRID} />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill={BRAIN_BG} />
          <rect width="100%" height="100%" fill="url(#neural-grid)" />

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>

            {/* Edges — rendered first so nodes are on top */}
            {topicEdges.map(edge => (
              <BrainEdge key={edge.id} edge={edge}
                srcNode={nodes.find(n => n.id === edge.source)}
                tgtNode={nodes.find(n => n.id === edge.target)}
                selected={selectedEdgeId === edge.id}
                edgeTypes={edgeTypes}
                allEdges={edges}
                onSelect={id => { setSelectedEdgeId(id); setSelectedNodeId(null); }}
                onEdit={e => { setEditingEdge({...e}); setIsNewEdge(false); }} />
            ))}

            {/* All nodes — topics + satellites as circles */}
            {nodes.map(node => (
              <BrainNode key={node.id} node={node}
                edges={edges}
                nodeTypes={nodeTypes}
                selected={selectedNodeId === node.id}
                books={books}
                onMouseDown={makeDragHandler(node)}
                onDoubleClick={e => { e.stopPropagation(); if (node.type === 'topic') setActiveTopicId(node.id); else { setEditingNode({...node}); setIsNewNode(false); }; }} />
            ))}
          </g>
        </svg>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, pointerEvents:'none' }}>
            <div style={{ fontSize:48, opacity:0.08, color:'#00ff41' }}>◉</div>
            <div style={{ fontSize:15, color:'#3a3830', fontStyle:'italic', fontFamily:'Lora, Georgia, serif' }}>The construct is empty</div>
            <div style={{ fontSize:11, color:'#2a2820', fontFamily:'DM Mono, monospace', letterSpacing:'0.06em' }}>+ NODE to initialise the first memory</div>
          </div>
        )}

        {/* Zoom % */}
        <div style={{ position:'absolute', bottom:14, right:14, fontSize:10, color:'#00ff41', fontFamily:'DM Mono, monospace', background:'#0e0c0a', border:'1px solid #1a1814', borderRadius:2, padding:'3px 8px', opacity:0.6 }}>
          {Math.round(transform.scale*100)}%
        </div>

        {/* Bellflower in META */}
        {(() => {
          const notice = getBellflowerNotice('meta');
          return (
            <div style={{ position:'absolute', bottom:14, left:14, background:'#141210', border:'1px solid #2a2824', borderRadius:2, padding:'8px 12px', maxWidth:200 }}>
              <div style={{ fontSize:7, color:'#00ff41', fontFamily:'DM Mono, monospace', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5, display:'flex', alignItems:'center', gap:5, opacity:0.7 }}>
                <XiaoHuaIcon size={13} />
                <span>小花</span>
              </div>
              <div style={{ fontSize:10, color:'#6a6660', fontStyle:'italic', lineHeight:1.6, fontFamily:'Lora, Georgia, serif' }}>{notice}</div>
            </div>
          );
        })()}

        {/* Legend */}
        <div style={{ position:'absolute', top:14, right:14, background:'#141210', border:'1px solid #1a1814', borderRadius:2, padding:'8px 12px', fontSize:9 }}>
          <div style={{ color:'#3a3830', fontFamily:'DM Mono, monospace', marginBottom:5, letterSpacing:'0.06em' }}>LEGEND</div>
          {(edgeTypes||[]).slice(0,5).map(et => (
            <div key={et.id} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
              <div style={{ width:16, height:2, background:et.color, borderRadius:1, boxShadow:`0 0 4px ${et.color}88` }} />
              <span style={{ color:'#4a4840', fontFamily:'DM Mono, monospace', fontSize:8, letterSpacing:'0.04em' }}>{et.label}</span>
            </div>
          ))}
        </div>
      </div>
      )} {/* end map tab */}

      {/* ── CONNECTIONS TAB ──────────────────────────────── */}
      {activeTab === 'connections' && (
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', background:'#0e0c0a' }}>
          {topicEdges.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#3a3830', fontFamily:'Lora, Georgia, serif', fontStyle:'italic' }}>
              No connections yet. Link nodes in the Map tab.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {connectionMatrix.map(({ node, connections }) => (
                <div key={node.id} style={{ background:'#141210', border:'1px solid #2a2824', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ padding:'8px 14px', background:'#1a1814', display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:(nodeTypes.find(t=>t.id===node.type)||{color:'#7a6a52'}).color, flexShrink:0, boxShadow:`0 0 6px ${(nodeTypes.find(t=>t.id===node.type)||{color:'#7a6a52'}).color}88` }} />
                    <span style={{ fontSize:13, fontFamily:'Lora, Georgia, serif', fontStyle:'italic', color:'#e8e4dc', flex:1 }}>{node.label}</span>
                    <span style={{ fontSize:9, color:'#3a3830', fontFamily:'DM Mono, monospace' }}>{connections.length} connections</span>
                  </div>
                  {connections.map((c,i) => (
                    <div key={c.edge.id+i} style={{ padding:'7px 14px', borderBottom:i<connections.length-1?'1px solid #1a1814':'none', display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:10, color:c.color, fontFamily:'DM Mono, monospace', width:16, textAlign:'center', textShadow:`0 0 6px ${c.color}88` }}>{c.direction==='out'?'→':'←'}</span>
                      <span style={{ fontSize:8, padding:'2px 6px', background:c.color+'18', color:c.color, fontFamily:'DM Mono, monospace', borderRadius:2, flexShrink:0 }}>{c.typeLabel.toUpperCase()}</span>
                      <span style={{ fontSize:12, color:'#8a8680', fontFamily:'Lora, Georgia, serif', fontStyle:'italic', flex:1 }}>{c.other?.label}</span>
                      <button onClick={() => { setEditingEdge({...c.edge}); setIsNewEdge(false); setActiveTab('map'); }}
                        style={{ fontSize:9, color:'#3a3830', background:'none', border:'1px solid #2a2824', borderRadius:2, cursor:'pointer', padding:'2px 6px', fontFamily:'DM Mono, monospace' }}
                        onMouseEnter={e=>{ e.currentTarget.style.color='#00ff41'; e.currentTarget.style.borderColor='#00ff4144'; }}
                        onMouseLeave={e=>{ e.currentTarget.style.color='#3a3830'; e.currentTarget.style.borderColor='#2a2824'; }}>✎</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {editingNode && (
        <NodeEditModal node={editingNode} books={books} nodeTypes={nodeTypes} isNew={isNewNode}
          onSave={handleSaveNode} onDelete={handleDeleteNode}
          onClose={() => setEditingNode(null)} onManageTypes={onManageNodeTypes} />
      )}
      {editingEdge && (
        <EdgeEditModal edge={editingEdge} nodes={nodes} edgeTypes={edgeTypes} isNew={isNewEdge}
          onSave={handleSaveEdge} onDelete={handleDeleteEdge}
          onClose={() => setEditingEdge(null)} onManageTypes={onManageEdgeTypes} />
      )}
    </div>
  );
}

function ToolBtn({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ fontSize:10, padding:'5px 10px', borderRadius:2, border:'1px solid #2a2824', color:'#6a6660', background:'transparent', cursor:'pointer', fontFamily:'DM Mono, monospace', letterSpacing:'0.04em' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='#00ff4144'; e.currentTarget.style.color='#00ff41'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='#2a2824'; e.currentTarget.style.color='#6a6660'; }}>
      {children}
    </button>
  );
}
