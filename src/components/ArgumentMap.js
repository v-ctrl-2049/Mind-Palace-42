import React, { useRef, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getEvidenceProfile } from '../utils/evidenceProfile';

const NODE_TYPES = {
  cause:     { label: 'Cause',       color: '#c0392b', icon: '◉' },
  mechanism: { label: 'Mechanism',   color: '#b07d28', icon: '⟶' },
  claim:     { label: 'Claim',       color: '#2c5f8a', icon: '◈' },
  evidence:  { label: 'Evidence',    color: '#2e7d5e', icon: '⊕' },
  objection: { label: 'Objection',   color: '#7b3fa0', icon: '⊘' },
  verdict:   { label: 'Verdict',     color: '#1a5c3a', icon: '⊛' },
};

const EDGE_TYPES = {
  supports:   { label: 'supports',   color: '#2e7d5e', dash: false },
  undermines: { label: 'undermines', color: '#c0392b', dash: true  },
  leads_to:   { label: 'leads to',   color: '#2c5f8a', dash: false },
  qualifies:  { label: 'qualifies',  color: '#b07d28', dash: true  },
};

const NODE_W = 160;
const NODE_H = 64;

function ArgNode({ node, selected, onSelect, onDragEnd, onDoubleClick, scale, books }) {
  const nt     = NODE_TYPES[node.type] || NODE_TYPES.claim;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const ep     = getEvidenceProfile(node, books || []);

  // Visual encoding
  const borderColor    = selected ? nt.color : ep.grade === 'bare' ? '#aaa' : (isDark ? '#3a3630' : '#e8e4da');
  const borderWidth    = selected ? 2.5 : ep.grade === 'bare' ? 1 : 1.5;
  const dashArray      = ep.borderStyle === 'dashed' ? '5 3' : undefined;
  const bodyOpacity    = ep.opacity;
  const tintColor      = ep.methodNarrow ? '#b07d28' : null; // amber tint for method-narrow

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(node.id);
    const sx = e.clientX, sy = e.clientY;
    const ox = node.x, oy = node.y;
    const onMove = (me) => onDragEnd(node.id, ox + (me.clientX - sx) / scale, oy + (me.clientY - sy) / scale);
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [node, onSelect, onDragEnd, scale]);

  return (
    <g transform={`translate(${node.x},${node.y})`}
      onMouseDown={handleMouseDown}
      onDoubleClick={e => { e.stopPropagation(); onDoubleClick(node); }}
      style={{ cursor: 'pointer', userSelect: 'none' }}>
      {/* Shadow */}
      <rect x={2} y={3} width={NODE_W} height={NODE_H} rx={8} fill="rgba(0,0,0,0.08)" opacity={bodyOpacity} />
      {/* Body */}
      <rect width={NODE_W} height={NODE_H} rx={8}
        fill={tintColor ? tintColor + '11' : (isDark ? '#272420' : '#fff')}
        stroke={borderColor}
        strokeWidth={borderWidth}
        strokeDasharray={dashArray}
        opacity={bodyOpacity} />
      {/* Top bar */}
      <rect width={NODE_W} height={12} rx={8} fill={nt.color} opacity={bodyOpacity} />
      <rect x={0} y={6} width={NODE_W} height={6} fill={nt.color} opacity={bodyOpacity} />
      {/* Type label */}
      <text x={NODE_W / 2} y={10} fontSize={8} fontWeight={700} fill="#fff"
        textAnchor="middle" fontFamily="DM Mono,monospace" letterSpacing="0.08em"
        opacity={bodyOpacity}
        style={{ pointerEvents: 'none' }}>
        {nt.icon} {nt.label.toUpperCase()}
      </text>
      {/* Evidence icon — bottom-right corner */}
      {node.type !== 'verdict' && (
        <text x={NODE_W - 8} y={NODE_H - 5} fontSize={9} fill={ep.color}
          textAnchor="middle" fontFamily="DM Mono,monospace"
          opacity={0.8} style={{ pointerEvents: 'none' }}>
          {ep.icon}
        </text>
      )}
      {/* Method narrow amber dot */}
      {ep.methodNarrow && (
        <circle cx={NODE_W - 10} cy={14} r={3} fill="#b07d28" opacity={0.7} />
      )}
      {/* Node text */}
      <foreignObject x={6} y={16} width={NODE_W - 18} height={NODE_H - 20}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          fontSize: 11, fontWeight: 500, color: isDark ? '#e0dbd0' : '#2a2420',
          lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          fontFamily: 'Lora, Georgia, serif',
          opacity: bodyOpacity,
        }}>
          {node.text || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>double-click to edit</span>}
        </div>
      </foreignObject>
    </g>
  );
}

function ArgEdge({ edge, srcNode, tgtNode, selected, onSelect }) {
  if (!srcNode || !tgtNode) return null;
  const et = EDGE_TYPES[edge.type] || EDGE_TYPES.supports;
  const sx = srcNode.x + NODE_W / 2, sy = srcNode.y + NODE_H / 2;
  const tx = tgtNode.x + NODE_W / 2, ty = tgtNode.y + NODE_H / 2;
  const dx = tx - sx, dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist, uy = dy / dist;
  const offset = Math.min(NODE_W / 2 + 6, NODE_H / 2 + 6);
  const x1 = sx + ux * offset, y1 = sy + uy * offset;
  const x2 = tx - ux * offset, y2 = ty - uy * offset;
  const mid = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  const arrowId = `arg-arr-${edge.id}`;
  const col = selected ? '#b07d28' : et.color;

  return (
    <g onClick={e => { e.stopPropagation(); onSelect(edge.id); }} style={{ cursor: 'pointer' }}>
      <defs>
        <marker id={arrowId} markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill={col} opacity={0.9} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={14} />
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={col} strokeWidth={selected ? 2.5 : 1.5}
        strokeDasharray={et.dash ? '5 4' : undefined}
        markerEnd={`url(#${arrowId})`} opacity={selected ? 1 : 0.75} />
      <text x={mid.x} y={mid.y - 5} textAnchor="middle" fontSize={9}
        fill={col} fontFamily="DM Mono,monospace"
        style={{ pointerEvents: 'none' }}>
        {et.label}
      </text>
    </g>
  );
}

// ── Node edit modal ───────────────────────────────────────────────
function NodeModal({ node, onSave, onDelete, onClose, isNew }) {
  const [draft, setDraft] = useState({ ...node });
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: 400, padding: '18px 20px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 14 }}>{isNew ? 'Add node' : 'Edit node'}</div>
        {/* Type selector */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Type</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(NODE_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setDraft(d => ({ ...d, type: k }))}
                style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${draft.type === k ? v.color : 'var(--paper-3)'}`, background: draft.type === k ? v.color + '22' : 'transparent', color: draft.type === k ? v.color : 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>
        {/* Text */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Content</div>
          <textarea autoFocus value={draft.text || ''} onChange={e => setDraft(d => ({ ...d, text: e.target.value }))}
            placeholder="State the argument node clearly and concisely…"
            rows={3}
            style={{ width: '100%', resize: 'vertical', padding: '7px 10px', fontSize: 13, borderRadius: 6, fontFamily: 'var(--font-serif)', border: '1px solid var(--paper-3)' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <div>
            {!isNew && <button onClick={() => { onDelete(node.id); onClose(); }}
              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)', cursor: 'pointer', background: 'transparent' }}>Delete</button>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
            <button onClick={() => { onSave(draft); onClose(); }}
              style={{ fontSize: 12, padding: '5px 18px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>
              {isNew ? 'Add' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edge edit modal ───────────────────────────────────────────────
function EdgeModal({ edge, nodes, onSave, onDelete, onClose, isNew }) {
  const [draft, setDraft] = useState({ ...edge });
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: 380, padding: '18px 20px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 14 }}>{isNew ? 'Add connection' : 'Edit connection'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>From</div>
            <select value={draft.source || ''} onChange={e => setDraft(d => ({ ...d, source: e.target.value }))}
              style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 6 }}>
              <option value="">Select…</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.text?.slice(0, 35) || `(${NODE_TYPES[n.type]?.label || n.type})`}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>To</div>
            <select value={draft.target || ''} onChange={e => setDraft(d => ({ ...d, target: e.target.value }))}
              style={{ width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 6 }}>
              <option value="">Select…</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.text?.slice(0, 35) || `(${NODE_TYPES[n.type]?.label || n.type})`}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Relationship</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.entries(EDGE_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setDraft(d => ({ ...d, type: k }))}
                style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${draft.type === k ? v.color : 'var(--paper-3)'}`, background: draft.type === k ? v.color + '22' : 'transparent', color: draft.type === k ? v.color : 'var(--ink-3)' }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <div>
            {!isNew && <button onClick={() => { onDelete(edge.id); onClose(); }}
              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)', cursor: 'pointer', background: 'transparent' }}>Delete</button>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
            <button onClick={() => { if (draft.source && draft.target) { onSave(draft); onClose(); } }}
              disabled={!draft.source || !draft.target}
              style={{ fontSize: 12, padding: '5px 18px', borderRadius: 6, background: draft.source && draft.target ? 'var(--accent)' : 'var(--paper-3)', color: draft.source && draft.target ? 'var(--paper-card)' : 'var(--ink-4)', border: 'none', cursor: draft.source && draft.target ? 'pointer' : 'default' }}>
              {isNew ? 'Add' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Export to outline ─────────────────────────────────────────────
function toOutline(nodes, edges) {
  if (!nodes.length) return '';
  const lines = ['## Argument map\n'];
  // Group by type
  const byType = {};
  nodes.forEach(n => { if (!byType[n.type]) byType[n.type] = []; byType[n.type].push(n); });
  const order = ['cause', 'mechanism', 'claim', 'evidence', 'objection', 'verdict'];
  order.forEach(type => {
    if (!byType[type]) return;
    const nt = NODE_TYPES[type];
    lines.push(`### ${nt.icon} ${nt.label}s`);
    byType[type].forEach(n => {
      lines.push(`- ${n.text}`);
      // Find outgoing edges
      edges.filter(e => e.source === n.id).forEach(e => {
        const tgt = nodes.find(nd => nd.id === e.target);
        if (tgt) lines.push(`  → (${EDGE_TYPES[e.type]?.label || e.type}) ${tgt.text}`);
      });
    });
    lines.push('');
  });
  return lines.join('\n');
}

// ── Main ArgumentMap ──────────────────────────────────────────────
export default function ArgumentMap({ argMap, onChange, books = [] }) {
  const svgRef   = useRef(null);
  const nodes    = argMap?.nodes || [];
  const edges    = argMap?.edges || [];
  const [transform, setTransform]   = useState({ x: 40, y: 40, scale: 1 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [editingNode, setEditingNode]   = useState(null);
  const [editingEdge, setEditingEdge]   = useState(null);
  const [isNew, setIsNew]               = useState(false);
  const [isPanning, setIsPanning]       = useState(false);
  const [copied, setCopied]             = useState(false);
  const panStart = useRef(null);

  const setNodes = (fn) => onChange({ ...argMap, nodes: typeof fn === 'function' ? fn(nodes) : fn });
  const setEdges = (fn) => onChange({ ...argMap, edges: typeof fn === 'function' ? fn(edges) : fn });

  // Pan
  const handleSvgMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setSelectedNode(null); setSelectedEdge(null);
    setIsPanning(true);
    panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  }, [transform]);

  useEffect(() => {
    const onMove = e => { if (!isPanning || !panStart.current) return; setTransform(t => ({ ...t, x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y })); };
    const onUp   = () => setIsPanning(false);
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isPanning]);

  // Zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    setTransform(t => { const ns = Math.max(0.3, Math.min(2.5, t.scale * factor)); return { scale: ns, x: px - (px - t.x) * (ns / t.scale), y: py - (py - t.y) * (ns / t.scale) }; });
  }, []);

  useEffect(() => {
    const el = svgRef.current; if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleDragEnd = useCallback((id, x, y) => setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n)), [nodes, edges]);

  const addNode = (type = 'claim') => {
    const rect = svgRef.current?.getBoundingClientRect() || { width: 700, height: 400 };
    const x = (rect.width / 2 - transform.x) / transform.scale - NODE_W / 2 + (Math.random() - .5) * 80;
    const y = (rect.height / 2 - transform.y) / transform.scale - NODE_H / 2 + (Math.random() - .5) * 60;
    setEditingNode({ id: uuidv4(), type, text: '', x, y });
    setIsNew(true);
  };

  const copyOutline = () => {
    navigator.clipboard?.writeText(toOutline(nodes, edges));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0, background: 'var(--paper-2)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add:</span>
        {Object.entries(NODE_TYPES).map(([k, v]) => (
          <button key={k} onClick={() => addNode(k)}
            style={{ fontSize: 10, padding: '2px 9px', borderRadius: 20, border: `1px solid ${v.color}55`, background: v.color + '11', color: v.color, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
            onMouseEnter={e => e.currentTarget.style.background = v.color + '33'}
            onMouseLeave={e => e.currentTarget.style.background = v.color + '11'}>
            {v.icon} {v.label}
          </button>
        ))}
        <div style={{ width: 1, height: 14, background: 'var(--paper-3)' }} />
        <button onClick={() => { setEditingEdge({ id: uuidv4(), source: selectedNode || '', target: '', type: 'supports' }); setIsNew(true); }}
          style={{ fontSize: 10, padding: '2px 9px', borderRadius: 20, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>
          + connection
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          <button onClick={copyOutline} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 5, border: '1px solid var(--paper-3)', color: copied ? 'var(--green)' : 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
            {copied ? '✓ copied' : 'copy outline'}
          </button>
          <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', alignSelf: 'center' }}>{Math.round(transform.scale * 100)}%</span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <svg ref={svgRef} width="100%" height="100%"
          onMouseDown={handleSvgMouseDown}
          onDoubleClick={e => { if (e.target === svgRef.current || e.target.tagName === 'rect') addNode(); }}
          style={{ cursor: isPanning ? 'grabbing' : 'default', display: 'block', background: 'var(--paper)' }}>
          <defs>
            <pattern id="arg-grid" width={24 * transform.scale} height={24 * transform.scale}
              patternTransform={`translate(${transform.x % (24 * transform.scale)},${transform.y % (24 * transform.scale)})`}
              patternUnits="userSpaceOnUse">
              <circle cx={0} cy={0} r={1} fill="var(--paper-3)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arg-grid)" />
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {edges.map(edge => (
              <ArgEdge key={edge.id} edge={edge}
                srcNode={nodes.find(n => n.id === edge.source)}
                tgtNode={nodes.find(n => n.id === edge.target)}
                selected={selectedEdge === edge.id}
                onSelect={id => { setSelectedEdge(id); setSelectedNode(null); }} />
            ))}
            {nodes.map(node => (
              <ArgNode key={node.id} node={node}
                selected={selectedNode === node.id}
                onSelect={id => { setSelectedNode(id); setSelectedEdge(null); }}
                onDragEnd={handleDragEnd}
                onDoubleClick={n => { setEditingNode(n); setIsNew(false); }}
                scale={transform.scale}
                books={books} />
            ))}
          </g>
        </svg>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none' }}>
            <div style={{ fontSize: 28, opacity: 0.12 }}>⊛</div>
            <div style={{ fontSize: 13, color: 'var(--ink-4)', fontStyle: 'italic' }}>No argument nodes yet</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', maxWidth: 260, textAlign: 'center', lineHeight: 1.65 }}>
              Click a node type above to add your first node, or double-click anywhere on the canvas.
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 7, padding: '8px 10px', fontSize: 10 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Connections</div>
          {Object.entries(EDGE_TYPES).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke={v.color} strokeWidth={1.5} strokeDasharray={v.dash ? '4 3' : undefined} /></svg>
              <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{v.label}</span>
            </div>
          ))}
          <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, marginTop: 8 }}>Evidence</div>
          {[
            { icon: '⊕', color: '#2e7d5e', label: 'primary source' },
            { icon: '◈', color: '#2c5f8a', label: 'secondary only' },
            { icon: '◉', color: '#b07d28', label: 'type unset' },
            { icon: '◌', color: '#8a8680', label: 'no sources (dashed)' },
          ].map(({ icon, color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 10, color, width: 12, textAlign: 'center' }}>{icon}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#b07d28', display: 'inline-block', opacity: 0.7 }} />
            <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>method narrow</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingNode && (
        <NodeModal node={editingNode} isNew={isNew}
          onSave={n => { if (isNew) setNodes(p => [...p, n]); else setNodes(p => p.map(x => x.id === n.id ? n : x)); }}
          onDelete={id => { setNodes(p => p.filter(n => n.id !== id)); setEdges(p => p.filter(e => e.source !== id && e.target !== id)); }}
          onClose={() => setEditingNode(null)} />
      )}
      {editingEdge && (
        <EdgeModal edge={editingEdge} nodes={nodes} isNew={isNew}
          onSave={e => { if (isNew) setEdges(p => [...p, e]); else setEdges(p => p.map(x => x.id === e.id ? e : x)); }}
          onDelete={id => setEdges(p => p.filter(e => e.id !== id))}
          onClose={() => setEditingEdge(null)} />
      )}
    </div>
  );
}
