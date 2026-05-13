import React, { useState } from 'react';
import ThoughtCard from './ThoughtCard';
import CaptureBar from './CaptureBar';
import BookSummary from './BookSummary';

import { stripHtml } from './SimpleEditor';

export default function LiveStream({ thoughts, books, articles = [], activeBook, thoughtTypes, onAdd, onDelete, onUpdate, onManageTypes, onSaveBookSummary, onOpenArchive }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('');
  const [search, setSearch] = useState('');
  const [summaryBook, setSummaryBook] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  const filtered = thoughts
    .filter(t => activeBook === 'all' || t.bookId === activeBook)
    .filter(t => typeFilter === 'all' || t.type === typeFilter)
    .filter(t => !topicFilter || t.topics?.includes(topicFilter))
    .filter(t => !search || stripHtml(t.text)?.toLowerCase().includes(search.toLowerCase()) || t.quote?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortOrder === 'newest'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt));

  const clearFilters = () => { setTypeFilter('all'); setTopicFilter(''); setSearch(''); };
  const hasFilters = typeFilter !== 'all' || topicFilter || search;

  const handleTopicClick = (topic) => setTopicFilter(prev => prev === topic ? '' : topic);

  const activeBookObj = books.find(b => b.id === activeBook) || articles.find(a => a.id === activeBook);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Topbar */}
      <div style={{ padding: '12px 20px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Live stream</div>
          <div style={{ fontSize: 9, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', opacity: 0.9 }}>rerum cognoscere causas</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 1 }}>
            {filtered.length} thought{filtered.length !== 1 ? 's' : ''}
            {activeBook !== 'all' && activeBookObj ? ` · ${activeBookObj.title}` : ''}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {activeBook !== 'all' && activeBookObj && (
            <button onClick={() => setSummaryBook(activeBookObj)}
              style={{ fontSize: 12, padding: '5px 14px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-2)', background: 'var(--paper-card)', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-2)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)'; e.currentTarget.style.color = 'var(--ink-2)'; }}>
              ✦ Summary
            </button>
          )}
          <button onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
            style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-2)', background: 'var(--paper-card)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {sortOrder === 'newest' ? '↓ Newest' : '↑ Oldest'}
          </button>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search thoughts…"
            style={{ width: 170, padding: '6px 12px', fontSize: 12 }} />
        </div>
      </div>

      {/* Type filter strip */}
      <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--paper-3)', display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
        <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All</FilterChip>
        {thoughtTypes.map(t => (
          <FilterChip key={t.id} active={typeFilter === t.id} color={t.color} bg={t.bg}
            onClick={() => setTypeFilter(typeFilter === t.id ? 'all' : t.id)}>
            {t.label}
          </FilterChip>
        ))}
        {topicFilter && (
          <FilterChip active color="#2c5f8a" bg="#e8eff8" onClick={() => setTopicFilter('')}>
            #{topicFilter} ✕
          </FilterChip>
        )}
        {hasFilters && <button onClick={clearFilters} style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', cursor: 'pointer', background: 'none', border: 'none' }}>clear</button>}
        <button onClick={onManageTypes} style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', cursor: 'pointer', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 5, padding: '2px 8px' }}>Manage types</button>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 14 }}>
            {hasFilters ? 'No evidence matches the current filter. these filters.' : 'The stream is empty. Begin your observations. — capture your first one below.'}
          </div>
        ) : (
          filtered.map(thought => {
            const source = books.find(b => b.id === thought.bookId) || articles.find(a => a.id === thought.bookId);
            return (
            <ThoughtCard key={thought.id} thought={thought} book={source} books={[...books, ...articles]} thoughtTypes={thoughtTypes} onDelete={onDelete} onUpdate={onUpdate} onTopicClick={handleTopicClick} onOpenArchive={onOpenArchive} />
            );
          })
        )}
      </div>

      <CaptureBar books={books} articles={articles} thoughtTypes={thoughtTypes} onAdd={onAdd} />

      {summaryBook && (
        <BookSummary book={summaryBook} thoughts={thoughts} onClose={() => setSummaryBook(null)} />
      )}
    </div>
  );
}

function FilterChip({ active, color, bg, onClick, children }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: `1px solid ${active && color ? color : 'var(--paper-3)'}`, background: active ? (bg || 'var(--accent-light)') : 'transparent', color: active ? (color || 'var(--accent)') : 'var(--ink-3)', cursor: 'pointer' }}>
      {children}
    </button>
  );
}
