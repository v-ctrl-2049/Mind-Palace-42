import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PIN_TYPES, getPinType, lngLatToXY } from '../data/worldmap';
import PinEditModal from './PinEditModal';

// Improved land paths — more detailed, includes coastlines and major features
const LANDS = [
  // North America
  { id:'na',  fill:'land', d:'M 62 95 L 75 78 L 95 68 L 118 62 L 142 60 L 165 62 L 182 68 L 195 78 L 205 88 L 215 100 L 218 115 L 212 128 L 202 138 L 192 148 L 180 158 L 168 168 L 155 178 L 144 188 L 132 196 L 118 202 L 104 205 L 90 202 L 78 195 L 68 184 L 60 170 L 57 155 L 58 138 L 62 120 Z'},
  // Greenland
  { id:'gl',  fill:'land', d:'M 192 30 L 215 24 L 238 26 L 252 36 L 255 50 L 248 62 L 235 68 L 218 66 L 205 58 L 196 46 Z'},
  // Central America
  { id:'cam', fill:'land', d:'M 132 196 L 145 200 L 155 210 L 152 220 L 142 226 L 132 220 L 125 210 Z'},
  // Caribbean (simplified)
  { id:'car', fill:'island', d:'M 165 195 L 170 192 L 175 198 L 170 202 Z'},
  // South America
  { id:'sa',  fill:'land', d:'M 142 226 L 162 218 L 185 222 L 205 232 L 215 248 L 218 268 L 215 290 L 208 315 L 198 338 L 185 355 L 170 362 L 155 358 L 142 342 L 132 320 L 125 295 L 122 270 L 125 248 Z'},
  // Iceland
  { id:'ic',  fill:'land', d:'M 248 52 L 262 46 L 272 50 L 275 60 L 265 68 L 252 66 Z'},
  // UK / Ireland
  { id:'uk',  fill:'land', d:'M 278 84 L 288 78 L 298 82 L 302 92 L 295 100 L 283 98 Z'},
  { id:'ire', fill:'land', d:'M 268 88 L 276 84 L 280 92 L 274 98 L 266 95 Z'},
  // Scandinavia
  { id:'sc',  fill:'land', d:'M 308 50 L 325 42 L 342 44 L 355 52 L 358 65 L 350 76 L 336 80 L 320 78 L 308 70 Z'},
  // Europe
  { id:'eu',  fill:'land', d:'M 285 100 L 310 85 L 338 82 L 362 86 L 378 96 L 385 108 L 378 122 L 362 130 L 344 135 L 326 138 L 308 136 L 290 128 L 280 118 Z'},
  // Iberian peninsula
  { id:'ib',  fill:'land', d:'M 275 115 L 290 108 L 305 112 L 308 126 L 298 136 L 282 136 L 270 126 Z'},
  // Italy
  { id:'it',  fill:'land', d:'M 325 118 L 335 115 L 342 122 L 340 135 L 330 142 L 318 138 L 315 128 Z'},
  // North Africa
  { id:'naf', fill:'land2', d:'M 270 148 L 310 140 L 355 138 L 400 140 L 438 145 L 455 155 L 458 168 L 450 178 L 420 182 L 385 182 L 348 180 L 315 178 L 285 172 L 264 162 Z'},
  // West Africa
  { id:'waf', fill:'land', d:'M 265 165 L 290 172 L 310 178 L 322 192 L 328 210 L 325 230 L 312 248 L 295 260 L 275 262 L 258 252 L 248 235 L 245 215 L 248 195 L 258 180 Z'},
  // East Africa
  { id:'eaf', fill:'land', d:'M 380 182 L 415 182 L 435 188 L 448 200 L 455 218 L 452 238 L 440 255 L 422 268 L 400 275 L 378 272 L 360 260 L 348 242 L 345 222 L 350 202 L 362 192 Z'},
  // South Africa
  { id:'saf', fill:'land', d:'M 348 242 L 380 235 L 415 240 L 440 255 L 435 280 L 418 305 L 395 318 L 372 320 L 350 308 L 335 288 L 335 268 Z'},
  // Middle East
  { id:'me',  fill:'land2', d:'M 378 120 L 415 115 L 445 118 L 462 128 L 468 142 L 462 155 L 445 162 L 418 165 L 392 162 L 372 152 L 365 138 Z'},
  // Arabian Peninsula
  { id:'ar',  fill:'land2', d:'M 415 165 L 448 162 L 468 168 L 478 182 L 475 200 L 460 215 L 440 220 L 418 215 L 405 200 L 402 182 Z'},
  // Central Asia
  { id:'ca',  fill:'land', d:'M 462 90 L 510 80 L 548 82 L 565 92 L 568 108 L 558 120 L 535 128 L 508 132 L 480 128 L 460 118 L 455 104 Z'},
  // South Asia (India)
  { id:'in',  fill:'land', d:'M 462 128 L 510 125 L 535 132 L 542 148 L 538 165 L 525 182 L 505 195 L 485 198 L 465 188 L 452 172 L 448 155 Z'},
  // Sri Lanka
  { id:'sl',  fill:'island', d:'M 510 200 L 515 196 L 520 202 L 515 208 Z'},
  // Russia / Siberia (simplified)
  { id:'ru',  fill:'land', d:'M 335 42 L 405 28 L 478 22 L 548 20 L 608 28 L 638 42 L 642 60 L 632 72 L 608 78 L 572 82 L 540 82 L 505 80 L 468 86 L 432 90 L 398 90 L 368 86 L 342 78 L 328 65 Z'},
  // East Asia (China + Korea + Japan area)
  { id:'ea',  fill:'land', d:'M 548 82 L 592 78 L 622 82 L 640 95 L 645 112 L 638 128 L 618 142 L 595 150 L 572 152 L 550 145 L 535 132 L 535 115 L 540 98 Z'},
  // Japan
  { id:'jp',  fill:'land', d:'M 618 92 L 632 85 L 642 90 L 645 105 L 635 115 L 622 115 L 615 105 Z'},
  // Southeast Asia (mainland)
  { id:'sea', fill:'land', d:'M 550 145 L 578 148 L 600 152 L 610 165 L 605 180 L 588 188 L 568 185 L 548 175 L 540 162 Z'},
  // Indonesia (simplified)
  { id:'ind', fill:'island', d:'M 565 195 L 588 190 L 608 195 L 612 205 L 595 210 L 572 208 Z'},
  { id:'ind2',fill:'island', d:'M 618 192 L 638 188 L 645 198 L 635 205 L 620 202 Z'},
  // Australia
  { id:'au',  fill:'land', d:'M 552 262 L 595 250 L 635 252 L 655 265 L 660 285 L 655 308 L 638 328 L 612 338 L 585 335 L 560 320 L 548 298 L 545 278 Z'},
  // New Zealand
  { id:'nz1', fill:'land', d:'M 648 320 L 658 315 L 665 325 L 658 335 L 648 332 Z'},
  { id:'nz2', fill:'land', d:'M 655 338 L 662 332 L 668 342 L 660 350 L 652 346 Z'},
  // Madagascar
  { id:'mg',  fill:'land', d:'M 438 255 L 448 248 L 456 258 L 452 278 L 442 282 L 434 272 Z'},
];

function Tooltip({ pin, book, books, x, y, onEdit, onClose, onViewTimeline }) {
  const pt = getPinType(pin.type);
  const linkedBooks = books.filter(b => (pin.bookIds || [pin.bookId]).includes(b.id));
  return (
    <div style={{ position: 'absolute', left: Math.min(x + 14, window.innerWidth - 270), top: Math.max(Math.min(y - 10, window.innerHeight - 220), 8), width: 250, background: 'var(--paper-card)', border: `1px solid var(--paper-3)`, borderLeft: `3px solid ${pt.color}`, borderRadius: 10, padding: '12px 14px', boxShadow: 'var(--shadow-md)', zIndex: 20, pointerEvents: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 10, color: pt.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pt.label}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3, marginTop: 2 }}>{pin.label}</div>
        </div>
        <button onClick={onClose} style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 8, flexShrink: 0, cursor: 'pointer' }}>✕</button>
      </div>
      {linkedBooks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {linkedBooks.map(b => (
            <span key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ink-3)', fontStyle: 'italic' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: b.color }} />{b.title}
            </span>
          ))}
        </div>
      )}
      {pin.note && <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 8 }}>{pin.note}</p>}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => onEdit(pin)} style={{ fontSize: 11, padding: '3px 12px', borderRadius: 6, background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--accent-2)', cursor: 'pointer' }}>Edit</button>
        {pin.eventTag && <button onClick={() => onViewTimeline(pin.eventTag)} style={{ fontSize: 11, padding: '3px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-2)', cursor: 'pointer' }}>→ Timeline</button>}
      </div>
    </div>
  );
}

export default function WorldMapView({ pins, routes, books, onUpdatePins, onUpdateRoutes, onSwitchToTimeline }) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [editingPin, setEditingPin] = useState(null);
  const [isNewPin, setIsNewPin] = useState(false);
  const [showEvents, setShowEvents]   = useState(true);
  const [showOrigins, setShowOrigins] = useState(true);
  const [showRoutes, setShowRoutes]   = useState(true);
  const [showPersons, setShowPersons] = useState(true);
  const [filterBook, setFilterBook]   = useState('all');

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const ocean  = isDark ? '#1c2230' : '#c8dff0';
  const land   = isDark ? '#2d2e28' : '#d8d4c8';
  const land2  = isDark ? '#2a2c26' : '#d2ceba'; // slightly different for deserts
  const island = isDark ? '#2d2e28' : '#d8d4c8';
  const coast  = isDark ? '#3a3c34' : '#b8b2a0';
  const grid   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';

  // Pan
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setTooltip(null); setIsPanning(true);
    panStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  }, [transform]);

  useEffect(() => {
    const onMove = (e) => { if (!isPanning || !panStart.current) return; setTransform(t => ({ ...t, x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y })); };
    const onUp = () => setIsPanning(false);
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isPanning]);

  // Zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    setTransform(t => { const ns = Math.max(0.6, Math.min(10, t.scale * factor)); return { scale: ns, x: px - (px - t.x) * (ns / t.scale), y: py - (py - t.y) * (ns / t.scale) }; });
  }, []);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const visiblePins = useMemo(() => pins.filter(p => {
    if (filterBook !== 'all' && !(p.bookIds || []).includes(filterBook) && p.bookId !== filterBook) return false;
    if (p.type === 'event'  && !showEvents)  return false;
    if (p.type === 'origin' && !showOrigins) return false;
    if ((p.type === 'person' || p.type === 'setting' || p.type === 'place') && !showPersons) return false;
    return true;
  }), [pins, filterBook, showEvents, showOrigins, showPersons]);

  const toSvg = (lng, lat) => lngLatToXY(lng, lat);

  const routePolylines = useMemo(() => {
    if (!showRoutes) return [];
    return routes.map(r => ({ ...r, pts: r.points.map(([lat, lng]) => { const { x, y } = toSvg(lng, lat); return `${x},${y}`; }).join(' ') }));
  }, [routes, showRoutes]);

  const handlePinClick = (e, pin) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({ pin, screenX: e.clientX - rect.left, screenY: e.clientY - rect.top });
  };

  const handleAddPin = () => { setEditingPin({ id: uuidv4(), type: 'event', label: '', lat: 30, lng: 20, bookIds: [], bookId: '', eventTag: '', note: '' }); setIsNewPin(true); };
  const handleSavePin = (updated) => { if (isNewPin) onUpdatePins(prev => [...prev, updated]); else onUpdatePins(prev => prev.map(p => p.id === updated.id ? updated : p)); };
  const handleDeletePin = (id) => { onUpdatePins(prev => prev.filter(p => p.id !== id)); setTooltip(null); };
  const fitView = () => setTransform({ x: 0, y: 0, scale: 1 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Topbar */}
      <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: 'var(--paper-2)', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>World map</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>{visiblePins.length} pins · scroll to zoom · drag to pan</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <LayerBtn active={showEvents}   onClick={() => setShowEvents(s=>!s)}   color="#c0392b">Events</LayerBtn>
          <LayerBtn active={showOrigins}  onClick={() => setShowOrigins(s=>!s)}  color="#2c5f8a">Origins</LayerBtn>
          <LayerBtn active={showPersons}  onClick={() => setShowPersons(s=>!s)}  color="#7b3fa0">People</LayerBtn>
          <LayerBtn active={showRoutes}   onClick={() => setShowRoutes(s=>!s)}   color="#b07d28">Routes</LayerBtn>
          <div style={{ width: 1, height: 18, background: 'var(--paper-3)' }} />
          <select value={filterBook} onChange={e => setFilterBook(e.target.value)}
            style={{ fontSize: 11, padding: '4px 24px 4px 8px', borderRadius: 6, background: 'var(--paper-2)', color: 'var(--ink-2)', border: '1px solid var(--paper-3)' }}>
            <option value="all">All books</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
          <button onClick={fitView} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-2)', background: 'var(--paper-card)', cursor: 'pointer' }}>⊡</button>
          <button onClick={handleAddPin} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>+ Pin</button>
        </div>
      </div>

      {/* Map */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: ocean, cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown} onClick={() => setTooltip(null)}>
        <svg width="100%" height="100%" viewBox="0 0 680 420" preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <defs>
            {/* Subtle gradient for ocean depth */}
            <radialGradient id="ocean-grad" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor={isDark ? '#1c2535' : '#d8ecf8'} />
              <stop offset="100%" stopColor={ocean} />
            </radialGradient>
            {/* Land texture via subtle pattern */}
            <pattern id="land-hatch" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="none"/>
              <line x1="0" y1="4" x2="4" y2="0" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} strokeWidth="0.5"/>
            </pattern>
            <filter id="pin-glow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {/* Ocean */}
            <rect x="-500" y="-500" width="1680" height="1420" fill="url(#ocean-grad)" />

            {/* Latitude grid lines */}
            {[-60,-30,0,30,60].map(lat => {
              const { y } = toSvg(0, lat);
              return <line key={lat} x1={-100} y1={y} x2={780} y2={y} stroke={grid} strokeWidth={0.5} />;
            })}
            {[-120,-60,0,60,120].map(lng => {
              const { x } = toSvg(lng, 0);
              return <line key={lng} x1={x} y1={-50} x2={x} y2={470} stroke={grid} strokeWidth={0.5} />;
            })}

            {/* Land masses */}
            {LANDS.map(l => (
              <path key={l.id} d={l.d}
                fill={l.fill === 'land2' ? land2 : l.fill === 'island' ? island : land}
                stroke={coast} strokeWidth={0.4}
              />
            ))}

            {/* Land texture overlay */}
            {LANDS.map(l => (
              <path key={l.id + '-tex'} d={l.d} fill="url(#land-hatch)" stroke="none" opacity={0.5} />
            ))}

            {/* Equator highlight */}
            {(() => { const { y } = toSvg(0, 0); return <line x1={-100} y1={y} x2={780} y2={y} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'} strokeWidth={0.8} strokeDasharray="4 4" />; })()}

            {/* Routes */}
            {routePolylines.map(r => (
              <g key={r.id}>
                <polyline points={r.pts} fill="none" stroke={r.color} strokeWidth={1.8}
                  strokeDasharray={r.dash ? '7 4' : undefined} opacity={0.65}
                  strokeLinecap="round" strokeLinejoin="round" />
                {/* Route glow */}
                <polyline points={r.pts} fill="none" stroke={r.color} strokeWidth={4}
                  strokeDasharray={r.dash ? '7 4' : undefined} opacity={0.12}
                  strokeLinecap="round" strokeLinejoin="round" />
                {(() => {
                  const mid = Math.floor(r.points.length / 2);
                  const [mlat, mlng] = r.points[mid];
                  const { x, y } = toSvg(mlng, mlat);
                  return (
                    <text x={x} y={y - 6} textAnchor="middle" fontSize={6.5} fill={r.color}
                      fontFamily="DM Mono,monospace" opacity={0.9}
                      style={{ pointerEvents: 'none' }}>
                      {r.label}
                    </text>
                  );
                })()}
              </g>
            ))}

            {/* Pins */}
            {visiblePins.map(pin => {
              const { x, y } = toSvg(pin.lng, pin.lat);
              const pt = getPinType(pin.type);
              const linkedBooks = books.filter(b => (pin.bookIds || [pin.bookId]).includes(b.id));
              const isSelected = tooltip?.pin?.id === pin.id;
              return (
                <g key={pin.id} transform={`translate(${x},${y})`}
                  onClick={e => handlePinClick(e, pin)} style={{ cursor: 'pointer' }}>
                  {/* Outer glow pulse */}
                  {isSelected && <circle r={16} fill={pt.color} opacity={0.15} />}
                  <circle r={isSelected ? 12 : 9} fill={pt.color} opacity={0.12} />
                  {/* Pin shadow */}
                  <circle r={5} cx={0.5} cy={1} fill="rgba(0,0,0,0.25)" />
                  {/* Pin body */}
                  <circle r={5} fill={pt.color}
                    stroke={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)'}
                    strokeWidth={1.5} filter={isSelected ? 'url(#pin-glow)' : undefined} />
                  {/* Multi-book rings */}
                  {linkedBooks.slice(0,3).map((b, i) => (
                    <circle key={b.id} r={7 + i * 3} fill="none" stroke={b.color}
                      strokeWidth={1} opacity={0.7} />
                  ))}
                  {/* Label */}
                  <text y={-10} textAnchor="middle" fontSize={7.5}
                    fill={isDark ? '#d8d4cc' : '#1a1814'} fontFamily="Lora,Georgia,serif"
                    fontWeight={isSelected ? 600 : 400} stroke={isDark ? '#1a1814' : '#ffffff'}
                    strokeWidth={2} paintOrder="stroke"
                    style={{ pointerEvents: 'none' }}>
                    {pin.label.length > 16 ? pin.label.slice(0,16) + '…' : pin.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Tooltip */}
        {tooltip && <Tooltip pin={tooltip.pin} book={books.find(b=>b.id===tooltip.pin.bookId)} books={books} x={tooltip.screenX} y={tooltip.screenY} onEdit={p => { setEditingPin(p); setIsNewPin(false); setTooltip(null); }} onClose={() => setTooltip(null)} onViewTimeline={() => { setTooltip(null); onSwitchToTimeline?.(); }} />}

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 8, padding: '10px 12px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={LL}>Pin types</div>
          {PIN_TYPES.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.label}</span>
            </div>
          ))}
          <div style={{ height: 1, background: 'var(--paper-3)', margin: '6px 0' }} />
          <div style={{ fontSize: 10, color: 'var(--ink-4)', lineHeight: 1.6, fontStyle: 'italic' }}>Rings = linked books<br />Click for details</div>
        </div>

        {/* Zoom % */}
        <div style={{ position: 'absolute', bottom: 14, right: 14, fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 5, padding: '3px 8px', boxShadow: 'var(--shadow-sm)' }}>
          {Math.round(transform.scale * 100)}%
        </div>

        {/* Stats */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[{l:'Events',c:pins.filter(p=>p.type==='event').length,col:'#c0392b'},{l:'Origins',c:pins.filter(p=>p.type==='origin').length,col:'#2c5f8a'},{l:'People',c:pins.filter(p=>p.type==='person').length,col:'#7b3fa0'},{l:'Routes',c:routes.length,col:'#b07d28'}].map(s => (
            <div key={s.l} style={{ background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 6, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.col }} />
              <span style={{ fontSize: 10, color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{s.c}</strong> {s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {editingPin && <PinEditModal pin={editingPin} books={books} isNew={isNewPin} onSave={handleSavePin} onDelete={handleDeletePin} onClose={() => setEditingPin(null)} />}
    </div>
  );
}

function LayerBtn({ active, onClick, color, children }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${active ? color : 'var(--paper-3)'}`, background: active ? color + '22' : 'transparent', color: active ? color : 'var(--ink-4)', fontWeight: active ? 500 : 400, display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: active ? color : 'var(--paper-3)' }} />
      {children}
    </button>
  );
}

const LL = { fontSize: 10, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginBottom: 6 };
