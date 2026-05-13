import React, { useState, useMemo } from 'react';
import { REGIONS, parseEventDate, getRegion } from '../data/timeline';
import EventDetailPage from './EventDetailPage';

const getEventType = (id, types) => (types || []).find(t => t.id === id) || { id, label: id, color: '#8a8680', bg: '#f2f0ec' };

// ── Era label ─────────────────────────────────────────────────────
function eraLabel(year) {
  if (year === null || year === undefined || isNaN(year)) return 'Unknown date';
  if (year < -3000) return 'Prehistoric / early civilisation';
  if (year < -500)  return 'Ancient world (before 500 BCE)';
  if (year < 0)     return 'Classical antiquity (500–1 BCE)';
  if (year < 500)   return 'Late antiquity (1–500 CE)';
  if (year < 1000)  return 'Early medieval (500–1000)';
  if (year < 1500)  return 'Medieval (1000–1500)';
  if (year < 1800)  return 'Early modern (1500–1800)';
  if (year < 1900)  return 'Nineteenth century (1800–1900)';
  if (year < 2100)  return `${Math.floor(year / 10) * 10}s`;
  return 'Future';
}


// ── Researcher badges ─────────────────────────────────────────────
function EventBadges({ event, allEvents }) {
  const bookCount = (event.bookIds || []).length;
  const sharedTagEvents = allEvents.filter(e =>
    e.id !== event.id &&
    e.tags?.some(t => event.tags?.includes(t)) &&
    (e.bookIds || []).some(b => (event.bookIds || []).includes(b))
  );
  const isContested = sharedTagEvents.length > 0 && sharedTagEvents.some(e => e.dateRaw !== event.dateRaw);
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
      {bookCount === 1 && (
        <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 2, background: '#b07d2820', color: '#b07d28', fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: '1px solid #b07d2840', letterSpacing: '0.06em' }}>◉ UNVERIFIED</span>
      )}
      {isContested && (
        <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 2, background: '#a0282020', color: '#c0392b', fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: '1px solid #c0392b40', letterSpacing: '0.06em' }}>⊘ DISPUTED</span>
      )}
      {bookCount >= 3 && (
        <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 2, background: '#2a6a4a20', color: '#2a6a4a', fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: '1px solid #2a6a4a40', letterSpacing: '0.06em' }}>⊕ CONFIRMED</span>
      )}
    </div>
  );
}

// ── Event card — field report entry ──────────────────────────────
function EventCard({ event, books, onEdit, eventTypes, onTagClick, onSelect, allEvents }) {
  const region      = getRegion(event.region);
  const evType      = getEventType(event.type, eventTypes);
  const linkedBooks = books.filter(b => (event.bookIds || []).includes(b.id));
  const [hovered, setHovered] = React.useState(false);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const isSingleWitness = linkedBooks.length === 1;
  const isContested = allEvents.some(e =>
    e.id !== event.id && e.tags?.some(t => event.tags?.includes(t)) &&
    (e.bookIds || []).some(b => (event.bookIds || []).includes(b)) && e.dateRaw !== event.dateRaw
  );
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect?.(event.id)}
      style={{
        background: isDark ? '#201a12' : (isSingleWitness ? '#fffde8' : isContested ? '#fff8f8' : '#fefcf5'),
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 22px, rgba(100,80,50,0.05) 22px, rgba(100,80,50,0.05) 23px)',
        border: `1px solid ${isContested ? '#c0392b33' : isSingleWitness ? '#b07d2833' : 'var(--paper-3)'}`,
        borderLeft: `3px solid ${region.color}`,
        borderRadius: 2, padding: '10px 12px 10px 14px', cursor: 'pointer', position: 'relative',
        transition: 'box-shadow 0.15s, transform 0.15s',
        boxShadow: hovered ? '2px 4px 12px rgba(26,20,10,0.12)' : '1px 2px 5px rgba(26,20,10,0.07)',
        transform: hovered ? 'translateX(2px)' : 'none',
      }}>
      <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 7, color: evType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', opacity: 0.65, transform: 'rotate(-6deg)', borderBottom: `1px solid ${evType.color}55`, paddingBottom: 1 }}>
        {evType.label.toUpperCase().slice(0, 6)}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35, fontFamily: 'var(--font-display)', paddingRight: 50, marginBottom: 5 }}>
        {event.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
        <span style={{ fontSize: 9, color: region.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>{region.label}</span>
        {linkedBooks.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {linkedBooks.slice(0, 3).map(b => <span key={b.id} title={b.title} style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: b.color }} />)}
            <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{linkedBooks.length} source{linkedBooks.length !== 1 ? 's' : ''}</span>
          </span>
        )}
      </div>
      <EventBadges event={event} allEvents={allEvents} />
      {event.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
          {event.tags.map(tag => (
            <button key={tag} onClick={e => { e.stopPropagation(); onTagClick?.(tag); }}
              style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', padding: 0, letterSpacing: '0.02em' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>
              #{tag}
            </button>
          ))}
        </div>
      )}
      {hovered && (
        <button onClick={e => { e.stopPropagation(); onEdit(event); }}
          style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 8, padding: '2px 8px', borderRadius: 2, background: 'var(--paper-2)', color: 'var(--ink-3)', border: '1px solid var(--paper-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
          EDIT
        </button>
      )}
    </div>
  );
}

// ── Source comparison drawer ──────────────────────────────────────
function BookComparePanel({ events, books, tag, onClose }) {
  const tagged = events.filter(e => e.tags?.includes(tag) || e.title?.toLowerCase().includes(tag.toLowerCase()));
  const bookIds = [...new Set(tagged.flatMap(e => e.bookIds || []))];
  const relatedBooks = bookIds.map(id => books.find(b => b.id === id)).filter(Boolean);
  if (!relatedBooks.length) return null;
  return (
    <div style={{ borderTop: '2px solid var(--paper-3)', background: 'var(--paper-2)', flexShrink: 0, maxHeight: 260, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 20px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0, background: 'var(--paper-3)' }}>
        <span style={{ fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em' }}>SUBJECT COMPARISON · #{tag.toUpperCase()}</span>
        <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{tagged.length} entries · {relatedBooks.length} sources</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', fontSize: 8, color: 'var(--ink-4)', padding: '2px 8px', border: '1px solid var(--paper-3)', borderRadius: 2, cursor: 'pointer', background: 'transparent', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>CLOSE ✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'grid', gridTemplateColumns: `repeat(${Math.min(relatedBooks.length, 4)}, 1fr)`, gap: 10 }}>
        {relatedBooks.map(book => {
          const bookEvents = tagged.filter(e => (e.bookIds||[]).includes(book.id));
          return (
            <div key={book.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${book.color}33` }}>
                <div style={{ width: 3, height: 14, background: book.color, borderRadius: 1, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: book.color, fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>{book.title}</span>
              </div>
              {bookEvents.map(ev => {
                const p = parseEventDate(ev.dateRaw);
                return (
                  <div key={ev.id} style={{ background: 'var(--paper-card)', border: `1px solid ${book.color}22`, borderLeft: `2px solid ${book.color}`, borderRadius: 2, padding: '5px 8px', marginBottom: 5 }}>
                    <div style={{ fontSize: 9, color: book.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginBottom: 2 }}>{p.display || '—'}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>{ev.title}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ══ TAB 2: COMPARATIVE — expedition team comparison ═══════════════
function ComparativeTab({ events, books, eventTypes, onSelect }) {
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [filterTag, setFilterTag]         = useState('');

  const toggleBook = (id) => setSelectedBooks(prev =>
    prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
  );

  const compBooks = books.filter(b => selectedBooks.includes(b.id));

  const relevantEvents = useMemo(() => {
    return events
      .filter(e => (e.bookIds || []).some(b => selectedBooks.includes(b)))
      .filter(e => !filterTag || e.tags?.includes(filterTag))
      .sort((a, b) => {
        const pa = parseEventDate(a.dateRaw), pb = parseEventDate(b.dateRaw);
        return (pa.sortKey || 0) - (pb.sortKey || 0);
      });
  }, [events, selectedBooks, filterTag]);

  const allTags = [...new Set(relevantEvents.flatMap(e => e.tags || []))].sort();

  if (books.length < 2) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ textAlign: 'center', color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.7 }}>
          <div style={{ fontSize: 28, opacity: 0.15, marginBottom: 12, fontFamily: 'var(--font-display)' }}>⊞</div>
          Add at least 2 books to events to use the comparative survey.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>

      {/* Expedition team selector */}
      <div style={{ padding: '10px 20px', borderBottom: '1px dashed var(--paper-3)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0, background: 'var(--paper-2)' }}>
        <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', marginRight: 4, textTransform: 'uppercase' }}>Compare sources:</div>
        {books.map(b => (
          <button key={b.id} onClick={() => toggleBook(b.id)}
            style={{ fontSize: 10, padding: '3px 10px', borderRadius: 2, border: `1px solid ${selectedBooks.includes(b.id) ? b.color : 'var(--paper-3)'}`, background: selectedBooks.includes(b.id) ? b.color + '18' : 'transparent', color: selectedBooks.includes(b.id) ? b.color : 'var(--ink-3)', cursor: 'pointer', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.1s' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: selectedBooks.includes(b.id) ? b.color : 'var(--paper-3)', flexShrink: 0, boxShadow: selectedBooks.includes(b.id) ? `0 0 0 2px ${b.color}33` : 'none' }} />
            {b.title}
          </button>
        ))}
        {allTags.length > 0 && (
          <>
            <div style={{ width: 1, height: 14, background: 'var(--paper-3)' }} />
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
              style={{ fontSize: 10, padding: '3px 22px 3px 8px', borderRadius: 2, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
              <option value="">All subjects</option>
              {allTags.map(t => <option key={t} value={t}>#{t}</option>)}
            </select>
          </>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{relevantEvents.length} entries</span>
      </div>

      {compBooks.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 13 }}>
          Select sources above to begin the comparison.
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Column headers — expedition team cards */}
          <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${compBooks.length}, 1fr)`, gap: '0 8px', padding: '10px 20px 8px', borderBottom: '1px dashed var(--paper-3)', flexShrink: 0, background: 'var(--paper-2)' }}>
            <div />
            {compBooks.map(b => (
              <div key={b.id} style={{ background: 'var(--paper-card)', border: `1px solid ${b.color}33`, borderTop: `3px solid ${b.color}`, borderRadius: 2, padding: '8px 10px', boxShadow: '1px 1px 4px rgba(26,20,10,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: b.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: b.color, fontStyle: 'italic', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                </div>
                {b.author && <div style={{ fontSize: 9, color: 'var(--ink-4)', fontStyle: 'italic', paddingLeft: 12 }}>{b.author}</div>}
                {b.sourceType && <div style={{ fontSize: 7, color: b.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em', paddingLeft: 12, marginTop: 2, opacity: 0.7 }}>{b.sourceType.toUpperCase()}</div>}
              </div>
            ))}
          </div>

          {/* Event rows */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
            {relevantEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-4)', fontStyle: 'italic' }}>No entries match your selection.</div>
            ) : relevantEvents.map(ev => {
              const parsed = parseEventDate(ev.dateRaw);
              return (
                <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: `80px repeat(${compBooks.length}, 1fr)`, gap: '0 8px', marginBottom: 8, alignItems: 'start' }}>
                  {/* Date column */}
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', paddingTop: 10, textAlign: 'right', paddingRight: 10, lineHeight: 1.35, letterSpacing: '0.02em' }}>
                    {parsed.display || ev.dateRaw || '—'}
                  </div>
                  {/* Per-book cells */}
                  {compBooks.map(book => {
                    const covered = (ev.bookIds || []).includes(book.id);
                    const bn = (ev.bookNotes || []).find(n => n.bookId === book.id);
                    if (!covered) {
                      return (
                        <div key={book.id} style={{ background: 'var(--paper-3)', borderRadius: 2, height: 38, opacity: 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em', opacity: 0.6 }}>[no record]</span>
                        </div>
                      );
                    }
                    return (
                      <div key={book.id} onClick={() => onSelect?.(ev.id)}
                        style={{ background: book.color + '0e', border: `1px solid ${book.color}33`, borderLeft: `3px solid ${book.color}`, borderRadius: 2, padding: '7px 10px', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = book.color + '1e'}
                        onMouseLeave={e => e.currentTarget.style.background = book.color + '0e'}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3, fontFamily: 'var(--font-display)', marginBottom: bn?.note ? 3 : 0 }}>{ev.title}</div>
                        {bn?.note && <div style={{ fontSize: 10, color: 'var(--ink-3)', lineHeight: 1.5, fontStyle: 'italic' }}>{bn.note.slice(0, 80)}{bn.note.length > 80 ? '…' : ''}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ══ TAB 3: GAPS & THREADS — analyst's summary memo ════════════════
function GapsTab({ events, books, eventTypes, onSelect, onTagClick }) {
  const [activeSection, setActiveSection] = useState('witnesses');

  const singleWitness   = events.filter(e => (e.bookIds || []).length === 1);
  const wellCorroborated = events.filter(e => (e.bookIds || []).length >= 3);
  const contested       = events.filter(e => {
    if ((e.bookIds || []).length < 2) return false;
    return events.some(other =>
      other.id !== e.id && other.tags?.some(t => e.tags?.includes(t)) && other.dateRaw !== e.dateRaw
    );
  });

  const tagMap = {};
  events.forEach(ev => {
    (ev.tags || []).forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = { events: [], books: new Set() };
      tagMap[tag].events.push(ev);
      (ev.bookIds || []).forEach(b => tagMap[tag].books.add(b));
    });
  });
  const tagThreads = Object.entries(tagMap)
    .map(([tag, data]) => ({ tag, count: data.events.length, bookCount: data.books.size }))
    .sort((a, b) => b.count - a.count);

  const allEras = [...new Set(events.map(e => {
    const p = parseEventDate(e.dateRaw);
    return p.year !== undefined ? eraLabel(p.year) : null;
  }).filter(Boolean))];

  const bookCoverage = books.map(book => {
    const bookEvents = events.filter(e => (e.bookIds || []).includes(book.id));
    const eras = new Set(bookEvents.map(e => {
      const p = parseEventDate(e.dateRaw);
      return p.year !== undefined ? eraLabel(p.year) : null;
    }).filter(Boolean));
    const missing = allEras.filter(era => !eras.has(era));
    return { book, total: bookEvents.length, covered: eras.size, missing };
  }).filter(bc => bc.missing.length > 0);

  const SECTIONS = [
    { id: 'witnesses', label: '◉ Witness analysis', count: singleWitness.length + contested.length, color: '#a02820' },
    { id: 'tags',      label: '# Subject index',   count: tagThreads.length,                        color: '#2a4a7a' },
    { id: 'gaps',      label: '◻ Coverage gaps',   count: bookCoverage.length,                      color: '#a07020' },
  ];

  const MemoHeader = ({ to, re, classification }) => (
    <div style={{ display: 'flex', gap: 16, marginBottom: 14, paddingBottom: 10, borderBottom: '1px dashed var(--paper-3)', flexWrap: 'wrap' }}>
      <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>TO: {to}</div>
      <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>RE: {re}</div>
      <div style={{ marginLeft: 'auto', fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em' }}>{classification}</div>
    </div>
  );

  const WitnessRow = ({ ev, stamp, stampColor, stampBg }) => {
    const book = books.find(b => (ev.bookIds||[]).includes(b.id));
    const p = parseEventDate(ev.dateRaw);
    return (
      <div onClick={() => onSelect?.(ev.id)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper-card)', border: `1px solid ${stampColor}22`, borderLeft: `3px solid ${stampColor}`, borderRadius: 2, padding: '8px 12px', marginBottom: 6, cursor: 'pointer', boxShadow: '1px 1px 4px rgba(26,20,10,0.06)', transition: 'transform 0.1s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{ev.title}</div>
          <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 2, fontStyle: 'italic' }}>{p.display || ev.dateRaw}{book ? ` · ${book.title}` : ''}</div>
        </div>
        <div style={{ fontSize: 7, padding: '1px 8px', border: `1px solid ${stampColor}55`, color: stampColor, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.09em', borderRadius: 2, background: stampBg, flexShrink: 0 }}>
          {stamp}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left nav — like a filing cabinet */}
      <div style={{ width: 200, borderRight: '1px solid var(--paper-3)', padding: '16px 0', background: 'var(--paper-2)', flexShrink: 0 }}>
        <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', padding: '0 14px 10px', textTransform: 'uppercase', borderBottom: '1px dashed var(--paper-3)', marginBottom: 8 }}>
          Analyst's summary
        </div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', background: activeSection === s.id ? 'var(--paper-card)' : 'transparent', border: 'none', borderLeft: `3px solid ${activeSection === s.id ? s.color : 'transparent'}`, color: activeSection === s.id ? s.color : 'var(--ink-3)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontSize: 10, letterSpacing: '0.04em', marginBottom: 2, transition: 'all 0.1s' }}>
            <span style={{ flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>{s.count}</span>
          </button>
        ))}
      </div>

      {/* Right content — memo paper */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 26px', background: 'var(--paper)' }}>

        {activeSection === 'witnesses' && (
          <div>
            <MemoHeader to="Research team" re="Source reliability assessment" classification="INTERNAL MEMO" />

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#a07020', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1 }}>◉ Unverified — single witness ({singleWitness.length})</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 12, paddingLeft: 10, borderLeft: '2px solid var(--paper-3)' }}>
                These entries rest on a single source. A rigorous analysis requires corroboration or explicit acknowledgement of the limitation.
              </div>
              {singleWitness.length === 0
                ? <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic' }}>None — all entries have multiple sources.</div>
                : singleWitness.map(ev => <WitnessRow key={ev.id} ev={ev} stamp="SINGLE SOURCE" stampColor="#a07020" stampBg="#faf0dc" />)
              }
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#a02820', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                ⊘ Contested — conflicting accounts ({contested.length})
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 12, paddingLeft: 10, borderLeft: '2px solid var(--paper-3)' }}>
                Sources share subjects but give conflicting dates or framings. Examine the discrepancy closely — it may be the most revealing evidence of all.
              </div>
              {contested.length === 0
                ? <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic' }}>No contested entries detected.</div>
                : contested.map(ev => {
                    const evBooks = books.filter(b => (ev.bookIds||[]).includes(b.id));
                    return (
                      <div key={ev.id} onClick={() => onSelect?.(ev.id)}
                        style={{ background: 'var(--paper-card)', border: '1px solid #a0282022', borderLeft: '3px solid #a02820', borderRadius: 2, padding: '8px 12px', marginBottom: 6, cursor: 'pointer', boxShadow: '1px 1px 4px rgba(26,20,10,0.06)' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>{ev.title}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {evBooks.map(b => <span key={b.id} style={{ fontSize: 9, color: b.color, display: 'flex', alignItems: 'center', gap: 3, fontStyle: 'italic' }}><span style={{ width: 4, height: 4, borderRadius: '50%', background: b.color, display: 'inline-block' }} />{b.title}</span>)}
                        </div>
                      </div>
                    );
                  })
              }
            </div>

            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#2a6a4a', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                ⊕ Corroborated — well-evidenced ({wellCorroborated.length})
              </div>
              {wellCorroborated.length === 0
                ? <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic' }}>No entries with 3+ sources yet.</div>
                : wellCorroborated.map(ev => <WitnessRow key={ev.id} ev={ev} stamp="CORROBORATED" stampColor="#2a6a4a" stampBg="#e4f4ec" />)
              }
            </div>
          </div>
        )}

        {activeSection === 'tags' && (
          <div>
            <MemoHeader to="Research team" re="Subject index — cross-referenced threads" classification="INDEX" />
            <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 18 }}>
              Recurring subjects across your timeline. Threads running through multiple sources are the ones worth following.
            </div>
            {tagThreads.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--ink-4)', fontStyle: 'italic' }}>No subjects indexed yet. Add tags to your events.</div>
            ) : tagThreads.map(({ tag, count, bookCount }) => (
              <div key={tag}
                style={{ background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 2, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 6, boxShadow: '1px 1px 4px rgba(26,20,10,0.05)', transition: 'transform 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-2)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)'; e.currentTarget.style.transform = 'none'; }}
                onClick={() => onTagClick?.(tag)}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>#{tag}</span>
                </div>
                {/* Mini bar */}
                <div style={{ width: 80, height: 4, background: 'var(--paper-3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, count * 15)}%`, background: 'var(--accent-2)', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textAlign: 'right', minWidth: 60 }}>
                  <span style={{ color: 'var(--ink)' }}>{count}</span> event{count !== 1 ? 's' : ''}<br />
                  <span style={{ color: 'var(--ink)' }}>{bookCount}</span> source{bookCount !== 1 ? 's' : ''}
                </div>
                {bookCount >= 2 && <span style={{ fontSize: 8, padding: '1px 6px', borderRadius: 2, background: 'var(--accent-light)', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em', flexShrink: 0 }}>CROSS-SOURCE</span>}
              </div>
            ))}
          </div>
        )}

        {activeSection === 'gaps' && (
          <div>
            <MemoHeader to="Research team" re="Lacunae — periods not covered by source" classification="COVERAGE REPORT" />
            <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.65, marginBottom: 18 }}>
              Periods documented by some sources but absent in others. These are not failures — they are research questions in disguise.
            </div>
            {bookCoverage.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--ink-4)', fontStyle: 'italic' }}>No gaps detected — all sources cover similar periods.</div>
            ) : bookCoverage.map(({ book, total, covered, missing }) => (
              <div key={book.id} style={{ background: 'var(--paper-card)', border: `1px solid ${book.color}22`, borderLeft: `3px solid ${book.color}`, borderRadius: 2, padding: '14px 16px', marginBottom: 12, boxShadow: '1px 1px 4px rgba(26,20,10,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px dashed ${book.color}33` }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: book.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: book.color, fontStyle: 'italic', fontFamily: 'var(--font-display)', flex: 1 }}>{book.title}</span>
                  <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{total} entries · {covered} eras</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink-3)', marginBottom: 8, fontStyle: 'italic' }}>Missing periods compared to your other sources:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {missing.map(era => (
                    <span key={era} style={{ fontSize: 9, padding: '2px 9px', borderRadius: 2, background: '#faf0dc', color: '#a07020', border: '1px solid #a0702033', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em' }}>{era}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ══ MAIN TIMELINE VIEW ════════════════════════════════════════════
export default function TimelineView({ events, books, eventTypes, onAdd, onEdit, onUpdate, onManageTypes }) {
  const [activeTab, setActiveTab]       = useState('chronicle');
  const [regionFilter, setRegionFilter] = useState([]);
  const [typeFilter,   setTypeFilter]   = useState([]);
  const [bookFilter,   setBookFilter]   = useState('all');
  const [search,       setSearch]       = useState('');
  const [compareTag,   setCompareTag]   = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [collapsedEras, setCollapsedEras] = useState({});
  const [sortOrder,    setSortOrder]    = useState('asc');

  const toggleEra    = (era) => setCollapsedEras(c => ({ ...c, [era]: !c[era] }));
  const toggleRegion = (id)  => setRegionFilter(f => f.includes(id) ? f.filter(r => r !== id) : [...f, id]);
  const toggleType   = (id)  => setTypeFilter(f => f.includes(id) ? f.filter(t => t !== id) : [...f, id]);

  const filtered = useMemo(() => events
    .filter(e => regionFilter.length === 0 || regionFilter.includes(e.region))
    .filter(e => typeFilter.length === 0   || typeFilter.includes(e.type))
    .filter(e => bookFilter === 'all'      || (e.bookIds || []).includes(bookFilter))
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.tags?.some(t => t.includes(search.toLowerCase())))
  , [events, regionFilter, typeFilter, bookFilter, search]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(ev => {
      const p = parseEventDate(ev.dateRaw);
      const era = p.year !== undefined ? eraLabel(p.year) : 'Unknown date';
      if (!g[era]) g[era] = [];
      g[era].push(ev);
    });
    Object.keys(g).forEach(era => g[era].sort((a, b) => {
      const pa = parseEventDate(a.dateRaw), pb = parseEventDate(b.dateRaw);
      const diff = (pa.sortKey || 0) - (pb.sortKey || 0);
      return sortOrder === 'asc' ? diff : -diff;
    }));
    return g;
  }, [filtered, sortOrder]);

  const eraOrder = useMemo(() => {
    const keys = Object.keys(grouped);
    return keys.sort((a, b) => {
      const sampleA = grouped[a][0], sampleB = grouped[b][0];
      const pa = parseEventDate(sampleA?.dateRaw), pb = parseEventDate(sampleB?.dateRaw);
      const diff = (pa?.sortKey || 0) - (pb?.sortKey || 0);
      return sortOrder === 'asc' ? diff : -diff;
    });
  }, [grouped, sortOrder]);

  const effectiveCollapsed = useMemo(() => {
    const result = {};
    eraOrder.forEach(era => {
      result[era] = collapsedEras[era] !== undefined ? collapsedEras[era] : true;
    });
    return result;
  }, [eraOrder, collapsedEras]);

  const usedTypes   = [...new Set(events.map(e => e.type).filter(Boolean))];
  const usedRegions = [...new Set(events.map(e => e.region).filter(Boolean))];

  // Date range of all events for the header
  const dateRange = useMemo(() => {
    const sorted = [...events].sort((a, b) => (parseEventDate(a.dateRaw).sortKey||0) - (parseEventDate(b.dateRaw).sortKey||0));
    if (!sorted.length) return null;
    const first = parseEventDate(sorted[0].dateRaw).display;
    const last  = parseEventDate(sorted[sorted.length-1].dateRaw).display;
    return first === last ? first : `${first} — ${last}`;
  }, [events]);

  // After all hooks — early return for event detail
  const activeEvent = activeEventId ? events.find(e => e.id === activeEventId) : null;
  if (activeEvent) {
    return (
      <EventDetailPage event={activeEvent} books={books} eventTypes={eventTypes}
        onUpdate={onUpdate} onBack={() => setActiveEventId(null)} />
    );
  }

  const TABS = [
    { id: 'chronicle',   label: '↔ Chronicle'      },
    { id: 'comparative', label: '⊞ Comparative'     },
    { id: 'gaps',        label: '◻ Gaps & threads'  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── SURVEY COVER ──────────────────────────────────── */}
      <div style={{ padding: '10px 20px 8px', borderBottom: '2px solid var(--paper-3)', flexShrink: 0, background: 'var(--paper-2)', position: 'relative', overflow: 'hidden' }}>

        {/* Miskatonic rubber stamp — clearly visible */}
        <div style={{ position: 'absolute', right: 200, top: '50%', transform: 'translateY(-50%) rotate(-5deg)', pointerEvents: 'none', userSelect: 'none', opacity: 0.35 }}>
          <div style={{ border: '2px solid var(--accent)', borderRadius: 3, padding: '4px 12px', display: 'inline-block', boxShadow: `inset 0 0 0 1px var(--accent-light)` }}>
            <div style={{ fontSize: 7, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.2em', textTransform: 'uppercase', lineHeight: 1.7, textAlign: 'center' }}>
              Miskatonic University<br/>Dept. of History · Est. 1690<br/>⚿ Restricted Archival Access
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.14em', marginBottom: 3, textTransform: 'uppercase' }}>
              Chronological survey
            </div>
            <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: '0.01em' }}>
              Historical Chronicle
            </div>
            {dateRange && (
              <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginTop: 3, letterSpacing: '0.04em' }}>
                {dateRange} · {events.length} entries · {books.length} sources
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chronicle…"
              style={{ width: 160, padding: '5px 10px', fontSize: 11, borderRadius: 2, fontStyle: 'italic' }} />
            <button onClick={onAdd}
              style={{ fontSize: 10, padding: '6px 14px', borderRadius: 2, background: 'var(--ink)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
              + ENTRY
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB BAR — expedition section tabs ─────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', background: 'var(--paper-2)', paddingLeft: 10, paddingTop: 5, borderBottom: '1px solid var(--paper-3)', flexShrink: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ fontSize: 10, padding: '5px 14px 7px', marginRight: 2, border: `1px solid ${activeTab === tab.id ? 'var(--paper-3)' : 'transparent'}`, borderBottom: 'none', borderRadius: '3px 3px 0 0', background: activeTab === tab.id ? 'var(--paper)' : 'transparent', color: activeTab === tab.id ? 'var(--ink)' : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em', fontWeight: activeTab === tab.id ? 600 : 400, transform: activeTab === tab.id ? 'none' : 'translateY(2px)', transition: 'all 0.1s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CHRONICLE TAB ─────────────────────────────────── */}
      {activeTab === 'chronicle' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left spine — era navigation */}
          <div style={{ width: 180, flexShrink: 0, borderRight: '1px solid var(--paper-3)', background: 'var(--paper-2)', overflowY: 'auto', padding: '10px 0' }}>
            <div style={{ fontSize: 7, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', padding: '0 12px 8px', textTransform: 'uppercase', borderBottom: '1px dashed var(--paper-3)', marginBottom: 6 }}>
              Periods on record
            </div>
            {eraOrder.map(era => (
              <button key={era} onClick={() => toggleEra(era)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '6px 12px', background: !effectiveCollapsed[era] ? 'var(--accent-light)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: `3px solid ${!effectiveCollapsed[era] ? 'var(--accent-2)' : 'transparent'}`, transition: 'all 0.1s' }}>
                <span style={{ fontSize: 7, color: 'var(--ink-4)', display: 'inline-block', transition: 'transform 0.15s', transform: effectiveCollapsed[era] ? 'rotate(0deg)' : 'rotate(90deg)', flexShrink: 0 }}>▶</span>
                <span style={{ flex: 1, fontSize: 12, color: !effectiveCollapsed[era] ? 'var(--accent)' : 'var(--ink-3)', fontFamily: 'var(--font-serif)', lineHeight: 1.3, textAlign: 'left' }}>{era}</span>
                <span style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', flexShrink: 0 }}>{grouped[era]?.length || 0}</span>
              </button>
            ))}
            {eraOrder.length === 0 && (
              <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', padding: '12px', lineHeight: 1.6 }}>No entries on record.</div>
            )}

            {/* Filter section below eras */}
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--paper-3)' }}>
              <div style={{ fontSize: 7, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', padding: '0 12px 8px', textTransform: 'uppercase' }}>Filter</div>
              {usedRegions.map(r => { const reg = getRegion(r); return (
                <button key={r} onClick={() => toggleRegion(r)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '4px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: `3px solid ${regionFilter.includes(r) ? reg.color : 'transparent'}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: reg.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: regionFilter.includes(r) ? reg.color : 'var(--ink-4)', flex: 1 }}>{reg.label}</span>
                </button>
              );})}
              {usedTypes.map(t => { const et = getEventType(t, eventTypes); return (
                <button key={t} onClick={() => toggleType(t)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '4px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: `3px solid ${typeFilter.includes(t) ? et.color : 'transparent'}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: 1, background: et.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: typeFilter.includes(t) ? et.color : 'var(--ink-4)', flex: 1 }}>{et.label}</span>
                </button>
              );})}
              {books.length > 0 && (
                <div style={{ padding: '6px 12px' }}>
                  <select value={bookFilter} onChange={e => setBookFilter(e.target.value)}
                    style={{ width: '100%', fontSize: 10, padding: '3px 20px 3px 6px', borderRadius: 2, background: 'var(--paper-2)', color: 'var(--ink-2)', border: '1px solid var(--paper-3)' }}>
                    <option value="all">All sources</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
              )}
              <div style={{ padding: '4px 12px' }}>
                <button onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
                  style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', cursor: 'pointer', background: 'none', border: 'none', letterSpacing: '0.04em' }}>
                  {sortOrder === 'asc' ? '↑ Oldest first' : '↓ Newest first'}
                </button>
              </div>
              {(regionFilter.length > 0 || typeFilter.length > 0 || bookFilter !== 'all') && (
                <div style={{ padding: '4px 12px' }}>
                  <button onClick={() => { setRegionFilter([]); setTypeFilter([]); setBookFilter('all'); }}
                    style={{ fontSize: 9, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', cursor: 'pointer', background: 'none', border: 'none', letterSpacing: '0.04em' }}>
                    clear filters
                  </button>
                </div>
              )}
              <div style={{ padding: '4px 12px', marginTop: 4 }}>
                <button onClick={onManageTypes}
                  style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', cursor: 'pointer', background: 'none', border: 'none', letterSpacing: '0.04em' }}>
                  manage types ↗
                </button>
              </div>
            </div>
          </div>

          {/* Right: event feed */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--paper)', borderTop: '2px solid var(--accent-2)', boxShadow: 'inset 0 2px 8px rgba(100,70,20,0.04)' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--ink-4)' }}>
                <div style={{ fontSize: 48, opacity: 0.08, marginBottom: 16, fontFamily: 'var(--font-display)', lineHeight: 1 }}>✦</div>
                <div style={{ fontSize: 13, fontStyle: 'italic', lineHeight: 1.85, maxWidth: 360, margin: '0 auto' }}>
                  {search || regionFilter.length || typeFilter.length
                    ? 'No entries match the current filter. The record is silent.'
                    : <>The chronicle has not yet been opened.<br/><span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontStyle: 'normal', opacity: 0.5, letterSpacing: '0.06em' }}>+ ENTRY to begin the record.</span></>}
                </div>
              </div>
            ) : eraOrder.map((era, eraIdx) => {
              const glyphs = ['◊', '⊗', '✦', '⊕', '◈', '⊛', '✶', '◉'];
              const glyph = glyphs[eraIdx % glyphs.length];
              return (
              <div key={era}>
                {/* Era chapter heading — Miskatonic document divider */}
                <div style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                  <button onClick={() => toggleEra(era)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', border: 'none', cursor: 'pointer', padding: '11px 20px 9px', textAlign: 'left', position: 'relative', overflow: 'hidden',
                      background: `linear-gradient(to right, var(--paper-2) 0%, var(--paper) 35%, var(--paper) 65%, var(--paper-2) 100%)`,
                      borderTop: eraIdx > 0 ? '1px solid var(--paper-3)' : 'none',
                      borderBottom: '1px solid var(--paper-3)',
                    }}>
                    {/* Eldritch glyph watermark */}
                    <div style={{ position: 'absolute', right: 80, top: '50%', transform: 'translateY(-50%)', fontSize: 44, color: 'var(--accent-2)', opacity: 0.07, fontFamily: 'var(--font-display)', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>
                      {glyph}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 1 }}>Period on record</div>
                      <div style={{ fontSize: 17, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.02em', fontStyle: 'italic', lineHeight: 1.2 }}>
                        {era}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'italic', flexShrink: 0 }}>
                      {effectiveCollapsed[era] ? `${grouped[era].length} entr${grouped[era].length !== 1 ? 'ies' : 'y'}` : 'collapse'}
                    </span>
                    <span style={{ fontSize: 9, color: 'var(--ink-4)', display: 'inline-block', transition: 'transform 0.15s', transform: effectiveCollapsed[era] ? 'rotate(0deg)' : 'rotate(90deg)', flexShrink: 0 }}>▶</span>
                  </button>
                </div>

                {/* Events in this era */}
                {!effectiveCollapsed[era] && (
                  <div style={{ padding: '14px 20px 10px', background: 'var(--paper)' }}>
                    {grouped[era].map((ev, i) => {
                      const parsed = parseEventDate(ev.dateRaw);
                      return (
                        <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '104px 1fr', gap: '0 18px', marginBottom: 14 }}>
                          <div style={{ textAlign: 'right', paddingTop: 16, fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', lineHeight: 1.4, letterSpacing: '0.02em', userSelect: 'none' }}>
                            {parsed.display || '—'}
                          </div>
                          <div style={{ position: 'relative' }}>
                            {i < grouped[era].length - 1 && (
                              <div style={{ position: 'absolute', left: -10, top: 26, bottom: -16, borderLeft: '2px dashed var(--paper-3)', opacity: 0.6 }} />
                            )}
                            {/* Pushpin with glow */}
                            <div style={{ position: 'absolute', left: -14, top: 18, width: 10, height: 10, borderRadius: '50%', background: getRegion(ev.region).color, border: '2px solid var(--paper)', boxShadow: `0 0 0 2px ${getRegion(ev.region).color}44, 0 0 8px ${getRegion(ev.region).color}33` }} />
                            <EventCard event={ev} books={books} onEdit={onEdit} eventTypes={eventTypes}
                              onTagClick={tag => setCompareTag(prev => prev === tag ? null : tag)}
                              onSelect={setActiveEventId} allEvents={events} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );})}
          </div>
        </div>
      )}

      {/* ── COMPARATIVE TAB ─────────────────────────────── */}
      {activeTab === 'comparative' && (
        <ComparativeTab events={events} books={books} eventTypes={eventTypes} onSelect={setActiveEventId} />
      )}

      {/* ── GAPS & THREADS TAB ──────────────────────────── */}
      {activeTab === 'gaps' && (
        <GapsTab events={events} books={books} eventTypes={eventTypes}
          onSelect={setActiveEventId}
          onTagClick={tag => { setCompareTag(tag); setActiveTab('chronicle'); }} />
      )}

      {/* Tag compare panel */}
      {compareTag && activeTab === 'chronicle' && (
        <BookComparePanel events={events} books={books} tag={compareTag} onClose={() => setCompareTag(null)} />
      )}
    </div>
  );
}
