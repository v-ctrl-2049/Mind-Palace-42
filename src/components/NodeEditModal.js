import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import BookPicker from './BookPicker';

const FL = { fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6, fontStyle: 'normal' };

function migrateBookNotes(node) {
  if (node.bookNotes?.length) return node.bookNotes.map(bn => ({ id: bn.id || uuidv4(), bookId: bn.bookId, quote: bn.quote || '', note: bn.note || '' }));
  return (node.bookIds || []).map(bid => ({ id: uuidv4(), bookId: bid, quote: '', note: '' }));
}

export default function NodeEditModal({ node, books, nodeTypes, onSave, onDelete, onClose, isNew, onManageTypes }) {
  const [draft, setDraft] = useState({
    ...node,
    bookIds:   node.bookIds || (node.bookId ? [node.bookId] : []),
    bookNotes: migrateBookNotes(node),
    year:      node.year || '',
  });

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const toggleBook = (id) => {
    const already = draft.bookIds.includes(id);
    const newBookIds   = already ? draft.bookIds.filter(b => b !== id) : [...draft.bookIds, id];
    const newBookNotes = already
      ? draft.bookNotes.filter(bn => bn.bookId !== id)
      : [...draft.bookNotes, { id: uuidv4(), bookId: id, quote: '', note: '' }];
    setDraft(d => ({ ...d, bookIds: newBookIds, bookNotes: newBookNotes }));
  };

  const addNote    = (bookId) => setDraft(d => ({ ...d, bookNotes: [...d.bookNotes, { id: uuidv4(), bookId, quote: '', note: '' }] }));
  const updateNote = (noteId, field, value) => setDraft(d => ({ ...d, bookNotes: d.bookNotes.map(bn => bn.id === noteId ? { ...bn, [field]: value } : bn) }));
  const removeNote = (noteId) => {
    const bn = draft.bookNotes.find(n => n.id === noteId);
    const remaining = draft.bookNotes.filter(n => n.id !== noteId);
    const stillHas = remaining.some(n => n.bookId === bn?.bookId);
    setDraft(d => ({ ...d, bookNotes: remaining, bookIds: stillHas ? d.bookIds : d.bookIds.filter(b => b !== bn?.bookId) }));
  };

  const handleSubmit = (e) => { e.preventDefault(); if (!draft.label.trim()) return; onSave(draft); onClose(); };

  const selectedBooks = books.filter(b => draft.bookIds.includes(b.id));

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{isNew ? 'Add node' : 'Edit node'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && <button onClick={() => { if (window.confirm('Delete this node and its connections?')) { onDelete(node.id); onClose(); }}} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)', cursor: 'pointer', background: 'transparent' }}>Delete</button>}
            <button onClick={onClose} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Node type */}
          <div>
            <div style={{ ...FL, display: 'flex', alignItems: 'center', gap: 8 }}>
              Node type
              <button type="button" onClick={onManageTypes} style={{ fontSize: 10, color: 'var(--ink-4)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>manage</button>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {nodeTypes.map(t => (
                <button key={t.id} type="button" onClick={() => set('type', t.id)}
                  style={{ fontSize: 11, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${draft.type === t.id ? t.color : 'var(--paper-3)'}`, background: draft.type === t.id ? t.bg + '55' : 'transparent', color: draft.type === t.id ? t.color : 'var(--ink-3)', fontWeight: draft.type === t.id ? 500 : 400 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <div style={FL}>Label *</div>
            <input autoFocus required value={draft.label} onChange={e => set('label', e.target.value)}
              placeholder="Concept, thinker, or idea name"
              style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)' }} />
          </div>

          {/* Year */}
          <div>
            <div style={FL}>Year / date</div>
            <input value={draft.year || ''} onChange={e => set('year', e.target.value)}
              placeholder='e.g. 1781, 380 BCE — when this idea was developed'
              style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)' }} />
          </div>

          {/* Note */}
          <div>
            <div style={FL}>Note</div>
            <textarea value={draft.note || ''} onChange={e => set('note', e.target.value)}
              placeholder="What does this node mean? Your interpretation?"
              rows={3} style={{ width: '100%', padding: '7px 10px', fontSize: 13, borderRadius: 6, resize: 'vertical', border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)', fontFamily: 'var(--font-serif)' }} />
          </div>

          {/* Book picker */}
          <div>
            <div style={FL}>Linked books</div>
            <BookPicker books={books} selected={draft.bookIds} onToggle={toggleBook} />
          </div>

          {/* Per-book quotes */}
          {selectedBooks.length > 0 && (
            <div>
              <div style={FL}>Quotes & notes per book</div>
              {selectedBooks.map(book => {
                const bookNotes = draft.bookNotes.filter(n => n.bookId === book.id);
                return (
                  <div key={book.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, paddingBottom: 5, borderBottom: `1px solid ${book.color}33` }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: book.color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: book.color, fontStyle: 'italic', flex: 1 }}>{book.title}</span>
                      <button type="button" onClick={() => addNote(book.id)}
                        style={{ fontSize: 10, color: book.color, background: 'none', border: `1px solid ${book.color}55`, borderRadius: 4, padding: '1px 8px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                        + note
                      </button>
                    </div>
                    {bookNotes.map((bn, idx) => (
                      <div key={bn.id} style={{ background: 'var(--paper-2)', border: `1px solid ${book.color}22`, borderRadius: 6, padding: '8px 10px', marginBottom: 6, position: 'relative' }}>
                        {bookNotes.length > 1 && (
                          <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>note {idx + 1}</div>
                        )}
                        <textarea value={bn.quote} onChange={e => updateNote(bn.id, 'quote', e.target.value)}
                          placeholder="Quote…" rows={2}
                          style={{ width: '100%', resize: 'vertical', padding: '5px 7px', fontSize: 12, borderRadius: 5, fontStyle: 'italic', color: 'var(--ink-2)', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', fontFamily: 'var(--font-serif)', marginBottom: 5 }} />
                        <textarea value={bn.note} onChange={e => updateNote(bn.id, 'note', e.target.value)}
                          placeholder="Your note on this concept in this book…" rows={2}
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
        </form>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={handleSubmit} style={{ fontSize: 13, padding: '8px 24px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>
            {isNew ? 'Add node' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
