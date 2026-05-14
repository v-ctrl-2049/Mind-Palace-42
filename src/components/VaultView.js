import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SimpleEditor from './SimpleEditor';
import BookSelect from './BookSelect';
import { GHOST_FACULTY, VAULT_FACULTY, getFacultyMember, getTriggeredNotices } from '../data/ghostFaculty';

// ── Media types ───────────────────────────────────────────────────
const MEDIA_TYPES = {
  text:     { label: 'Text',      icon: '◧', color: '#2a4a7a', desc: 'Pamphlet, speech, letter, treaty, manifesto' },
  document: { label: 'Document',  icon: '◫', color: '#4a2a2a', desc: 'Legal record, census, administrative file' },
  visual:   { label: 'Visual',    icon: '◈', color: '#2a5a2a', desc: 'Photograph, map, illustration, poster' },
  oral:     { label: 'Oral',      icon: '◎', color: '#5a4a2a', desc: 'Transcribed interview, recorded speech' },
  object:   { label: 'Object',    icon: '⊕', color: '#3a3a5a', desc: 'Material culture, artifact description' },
};

const WATERMARK = 'THE VAULT · COLD STORAGE · EVIDENCE IN · EVIDENCE OUT';

// ── Ghost Faculty vault notice ────────────────────────────────────
function VaultNotice({ faculty, notice, onDismiss }) {
  return (
    <div style={{ background: 'var(--paper-2)', border: '1px solid var(--paper-3)', borderLeft: '3px solid var(--accent-2)', borderRadius: 2, padding: '10px 12px', marginBottom: 10 }}>
      <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
        <span>⊛ {faculty.name}</span>
        <button onClick={onDismiss} style={{ fontSize: 10, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.65 }}>{notice}</div>
    </div>
  );
}

// ── Source card ───────────────────────────────────────────────────
function SourceCard({ entry, isSelected, onClick }) {
  const mt = MEDIA_TYPES[entry.mediaType] || MEDIA_TYPES.text;
  return (
    <div onClick={() => onClick(entry)}
      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--paper-3)', background: isSelected ? 'var(--nav-active-bg)' : 'transparent', borderLeft: isSelected ? `2px solid ${mt.color}` : '2px solid transparent', transition: 'all 0.1s' }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--nav-hover-bg)'; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 10, color: mt.color, flexShrink: 0 }}>{mt.icon}</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: isSelected ? 'var(--ink)' : 'var(--ink-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title || 'Untitled source'}</span>
        {entry.date && <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', flexShrink: 0 }}>{entry.date}</span>}
      </div>
      {entry.provenance && (
        <div style={{ fontSize: 9, color: 'var(--ink-4)', fontStyle: 'italic', marginTop: 2, paddingLeft: 18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.provenance}
        </div>
      )}
    </div>
  );
}

// ── Source editor ─────────────────────────────────────────────────
function SourceEditor({ entry, allEntries, topics, books = [], investigations, onSave, onDelete, onClose }) {
  const [draft, setDraft] = useState({ ...entry });
  const [saved, setSaved]   = useState(false);
  const [dismissedNotices, setDismissedNotices] = useState([]);

  const mt = MEDIA_TYPES[draft.mediaType] || MEDIA_TYPES.text;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const set = (k, v) => {
    const updated = { ...draft, [k]: v, updatedAt: new Date().toISOString() };
    setDraft(updated);
    onSave(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  // Vault-specific Ghost Faculty notices
  const notices = useMemo(() => {
    const triggered = getTriggeredNotices(draft.transcription || draft.description || '', draft.title || '', 2)
      .filter(n => VAULT_FACULTY.includes(n.faculty.id))
      .filter(n => !dismissedNotices.includes(n.faculty.id));
    return triggered;
  }, [draft.title, draft.transcription, draft.description, dismissedNotices]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: isDark ? '#1a1814' : '#faf6ee' }}>

      {/* Header */}
      <div style={{ padding: '12px 20px 10px', borderBottom: `2px solid ${mt.color}44`, flexShrink: 0, background: isDark ? '#1c1a14' : '#f0e8d8', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 16, bottom: -10, fontSize: 64, color: mt.color, opacity: 0.04, fontFamily: 'var(--font-display)', pointerEvents: 'none', userSelect: 'none' }}>◊</div>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button onClick={onClose} style={{ fontSize: 8, color: 'var(--ink-4)', cursor: 'pointer', background: 'none', border: '1px solid var(--paper-3)', borderRadius: 2, padding: '2px 9px', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.08em' }}>← VAULT</button>
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.entries(MEDIA_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => set('mediaType', k)}
                title={v.desc}
                style={{ fontSize: 8, padding: '2px 8px', borderRadius: 2, border: `1px solid ${draft.mediaType === k ? v.color : 'var(--paper-3)'}`, background: draft.mediaType === k ? v.color + '18' : 'transparent', color: draft.mediaType === k ? v.color : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {saved && <span style={{ fontSize: 8, color: 'var(--green)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>✓ filed</span>}
          <button onClick={() => { if (window.confirm('Remove this source from The Vault?')) onDelete(entry.id); }}
            style={{ fontSize: 8, padding: '2px 9px', borderRadius: 2, border: '1px solid var(--paper-3)', color: 'var(--ink-4)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-4)'; e.currentTarget.style.borderColor = 'var(--paper-3)'; }}>
            REMOVE
          </button>
        </div>

        {/* Title */}
        <input value={draft.title} onChange={e => set('title', e.target.value)}
          placeholder="Source title…"
          style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', background: 'transparent', border: 'none', outline: 'none', width: '100%' }} />

        {/* Date + Provenance row */}
        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <input value={draft.date || ''} onChange={e => set('date', e.target.value)}
            placeholder="Date…"
            style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontStyle: 'normal', color: 'var(--ink-3)', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--paper-3)', outline: 'none', width: 120 }} />
          <input value={draft.provenance || ''} onChange={e => set('provenance', e.target.value)}
            placeholder="Author / Creator / Origin…"
            style={{ fontSize: 11, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--ink-3)', background: 'transparent', border: 'none', borderBottom: '1px dashed var(--paper-3)', outline: 'none', flex: 1 }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Ghost Faculty notices */}
        {notices.length > 0 && (
          <div>
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>⊛ Archivists' notes</div>
            {notices.map(({ faculty, notice }) => (
              <VaultNotice key={faculty.id} faculty={faculty} notice={notice}
                onDismiss={() => setDismissedNotices(d => [...d, faculty.id])} />
            ))}
          </div>
        )}

        {/* Archival location */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Archival location</div>
          <input value={draft.archivalLocation || ''} onChange={e => set('archivalLocation', e.target.value)}
            placeholder="Repository, collection, call number…"
            style={{ width: '100%', padding: '5px 8px', fontSize: 11, borderRadius: 2, fontStyle: 'italic' }} />
        </div>

        {/* Transcription / Description */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            {draft.mediaType === 'visual' || draft.mediaType === 'object' ? 'Description' : 'Transcription / Key passages'}
          </div>
          <SimpleEditor
            value={draft.transcription || ''}
            onChange={val => set('transcription', val)}
            placeholder={draft.mediaType === 'visual' ? 'Describe what is shown. What is the studium? What is the punctum?' : 'Transcribe key passages. Note what is legible and what is not…'} />
        </div>

        {/* Significance */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Significance notes</div>
          <SimpleEditor
            value={draft.significance || ''}
            onChange={val => set('significance', val)}
            placeholder="Why does this source matter? What does it establish? What does it conceal? Read against the grain…" />
        </div>

        {/* Tags */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Tags</div>
          <input value={(draft.tags || []).join(', ')} onChange={e => set('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="Tags, comma separated…"
            style={{ width: '100%', padding: '5px 8px', fontSize: 11, borderRadius: 2, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }} />
        </div>

        {/* Linked Topics */}
        {topics.length > 0 && (
          <div>
            <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Linked Topics</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
              {(draft.topicIds || []).map(id => {
                const t = topics.find(t => t.id === id);
                if (!t) return null;
                return (
                  <span key={id} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--paper-3)', borderRadius: 2, color: 'var(--ink-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {t.title}
                    <button onClick={() => set('topicIds', (draft.topicIds || []).filter(r => r !== id))} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
                  </span>
                );
              })}
            </div>
            <select onChange={e => { if (e.target.value) set('topicIds', [...new Set([...(draft.topicIds || []), e.target.value])]); e.target.value = ''; }}
              style={{ fontSize: 11, padding: '4px 8px', borderRadius: 2, background: 'transparent', fontStyle: 'italic' }}>
              <option value="">Link to topic…</option>
              {topics.filter(t => !(draft.topicIds || []).includes(t.id)).map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Linked Books */}
        <div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Source Books</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
            {(draft.bookIds || []).map(id => {
              const b = books.find(b => b.id === id);
              if (!b) return null;
              return (
                <span key={id} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--paper-3)', borderRadius: 2, color: 'var(--ink-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 5, borderLeft: `2px solid ${b.color}` }}>
                  {b.title}
                  <button onClick={() => set('bookIds', (draft.bookIds || []).filter(r => r !== id))} style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕</button>
                </span>
              );
            })}
          </div>
          <BookSelect books={books} value="" onChange={id => { if (id) set('bookIds', [...new Set([...(draft.bookIds || []), id])]); }} placeholder="Link source book…" defaultFilter="all" />
        </div>

        {/* Vault footer */}
        <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', opacity: 0.4, borderTop: '1px dashed var(--paper-3)', paddingTop: 10, letterSpacing: '0.1em' }}>
          VAULT · {mt.label.toUpperCase()} · {(draft.tags || []).length} TAGS · {(draft.topicIds || []).length} TOPIC LINKS · {draft.updatedAt ? new Date(draft.updatedAt).toLocaleDateString('en-GB') : '—'}
        </div>
      </div>
    </div>
  );
}

// ── Main Vault view ───────────────────────────────────────────────
export default function VaultView({ entries = [], onUpdate, topics = [], investigations = [], books = [] }) {
  const [selectedId, setSelectedId] = useState(null);
  const [pendingEntry, setPendingEntry] = useState(null);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('all');

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const handleCreate = (mediaType = 'text') => {
    const entry = {
      id: uuidv4(),
      mediaType,
      title: '',
      date: '',
      provenance: '',
      archivalLocation: '',
      transcription: '',
      description: '',
      significance: '',
      tags: [],
      topicIds: [],
      investigationIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdate(prev => [entry, ...prev]);
    setSelectedId(entry.id);
    setPendingEntry(entry);
  };

  const handleSave = (updated) => {
    onUpdate(prev => prev.map(e => e.id === updated.id ? updated : e));
    setPendingEntry(null);
  };

  const handleDelete = (id) => {
    onUpdate(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) { setSelectedId(null); setPendingEntry(null); }
  };

  const filtered = useMemo(() => {
    let pool = entries;
    if (filterType !== 'all') pool = pool.filter(e => e.mediaType === filterType);
    if (search) pool = pool.filter(e =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.provenance?.toLowerCase().includes(search.toLowerCase()) ||
      (e.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    );
    return [...pool].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [entries, filterType, search]);

  const selectedEntry = entries.find(e => e.id === selectedId) || (pendingEntry?.id === selectedId ? pendingEntry : null);

  const counts = useMemo(() => {
    const c = {};
    Object.keys(MEDIA_TYPES).forEach(k => { c[k] = entries.filter(e => e.mediaType === k).length; });
    return c;
  }, [entries]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>

      {/* ── LEFT: Source list ───────────────────────────────── */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--paper-3)', display: 'flex', flexDirection: 'column', background: 'var(--paper-2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 42, color: 'var(--accent-2)', opacity: 0.06, fontFamily: 'var(--font-display)', pointerEvents: 'none', userSelect: 'none' }}>⊛</div>
          <div style={{ fontSize: 8, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Cold Storage</div>
          <div style={{ fontSize: 16, fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 2 }}>The Vault</div>
          <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.06em' }}>
            {entries.length} primary source{entries.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Media type filters */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            <button onClick={() => setFilterType('all')}
              style={{ fontSize: 8, padding: '2px 7px', borderRadius: 2, border: `1px solid ${filterType === 'all' ? 'var(--accent-2)' : 'var(--paper-3)'}`, background: filterType === 'all' ? 'var(--nav-active-bg)' : 'transparent', color: filterType === 'all' ? 'var(--accent)' : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
              All · {entries.length}
            </button>
            {Object.entries(MEDIA_TYPES).map(([k, v]) => counts[k] > 0 && (
              <button key={k} onClick={() => setFilterType(k)}
                style={{ fontSize: 8, padding: '2px 7px', borderRadius: 2, border: `1px solid ${filterType === k ? v.color : 'var(--paper-3)'}`, background: filterType === k ? v.color + '18' : 'transparent', color: filterType === k ? v.color : 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                {v.icon} {v.label} · {counts[k]}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vault…"
            style={{ width: '100%', padding: '4px 8px', fontSize: 11, borderRadius: 2, fontStyle: 'italic' }} />
        </div>

        {/* Add buttons */}
        <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--paper-3)', display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
          {Object.entries(MEDIA_TYPES).map(([k, v]) => (
            <button key={k} onClick={() => handleCreate(k)}
              title={v.desc}
              style={{ flex: '1 0 auto', fontSize: 8, padding: '4px 2px', borderRadius: 2, border: `1px solid ${v.color}44`, color: v.color, background: v.color + '0d', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', minWidth: 40 }}
              onMouseEnter={e => e.currentTarget.style.background = v.color + '22'}
              onMouseLeave={e => e.currentTarget.style.background = v.color + '0d'}>
              {v.icon}
            </button>
          ))}
          <button onClick={() => handleCreate()}
            style={{ fontSize: 8, padding: '4px 8px', borderRadius: 2, background: 'var(--ink)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.05em' }}>
            + File
          </button>
        </div>

        {/* Source list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, opacity: 0.08, marginBottom: 8, fontFamily: 'var(--font-display)' }}>◌</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.7 }}>
                {search ? 'No sources match.' : 'The Vault is empty.\nFile your first primary source.'}
              </div>
            </div>
          ) : filtered.map(entry => (
            <SourceCard key={entry.id} entry={entry} isSelected={selectedId === entry.id} onClick={e => setSelectedId(e.id)} />
          ))}
        </div>
      </div>

      {/* ── RIGHT: Source editor or empty ───────────────────── */}
      {selectedEntry ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <SourceEditor
            key={selectedEntry.id}
            entry={selectedEntry}
            allEntries={entries}
            topics={topics}
            books={books}
            investigations={investigations}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => setSelectedId(null)} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: isDark ? '#1a1814' : '#faf6ee', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.2em', opacity: 0.1, textTransform: 'uppercase', pointerEvents: 'none', userSelect: 'none' }}>
            {WATERMARK}
          </div>
          <div style={{ fontSize: 40, opacity: 0.07, fontFamily: 'var(--font-display)' }}>⊛</div>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 8 }}>The Vault</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', lineHeight: 1.8, marginBottom: 16 }}>
              Primary sources, evidence, primary material.<br />
              Text · Document · Visual · Oral · Object
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(MEDIA_TYPES).map(([k, v]) => (
                <button key={k} onClick={() => handleCreate(k)}
                  title={v.desc}
                  style={{ fontSize: 11, padding: '7px 14px', borderRadius: 2, border: `1px solid ${v.color}44`, color: v.color, background: v.color + '0d', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal', letterSpacing: '0.04em' }}
                  onMouseEnter={e => e.currentTarget.style.background = v.color + '22'}
                  onMouseLeave={e => e.currentTarget.style.background = v.color + '0d'}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
