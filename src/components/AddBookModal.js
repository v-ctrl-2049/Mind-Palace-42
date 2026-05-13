import React, { useState } from 'react';

const COLORS = ['#7a6a52','#2e7d5e','#c0392b','#2c5f8a','#b07d28','#7b3fa0','#c0784a','#3a7d7d'];

export default function AddBookModal({ onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), author: author.trim(), year: year ? parseInt(year, 10) : null, color });
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--paper-card)', borderRadius: 14, padding: '28px 28px 24px', width: 360, boxShadow: 'var(--shadow-md)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 18 }}>Add a book</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title *"
            required
            style={{ padding: '8px 12px', width: '100%' }}
          />
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Author"
            style={{ padding: '8px 12px', width: '100%' }}
          />
          <input
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="Year published"
            style={{ padding: '8px 12px', width: '100%' }}
          />

          {/* Color picker */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>Colour tag</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
                    outline: color === c ? '2px solid #fff' : 'none',
                    outlineOffset: -3,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ fontSize: 13, padding: '7px 16px', border: '1px solid var(--paper-3)', borderRadius: 7, color: 'var(--ink-2)' }}>
              Cancel
            </button>
            <button type="submit" style={{ fontSize: 13, padding: '7px 20px', borderRadius: 7, background: 'var(--accent)', color: '#fff' }}>
              Add book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
