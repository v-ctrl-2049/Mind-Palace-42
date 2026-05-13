import React, { useState } from 'react';
// invTypes passed as prop

const FL = { fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5, fontStyle: 'normal', display: 'block' };
const Input = (props) => <input {...props} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, width: '100%', border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)', ...props.style }} />;
const Textarea = (props) => <textarea {...props} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, width: '100%', resize: 'vertical', border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)', fontFamily: 'var(--font-serif)', ...props.style }} />;

export default function InvestigationEditModal({ inv, books, invTypes = [], onSave, onDelete, onClose, isNew }) {
  const [draft, setDraft] = useState({
    ...inv,
    actors: inv.actors || [],
    causes: inv.causes || [],
    tags: inv.tags || [],
    bookIds: inv.bookIds || [],
    bookNotes: inv.bookNotes || [],
  });
  const [actorInput, setActorInput] = useState('');
  const [causeInput, setCauseInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const addItem = (field, val, setVal) => {
    if (!val.trim()) return;
    set(field, [...draft[field], val.trim()]);
    setVal('');
  };
  const removeItem = (field, idx) => set(field, draft[field].filter((_, i) => i !== idx));

  const toggleBook = (id) => {
    const sel = draft.bookIds.includes(id);
    const newBookIds = sel ? draft.bookIds.filter(b => b !== id) : [...draft.bookIds, id];
    const newBookNotes = sel
      ? draft.bookNotes.filter(bn => bn.bookId !== id)
      : [...draft.bookNotes, { bookId: id, quote: '', note: '' }];
    setDraft(d => ({ ...d, bookIds: newBookIds, bookNotes: newBookNotes }));
  };

  const updateBookNote = (bookId, field, val) =>
    setDraft(d => ({ ...d, bookNotes: d.bookNotes.map(bn => bn.bookId === bookId ? { ...bn, [field]: val } : bn) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onSave({ ...draft, updatedAt: new Date().toISOString() });
    onClose();
  };

  const selectedBooks = books.filter(b => draft.bookIds.includes(b.id));

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)' }}>

        {/* Header */}
        <div style={{ padding: '15px 22px 11px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{isNew ? 'New investigation' : 'Edit investigation'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && <button onClick={() => { if (window.confirm('Delete this investigation?')) { onDelete(inv.id); onClose(); }}} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)', cursor: 'pointer' }}>Delete</button>}
            <button onClick={onClose} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Title */}
          <div><label style={FL}>Case title *</label>
            <Input autoFocus required value={draft.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Collapse of the Roman Republic" />
          </div>

          {/* Type + Status + Date range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={FL}>Type</label>
              <select value={draft.type || ''} onChange={e => set('type', e.target.value)}
                style={{ width: '100%', padding: '7px 28px 7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                {invTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={FL}>Status</label>
              <select value={draft.status || 'active'} onChange={e => set('status', e.target.value)}
                style={{ width: '100%', padding: '7px 28px 7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                <option value="active">Active</option>
                <option value="cold">Cold</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div><label style={FL}>Date / period</label>
              <Input value={draft.dateRange || ''} onChange={e => set('dateRange', e.target.value)} placeholder="e.g. 133–27 BCE" />
            </div>
          </div>

          {/* Summary */}
          <div><label style={FL}>Opening question / summary</label>
            <Textarea value={draft.summary || ''} onChange={e => set('summary', e.target.value)} placeholder="What is this case about? What question are you investigating?" rows={2} />
          </div>

          {/* Key actors */}
          <div>
            <label style={FL}>Key actors</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
              {draft.actors.map((a, i) => (
                <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--paper-3)', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {a}
                  <button type="button" onClick={() => removeItem('actors', i)} style={{ fontSize: 9, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)' }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Input value={actorInput} onChange={e => setActorInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('actors', actorInput, setActorInput))}
                placeholder="Person, group or institution… (Enter to add)" />
              <button type="button" onClick={() => addItem('actors', actorInput, setActorInput)}
                style={{ fontSize: 12, padding: '7px 14px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Add</button>
            </div>
          </div>

          {/* Causes */}
          <div>
            <label style={FL}>Causes / contributing factors</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
              {draft.causes.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)' }}>
                  <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>·</span>
                  <span style={{ flex: 1 }}>{c}</span>
                  <button type="button" onClick={() => removeItem('causes', i)} style={{ fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Input value={causeInput} onChange={e => setCauseInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('causes', causeInput, setCauseInput))}
                placeholder="A cause or contributing factor… (Enter to add)" />
              <button type="button" onClick={() => addItem('causes', causeInput, setCauseInput)}
                style={{ fontSize: 12, padding: '7px 14px', borderRadius: 6, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Add</button>
            </div>
          </div>

          {/* Books */}
          <div>
            <label style={FL}>Books that discuss this case</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {books.map(b => {
                const sel = draft.bookIds.includes(b.id);
                return (
                  <button key={b.id} type="button" onClick={() => toggleBook(b.id)}
                    style={{ fontSize: 11, padding: '4px 11px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${sel ? b.color : 'var(--paper-3)'}`, background: sel ? b.color + '22' : 'transparent', color: sel ? b.color : 'var(--ink-3)', fontWeight: sel ? 500 : 400 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: sel ? b.color : 'var(--paper-3)' }} />
                    {b.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-book notes */}
          {selectedBooks.length > 0 && (
            <div>
              <label style={FL}>Evidence per book</label>
              {selectedBooks.map(book => {
                const bn = draft.bookNotes.find(n => n.bookId === book.id) || { bookId: book.id, quote: '', note: '' };
                return (
                  <div key={book.id} style={{ background: 'var(--paper-2)', border: `1px solid ${book.color}33`, borderLeft: `3px solid ${book.color}`, borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: book.color }} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: book.color, fontStyle: 'italic' }}>{book.title}</span>
                    </div>
                    <textarea value={bn.quote} onChange={e => updateBookNote(book.id, 'quote', e.target.value)}
                      placeholder="Quote from this book…" rows={2}
                      style={{ width: '100%', resize: 'vertical', padding: '6px 8px', fontSize: 12, borderRadius: 5, fontStyle: 'italic', color: 'var(--ink-2)', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', fontFamily: 'var(--font-serif)', marginBottom: 6 }} />
                    <textarea value={bn.note} onChange={e => updateBookNote(book.id, 'note', e.target.value)}
                      placeholder="How does this author discuss this case?" rows={2}
                      style={{ width: '100%', resize: 'vertical', padding: '6px 8px', fontSize: 12, borderRadius: 5, color: 'var(--ink)', background: 'var(--paper-card)', border: '1px solid var(--paper-3)', fontFamily: 'var(--font-serif)' }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Tags */}
          <div>
            <label style={FL}>Tags (for cross-linking with Timeline)</label>
            <div style={{ border: '1px solid var(--paper-3)', borderRadius: 6, padding: '5px 8px', display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center', background: 'var(--paper-2)' }}>
              {draft.tags.map((tag, i) => (
                <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  #{tag}
                  <button type="button" onClick={() => removeItem('tags', i)} style={{ fontSize: 10, cursor: 'pointer', background: 'none', border: 'none', color: 'var(--accent)', padding: 0 }}>✕</button>
                </span>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addItem('tags', tagInput.replace(',', '').toLowerCase(), setTagInput))}
                placeholder={draft.tags.length ? '' : 'e.g. rome, collapse… (Enter to add)'}
                style={{ border: 'none', outline: 'none', fontSize: 12, background: 'transparent', minWidth: 100, color: 'var(--ink)', fontFamily: 'var(--font-serif)' }} />
            </div>
          </div>

        </form>

        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={handleSubmit} style={{ fontSize: 13, padding: '8px 24px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>
            {isNew ? 'Open case' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
