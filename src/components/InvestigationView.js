import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import InvestigationEditModal from './InvestigationEditModal';
import InvestigationCasePage from './InvestigationCasePage';
import TypeManager from './TypeManager';
import { getMapEvidenceSummary } from '../utils/evidenceProfile';

const STATUS_STYLES = {
  active: { color: '#2a6a4a', bg: '#e4f4ec', label: 'ACTIVE',  stamp: '#2a6a4a' },
  cold:   { color: '#7a5c38', bg: '#f0e8d8', label: 'COLD',    stamp: '#7a5c38' },
  closed: { color: '#5a5050', bg: '#f0eeea', label: 'CLOSED',  stamp: '#5a5050' },
};

const getInvType = (id, invTypes) =>
  invTypes.find(t => t.id === id) || { id, label: id, color: '#8a8680', bg: '#f2f0ec' };

// Seeded card tilt — subtle, consistent
function seedTilt(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return ((h % 5) - 2) * 0.35;
}

// ── Case card ─────────────────────────────────────────────────────
function CaseCard({ inv, books, invTypes, onClick, compact }) {
  const [hovered, setHovered] = useState(false);
  const invType = getInvType(inv.type, invTypes);
  const ss = STATUS_STYLES[inv.status] || STATUS_STYLES.active;
  const linkedBooks = books.filter(b => (inv.bookIds || []).includes(b.id));
  const unresolved = (inv.contradictions || []).filter(c => !c.resolution).length;
  const tilt = seedTilt(inv.id);

  // Evidence grade from arg map
  const argNodes = inv.argMap?.nodes || [];
  const evidenceSummary = argNodes.length ? getMapEvidenceSummary(argNodes, books) : null;

  if (compact) {
    return (
      <div onClick={onClick}
        style={{ background: 'var(--paper-card)', border: '1px solid var(--paper-3)', borderLeft: `4px solid ${invType.color}`, borderRadius: 3, padding: '12px 16px', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center', boxShadow: 'var(--shadow-card)', transition: 'box-shadow 0.12s, transform 0.12s' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'none'; }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            {inv.caseNumber && <span style={{ fontSize: 9, color: invType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>{inv.caseNumber}</span>}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>{inv.title}</span>
            {unresolved > 0 && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 2, background: '#c0392b22', color: '#c0392b', fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: '1px solid #c0392b44' }}>⚠ {unresolved}</span>}
          </div>
          {inv.summary && <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.5, fontStyle: 'italic', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.summary}</p>}
          {linkedBooks.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
              {linkedBooks.map(b => <span key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: b.color, fontStyle: 'italic' }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: b.color }} />{b.title}</span>)}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 9, padding: '1px 7px', borderRadius: 2, border: `1px solid ${ss.stamp}55`, color: ss.stamp, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em', marginBottom: 4, display: 'inline-block' }}>{ss.label}</div>
          {evidenceSummary && <div style={{ fontSize: 11, fontWeight: 900, color: evidenceSummary.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{evidenceSummary.grade}</div>}
        </div>
      </div>
    );
  }

  // Board card — case file dropped on desk
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--paper-card)',
        border: '1px solid var(--paper-3)',
        borderRadius: 2,
        padding: '18px 14px 14px',
        cursor: 'pointer',
        position: 'relative',
        transform: hovered ? 'rotate(0deg) translateY(-3px)' : `rotate(${tilt}deg)`,
        transition: 'transform 0.18s cubic-bezier(.2,.8,.3,1), box-shadow 0.18s',
        boxShadow: hovered
          ? '3px 8px 20px rgba(26,20,10,0.16), 0 0 0 1px rgba(26,20,10,0.06)'
          : '1px 3px 8px rgba(26,20,10,0.10)',
        zIndex: hovered ? 5 : 1,
      }}>

      {/* Paperclip graphic — top right */}
      <div style={{ position: 'absolute', top: -8, right: 20, width: 14, height: 28, borderRadius: '7px 7px 0 0', border: `2px solid ${invType.color}88`, borderBottom: 'none', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -8, right: 23, width: 8, height: 24, borderRadius: '4px 4px 0 0', border: `2px solid ${invType.color}88`, borderBottom: 'none', pointerEvents: 'none' }} />

      {/* Case number + type */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 8, color: invType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em', opacity: 0.8 }}>
          {inv.caseNumber || '—'}
        </span>
        <span style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>·</span>
        <span style={{ fontSize: 8, color: invType.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>{invType.label.toUpperCase()}</span>
        <div style={{ flex: 1 }} />
        {linkedBooks.slice(0, 3).map(b => (
          <div key={b.id} title={b.title} style={{ width: 6, height: 6, borderRadius: '50%', background: b.color }} />
        ))}
      </div>

      {/* Title — display font */}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35, marginBottom: 8, fontFamily: 'var(--font-display)', paddingRight: 16 }}>
        {inv.title}
      </div>

      {/* Status stamp — rotated */}
      <div style={{ position: 'absolute', top: 14, right: 10, transform: 'rotate(-8deg)', border: `2px solid ${ss.stamp}`, borderRadius: 2, padding: '2px 6px', opacity: 0.75 }}>
        <div style={{ fontSize: 8, fontWeight: 900, color: ss.stamp, fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.12em' }}>{ss.label}</div>
      </div>

      {/* Unresolved contradictions */}
      {unresolved > 0 && (
        <div style={{ fontSize: 9, padding: '1px 7px', borderRadius: 2, background: '#c0392b11', color: '#c0392b', fontFamily: 'var(--font-mono)', fontStyle: 'normal', border: '1px solid #c0392b33', alignSelf: 'flex-start', display: 'inline-block', marginBottom: 6 }}>
          ⚠ {unresolved} unresolved
        </div>
      )}

      {/* Opening question */}
      {inv.summary && (
        <p style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {inv.summary}
        </p>
      )}

      {/* Tags */}
      {inv.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {inv.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: 8, padding: '1px 6px', borderRadius: 2, background: 'var(--paper-2)', color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em' }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer — evidence grade + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px dashed var(--paper-3)', paddingTop: 7, marginTop: 4 }}>
        {evidenceSummary ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: evidenceSummary.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{evidenceSummary.grade}</span>
            </div>
            <span style={{ fontSize: 9, color: evidenceSummary.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{evidenceSummary.label}</span>
          </div>
        ) : (
          <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontStyle: 'italic' }}>no evidence mapped</span>
        )}
        <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginLeft: 'auto' }}>
          {new Date(inv.updatedAt || inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function InvestigationView({
  investigations, books, events,
  invTypes, onUpdateInvTypes,
  onUpdate, onAdd, onDelete, onSwitchToTimeline,
}) {
  const [displayMode, setDisplayMode] = useState('board');
  const [filterType,   setFilterType]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch]             = useState('');
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [editingInv, setEditingInv]     = useState(null);
  const [isNewInv, setIsNewInv]         = useState(false);
  const [managingTypes, setManagingTypes] = useState(false);
  const [sortBy, setSortBy]             = useState('updated'); // 'updated' | 'created' | 'title' | 'status'
  const [groupBy, setGroupBy]           = useState('type');   // 'type' | 'status' | 'none'
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const toggleGroup = (key) => setCollapsedGroups(c => ({ ...c, [key]: !c[key] }));

  // ── Filtering ─────────────────────────────────────────────────
  const filtered = investigations
    .filter(inv => filterType   === 'all' || inv.type   === filterType)
    .filter(inv => filterStatus === 'all' || inv.status === filterStatus)
    .filter(inv => !search
      || inv.title.toLowerCase().includes(search.toLowerCase())
      || inv.tags?.some(tag => tag.includes(search.toLowerCase()))
      || inv.actors?.some(actor => actor.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'title')   return a.title.localeCompare(b.title);
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'status')  return a.status.localeCompare(b.status);
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

  const activeCase = activeCaseId ? investigations.find(i => i.id === activeCaseId) : null;

  // ── Case page ────────────────────────────────────────────────
  if (activeCase) {
    return (
      <InvestigationCasePage
        inv={activeCase} books={books} events={events} invTypes={invTypes}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onBack={() => setActiveCaseId(null)}
        onViewTimeline={tag => { setActiveCaseId(null); onSwitchToTimeline?.(tag); }}
      />
    );
  }

  const handleAdd = () => {
    setEditingInv({
      id: uuidv4(), title: '', type: invTypes[0]?.id || 'political', status: 'active',
      dateRange: '', actors: [], causes: [], bookIds: [], bookNotes: [],
      tags: [], summary: '', analysis: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    setIsNewInv(true);
  };

  // Build groups based on groupBy setting
  const buildGroups = () => {
    if (groupBy === 'none') return [{ key: 'all', label: 'All cases', color: 'var(--ink-3)', items: filtered }];
    if (groupBy === 'status') {
      return Object.entries(STATUS_STYLES)
        .map(([k, v]) => ({ key: k, label: v.label, color: v.color, items: filtered.filter(i => i.status === k) }))
        .filter(g => g.items.length > 0);
    }
    // Default: group by type
    return invTypes
      .map(t => ({ key: t.id, label: t.label, color: t.color, items: filtered.filter(i => i.type === t.id) }))
      .filter(g => g.items.length > 0);
  };
  const groups = buildGroups();

  // Books that appear in at least one investigation
  const usedBookIds = [...new Set(investigations.flatMap(i => i.bookIds || []))];
  // (kept for potential future use)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Topbar */}
      <div style={{ padding: '12px 20px 10px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>Investigation</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', opacity: 0.9 }}>rerum cognoscere causas</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 1 }}>
              {investigations.length} case{investigations.length !== 1 ? 's' : ''} · {investigations.filter(i => i.status === 'active').length} active
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--paper-3)', borderRadius: 7, overflow: 'hidden' }}>
              {[['board','⊞ Board'],['list','≡ List']].map(([mode, label]) => (
                <button key={mode} onClick={() => setDisplayMode(mode)}
                  style={{ padding: '5px 12px', fontSize: 11, border: 'none', borderRight: mode === 'board' ? '1px solid var(--paper-3)' : 'none', background: displayMode === mode ? 'var(--accent-light)' : 'transparent', color: displayMode === mode ? 'var(--accent)' : 'var(--ink-3)', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
            <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
              style={{ fontSize: 11, padding: '5px 22px 5px 8px', borderRadius: 6, background: 'var(--paper-2)', color: 'var(--ink-2)', border: '1px solid var(--paper-3)' }}>
              <option value="type">Group: Type</option>
              <option value="status">Group: Status</option>
              <option value="none">No grouping</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ fontSize: 11, padding: '5px 22px 5px 8px', borderRadius: 6, background: 'var(--paper-2)', color: 'var(--ink-2)', border: '1px solid var(--paper-3)' }}>
              <option value="updated">Sort: Last updated</option>
              <option value="created">Sort: Date created</option>
              <option value="title">Sort: Title</option>
              <option value="status">Sort: Status</option>
            </select>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases…"
              style={{ width: 170, padding: '6px 12px', fontSize: 12 }} />
            <button onClick={handleAdd}
              style={{ fontSize: 12, padding: '6px 16px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + Open case
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Type pills */}
          <Pill active={filterType === 'all'} color="var(--ink-3)" bg="var(--paper-3)" onClick={() => setFilterType('all')}>All types</Pill>
          {invTypes.map(t => {
            const cnt = investigations.filter(i => i.type === t.id).length;
            if (!cnt) return null;
            return <Pill key={t.id} active={filterType === t.id} color={t.color} bg={t.bg} onClick={() => setFilterType(filterType === t.id ? 'all' : t.id)}>{t.label} {cnt}</Pill>;
          })}
          <button onClick={() => setManagingTypes(true)}
            style={{ fontSize: 10, color: 'var(--ink-4)', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
            manage types
          </button>

          <div style={{ width: 1, height: 14, background: 'var(--paper-3)' }} />

          {/* Status pills */}
          {['all','active','cold','closed'].map(s => (
            <Pill key={s} active={filterStatus === s}
              color={STATUS_STYLES[s]?.color || 'var(--ink-3)'}
              bg={STATUS_STYLES[s]?.bg || 'var(--paper-3)'}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}>
              {s === 'all' ? 'All status' : STATUS_STYLES[s]?.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-4)', fontStyle: 'italic', fontSize: 14, lineHeight: 1.7 }}>
            {search || filterType !== 'all' || filterStatus !== 'all' || filterBook !== 'all'
              ? 'No cases match your filters.'
              : 'The dossier is empty. The inquiry has not yet begun. yet.\nClick "+ Open case" to start your first.'}
          </div>
        ) : displayMode === 'board' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {groups.map(({ key, label, color, items }) => (
              <div key={key}>
                {/* Group header — collapsible */}
                <button onClick={() => toggleGroup(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', marginBottom: collapsedGroups[key] ? 0 : 12, textAlign: 'left' }}>
                  <span style={{ fontSize: 9, color: 'var(--ink-4)', display: 'inline-block', transition: 'transform 0.15s', transform: collapsedGroups[key] ? 'rotate(0deg)' : 'rotate(90deg)' }}>▶</span>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{label}</span>
                  <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{items.length}</span>
                </button>
                {!collapsedGroups[key] && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {items.map(inv => (
                      <CaseCard key={inv.id} inv={inv} books={books} invTypes={invTypes} onClick={() => setActiveCaseId(inv.id)} compact={false} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(inv => (
              <CaseCard key={inv.id} inv={inv} books={books} invTypes={invTypes} onClick={() => setActiveCaseId(inv.id)} compact />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {editingInv && (
        <InvestigationEditModal
          inv={editingInv} books={books} invTypes={invTypes} isNew={isNewInv}
          onSave={updated => {
            if (isNewInv) { onAdd(updated); setActiveCaseId(updated.id); }
            else onUpdate(updated);
          }}
          onDelete={onDelete}
          onClose={() => setEditingInv(null)}
        />
      )}
      {managingTypes && (
        <TypeManager
          title="Investigation types"
          types={invTypes}
          onUpdate={onUpdateInvTypes}
          onClose={() => setManagingTypes(false)}
          hasColor hasDash={false}
        />
      )}
    </div>
  );
}

function Pill({ active, color, bg, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      fontSize: 10, padding: '3px 10px', borderRadius: 20,
      border: `1px solid ${active ? color : 'var(--paper-3)'}`,
      background: active ? bg + '44' : 'transparent',
      color: active ? color : 'var(--ink-3)',
      cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal',
    }}>{children}</button>
  );
}
