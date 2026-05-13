import React, { useState } from 'react';
import { STATUSES, COVER_STYLES, ACCENT_COLORS } from '../data/library';

const RATINGS = [1, 2, 3, 4, 5];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {RATINGS.map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(value === n ? null : n)}
          style={{
            fontSize: 20, background: 'none', border: 'none', cursor: 'pointer',
            color: n <= (hover || value || 0) ? '#b07d28' : 'var(--paper-3)',
            transition: 'color 0.1s', lineHeight: 1,
          }}
        >★</button>
      ))}
      {value && <span style={{ fontSize: 11, color: 'var(--ink-3)', alignSelf: 'center', marginLeft: 4 }}>{value}/5</span>}
    </div>
  );
}

const Field = ({ label, children, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase', fontStyle: 'normal' }}>
      {label}
    </label>
    {children}
    {hint && <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic' }}>{hint}</div>}
  </div>
);

const Input = (props) => (
  <input {...props} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, width: '100%', ...props.style }} />
);

const Textarea = (props) => (
  <textarea {...props} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, width: '100%', resize: 'vertical', ...props.style }} />
);

export default function BookEditModal({ book, groups = [], genres = [], methodologies = [], onSave, onDelete, onClose, isNew, onManageGenres, onManageMethodologies }) {
  const [draft, setDraft] = useState({ ...book });

  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  const handleStatusChange = (statusId) => {
    const now = new Date().toISOString();
    let updates = { status: statusId };
    if (statusId === 'reading' && !draft.startedAt) updates.startedAt = now;
    if (statusId === 'finished') updates.finishedAt = now;
    if (statusId === 'dnf') updates.dnfAt = now;
    setDraft(d => ({ ...d, ...updates }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onSave(draft);
    onClose();
  };

  const currentStatus = STATUSES.find(s => s.id === draft.status);
  const isWant = ['want-next', 'want-someday', 'want-meh'].includes(draft.status);
  const isReading = draft.status === 'reading';
  const isFinished = draft.status === 'finished';
  const isDnf = draft.status === 'dnf';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--paper-card)', borderRadius: 14, width: '100%', maxWidth: 680, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>

        {/* Modal header */}
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{isNew ? 'Add a book' : 'Edit book'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && (
              <button
                type="button"
                onClick={() => { if (window.confirm('Remove this book from your library?')) { onDelete(book.id); onClose(); }}}
                style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #faeae8', color: '#c0392b' }}
              >
                Remove
              </button>
            )}
            <button type="button" onClick={onClose} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)' }}>
              Cancel
            </button>
          </div>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── BOOK INFO ── */}
          <section>
            <SectionTitle>Book information</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Title *">
                  <Input autoFocus required value={draft.title} onChange={e => set('title', e.target.value)} placeholder="Title" />
                </Field>
              </div>
              <Field label="Author"><Input value={draft.author} onChange={e => set('author', e.target.value)} placeholder="Author" /></Field>
              <Field label="Year"><Input type="number" value={draft.year || ''} onChange={e => set('year', parseInt(e.target.value) || null)} placeholder="e.g. 1997 or -380 for BCE" /></Field>
              <Field label="Publisher"><Input value={draft.publisher || ''} onChange={e => set('publisher', e.target.value)} placeholder="Publisher" /></Field>
              <Field label="Pages"><Input type="number" value={draft.pages || ''} onChange={e => set('pages', parseInt(e.target.value) || null)} placeholder="Total pages" /></Field>
              <Field label={<span style={{display:'flex',alignItems:'center',gap:8}}>Genre <button type="button" onClick={onManageGenres} style={{fontSize:10,color:'var(--ink-4)',textDecoration:'underline',cursor:'pointer',background:'none',border:'none',fontFamily:'var(--font-mono)',fontStyle:'normal'}}>manage</button></span>}>
                <select value={draft.genre || ''} onChange={e => set('genre', e.target.value)} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)' }}>
                  <option value="">Select genre…</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>

              <Field label="Source type">
                <select value={draft.sourceType || ''} onChange={e => set('sourceType', e.target.value)}
                  style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)' }}>
                  <option value="">Not specified</option>
                  <option value="primary">Primary — original, firsthand account</option>
                  <option value="secondary">Secondary — analysis or interpretation</option>
                  <option value="tertiary">Tertiary — compiles secondaries (encyclopaedia etc.)</option>
                </select>
              </Field>

              <Field label={<span style={{display:'flex',alignItems:'center',gap:8}}>Methodology <button type="button" onClick={onManageMethodologies} style={{fontSize:10,color:'var(--ink-4)',textDecoration:'underline',cursor:'pointer',background:'none',border:'none',fontFamily:'var(--font-mono)',fontStyle:'normal'}}>manage</button></span>}>
                <select value={draft.methodology || ''} onChange={e => set('methodology', e.target.value)}
                  style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)' }}>
                  <option value="">Not specified</option>
                  {methodologies.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              
              <Field label="Group">
                <select value={draft.groupId || ''} onChange={e => set('groupId', e.target.value)}
                  style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)' }}>
                  <option value="">No group</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </Field>
              <Field label="ISBN"><Input value={draft.isbn || ''} onChange={e => set('isbn', e.target.value)} placeholder="ISBN" /></Field>
              <Field label="Language"><Input value={draft.language || ''} onChange={e => set('language', e.target.value)} placeholder="e.g. English" /></Field>
              <Field label="Original language"><Input value={draft.originalLanguage || ''} onChange={e => set('originalLanguage', e.target.value)} placeholder="If translated" /></Field>
              <Field label="Translator"><Input value={draft.translator || ''} onChange={e => set('translator', e.target.value)} placeholder="If translated" /></Field>
            </div>
            <div style={{ marginTop: 12 }}>
              <Field label="Personal notes">
                <Textarea value={draft.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Why I picked it up, context, notes to self…" rows={3} />
              </Field>
            </div>
          </section>

          {/* ── STATUS ── */}
          <section>
            <SectionTitle>Reading status</SectionTitle>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStatusChange(s.id)}
                  style={{
                    fontSize: 12, padding: '6px 14px', borderRadius: 20,
                    border: `1px solid ${draft.status === s.id ? s.color : 'var(--paper-3)'}`,
                    background: draft.status === s.id ? s.bg : 'transparent',
                    color: draft.status === s.id ? s.color : 'var(--ink-3)',
                    fontWeight: draft.status === s.id ? 500 : 400,
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >{s.label}</button>
              ))}
            </div>

            {/* Want-to-read reason */}
            {isWant && (
              <Field label="Why do you want to read this?" hint="What sparked the interest? A recommendation, a reference from another book, a topic you're exploring?">
                <Textarea value={draft.wantToReadReason || ''} onChange={e => set('wantToReadReason', e.target.value)} placeholder="What made you add this to your list…" rows={2} />
              </Field>
            )}

            {/* Progress */}
            {isReading && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Current page">
                  <Input type="number" value={draft.progress || ''} onChange={e => set('progress', parseInt(e.target.value) || 0)} placeholder="Page number" />
                </Field>
                <Field label="Started">
                  <Input type="date" value={draft.startedAt ? draft.startedAt.slice(0, 10) : ''} onChange={e => set('startedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
                </Field>
                {draft.pages && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 6, background: 'var(--paper-3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, Math.round((draft.progress / draft.pages) * 100))}%`, background: 'var(--green)', borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                      {Math.round((draft.progress / draft.pages) * 100)}% · {draft.pages - draft.progress} pages left
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Finished */}
            {isFinished && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Started">
                    <Input type="date" value={draft.startedAt ? draft.startedAt.slice(0, 10) : ''} onChange={e => set('startedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
                  </Field>
                  <Field label="Finished">
                    <Input type="date" value={draft.finishedAt ? draft.finishedAt.slice(0, 10) : ''} onChange={e => set('finishedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
                  </Field>
                </div>
                <Field label="Rating">
                  <StarRating value={draft.rating} onChange={val => set('rating', val)} />
                </Field>
                <Field label="One-line review">
                  <Input value={draft.review || ''} onChange={e => set('review', e.target.value)} placeholder="What would you tell a friend about this book?" />
                </Field>
              </div>
            )}

            {/* DNF */}
            {isDnf && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Stopped on page">
                  <Input type="number" value={draft.progress || ''} onChange={e => set('progress', parseInt(e.target.value) || 0)} />
                </Field>
                <Field label="Date">
                  <Input type="date" value={draft.dnfAt ? draft.dnfAt.slice(0, 10) : ''} onChange={e => set('dnfAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Why did you stop?" hint="No judgement — sometimes it's just not the right time.">
                    <Textarea value={draft.dnfReason || ''} onChange={e => set('dnfReason', e.target.value)} placeholder="What made you put it down?" rows={2} />
                  </Field>
                </div>
              </div>
            )}
          </section>

          {/* ── APPEARANCE ── */}
          <section>
            <SectionTitle>Appearance</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Cover style">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {COVER_STYLES.map(cs => (
                    <button
                      key={cs.id}
                      type="button"
                      onClick={() => set('coverStyle', cs.id)}
                      style={{
                        fontSize: 11, padding: '5px 12px', borderRadius: 6,
                        border: `1px solid ${draft.coverStyle === cs.id ? 'var(--ink)' : 'var(--paper-3)'}`,
                        background: draft.coverStyle === cs.id ? 'var(--ink)' : 'transparent',
                        color: draft.coverStyle === cs.id ? '#fff' : 'var(--ink-3)',
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}
                    >{cs.label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Accent colour">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('color', c)}
                      style={{
                        width: 22, height: 22, borderRadius: '50%', background: c, border: 'none',
                        cursor: 'pointer',
                        outline: draft.color === c ? '2px solid var(--ink)' : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </Field>
            </div>
          </section>

        </form>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button
            type="submit"
            onClick={handleSubmit}
            style={{ fontSize: 13, padding: '8px 24px', borderRadius: 7, background: 'var(--accent)', color: '#fff', border: 'none' }}
          >
            {isNew ? 'Add to library' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'var(--font-mono)', fontStyle: 'normal', paddingBottom: 8, borderBottom: '1px solid var(--paper-3)' }}>
      {children}
    </div>
  );
}
