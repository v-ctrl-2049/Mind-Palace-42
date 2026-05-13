import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { parseEventDate } from '../data/timeline';
import BookPicker from './BookPicker';

const FL = { fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5, fontStyle: 'normal', display: 'block' };
const Input = (props) => <input {...props} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, width: '100%', border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)', ...props.style }} />;

// Migrate old single-note-per-book to multi-note array
function migrateBookNotes(event) {
  if (!event.bookNotes?.length) {
    const ids = event.bookIds || (event.bookId ? [event.bookId] : []);
    if (ids.length && (event.quote || event.note)) {
      return [{ id: uuidv4(), bookId: ids[0], quote: event.quote || '', note: event.note || '' }];
    }
    return ids.map(bid => ({ id: uuidv4(), bookId: bid, quote: '', note: '' }));
  }
  // Ensure each entry has an id
  return event.bookNotes.map(bn => ({ id: bn.id || uuidv4(), bookId: bn.bookId, quote: bn.quote || '', note: bn.note || '' }));
}

export default function EventEditModal({ event, books, articles = [], eventTypes, regions, onSave, onDelete, onClose, isNew, onManageTypes }) {
  const [draft, setDraft] = useState({
    ...event,
    bookIds:   event.bookIds || (event.bookId ? [event.bookId] : []),
    bookNotes: migrateBookNotes(event),
    tags:      event.tags || [],
  });
  const [tagInput,     setTagInput]     = useState('');
  const [datePreview,  setDatePreview]  = useState(() => parseEventDate(event.dateRaw).display);

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  // Toggle a book — adds first blank note, removes all notes on deselect
  const toggleBook = (id) => {
    const already = draft.bookIds.includes(id);
    const newBookIds   = already ? draft.bookIds.filter(b => b !== id) : [...draft.bookIds, id];
    const newBookNotes = already
      ? draft.bookNotes.filter(bn => bn.bookId !== id)
      : [...draft.bookNotes, { id: uuidv4(), bookId: id, quote: '', note: '' }];
    setDraft(d => ({ ...d, bookIds: newBookIds, bookNotes: newBookNotes }));
  };

  // Add another note entry for a book
  const addNote = (bookId) =>
    setDraft(d => ({ ...d, bookNotes: [...d.bookNotes, { id: uuidv4(), bookId, quote: '', note: '' }] }));

  // Update a specific note entry by id
  const updateNote = (noteId, field, value) =>
    setDraft(d => ({ ...d, bookNotes: d.bookNotes.map(bn => bn.id === noteId ? { ...bn, [field]: value } : bn) }));

  // Remove a specific note entry — if last one, also remove book
  const removeNote = (noteId) => {
    const bn = draft.bookNotes.find(n => n.id === noteId);
    const remaining = draft.bookNotes.filter(n => n.id !== noteId);
    const stillHasBook = remaining.some(n => n.bookId === bn?.bookId);
    setDraft(d => ({
      ...d,
      bookNotes: remaining,
      bookIds: stillHasBook ? d.bookIds : d.bookIds.filter(b => b !== bn?.bookId),
    }));
  };

  const handleDateChange = (v) => { set('dateRaw', v); setDatePreview(parseEventDate(v).display); };
  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (!draft.tags.includes(tag)) set('tags', [...draft.tags, tag]);
      setTagInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onSave({ ...draft, quote: undefined, note: undefined });
    onClose();
  };

  const selectedBooks = [...books, ...articles].filter(b => draft.bookIds.includes(b.id));

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 14, width: '100%', maxWidth: 620, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px 11px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{isNew ? 'New event' : 'Edit event'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && <button type="button" onClick={() => { if (window.confirm('Delete this event?')) { onDelete(event.id); onClose(); }}} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)', cursor: 'pointer', background: 'transparent' }}>Delete</button>}
            <button onClick={onClose} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Title */}
          <div><label style={FL}>Event title *</label>
            <Input autoFocus required value={draft.title || ''} onChange={e => set('title', e.target.value)} placeholder="e.g. Battle of Marathon" />
          </div>

          {/* Date + preview */}
          <div>
            <label style={FL}>Date / period</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Input value={draft.dateRaw || ''} onChange={e => handleDateChange(e.target.value)} placeholder="e.g. 490 BCE, 1789, March 1917" style={{ flex: 1 }} />
              {datePreview && <span style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>{datePreview}</span>}
            </div>
          </div>

          {/* Type + Region */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ ...FL, display: 'flex', alignItems: 'center', gap: 6 }}>
                Event type
                <button type="button" onClick={onManageTypes} style={{ fontSize: 10, color: 'var(--ink-4)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontWeight: 400, textTransform: 'none' }}>manage</button>
              </label>
              <select value={draft.type || ''} onChange={e => set('type', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                <option value="">No type</option>
                {eventTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={FL}>Region</label>
              <select value={draft.region || ''} onChange={e => set('region', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                <option value="">No region</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {/* Book picker */}
          <div>
            <label style={FL}>Books & papers that discuss this event</label>
            <BookPicker
              books={books} articles={articles}
              selected={draft.bookIds}
              onToggle={toggleBook} />
          </div>

          {/* Per-book multi-quote notes */}
          {selectedBooks.length > 0 && (
            <div>
              <label style={FL}>Quotes & notes per source</label>
              {selectedBooks.map(book => {
                const bookNotes = draft.bookNotes.filter(n => n.bookId === book.id);
                return (
                  <div key={book.id} style={{ marginBottom: 14 }}>
                    {/* Book header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, paddingBottom: 5, borderBottom: `1px solid ${book.color}33` }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: book.color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: book.color, fontStyle: 'italic', flex: 1 }}>{book.title}</span>
                      <button type="button" onClick={() => addNote(book.id)}
                        style={{ fontSize: 10, color: book.color, background: 'none', border: `1px solid ${book.color}55`, borderRadius: 4, padding: '1px 8px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                        + note
                      </button>
                    </div>
                    {/* Individual note entries */}
                    {bookNotes.map((bn, idx) => (
                      <div key={bn.id} style={{ background: 'var(--paper-2)', border: `1px solid ${book.color}22`, borderRadius: 6, padding: '8px 10px', marginBottom: 6, position: 'relative' }}>
                        {bookNotes.length > 1 && (
                          <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                            note {idx + 1}
                          </div>
                        )}
                        <textarea value={bn.quote} onChange={e => updateNote(bn.id, 'quote', e.target.value)}
                          placeholder="Quote from this source…" rows={2}
                          style={{ width: '100%', resize: 'vertical', padding: '5px 7px', fontSize: 12, borderRadius: 5, fontStyle: 'italic', color: 'var(--ink-2)', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', fontFamily: 'var(--font-serif)', marginBottom: 5 }} />
                        <textarea value={bn.note} onChange={e => updateNote(bn.id, 'note', e.target.value)}
                          placeholder="Your note on how this source discusses this event…" rows={2}
                          style={{ width: '100%', resize: 'vertical', padding: '5px 7px', fontSize: 12, borderRadius: 5, color: 'var(--ink)', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', fontFamily: 'var(--font-serif)' }} />
                        {bookNotes.length > 1 && (
                          <button type="button" onClick={() => removeNote(bn.id)}
                            style={{ marginTop: 5, fontSize: 10, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>
                            remove this note
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tags */}
          <div>
            <label style={FL}>Tags</label>
            <div style={{ border: '1px solid var(--paper-3)', borderRadius: 6, padding: '5px 8px', display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center', background: 'var(--paper-2)' }}>
              {draft.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  #{tag}
                  <button type="button" onClick={() => set('tags', draft.tags.filter(t => t !== tag))} style={{ fontSize: 10, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--accent)', padding: 0 }}>✕</button>
                </span>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                placeholder={draft.tags.length ? '' : 'e.g. trade, empire… (Enter to add)'}
                style={{ border: 'none', outline: 'none', fontSize: 12, background: 'transparent', minWidth: 100, color: 'var(--ink)', fontFamily: 'var(--font-serif)' }} />
            </div>
          </div>

          {/* Synthesis */}
          <div>
            <label style={FL}>Synthesis / your analysis</label>
            <textarea value={draft.synthesis || ''} onChange={e => set('synthesis', e.target.value)}
              placeholder="Your own synthesis across sources…" rows={3}
              style={{ width: '100%', resize: 'vertical', padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)', fontFamily: 'var(--font-serif)' }} />
          </div>

        </form>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={handleSubmit} style={{ fontSize: 13, padding: '8px 24px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>
            {isNew ? 'Add event' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
