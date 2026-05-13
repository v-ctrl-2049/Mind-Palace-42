import React, { useState } from 'react';
import { STATUSES, COVER_STYLES, ACCENT_COLORS } from '../data/library';

const FL = { fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5, fontStyle: 'normal', display: 'block' };
const Input = (props) => <input {...props} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, width: '100%', border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)', ...props.style }} />;
const Textarea = (props) => <textarea {...props} style={{ padding: '7px 10px', fontSize: 13, borderRadius: 6, width: '100%', resize: 'vertical', border: '1px solid var(--paper-3)', background: 'var(--paper-2)', color: 'var(--ink)', fontFamily: 'var(--font-serif)', ...props.style }} />;

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12, fontFamily: 'var(--font-mono)', fontStyle: 'normal', paddingBottom: 8, borderBottom: '1px solid var(--paper-3)', marginTop: 4 }}>{children}</div>;
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(value === n ? null : n)}
          style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: n <= (hover || value || 0) ? '#b07d28' : 'var(--paper-3)', lineHeight: 1 }}>★</button>
      ))}
      {value && <span style={{ fontSize: 11, color: 'var(--ink-3)', alignSelf: 'center', marginLeft: 4 }}>{value}/5</span>}
    </div>
  );
}

export default function ArticleEditModal({ article, groups, genres, methodologies = [], books, onSave, onDelete, onClose, isNew, onManageGenres, onManageMethodologies }) {
  const [draft, setDraft] = useState({ ...article });
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const handleStatusChange = (statusId) => {
    const now = new Date().toISOString();
    const updates = { status: statusId };
    if (statusId === 'reading' && !draft.startedAt) updates.startedAt = now;
    if (statusId === 'finished') updates.finishedAt = now;
    if (statusId === 'dnf') updates.dnfAt = now;
    setDraft(d => ({ ...d, ...updates }));
  };

  const toggleLinkedBook = (id) => {
    const current = draft.linkedBookIds || [];
    set('linkedBookIds', current.includes(id) ? current.filter(b => b !== id) : [...current, id]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onSave({ ...draft, type: 'article' });
    onClose();
  };

  const isWant     = ['want-next','want-someday','want-meh'].includes(draft.status);
  const isReading  = draft.status === 'reading';
  const isFinished = draft.status === 'finished';
  const isDnf      = draft.status === 'dnf';
  const pct        = draft.pages ? Math.min(100, Math.round((draft.progress / parseInt(draft.pages)) * 100)) : 0;

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 14, width: '100%', maxWidth: 680, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)' }}>

        {/* Header */}
        <div style={{ padding: '15px 22px 11px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{isNew ? 'Add article / paper' : 'Edit article'}</span>
            <span style={{ fontSize: 10, marginLeft: 8, padding: '2px 8px', borderRadius: 10, background: '#e0f0f8', color: '#1a5c7a', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>PAPERLESS</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isNew && <button onClick={() => { if (window.confirm('Remove this article?')) { onDelete(article.id); onClose(); }}} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--red)', cursor: 'pointer' }}>Remove</button>}
            <button onClick={onClose} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ── Article information ── */}
          <section>
            <SectionTitle>Article information</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FL}>Title *</label>
                <Input autoFocus required value={draft.title} onChange={e => set('title', e.target.value)} placeholder="Article title" />
              </div>
              <div>
                <label style={FL}>Medium</label>
                <select value={draft.medium || ''} onChange={e => set('medium', e.target.value)}
                  style={{ padding: '7px 28px 7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', width: '100%', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                  <option value="">Not specified</option>
                  <option value="academic">Academic paper</option>
                  <option value="web">Web article / blog</option>
                  <option value="news">News article</option>
                  <option value="social">Social media (thread, post)</option>
                  <option value="video">Video / documentary</option>
                  <option value="podcast">Podcast / audio</option>
                  <option value="magazine">Magazine / journal</option>
                  <option value="document">Primary document (letter, speech, data)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={FL}>Author(s)</label>
                <Input value={draft.author || ''} onChange={e => set('author', e.target.value)} placeholder="Author, Author" />
              </div>
              <div>
                <label style={FL}>Year</label>
                <Input type="number" value={draft.year || ''} onChange={e => set('year', parseInt(e.target.value) || null)} placeholder="2024" />
              </div>
              <div>
                <label style={FL}>Publication / outlet</label>
                <Input value={draft.journal || ''} onChange={e => set('journal', e.target.value)} placeholder="Journal, newspaper, website, channel…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={FL}>Volume</label>
                  <Input value={draft.volume || ''} onChange={e => set('volume', e.target.value)} placeholder="Vol." />
                </div>
                <div>
                  <label style={FL}>Issue</label>
                  <Input value={draft.issue || ''} onChange={e => set('issue', e.target.value)} placeholder="No." />
                </div>
                <div>
                  <label style={FL}>Pages</label>
                  <Input value={draft.pages || ''} onChange={e => set('pages', e.target.value)} placeholder="1–20" />
                </div>
              </div>
              <div>
                <label style={FL}>DOI / reference</label>
                <Input value={draft.doi || ''} onChange={e => set('doi', e.target.value)} placeholder="10.xxxx/xxxxx or any reference ID" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FL}>URL</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Input value={draft.url || ''} onChange={e => set('url', e.target.value)} placeholder="https://…" style={{ flex: 1 }} />
                  {draft.url && (
                    <button type="button" onClick={() => window.open(draft.url, '_blank')}
                      style={{ fontSize: 12, padding: '7px 14px', borderRadius: 6, border: '1px solid var(--paper-3)', color: 'var(--accent)', background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      Open ↗
                    </button>
                  )}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FL}>Abstract / summary</label>
                <Textarea value={draft.abstract || ''} onChange={e => set('abstract', e.target.value)} placeholder="Paste or write the abstract or a brief summary…" rows={3} />
              </div>
              <div>
                <label style={{ ...FL, display: 'flex', alignItems: 'center', gap: 8 }}>Genre
                  <button type="button" onClick={onManageGenres} style={{ fontSize: 10, color: 'var(--ink-4)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>manage</button>
                </label>
                <select value={draft.genre || ''} onChange={e => set('genre', e.target.value)}
                  style={{ padding: '7px 28px 7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', width: '100%', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                  <option value="">Select genre…</option>
                  {genres.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={FL}>Source type</label>
                <select value={draft.sourceType || ''} onChange={e => set('sourceType', e.target.value)}
                  style={{ padding: '7px 28px 7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', width: '100%', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                  <option value="">Not specified</option>
                  <option value="primary">Primary — original, firsthand</option>
                  <option value="secondary">Secondary — analysis or interpretation</option>
                  <option value="tertiary">Tertiary — compiles secondaries</option>
                </select>
              </div>
              <div>
                <label style={{ ...FL, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Methodology
                  <button type="button" onClick={onManageMethodologies} style={{ fontSize: 10, color: 'var(--ink-4)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>manage</button>
                </label>
                <select value={draft.methodology || ''} onChange={e => set('methodology', e.target.value)}
                  style={{ padding: '7px 28px 7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', width: '100%', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                  <option value="">Not specified</option>
                  {methodologies.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={FL}>Group</label>
                <select value={draft.groupId || ''} onChange={e => set('groupId', e.target.value)}
                  style={{ padding: '7px 28px 7px 10px', fontSize: 13, borderRadius: 6, border: '1px solid var(--paper-3)', width: '100%', background: 'var(--paper-2)', color: 'var(--ink)' }}>
                  <option value="">No group</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={FL}>Personal notes</label>
                <Textarea value={draft.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Why you're reading it, context, notes to self…" rows={2} />
              </div>
            </div>
          </section>

          {/* ── Status ── */}
          <section>
            <SectionTitle>Reading status</SectionTitle>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {STATUSES.map(s => (
                <button key={s.id} type="button" onClick={() => handleStatusChange(s.id)}
                  style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, border: `1px solid ${draft.status === s.id ? s.color : 'var(--paper-3)'}`, background: draft.status === s.id ? s.bg + '44' : 'transparent', color: draft.status === s.id ? s.color : 'var(--ink-3)', fontWeight: draft.status === s.id ? 500 : 400, cursor: 'pointer' }}>
                  {s.label}
                </button>
              ))}
            </div>

            {isWant && (
              <div>
                <label style={FL}>Why do you want to read this?</label>
                <Textarea value={draft.wantToReadReason || ''} onChange={e => set('wantToReadReason', e.target.value)} placeholder="What sparked the interest?" rows={2} />
              </div>
            )}

            {isReading && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={FL}>Current page</label>
                  <Input type="number" value={draft.progress || ''} onChange={e => set('progress', parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={FL}>Started</label>
                  <Input type="date" value={draft.startedAt ? draft.startedAt.slice(0,10) : ''} onChange={e => set('startedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} />
                </div>
                {draft.pages && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ height: 5, background: 'var(--paper-3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#2e7d5e', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 3, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{pct}%</div>
                  </div>
                )}
              </div>
            )}

            {isFinished && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={FL}>Started</label><Input type="date" value={draft.startedAt ? draft.startedAt.slice(0,10) : ''} onChange={e => set('startedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} /></div>
                  <div><label style={FL}>Finished</label><Input type="date" value={draft.finishedAt ? draft.finishedAt.slice(0,10) : ''} onChange={e => set('finishedAt', e.target.value ? new Date(e.target.value).toISOString() : null)} /></div>
                </div>
                <div><label style={FL}>Rating</label><StarRating value={draft.rating} onChange={v => set('rating', v)} /></div>
                <div><label style={FL}>One-line review</label><Input value={draft.review || ''} onChange={e => set('review', e.target.value)} placeholder="What would you tell a colleague?" /></div>
              </div>
            )}

            {isDnf && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={FL}>Stopped on page</label><Input type="number" value={draft.progress || ''} onChange={e => set('progress', parseInt(e.target.value) || 0)} /></div>
                <div><label style={FL}>Date</label><Input type="date" value={draft.dnfAt ? draft.dnfAt.slice(0,10) : ''} onChange={e => set('dnfAt', e.target.value ? new Date(e.target.value).toISOString() : null)} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label style={FL}>Why did you stop?</label><Textarea value={draft.dnfReason || ''} onChange={e => set('dnfReason', e.target.value)} rows={2} /></div>
              </div>
            )}
          </section>

          {/* ── Links to books ── */}
          <section>
            <SectionTitle>Linked books</SectionTitle>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', marginBottom: 8 }}>Connect this article to books in your library that share topics or are cited.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {books.map(b => {
                const sel = (draft.linkedBookIds || []).includes(b.id);
                return (
                  <button key={b.id} type="button" onClick={() => toggleLinkedBook(b.id)}
                    style={{ fontSize: 11, padding: '4px 11px', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${sel ? b.color : 'var(--paper-3)'}`, background: sel ? b.color + '22' : 'transparent', color: sel ? b.color : 'var(--ink-3)', fontWeight: sel ? 500 : 400 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: sel ? b.color : 'var(--paper-3)' }} />
                    {b.title}
                  </button>
                );
              })}
              {books.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic' }}>No books in library yet.</span>}
            </div>
          </section>

          {/* ── Appearance ── */}
          <section>
            <SectionTitle>Appearance</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={FL}>Cover style</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {COVER_STYLES.map(cs => (
                    <button key={cs.id} type="button" onClick={() => set('coverStyle', cs.id)}
                      style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: `1px solid ${draft.coverStyle === cs.id ? 'var(--ink)' : 'var(--paper-3)'}`, background: draft.coverStyle === cs.id ? 'var(--ink)' : 'transparent', color: draft.coverStyle === cs.id ? 'var(--paper-card)' : 'var(--ink-3)', cursor: 'pointer' }}>
                      {cs.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={FL}>Accent colour</label>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {ACCENT_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => set('color', c)}
                      style={{ width: 20, height: 20, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: draft.color === c ? '2px solid var(--ink)' : 'none', outlineOffset: 2 }} />
                  ))}
                </div>
              </div>
            </div>
          </section>

        </form>

        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={handleSubmit} style={{ fontSize: 13, padding: '8px 24px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>
            {isNew ? 'Add to Sources' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
