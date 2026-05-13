import React, { useState } from 'react';
import SimpleEditor from './SimpleEditor';

export default function BookSummary({ book, thoughts, onClose }) {
  const [summary, setSummary] = useState(book.summary || '');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const bookThoughts = thoughts.filter(t => t.bookId === book.id);

  const handleGenerate = async () => {
    if (!bookThoughts.length) { setError('No thoughts captured for this book yet.'); return; }
    setGenerating(true); setError('');
    try {
      const thoughtsText = bookThoughts.map(t =>
        `[${t.type.toUpperCase()}${t.page ? ` p.${t.page}` : ''}]: ${t.text}`
      ).join('\n\n');

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a thoughtful reading assistant. Based on the reader's captured thoughts, reactions, questions, and insights about a book, write a cohesive 3-5 paragraph summary of the book's main ideas as the reader understands them. Write in second person ("you found", "your reading"). Be concise and insightful. Do not use headers or bullet points — flowing prose only.`,
          messages: [{
            role: 'user',
            content: `Book: "${book.title}" by ${book.author}\n\nMy captured thoughts:\n\n${thoughtsText}\n\nPlease write a summary of my understanding of this book based on these notes.`
          }]
        })
      });
      const data = await res.json();
      if (data.content?.[0]?.text) {
        setSummary(data.content[0].text);
      } else {
        setError('Could not generate summary. Try again.');
      }
    } catch (e) {
      setError('Network error. Make sure you are connected.');
    }
    setGenerating(false);
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: 'var(--paper-card)', borderRadius: 14, width: '100%', maxWidth: 620, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid var(--paper-3)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: book.color, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{book.title}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>{book.author} · Book summary</div>
          </div>
          <button onClick={onClose} style={{ fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{ padding: '10px 22px', borderBottom: '1px solid var(--paper-3)', display: 'flex', gap: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}><strong style={{ color: 'var(--ink)' }}>{bookThoughts.length}</strong> thoughts captured</span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}><strong style={{ color: 'var(--ink)' }}>{bookThoughts.filter(t => t.type === 'quote').length}</strong> quotes</span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}><strong style={{ color: 'var(--ink)' }}>{bookThoughts.filter(t => t.type === 'question').length}</strong> open questions</span>
        </div>

        {/* Editor */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px' }}>
          {error && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10, padding: '8px 12px', background: 'var(--paper-2)', borderRadius: 6 }}>{error}</div>}
          <SimpleEditor
            value={summary}
            onChange={setSummary}
            placeholder="Write your summary here, or generate a draft from your captured thoughts…"
          />
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--paper-3)', display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={handleGenerate} disabled={generating}
            style={{ fontSize: 12, padding: '7px 18px', borderRadius: 7, border: '1px solid var(--accent-2)', background: 'var(--accent-light)', color: 'var(--accent)', cursor: generating ? 'wait' : 'pointer', opacity: generating ? 0.7 : 1 }}>
            {generating ? '✦ Generating…' : '✦ Draft from my notes'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ fontSize: 12, padding: '7px 16px', borderRadius: 7, border: '1px solid var(--paper-3)', color: 'var(--ink-3)', cursor: 'pointer' }}>Cancel</button>
            <button
              onClick={() => {
                // Save summary back to book via custom event
                window.dispatchEvent(new CustomEvent('save-book-summary', { detail: { bookId: book.id, summary } }));
                onClose();
              }}
              style={{ fontSize: 12, padding: '7px 20px', borderRadius: 7, background: 'var(--accent)', color: 'var(--paper-card)', border: 'none', cursor: 'pointer' }}>
              Save summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
