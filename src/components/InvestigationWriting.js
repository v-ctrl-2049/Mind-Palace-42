import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SimpleEditor from './SimpleEditor';

// ── Section types ─────────────────────────────────────────────────
const SECTION_TYPES = {
  thesis:      { label: 'Thesis',       color: '#1a5c3a', icon: '⊛', singleton: true },
  background:  { label: 'Background',   color: '#7a6a52', icon: '◎' },
  argument:    { label: 'Argument',     color: '#2c5f8a', icon: '◈' },
  evidence:    { label: 'Evidence',     color: '#2e7d5e', icon: '⊕' },
  objection:   { label: 'Objection',    color: '#c0392b', icon: '⊘' },
  resolution:  { label: 'Resolution',   color: '#b07d28', icon: '↺' },
  conclusion:  { label: 'Conclusion',   color: '#1a5c3a', icon: '⊙' },
  note:        { label: 'Note',         color: '#8a8680', icon: '·' },
};

// Build sections from argument map
function sectionsFromArgMap(argMap) {
  const nodes = argMap?.nodes || [];
  if (!nodes.length) return [];
  const sections = [];

  // Thesis from verdict node(s)
  nodes.filter(n => n.type === 'verdict').forEach(n => {
    sections.push({ id: uuidv4(), type: 'thesis', title: 'Thesis', draft: '', argNodeId: n.id, note: n.text });
  });
  // Background from causes
  nodes.filter(n => n.type === 'cause').forEach(n => {
    sections.push({ id: uuidv4(), type: 'background', title: n.text || 'Background', draft: '', argNodeId: n.id, note: '' });
  });
  // Arguments from mechanisms + claims
  nodes.filter(n => n.type === 'mechanism' || n.type === 'claim').forEach(n => {
    sections.push({ id: uuidv4(), type: 'argument', title: n.text || 'Argument', draft: '', argNodeId: n.id, note: '' });
  });
  // Evidence
  nodes.filter(n => n.type === 'evidence').forEach(n => {
    sections.push({ id: uuidv4(), type: 'evidence', title: n.text || 'Evidence', draft: '', argNodeId: n.id, note: '' });
  });
  // Objections
  nodes.filter(n => n.type === 'objection').forEach(n => {
    sections.push({ id: uuidv4(), type: 'objection', title: n.text || 'Objection', draft: '', argNodeId: n.id, note: '' });
  });
  // Conclusion
  sections.push({ id: uuidv4(), type: 'conclusion', title: 'Conclusion', draft: '', argNodeId: null, note: '' });

  return sections;
}

// ── Export to markdown ─────────────────────────────────────────────
function toMarkdown(inv, sections, books) {
  const lines = [`# ${inv.caseNumber || ''} — ${inv.title}`, ''];
  sections.forEach(sec => {
    const st = SECTION_TYPES[sec.type] || SECTION_TYPES.note;
    lines.push(`## ${st.icon} ${sec.title}`);
    if (sec.note) lines.push(`> *${sec.note}*`, '');
    if (sec.draft) lines.push(sec.draft.replace(/<[^>]*>/g, ''), '');
    // Pulled quotes
    (sec.quotes || []).forEach(q => {
      const book = books.find(b => b.id === q.bookId);
      lines.push(`> "${q.quote}"`, `> — ${book?.title || 'Unknown source'}`, '');
    });
    lines.push('');
  });
  return lines.join('\n');
}

// ── Pull quote picker ─────────────────────────────────────────────
function QuotePicker({ inv, books, onPick, onClose }) {
  const exhibits = (inv.bookNotes || []).filter(bn => bn.quote?.trim());
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 12, width: 480, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--paper-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Pull a quote into this section</span>
          <button onClick={onClose} style={{ fontSize: 12, color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {exhibits.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>
              No quotes in your evidence yet — add quotes to exhibits in the Dossier tab.
            </div>
          ) : exhibits.map(bn => {
            const book = books.find(b => b.id === bn.bookId);
            return (
              <div key={bn.id} onClick={() => { onPick({ id: uuidv4(), bookId: bn.bookId, quote: bn.quote, exhibitLabel: bn.label }); onClose(); }}
                style={{ background: 'var(--paper-2)', border: '1px solid var(--paper-3)', borderLeft: `3px solid ${book?.color || '#888'}`, borderRadius: 7, padding: '10px 12px', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-card)'; e.currentTarget.style.borderColor = book?.color + '55' || 'var(--paper-3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--paper-2)'; e.currentTarget.style.borderColor = 'var(--paper-3)'; }}>
                <div style={{ fontSize: 10, color: book?.color || 'var(--ink-4)', fontStyle: 'italic', marginBottom: 4 }}>
                  {book?.title || 'Unknown'}{bn.label ? ` · ${bn.label}` : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.6 }}>"{bn.quote}"</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main writing tab ──────────────────────────────────────────────
export default function InvestigationWriting({ inv, books, onUpdate }) {
  const writing = inv.writing || { sections: [], thesisStatement: '' };
  const sections = writing.sections || [];

  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || null);
  const [showQuotePicker, setShowQuotePicker] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('argument');
  const [addingSection, setAddingSection] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [copied, setCopied] = useState(false);

  const activeSection = sections.find(s => s.id === activeSectionId);

  const save = (updatedWriting) => onUpdate({ ...inv, writing: updatedWriting, updatedAt: new Date().toISOString() });

  const updateSection = (id, changes) => {
    save({ ...writing, sections: sections.map(s => s.id === id ? { ...s, ...changes } : s) });
  };

  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    const sec = { id: uuidv4(), type: newSectionType, title: newSectionTitle.trim(), draft: '', quotes: [], note: '' };
    const updated = { ...writing, sections: [...sections, sec] };
    save(updated);
    setActiveSectionId(sec.id);
    setNewSectionTitle('');
    setAddingSection(false);
  };

  const deleteSection = (id) => {
    const updated = { ...writing, sections: sections.filter(s => s.id !== id) };
    save(updated);
    if (activeSectionId === id) setActiveSectionId(sections.find(s => s.id !== id)?.id || null);
  };

  const moveSection = (id, dir) => {
    const idx = sections.findIndex(s => s.id === id);
    if (idx + dir < 0 || idx + dir >= sections.length) return;
    const copy = [...sections];
    [copy[idx], copy[idx + dir]] = [copy[idx + dir], copy[idx]];
    save({ ...writing, sections: copy });
  };

  const pullFromArgMap = () => {
    const generated = sectionsFromArgMap(inv.argMap);
    if (!generated.length) return;
    const confirmed = window.confirm(`Generate ${generated.length} sections from your argument map? This adds to existing sections.`);
    if (!confirmed) return;
    const updated = { ...writing, sections: [...sections, ...generated] };
    save(updated);
    setActiveSectionId(generated[0]?.id || activeSectionId);
  };

  const addQuote = (quote) => {
    if (!activeSection) return;
    updateSection(activeSection.id, { quotes: [...(activeSection.quotes || []), quote] });
  };

  const removeQuote = (sectionId, quoteId) => {
    const sec = sections.find(s => s.id === sectionId);
    if (!sec) return;
    updateSection(sectionId, { quotes: (sec.quotes || []).filter(q => q.id !== quoteId) });
  };

  const copyDraft = () => {
    navigator.clipboard?.writeText(toMarkdown(inv, sections, books));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const wordCount = activeSection?.draft
    ? activeSection.draft.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    : 0;

  const totalWords = sections.reduce((sum, s) => {
    return sum + (s.draft ? s.draft.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── LEFT: Outline panel ───────────────────────────── */}
      <div style={{ width: 220, flexShrink: 0, borderRight: '1px solid var(--paper-3)', display: 'flex', flexDirection: 'column', background: 'var(--paper-2)', overflow: 'hidden' }}>

        {/* Outline header */}
        <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--paper-3)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginBottom: 2 }}>Outline</div>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
            {sections.length} section{sections.length !== 1 ? 's' : ''} · {totalWords} words
          </div>
        </div>

        {/* Section list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {sections.length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic', padding: '16px 12px', lineHeight: 1.65, textAlign: 'center' }}>
              No sections yet.<br />Add one below or pull from the argument map.
            </div>
          ) : sections.map((sec, idx) => {
            const st = SECTION_TYPES[sec.type] || SECTION_TYPES.note;
            const isActive = activeSectionId === sec.id;
            const secWords = sec.draft ? sec.draft.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0;
            const hasDraft = secWords > 0;
            return (
              <div key={sec.id}
                onMouseEnter={e => e.currentTarget.querySelector('.sec-actions').style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.querySelector('.sec-actions').style.opacity = '0'}>
                <button onClick={() => setActiveSectionId(sec.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: isActive ? st.color + '18' : 'transparent', border: 'none', borderLeft: `3px solid ${isActive ? st.color : 'transparent'}`, cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--paper-3)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <span style={{ fontSize: 11, color: st.color, flexShrink: 0 }}>{st.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingTitle === sec.id ? (
                      <input autoFocus defaultValue={sec.title}
                        onBlur={e => { updateSection(sec.id, { title: e.target.value || sec.title }); setEditingTitle(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') { updateSection(sec.id, { title: e.target.value || sec.title }); setEditingTitle(null); } if (e.key === 'Escape') setEditingTitle(null); }}
                        onClick={e => e.stopPropagation()}
                        style={{ width: '100%', fontSize: 12, border: 'none', borderBottom: '1px solid var(--accent-2)', background: 'transparent', outline: 'none', color: 'var(--ink)', padding: '1px 0' }} />
                    ) : (
                      <div style={{ fontSize: 12, color: isActive ? 'var(--ink)' : 'var(--ink-2)', fontWeight: isActive ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                        {sec.title}
                      </div>
                    )}
                    <div style={{ fontSize: 9, color: hasDraft ? st.color : 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', marginTop: 1 }}>
                      {hasDraft ? `${secWords}w` : 'empty'}
                    </div>
                  </div>
                </button>
                {/* Hover actions */}
                <div className="sec-actions" style={{ display: 'flex', gap: 2, position: 'absolute', right: 8, marginTop: -28, opacity: 0, transition: 'opacity 0.12s', background: 'var(--paper-2)', borderRadius: 4, padding: '1px 3px' }}>
                  <button onClick={() => moveSection(sec.id, -1)} disabled={idx === 0}
                    style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>↑</button>
                  <button onClick={() => moveSection(sec.id, 1)} disabled={idx === sections.length - 1}
                    style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: idx === sections.length - 1 ? 'default' : 'pointer', opacity: idx === sections.length - 1 ? 0.3 : 1 }}>↓</button>
                  <button onClick={() => setEditingTitle(sec.id)}
                    style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✎</button>
                  <button onClick={() => deleteSection(sec.id)}
                    style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add section */}
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--paper-3)', flexShrink: 0 }}>
          {addingSection ? (
            <div>
              <select value={newSectionType} onChange={e => setNewSectionType(e.target.value)}
                style={{ width: '100%', fontSize: 11, padding: '4px 6px', borderRadius: 5, marginBottom: 5, fontFamily: 'var(--font-mono)' }}>
                {Object.entries(SECTION_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
              <input value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addSection(); if (e.key === 'Escape') setAddingSection(false); }}
                placeholder="Section title…" autoFocus
                style={{ width: '100%', fontSize: 12, padding: '5px 8px', borderRadius: 5, marginBottom: 5 }} />
              <div style={{ display: 'flex', gap: 5 }}>
                <button onClick={addSection} style={{ flex: 1, fontSize: 11, padding: '4px', borderRadius: 5, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>Add</button>
                <button onClick={() => { setAddingSection(false); setNewSectionTitle(''); }} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}>✕</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <button onClick={() => setAddingSection(true)}
                style={{ width: '100%', fontSize: 11, padding: '5px', borderRadius: 5, border: '1px dashed var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-2)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)'; e.currentTarget.style.color = 'var(--ink-3)'; }}>
                + add section
              </button>
              <button onClick={pullFromArgMap}
                style={{ width: '100%', fontSize: 10, padding: '4px', borderRadius: 5, border: '1px solid var(--paper-3)', color: 'var(--ink-4)', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-2)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--paper-3)'; e.currentTarget.style.color = 'var(--ink-4)'; }}>
                ⟶ pull from arg map
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Writing area ───────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeSection ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--ink-4)' }}>
            <div style={{ fontSize: 28, opacity: 0.12 }}>✍</div>
            <div style={{ fontSize: 13, fontStyle: 'italic' }}>Select a section to start writing</div>
            <div style={{ fontSize: 11, maxWidth: 280, textAlign: 'center', lineHeight: 1.65 }}>
              Add sections in the outline, or pull from your argument map — then click a section to open it here.
            </div>
          </div>
        ) : (() => {
          const st = SECTION_TYPES[activeSection.type] || SECTION_TYPES.note;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Section header */}
              <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: 'var(--paper-2)' }}>
                <span style={{ fontSize: 14, color: st.color }}>{st.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{activeSection.title}</div>
                  <div style={{ fontSize: 10, color: st.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{st.label}</div>
                </div>
                <button onClick={() => setShowQuotePicker(true)}
                  style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: `1px solid ${st.color}44`, color: st.color, background: st.color + '11', cursor: 'pointer', marginLeft: 8 }}
                  onMouseEnter={e => e.currentTarget.style.background = st.color + '22'}
                  onMouseLeave={e => e.currentTarget.style.background = st.color + '11'}>
                  ⊕ pull quote
                </button>
                <button onClick={copyDraft}
                  style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--paper-3)', color: copied ? 'var(--green)' : 'var(--ink-3)', background: 'transparent', cursor: 'pointer' }}>
                  {copied ? '✓ copied' : 'export draft'}
                </button>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>{wordCount} words</span>
              </div>

              {/* Section note (from arg map) */}
              {activeSection.note && (
                <div style={{ padding: '8px 20px', background: st.color + '0d', borderBottom: `1px solid ${st.color}22`, fontSize: 12, color: st.color, fontStyle: 'italic', flexShrink: 0 }}>
                  From argument map: "{activeSection.note}"
                </div>
              )}

              {/* Pulled quotes */}
              {(activeSection.quotes || []).length > 0 && (
                <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--paper-3)', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, background: 'var(--paper-2)', maxHeight: 160, overflowY: 'auto' }}>
                  <div style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Pulled quotes</div>
                  {(activeSection.quotes || []).map(q => {
                    const book = books.find(b => b.id === q.bookId);
                    return (
                      <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--paper-card)', border: `1px solid ${book?.color || 'var(--paper-3)'}33`, borderLeft: `3px solid ${book?.color || 'var(--paper-3)'}`, borderRadius: 6, padding: '7px 10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: book?.color || 'var(--ink-4)', fontStyle: 'italic', marginBottom: 2 }}>{book?.title || 'Unknown'}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.55 }}>"{q.quote}"</div>
                        </div>
                        <button onClick={() => removeQuote(activeSection.id, q.id)}
                          style={{ fontSize: 9, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Draft editor */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                <SimpleEditor
                  key={activeSection.id}
                  value={activeSection.draft || ''}
                  onChange={val => updateSection(activeSection.id, { draft: val })}
                  placeholder={`Write your ${st.label.toLowerCase()} here…\n\nYou can pull quotes from the evidence column using the "⊕ pull quote" button above.`} />
              </div>
            </div>
          );
        })()}
      </div>

      {showQuotePicker && (
        <QuotePicker inv={inv} books={books} onPick={addQuote} onClose={() => setShowQuotePicker(false)} />
      )}
    </div>
  );
}
