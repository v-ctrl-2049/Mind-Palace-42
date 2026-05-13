import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { STATUSES, getStatus } from '../data/library';
import { BookCard } from './BookCover';

const ARTICLE_COLORS = [
  '#2c5f8a','#1a5c7a','#2e7d5e','#7b3fa0','#b07d28',
  '#c0392b','#7a6a52','#3a7d7d','#4a6fa5','#2c6e4a',
];

// ── Inline group manager ─────────────────────────────────────────
function ArticleGroupManager({ groups, onUpdate, onClose }) {
  const [items, setItems] = useState(groups.map(g => ({ ...g })));
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(ARTICLE_COLORS[0]);
  const add = () => {
    if (!newName.trim()) return;
    setItems(prev => [...prev, { id: uuidv4(), name: newName.trim(), color: newColor }]);
    setNewName('');
  };
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: 400, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Manage article groups</span>
          <button onClick={onClose} style={{ fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 18px' }}>
          {items.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 0', borderBottom: '1px solid var(--paper-3)' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: g.color, cursor: 'pointer' }} />
                <input type="color" value={g.color} onChange={e => setItems(prev => prev.map(i => i.id === g.id ? { ...i, color: e.target.value } : i))}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
              </div>
              <input value={g.name} onChange={e => setItems(prev => prev.map(i => i.id === g.id ? { ...i, name: e.target.value } : i))}
                style={{ flex: 1, padding: '4px 8px', fontSize: 13, borderRadius: 5 }} />
              <button onClick={() => setItems(prev => prev.filter(i => i.id !== g.id))}
                style={{ fontSize: 11, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
            </div>
          ))}
          {items.length === 0 && <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', padding: '8px 0' }}>No groups yet.</div>}
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--paper-3)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: newColor, cursor: 'pointer', border: '2px solid var(--paper-3)' }} />
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
            </div>
            <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
              placeholder="New group…" style={{ flex: 1, padding: '6px 10px', fontSize: 13, borderRadius: 6 }} />
            <button onClick={add} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Add</button>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</button>
            <button onClick={() => { onUpdate(items); onClose(); }} style={{ fontSize: 12, padding: '6px 18px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_GROUPS = [
  { id: 'reading',      label: 'Currently Reading' },
  { id: 'want-next',    label: 'Next Up' },
  { id: 'want-someday', label: 'Maybe Someday' },
  { id: 'want-meh',     label: 'Yeah Whatever' },
  { id: 'finished',     label: 'Finished' },
  { id: 'dnf',          label: 'Did Not Finish' },
];

function StarDisplay({ rating }) {
  if (!rating) return null;
  return <span style={{ color: '#b07d28', fontSize: 11 }}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>;
}

function ProgressBar({ article }) {
  if (!article.pages || article.status !== 'reading') return null;
  const total = parseInt(article.pages) || 1;
  const pct = Math.min(100, Math.round((article.progress / total) * 100));
  return (
    <div style={{ marginTop: 3 }}>
      <div style={{ height: 3, background: 'var(--paper-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#2e7d5e', borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 2, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>p.{article.progress} · {pct}%</div>
    </div>
  );
}


const MEDIUM_CONFIG = {
  academic:  { label: 'Paper',    icon: '◎', color: '#2c5f8a' },
  web:       { label: 'Web',      icon: '◉', color: '#2e7d5e' },
  news:      { label: 'News',     icon: '◈', color: '#b07d28' },
  social:    { label: 'Social',   icon: '⊕', color: '#7b3fa0' },
  video:     { label: 'Video',    icon: '▶', color: '#c0392b' },
  podcast:   { label: 'Podcast',  icon: '◌', color: '#1a5c7a' },
  magazine:  { label: 'Magazine', icon: '◧', color: '#7a6a52' },
  document:  { label: 'Doc',      icon: '⊛', color: '#1a5c3a' },
  other:     { label: 'Other',    icon: '·', color: '#8a8680' },
};

// ── Article card (list mode) ─────────────────────────────────────
function ArticleListRow({ article, group, books, onEdit, isLast }) {
  const linkedBooks = books.filter(b => (article.connectedBookIds || []).includes(b.id));
  return (
    <div onClick={() => onEdit(article)}
      style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: isLast ? 'none' : '1px solid var(--paper-3)', cursor: 'pointer', transition: 'background 0.12s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ width: 10, height: 10, borderRadius: 2, background: article.color, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>{article.title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, fontStyle: 'italic' }}>
          {article.author}
          {article.journal && <span style={{ color: 'var(--ink-4)' }}> · {article.journal}{article.volume ? ` ${article.volume}${article.issue ? `(${article.issue})` : ''}` : ''}</span>}
          {article.year ? <span style={{ color: 'var(--ink-4)' }}> · {article.year}</span> : ''}
          {group ? <span style={{ color: group.color, marginLeft: 4 }}>· {group.name}</span> : ''}
        </div>
        <ProgressBar article={article} />
        {article.review && <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 3 }}>"{article.review}"</div>}
        {linkedBooks.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>↔</span>
            {linkedBooks.map(b => (
              <span key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: b.color }} />{b.title}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <StarDisplay rating={article.rating} />
        {article.medium && MEDIUM_CONFIG[article.medium] && (
          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 8, background: MEDIUM_CONFIG[article.medium].color + '18', color: MEDIUM_CONFIG[article.medium].color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: `1px solid ${MEDIUM_CONFIG[article.medium].color}33` }}>
            {MEDIUM_CONFIG[article.medium].icon} {MEDIUM_CONFIG[article.medium].label}
          </span>
        )}
        {article.url && (
          <button onClick={e => { e.stopPropagation(); window.open(article.url, '_blank'); }}
            style={{ fontSize: 9, padding: '1px 8px', borderRadius: 5, border: '1px solid var(--paper-3)', color: 'var(--accent)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--paper-3)'}>
            Open ↗
          </button>
        )}
      </div>
    </div>
  );
}

// ── Article card (covers mode) ───────────────────────────────────
function ArticleCoverCard({ article, onEdit }) {
  const st = getStatus(article.status);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 120 }}>
      <BookCard book={article} status={st} onClick={() => onEdit(article)} />
      <div style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</div>
      <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.author}</div>
      {article.journal && <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.journal}</div>}
      <StarDisplay rating={article.rating} />
    </div>
  );
}

// ── Main PaperlessView ───────────────────────────────────────────
export default function PaperlessView({ articles, articleGroups = [], books, genres, onEdit, onAdd, onUpdateGroups }) {
  const [displayMode, setDisplayMode]   = useState('list');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch]             = useState('');
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [collapsedGroups, setCollapsedGroups]   = useState({});
  const toggleGroup = (id) => setCollapsedGroups(c => ({ ...c, [id]: !c[id] }));

  const filtered = articles
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .filter(a => !search ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.author?.toLowerCase().includes(search.toLowerCase()) ||
      a.journal?.toLowerCase().includes(search.toLowerCase()) ||
      a.abstract?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    reading:  articles.filter(a => a.status === 'reading').length,
    finished: articles.filter(a => a.status === 'finished').length,
    want:     articles.filter(a => a.status?.startsWith('want')).length,
  };

  // Group sections: each articleGroup + ungrouped at end
  const groupSections = [
    ...articleGroups.map(g => ({
      id: g.id,
      label: g.name,
      color: g.color || 'var(--accent)',
      articles: filtered.filter(a => a.groupId === g.id),
    })),
    {
      id: '__ungrouped',
      label: 'Ungrouped',
      color: 'var(--ink-4)',
      articles: filtered.filter(a => !a.groupId || !articleGroups.find(g => g.id === a.groupId)),
    },
  ].filter(s => s.articles.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Topbar */}
      <div style={{ padding: '12px 20px 10px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0, background: 'var(--paper-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.2 }}>Sources</div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginTop: 2, letterSpacing: '0.04em' }}>
              {articles.length} article{articles.length !== 1 ? 's' : ''} · {stats.reading} reading · {stats.finished} finished
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid var(--paper-3)', borderRadius: 2, overflow: 'hidden' }}>
              {[['list','≡ List'],['covers','⊞ Covers']].map(([mode, label]) => (
                <button key={mode} onClick={() => setDisplayMode(mode)}
                  style={{ padding: '5px 10px', fontSize: 10, border: 'none', background: displayMode === mode ? 'var(--ink)' : 'transparent', color: displayMode === mode ? 'var(--paper-card)' : 'var(--ink-3)', cursor: 'pointer', borderRight: mode === 'list' ? '1px solid var(--paper-3)' : 'none', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowGroupManager(true)}
              style={{ fontSize: 10, padding: '5px 10px', borderRadius: 2, border: '1px solid var(--paper-3)', color: 'var(--ink-2)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-2)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)'; }}>
              ⊙ Groups
            </button>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sources…"
              style={{ width: 160, padding: '5px 10px', fontSize: 11, borderRadius: 2, fontStyle: 'italic' }} />
            <button onClick={onAdd}
              style={{ fontSize: 10, padding: '5px 14px', borderRadius: 2, background: 'var(--ink)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
              + ADD SOURCE
            </button>
          </div>
        </div>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          <StatusPill label="All" count={articles.length} active={filterStatus === 'all'} color="var(--ink-3)" bg="var(--paper-3)" onClick={() => setFilterStatus('all')} />
          {STATUSES.map(s => {
            const cnt = articles.filter(a => a.status === s.id).length;
            if (cnt === 0) return null;
            return <StatusPill key={s.id} label={s.label} count={cnt} active={filterStatus === s.id} color={s.color} bg={s.bg} onClick={() => setFilterStatus(filterStatus === s.id ? 'all' : s.id)} />;
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-4)', fontStyle: 'italic' }}>
            <div style={{ fontSize: 32, opacity: 0.1, marginBottom: 12, fontFamily: 'var(--font-display)' }}>◌</div>
            {search ? 'No sources match this search.' : 'No sources yet — add your first paper.'}
          </div>
        ) : displayMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {groupSections.map(section => {
              const isCollapsed = collapsedGroups[section.id] !== false; // default collapsed
              return (
                <div key={section.id}>
                  {/* Group header — collapsible */}
                  <button onClick={() => toggleGroup(section.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', textAlign: 'left', marginBottom: isCollapsed ? 0 : 8 }}>
                    <span style={{ fontSize: 8, color: 'var(--ink-4)', display: 'inline-block', transition: 'transform 0.15s', transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}>▶</span>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: section.color, flexShrink: 0, boxShadow: `0 0 0 2px ${section.color}33` }} />
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink-2)' }}>{section.label}</span>
                    <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{section.articles.length} source{section.articles.length !== 1 ? 's' : ''}</span>
                  </button>

                  {!isCollapsed && (
                    <div style={{ background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 4px rgba(100,70,20,0.07)' }}>
                      {section.articles.map((a, i) => {
                        const group = (articleGroups || []).find(g => g.id === a.groupId);
                        return <ArticleListRow key={a.id} article={a} group={group} books={books} onEdit={onEdit} isLast={i === section.articles.length - 1} />;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {groupSections.map(section => {
              const isCollapsed = collapsedGroups[section.id] !== false;
              return (
                <div key={section.id}>
                  <button onClick={() => toggleGroup(section.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left', marginBottom: isCollapsed ? 0 : 12 }}>
                    <span style={{ fontSize: 8, color: 'var(--ink-4)', display: 'inline-block', transition: 'transform 0.15s', transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}>▶</span>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: section.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic', color: 'var(--ink-2)' }}>{section.label}</span>
                    <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{section.articles.length}</span>
                  </button>
                  {!isCollapsed && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                      {section.articles.map(a => <ArticleCoverCard key={a.id} article={a} onEdit={onEdit} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showGroupManager && (
        <ArticleGroupManager groups={articleGroups} onUpdate={onUpdateGroups} onClose={() => setShowGroupManager(false)} />
      )}
    </div>
  );
}

function StatusPill({ label, count, active, color, bg, onClick }) {
  return (
    <button onClick={onClick}
      style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, border: `1px solid ${active ? color : 'var(--paper-3)'}`, background: active ? bg + '44' : 'transparent', color: active ? color : 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', display: 'flex', alignItems: 'center', gap: 4 }}>
      {label} <span style={{ opacity: 0.7 }}>{count}</span>
    </button>
  );
}
