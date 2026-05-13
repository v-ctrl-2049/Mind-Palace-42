import React, { useState, useRef } from 'react';
import { CompactEditor, stripHtml } from './SimpleEditor';

const MEDIUM_LABELS = { academic:'[P]', web:'[W]', news:'[N]', social:'[S]', video:'[V]', podcast:'[🎙]', magazine:'[M]', document:'[D]', other:'[?]' };

export default function CaptureBar({ books, articles = [], thoughtTypes, onAdd }) {
  const readingSources = [
    ...books.filter(b => b.status === 'reading').map(b => ({ ...b, _sourceType: 'book' })),
    ...articles.filter(a => a.status === 'reading').map(a => ({ ...a, _sourceType: 'article' })),
  ];
  const otherSources = [
    ...books.filter(b => b.status !== 'reading').map(b => ({ ...b, _sourceType: 'book' })),
    ...articles.filter(a => a.status !== 'reading').map(a => ({ ...a, _sourceType: 'article' })),
  ];
  const allSources = [...readingSources, ...otherSources];

  const [text, setText] = useState('');
  const [quote, setQuote] = useState('');
  const [bookId, setBookId] = useState(readingSources[0]?.id || allSources[0]?.id || '');
  const [type, setType] = useState(thoughtTypes[0]?.id || 'reaction');
  const [page, setPage] = useState('');
  const [chapter, setChapter] = useState('');
  const [section, setSection] = useState('');
  const [topics, setTopics] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const textRef = useRef();

  const displaySources = showAll ? allSources : readingSources;

  const handleSubmit = () => {
    if (!stripHtml(text) && !quote.trim()) return;
    const selectedSource = allSources.find(s => s.id === bookId);
    onAdd({
      text: text, // store as HTML
      quote: quote.trim(),
      bookId,
      sourceType: selectedSource?._sourceType || 'book',
      type,
      page: page ? parseInt(page, 10) : null,
      chapter: chapter.trim(),
      section: section.trim(),
      topics: topics.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    });
    setText(''); setQuote(''); setPage(''); setChapter(''); setSection(''); setTopics('');
    setExpanded(false); setShowAll(false);
    textRef.current?.focus();
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); };

  return (
    <div style={{ borderTop: '1px solid var(--paper-3)', background: 'var(--paper-card)', padding: expanded ? '14px 18px' : '10px 18px' }}>
      {/* Quote (expanded only) */}
      {expanded && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quote (optional)</div>
          <textarea value={quote} onChange={e => setQuote(e.target.value)} rows={2} onKeyDown={handleKeyDown}
            placeholder="A passage from the text…"
            style={{ width: '100%', resize: 'none', border: '1px solid var(--paper-3)', borderRadius: 6, padding: '6px 10px', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-2)', background: 'var(--paper-2)', fontFamily: 'var(--font-serif)' }} />
        </div>
      )}

      {/* Main thought */}
      {expanded ? (
        <CompactEditor
          value={text}
          onChange={setText}
          placeholder="A thought just hit you — drop it here…"
          minHeight={80}
          autoFocus />
      ) : (
        <textarea ref={textRef} value={text}
          onChange={e => { setText(e.target.value); if (e.target.value) setExpanded(true); }}
          onFocus={() => setExpanded(true)} onKeyDown={handleKeyDown}
          placeholder="A thought just hit you — drop it here…"
          rows={1}
          style={{ width: '100%', resize: 'none', border: 'none', background: 'transparent', fontSize: 14, lineHeight: 1.6, color: 'var(--ink)', padding: 0, outline: 'none', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }} />
      )}

      {/* Controls */}
      {expanded && (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Source selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <select value={bookId} onChange={e => setBookId(e.target.value)}
              style={{ padding: '5px 28px 5px 8px', fontSize: 12, borderRadius: 6 }}>
              {displaySources.length === 0 && <option value="">No sources — add a book or paper first</option>}
              {displaySources.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title}{s._sourceType === 'article' ? ` ${MEDIUM_LABELS[s.medium] || '[S]'}` : ''}
                </option>
              ))}
            </select>
            {otherSources.length > 0 && (
              <button type="button" onClick={() => setShowAll(s => !s)}
                style={{ fontSize: 10, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', whiteSpace: 'nowrap' }}
                title={showAll ? 'Show only currently reading' : 'Show all books & papers'}>
                {showAll ? '↑ less' : 'all ↓'}
              </button>
            )}
          </div>

          {/* Type */}
          <select value={type} onChange={e => setType(e.target.value)}
            style={{ padding: '5px 28px 5px 8px', fontSize: 12, borderRadius: 6 }}>
            {thoughtTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>

          {/* Page */}
          <input type="number" value={page} onChange={e => setPage(e.target.value)}
            placeholder="p." style={{ width: 60, padding: '5px 8px', fontSize: 12, borderRadius: 6 }} />
          <input value={chapter} onChange={e => setChapter(e.target.value)} placeholder="Chapter / section…" 
            style={{width: 140, padding: '5px 8px', fontSize: 11, borderRadius: 2, fontStyle: 'italic' }} />
          {/* Topics */}
          <input type="text" value={topics} onChange={e => setTopics(e.target.value)}
            placeholder="topics, comma separated"
            style={{ flex: 1, minWidth: 140, padding: '5px 10px', fontSize: 12, borderRadius: 6 }} />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button onClick={() => { setExpanded(false); setText(''); setQuote(''); setPage(''); setChapter(''); setSection(''); setTopics(''); }}
              style={{ fontSize: 12, color: 'var(--ink-3)', padding: '5px 12px', border: '1px solid var(--paper-3)', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}>
              Cancel
            </button>
            <button onClick={handleSubmit}
              style={{ fontSize: 12, padding: '5px 16px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-serif)' }}>
              Save <span style={{ opacity: 0.6, fontSize: 10 }}>⌘↵</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
