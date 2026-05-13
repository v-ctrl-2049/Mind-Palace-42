import React, { useState, useMemo } from 'react';
import { useTheme } from '../ThemeContext';
import BookPeek from './BookPeek';
import { getDailyQuote, getDailyNotice } from '../data/archivistQuotes';

// ── Grouped nav — Reading mode ────────────────────────────────────
const NAV_GROUPS_READING = [
  {
    id: 'capture',
    label: 'Capture',
    items: [
      { id: 'stream', icon: '◎', label: 'Live Stream'    },
      { id: 'log',    icon: '◈', label: 'Field Journal'  },
    ],
  },
  {
    id: 'reading',
    label: 'Reading',
    items: [
      { id: 'library',  icon: '▣', label: 'The Library'  },
      { id: 'sources',  icon: '◧', label: 'The Sources'  },
      { id: 'archive',  icon: '◫', label: 'The Archive'  },
    ],
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    items: [
      { id: 'topics',        icon: '⊕', label: 'The Stacks'          },
      { id: 'investigation', icon: '⊛', label: 'The Casebook'        },
      { id: 'timeline',      icon: '↔', label: 'The Chronicle'       },
      { id: 'mindmap',       icon: '✦', label: 'META'                },
    ],
  },
];

const NAV_GROUPS_WRITING = [
  {
    id: 'analysis',
    label: 'Analysis',
    items: [
      { id: 'investigation', icon: '⊛', label: 'The Casebook'  },
      { id: 'topics',        icon: '⊕', label: 'The Stacks'    },
      { id: 'mindmap',       icon: '✦', label: 'META'          },
    ],
  },
  {
    id: 'sources_w',
    label: 'Sources',
    items: [
      { id: 'timeline', icon: '↔', label: 'The Chronicle' },
      { id: 'archive',  icon: '◫', label: 'The Archive'   },
      { id: 'library',  icon: '▣', label: 'The Library'   },
      { id: 'sources',  icon: '◧', label: 'The Sources'   },
    ],
  },
  {
    id: 'capture_w',
    label: 'Capture',
    items: [
      { id: 'log',    icon: '◈', label: 'Field Journal' },
      { id: 'stream', icon: '◎', label: 'Live Stream'   },
    ],
  },
];

export default function Sidebar({ books, groups, activeView, activeBook, onViewChange, onBookChange, onAddBook, onUpdateGroups, thoughts = [], thoughtTypes = [], onOpenArchive, investigations = [], topics = [], events = [] }) {
  const { dark, toggle } = useTheme();
  const [collapsed, setCollapsed]           = useState({});
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupDraft, setGroupDraft]         = useState('');
  const [peekBookId, setPeekBookId]         = useState(null);
  const [mode, setMode]                     = useState('reading');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedNavGroups, setCollapsedNavGroups] = useState({});

  const NAV_GROUPS = mode === 'writing' ? NAV_GROUPS_WRITING : NAV_GROUPS_READING;
  const readingBooks = books.filter(b => b.status === 'reading');

  const toggleGroup    = (gid) => setCollapsed(c => ({ ...c, [gid]: !c[gid] }));
  const toggleNavGroup = (gid) => setCollapsedNavGroups(c => ({ ...c, [gid]: !c[gid] }));

  const startEditGroup = (g) => { setEditingGroupId(g.id); setGroupDraft(g.name); };
  const saveGroupName  = () => {
    if (!groupDraft.trim()) return;
    onUpdateGroups(prev => prev.map(g => g.id === editingGroupId ? { ...g, name: groupDraft.trim() } : g));
    setEditingGroupId(null);
  };
  const deleteGroup = (gid) => {
    if (!window.confirm('Remove this group?')) return;
    onUpdateGroups(prev => prev.filter(g => g.id !== gid));
  };

  const groupedReading   = groups.map(g => ({ group: g, books: readingBooks.filter(b => b.groupId === g.id) })).filter(g => g.books.length > 0);
  const ungroupedReading = readingBooks.filter(b => !b.groupId || !groups.find(g => g.id === b.groupId));

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── Collapsed sidebar — icon rail only ───────────────────────────
  if (sidebarCollapsed) {
    const allItems = NAV_GROUPS.flatMap(g => g.items);
    return (
      <div style={{ width: 44, flexShrink: 0, borderRight: '2px solid var(--paper-3)', background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', paddingTop: 8 }}>
        <button onClick={() => setSidebarCollapsed(false)}
          title="Expand sidebar"
          style={{ fontSize: 12, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12, padding: 4 }}>›</button>
        <button onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'}
          style={{ fontSize: 13, color: dark ? 'var(--amber)' : 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8 }}>
          {dark ? '☽' : '☀'}
        </button>
        <div style={{ width: '100%', height: 1, background: 'var(--paper-3)', marginBottom: 6 }} />
        {allItems.map(item => (
          <button key={item.id} onClick={() => onViewChange(item.id)}
            title={item.label}
            style={{ fontSize: 13, width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeView === item.id ? 'var(--accent)' : 'var(--ink-4)', background: activeView === item.id ? 'var(--nav-active-bg)' : 'transparent', border: 'none', borderLeft: activeView === item.id ? '2px solid var(--accent-2)' : '2px solid transparent', cursor: 'pointer', marginBottom: 1 }}>
            {item.icon}
          </button>
        ))}
      </div>
    );
  }

  // ── Full sidebar ─────────────────────────────────────────────────
  return (
    <div style={{ width: 224, flexShrink: 0, borderRight: '2px solid var(--paper-3)', background: 'var(--paper-2)', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'var(--font-serif)' }}>

      {/* ── TITLE ────────────────────────────────────────── */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--paper-3)', background: dark ? '#1c1710' : '#e8dfc8' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.01em', lineHeight: 1.2 }}>Mind Palace</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ink-3)', letterSpacing: '0.02em', lineHeight: 1.2 }}>42</div>
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontStyle: 'italic', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', marginTop: 3, opacity: 0.8 }}>rerum cognoscere causas</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <button onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'}
              style={{ fontSize: 14, color: dark ? 'var(--amber)' : 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}>
              {dark ? '☽' : '☀'}
            </button>
            <button onClick={() => setSidebarCollapsed(true)} title="Collapse sidebar"
              style={{ fontSize: 11, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>‹</button>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--paper-3)', margin: '6px 0' }} />
        <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>{today.toUpperCase()}</div>
      </div>

      {/* ── MODE ─────────────────────────────────────────── */}
      <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid var(--paper-3)', background: dark ? '#1a1710' : '#e0d8c4' }}>
        <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', marginBottom: 5 }}>MODE</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[{ id: 'reading', label: '◎ READING' }, { id: 'writing', label: '✍ WRITING' }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ flex: 1, padding: '5px 4px 4px', borderRadius: 2, border: `1px solid ${mode === m.id ? 'var(--accent-2)' : 'var(--paper-3)'}`, background: mode === m.id ? (dark ? '#2a1e0a' : '#f0e4cc') : 'transparent', color: mode === m.id ? 'var(--accent)' : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em', fontSize: 8, textAlign: 'center', transition: 'all 0.15s', fontWeight: mode === m.id ? 700 : 400 }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GROUPED NAV ──────────────────────────────────── */}
      <div style={{ padding: '6px 0 4px', borderBottom: '1px solid var(--paper-3)' }}>
        {NAV_GROUPS.map(group => {
          const isOpen = collapsedNavGroups[group.id] !== true; // default open
          return (
            <div key={group.id} style={{ marginBottom: 2 }}>
              <button onClick={() => toggleNavGroup(group.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '3px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 7, color: 'var(--ink-4)', display: 'inline-block', transition: 'transform 0.15s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                <span style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{group.label}</span>
              </button>
              {isOpen && group.items.map(item => (
                <NavBtn key={item.id} active={activeView === item.id} onClick={() => onViewChange(item.id)}>
                  <span style={{ fontSize: 10, width: 14, textAlign: 'center', flexShrink: 0, opacity: 0.7 }}>{item.icon}</span>
                  {item.label}
                </NavBtn>
              ))}
            </div>
          );
        })}
      </div>

      {/* ── CURRENT READING ──────────────────────────────── */}
      <div style={{ padding: '6px 0 4px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 5px' }}>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase' }}>On the desk</div>
          <span style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{readingBooks.length}</span>
        </div>

        <BookItem label="All sources" color="var(--ink-4)" active={activeBook === 'all'} onClick={() => onBookChange('all')} />

        {groupedReading.map(({ group, books: gBooks }) => {
          const isOpen = !collapsed[group.id];
          return (
            <div key={group.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px 2px', marginTop: 4 }}
                onMouseEnter={e => e.currentTarget.querySelector('.group-actions').style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.querySelector('.group-actions').style.opacity = '0'}>
                <button onClick={() => toggleGroup(group.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flex: 1, textAlign: 'left', padding: 0 }}>
                  <span style={{ fontSize: 7, color: 'var(--ink-4)', transition: 'transform 0.15s', transform: isOpen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>▶</span>
                  {editingGroupId === group.id ? (
                    <input autoFocus value={groupDraft} onChange={e => setGroupDraft(e.target.value)}
                      onBlur={saveGroupName} onKeyDown={e => { if (e.key === 'Enter') saveGroupName(); if (e.key === 'Escape') setEditingGroupId(null); }}
                      style={{ fontSize: 9, border: 'none', background: 'transparent', outline: '1px solid var(--accent-2)', borderRadius: 2, padding: '1px 4px', color: 'var(--ink)', width: 100, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }} />
                  ) : (
                    <span style={{ fontSize: 9, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.07em', textTransform: 'uppercase', flex: 1 }}>{group.name}</span>
                  )}
                </button>
                <div className="group-actions" style={{ display: 'flex', gap: 3, opacity: 0, transition: 'opacity 0.15s' }}>
                  <button onClick={() => startEditGroup(group)} style={{ fontSize: 9, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: 'none' }} title="Rename">✎</button>
                  <button onClick={() => deleteGroup(group.id)} style={{ fontSize: 9, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
                </div>
              </div>
              {isOpen && gBooks.map(b => (
                <BookItem key={b.id} label={b.title} color={b.color} active={activeBook === b.id}
                  onClick={() => onBookChange(b.id)} indent
                  progress={b.pages ? Math.round((b.progress / b.pages) * 100) : null}
                  bookId={b.id} onOpenArchive={onOpenArchive}
                  onPeek={id => setPeekBookId(id)} onUnpeek={() => setPeekBookId(null)} />
              ))}
            </div>
          );
        })}

        {ungroupedReading.map(b => (
          <BookItem key={b.id} label={b.title} color={b.color} active={activeBook === b.id}
            onClick={() => onBookChange(b.id)}
            progress={b.pages ? Math.round((b.progress / b.pages) * 100) : null}
            bookId={b.id} onOpenArchive={onOpenArchive}
            onPeek={id => setPeekBookId(id)} onUnpeek={() => setPeekBookId(null)} />
        ))}

        {readingBooks.length === 0 && (
          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', padding: '8px 14px', lineHeight: 1.6 }}>
            The desk is clear.<br />Open a book in Library to begin.
          </div>
        )}

        {peekBookId && (() => {
          const peekBook = readingBooks.find(b => b.id === peekBookId);
          if (!peekBook) return null;
          return <BookPeek book={peekBook} thoughts={thoughts} thoughtTypes={thoughtTypes} />;
        })()}
      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <div style={{ padding: '8px 12px 10px', borderTop: '1px solid var(--paper-3)' }}>
        <button onClick={onAddBook}
          style={{ width: '100%', padding: '6px 0', fontSize: 10, color: 'var(--ink-3)', border: '1px dashed var(--paper-3)', borderRadius: 2, cursor: 'pointer', background: 'transparent', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-2)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)'; e.currentTarget.style.color = 'var(--ink-3)'; }}>
          + ADD TO COLLECTION
        </button>
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: '5px 12px 5px 22px', fontSize: 11, textAlign: 'left', color: active ? 'var(--ink)' : 'var(--ink-3)', background: active ? 'var(--nav-active-bg)' : 'transparent', fontWeight: active ? 500 : 400, cursor: 'pointer', border: 'none', borderLeft: active ? '2px solid var(--accent-2)' : '2px solid transparent', marginBottom: 1, fontFamily: 'var(--font-serif)', transition: 'all 0.1s' }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--nav-hover-bg)'; e.currentTarget.style.color = 'var(--ink)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-3)'; } }}>
      {children}
    </button>
  );
}

function BookItem({ label, color, active, onClick, indent, progress, bookId, onOpenArchive, onPeek, onUnpeek }) {
  return (
    <div style={{ position: 'relative' }}
      onMouseEnter={() => onPeek?.(bookId)}
      onMouseLeave={() => onUnpeek?.()}>
      <button onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', gap: 7, width: '100%', padding: `4px 12px 4px ${indent ? 22 : 12}px`, fontSize: 11, textAlign: 'left', color: active ? 'var(--ink)' : 'var(--ink-2)', background: active ? 'var(--nav-active-bg)' : 'transparent', fontWeight: active ? 500 : 400, cursor: 'pointer', border: 'none', borderLeft: active ? '2px solid var(--accent-2)' : '2px solid transparent', marginBottom: 1, lineHeight: 1.35, transition: 'all 0.1s' }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--nav-hover-bg)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>{label}</div>
          {progress !== null && progress !== undefined && (
            <div style={{ marginTop: 2, height: 2, background: 'var(--paper-3)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: color, opacity: 0.7 }} />
            </div>
          )}
        </div>
        {onOpenArchive && (
          <button onClick={e => { e.stopPropagation(); onOpenArchive(bookId); }}
            style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', flexShrink: 0, opacity: 0 }}
            className="archive-btn" title="View notes"
            onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-4)'; e.currentTarget.style.opacity = '0'; }}>
            ◈
          </button>
        )}
      </button>
    </div>
  );
}
