import React, { useState } from 'react';

// ── Seeded RNG ────────────────────────────────────────────────────
function seededRng(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return () => { h ^= h << 13; h ^= h >> 17; h ^= h << 5; return (h >>> 0) / 0xFFFFFFFF; };
}

// ── Colour helpers ────────────────────────────────────────────────
function darken(hex, amt = 0.35) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.round(r*(1-amt))},${Math.round(g*(1-amt))},${Math.round(b*(1-amt))})`;
}
function lighten(hex, amt = 0.55) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.min(255,Math.round(r+(255-r)*amt))},${Math.min(255,Math.round(g+(255-g)*amt))},${Math.min(255,Math.round(b+(255-b)*amt))})`;
}
function toVeryDark(hex) {
  // near-black but retains colour hue — for Neuromancer bg
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgb(${Math.round(r*0.12+4)},${Math.round(g*0.14+4)},${Math.round(b*0.10+4)})`;
}

// ── Classify book — Neuromancer vs Loeb ───────────────────────────
const NEURO_GENRES = new Set([
  'classics','philosophy','theory','ancient','political theory','critical theory',
  'ancient history','greek','latin','continental philosophy','metaphysics',
  'epistemology','phenomenology','ethics','logic','aesthetics',
]);
const NEURO_AUTHORS = [
  'plato','aristotle','marx','hegel','kant','foucault','nietzsche','hume',
  'descartes','spinoza','leibniz','locke','rousseau','hobbes','wittgenstein',
  'heidegger','sartre','camus','derrida','althusser','lukács','gramsci',
  'socrates','thucydides','herodotus','homer','virgil','cicero','tacitus',
  'marcus aurelius','seneca','epictetus','augustine','aquinas','machiavelli',
  'confucius','laozi','zhuangzi','sun tzu','ibn khaldun','averroes',
];

function isNeuromancerStyle(book) {
  const genre = (book.genre||'').toLowerCase();
  const author = (book.author||'').toLowerCase();
  if (NEURO_GENRES.has(genre)) return true;
  if (NEURO_AUTHORS.some(a => author.includes(a))) return true;
  // Also check title keywords
  const title = (book.title||'').toLowerCase();
  const classicTitles = ['republic','iliad','odyssey','aeneid','capital','critique','phenomenology','being','ethics','meditations','symposium','apology','nicomachean','leviathan','discourse','genealogy','discipline'];
  if (classicTitles.some(t => title.includes(t))) return true;
  return false;
}



// ── NEUROMANCER COVER ─────────────────────────────────────────────
function NeuromancerCover({ book, width = 120, height = 160 }) {
  const rng    = seededRng(book.id + 'neo');
  const color  = book.color || '#2a6a2a';
  const bg     = toVeryDark(color);
  const accent = lighten(color, 0.55);
  const pct    = book.pages ? Math.min(100, Math.round((book.progress||0)/book.pages*100)) : 0;
  const glitch1Y = Math.round(rng() * 60 + 30);
  const glitch2Y = Math.round(rng() * 40 + 80);
  const glitch1W = Math.round(rng() * 40 + 20);
  const glitch2W = Math.round(rng() * 30 + 15);
  const glitch1X = Math.round(rng() * (width - glitch1W));
  const glitch2X = Math.round(rng() * (width - glitch2W));
  const brokenCorner = Math.floor(rng() * 4);
  return (
    <div style={{ width, height, background: bg, position:'relative', overflow:'hidden', borderRadius:'2px 3px 3px 2px' }}>
      <svg style={{ position:'absolute', inset:0, pointerEvents:'none' }} width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width={width-12} height={height-12} fill="none" stroke={accent} strokeWidth="0.6" opacity="0.5"/>
        <rect x="9" y="9" width={width-18} height={height-18} fill="none" stroke={accent} strokeWidth="0.35" opacity="0.3"/>
        {[[7,7],[width-7,7],[7,height-7],[width-7,height-7]].map(([cx,cy],i) => (
          i === brokenCorner
            ? <g key={i}><rect x={cx-4} y={cy-4} width={5} height={8} fill="none" stroke={accent} strokeWidth="0.7" opacity="0.3"/></g>
            : <g key={i}><rect x={cx-3} y={cy-3} width={6} height={6} fill={accent} opacity="0.55"/><rect x={cx-5} y={cy-5} width={10} height={10} fill="none" stroke={accent} strokeWidth="0.5" opacity="0.35"/></g>
        ))}
        <line x1="16" y1="7" x2={width*0.4} y2="7" stroke={accent} strokeWidth="0.8" opacity="0.4"/>
        <line x1={width*0.6} y1="7" x2={width-16} y2="7" stroke={accent} strokeWidth="0.8" opacity="0.4"/>
        <line x1="16" y1={height-7} x2={width*0.35} y2={height-7} stroke={accent} strokeWidth="0.8" opacity="0.4"/>
        <line x1={width*0.65} y1={height-7} x2={width-16} y2={height-7} stroke={accent} strokeWidth="0.8" opacity="0.4"/>
        <line x1="7" y1="16" x2="7" y2={height*0.38} stroke={accent} strokeWidth="0.8" opacity="0.4"/>
        <line x1="7" y1={height*0.62} x2="7" y2={height-16} stroke={accent} strokeWidth="0.8" opacity="0.4"/>
        <line x1={width-7} y1="16" x2={width-7} y2={height*0.42} stroke={accent} strokeWidth="0.8" opacity="0.4"/>
        <line x1={width-7} y1={height*0.58} x2={width-7} y2={height-16} stroke={accent} strokeWidth="0.8" opacity="0.4"/>
        <rect x={glitch1X} y={glitch1Y} width={glitch1W} height={2} fill={accent} opacity="0.18"/>
        <rect x={glitch2X} y={glitch2Y} width={glitch2W} height={1.5} fill={accent} opacity="0.14"/>
      </svg>
      <div style={{ position:'absolute', top:20, left:10, right:10 }}>
        <div style={{ fontSize:12, fontWeight:700, fontFamily:'var(--font-display)', fontStyle:'italic', color:accent, lineHeight:1.2, letterSpacing:'0.04em', textShadow:`0 0 8px ${accent}66` }}>
          {book.title}
        </div>
      </div>
      <div style={{ position:'absolute', bottom:22, left:10, right:10 }}>
        <div style={{ fontSize:7.5, color:accent, opacity:0.7, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.12em', textTransform:'uppercase' }}>{book.author}</div>
        {book.year && <div style={{ fontSize:6.5, color:accent, opacity:0.4, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em', marginTop:2 }}>{book.year < 0 ? `${Math.abs(book.year)} BCE` : book.year}</div>}
      </div>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:5, background:'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }}/>
      {book.status === 'reading' && pct > 0 && <div style={{ position:'absolute', bottom:0, left:0, width:`${pct}%`, height:2, background:accent, opacity:0.8 }}/>}
    </div>
  );
}

// ── LOEB COVER ────────────────────────────────────────────────────
function LoebCover({ book, width = 120, height = 160 }) {
  const color   = book.color || '#7a5c38';
  const binding = darken(color, 0.28);
  const gold    = lighten(color, 0.62);
  const pct     = book.pages ? Math.min(100, Math.round((book.progress||0)/book.pages*100)) : 0;
  const rng     = seededRng(book.id + 'loeb');
  const glyphs  = ['✦','◊','⊕','◈','⊛','✶','◉','⊗'];
  const medallion = glyphs[Math.floor(rng() * glyphs.length)];
  return (
    <div style={{ width, height, background:binding, position:'relative', overflow:'hidden', borderRadius:'2px 3px 3px 2px' }}>
      <svg style={{ position:'absolute', inset:0, pointerEvents:'none' }} width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width={width-10} height={height-10} fill="none" stroke={gold} strokeWidth="0.85" opacity="0.65"/>
        <rect x="8" y="8" width={width-16} height={height-16} fill="none" stroke={gold} strokeWidth="0.4" opacity="0.4"/>
        {Array.from({length:Math.floor((width-24)/8)},(_,i)=>{const x=14+i*8,y=6.5;return i%2===0?<polygon key={i} points={`${x},${y-2} ${x+2},${y} ${x},${y+2} ${x-2},${y}`} fill={gold} opacity="0.55"/>:<circle key={i} cx={x} cy={y} r="0.7" fill={gold} opacity="0.45"/>;})}
        {Array.from({length:Math.floor((width-24)/8)},(_,i)=>{const x=14+i*8,y=height-6.5;return i%2===0?<polygon key={i} points={`${x},${y-2} ${x+2},${y} ${x},${y+2} ${x-2},${y}`} fill={gold} opacity="0.55"/>:<circle key={i} cx={x} cy={y} r="0.7" fill={gold} opacity="0.45"/>;})}
        {Array.from({length:Math.floor((height-24)/8)},(_,i)=>{const x=6.5,y=14+i*8;return i%2===0?<polygon key={i} points={`${x-2},${y} ${x},${y-2} ${x+2},${y} ${x},${y+2}`} fill={gold} opacity="0.55"/>:<circle key={i} cx={x} cy={y} r="0.7" fill={gold} opacity="0.45"/>;})}
        {Array.from({length:Math.floor((height-24)/8)},(_,i)=>{const x=width-6.5,y=14+i*8;return i%2===0?<polygon key={i} points={`${x-2},${y} ${x},${y-2} ${x+2},${y} ${x},${y+2}`} fill={gold} opacity="0.55"/>:<circle key={i} cx={x} cy={y} r="0.7" fill={gold} opacity="0.45"/>;})}
        {[[12,12],[width-12,12],[12,height-12],[width-12,height-12]].map(([cx,cy],i)=>(
          <g key={i}><polygon points={`${cx},${cy-5} ${cx+5},${cy} ${cx},${cy+5} ${cx-5},${cy}`} fill="none" stroke={gold} strokeWidth="0.8" opacity="0.6"/><circle cx={cx} cy={cy} r="1.2" fill={gold} opacity="0.7"/></g>
        ))}
        <circle cx={width/2} cy={height/2} r="18" fill="none" stroke={gold} strokeWidth="0.8" opacity="0.45"/>
        <circle cx={width/2} cy={height/2} r="14" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.3"/>
      </svg>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:22, color:gold, opacity:0.45, fontFamily:'var(--font-display)', lineHeight:1, userSelect:'none' }}>{medallion}</div>
      <div style={{ position:'absolute', top:16, left:13, right:13, textAlign:'center' }}>
        <div style={{ height:'0.5px', background:gold, opacity:0.35, marginBottom:6 }}/>
        <div style={{ fontSize:10, fontWeight:700, fontFamily:'var(--font-display)', fontStyle:'italic', color:gold, lineHeight:1.25, letterSpacing:'0.02em', textShadow:`0 1px 3px rgba(0,0,0,0.4)` }}>{book.title}</div>
        <div style={{ height:'0.5px', background:gold, opacity:0.35, marginTop:6 }}/>
      </div>
      <div style={{ position:'absolute', bottom:16, left:13, right:13, textAlign:'center' }}>
        <div style={{ height:'0.5px', background:gold, opacity:0.35, marginBottom:5 }}/>
        {book.author && <div style={{ fontSize:7.5, color:gold, opacity:0.75, fontStyle:'italic', lineHeight:1.2, fontFamily:'var(--font-serif)' }}>{book.author}</div>}
        {book.year && <div style={{ fontSize:6.5, color:gold, opacity:0.4, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.08em', marginTop:2 }}>{book.year < 0 ? `${Math.abs(book.year)} BCE` : book.year}</div>}
      </div>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:5, background:'linear-gradient(to right, rgba(0,0,0,0.25), transparent)' }}/>
      {book.status === 'reading' && pct > 0 && <div style={{ position:'absolute', bottom:0, left:0, width:`${pct}%`, height:2, background:gold, opacity:0.6 }}/>}
    </div>
  );
}

// ── Classify ───────────────────────────────────
// ── PUBLIC: BookCard ──────────────────────────────────────────────
export function BookCard({ book, status, onClick, selected }) {
  const [hovered, setHovered] = useState(false);
  const isNeo  = isNeuromancerStyle(book);
  const color  = book.color || '#7a5c38';
  const accent = isNeo ? lighten(color, 0.55) : lighten(color, 0.62);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ width:120, flexShrink:0, cursor:'pointer', position:'relative',
        transform: hovered ? 'translateY(-7px) rotate(-0.5deg)' : 'translateY(0)',
        transition:'transform 0.2s cubic-bezier(.2,.8,.3,1)',
        filter: selected ? `drop-shadow(0 0 6px ${color}88)` : 'none',
      }}>
      <div style={{ borderRadius:'2px 3px 3px 2px',
        boxShadow: hovered
          ? `3px 8px 22px rgba(0,0,0,0.35), -1px 0 0 rgba(0,0,0,0.18)`
          : `2px 4px 12px rgba(0,0,0,0.22), -1px 0 0 rgba(0,0,0,0.14)`,
        transition:'box-shadow 0.2s', overflow:'hidden',
      }}>
        {isNeo ? <NeuromancerCover book={book} width={120} height={160}/> : <LoebCover book={book} width={120} height={160}/>}
        {status && (
          <div style={{ background: isNeo ? 'rgba(0,0,0,0.7)' : darken(color,0.45), padding:'3px 8px', fontSize:7, color:accent, opacity:0.85, fontFamily:'var(--font-mono)', fontStyle:'normal', letterSpacing:'0.07em', textAlign:'center' }}>
            {status.label.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PUBLIC: BookSpine ─────────────────────────────────────────────
export function BookSpine({ book, height = 120, onClick, selected }) {
  const [hovered, setHovered] = useState(false);
  const isNeo   = isNeuromancerStyle(book);
  const color   = book.color || '#7a5c38';
  const binding = isNeo ? toVeryDark(color) : darken(color, 0.28);
  const accent  = isNeo ? lighten(color, 0.55) : lighten(color, 0.62);
  const w = Math.max(18, Math.min(32, Math.floor(((book.pages||300)/800)*36)+12));
  return (
    <div onClick={onClick} title={`${book.title}${book.author?' — '+book.author:''}`}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ width:w, height, flexShrink:0, cursor:'pointer',
        transform: hovered ? 'translateY(-6px)' : 'none',
        transition:'transform 0.18s cubic-bezier(.2,.8,.3,1)',
      }}>
      <div style={{ width:'100%', height:'100%', background:binding,
        borderRadius:'2px 3px 3px 2px', overflow:'hidden', position:'relative',
        boxShadow: selected ? `0 0 0 2px ${color}, 2px 3px 10px rgba(0,0,0,0.3)`
          : hovered ? '2px 5px 14px rgba(0,0,0,0.3)' : '1px 2px 6px rgba(0,0,0,0.2)',
        transition:'box-shadow 0.18s',
      }}>
        <div style={{ height:8, background:isNeo?'transparent':darken(color,0.15), borderBottom:`1px solid ${accent}55` }}/>
        <div style={{ position:'absolute', top:12, bottom:12, left:0, right:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ writingMode:'vertical-rl', textOrientation:'mixed', transform:'rotate(180deg)',
            fontSize:8.5, fontWeight:isNeo?700:600, color:accent, letterSpacing:isNeo?'0.06em':'0.04em',
            padding:'4px 2px', overflow:'hidden', maxHeight:height-28,
            textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.2,
            fontFamily: isNeo ? 'var(--font-mono)' : 'var(--font-display)',
            fontStyle: isNeo ? 'normal' : 'italic',
            textShadow: isNeo ? `0 0 6px ${accent}66` : `0 1px 2px rgba(0,0,0,0.35)`,
          }}>{book.title}</div>
        </div>
        <div style={{ position:'absolute', bottom:8, left:2, right:2, height:'0.75px', background:accent, opacity:0.5 }}/>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(to right, rgba(0,0,0,0.25), transparent)' }}/>
      </div>
    </div>
  );
}
