import React from 'react';

export default function BookPeek({ book, thoughts, thoughtTypes, style }) {
  const bookThoughts = thoughts
    .filter(t => t.bookId === book.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div style={{
      position: 'absolute', left: '100%', top: 0, marginLeft: 8,
      width: 260, zIndex: 100,
      background: 'var(--paper-card)', border: '1px solid var(--paper-3)',
      borderLeft: `3px solid ${book.color}`,
      borderRadius: 10, padding: '12px 14px',
      boxShadow: 'var(--shadow-md)',
      pointerEvents: 'none',
      ...style,
    }}>
      {/* Book header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--paper-3)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: book.color, flexShrink: 0 }} />
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', flex: 1, lineHeight: 1.3 }}>{book.title}</div>
        <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', flexShrink: 0 }}>
          {thoughts.filter(t => t.bookId === book.id).length} notes
        </span>
      </div>

      {bookThoughts.length === 0 ? (
        <div style={{ fontSize: 11, color: 'var(--ink-4)', fontStyle: 'italic' }}>
          No notes yet for this book.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bookThoughts.map(t => {
            const typeInfo = thoughtTypes.find(tp => tp.id === t.type) || { color: '#7a6a52', label: t.type };
            return (
              <div key={t.id} style={{ borderLeft: `2px solid ${typeInfo.color}55`, paddingLeft: 8 }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 3 }}>
                  <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 8, background: typeInfo.color + '22', color: typeInfo.color, fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>
                    {typeInfo.label}
                  </span>
                  {t.page && <span style={{ fontSize: 9, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>p.{t.page}</span>}
                </div>
                {t.quote && (
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 2 }}>
                    "{t.quote.slice(0, 80)}{t.quote.length > 80 ? '…' : ''}"
                  </div>
                )}
                {t.text && (
                  <div style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                    {t.text.slice(0, 100)}{t.text.length > 100 ? '…' : ''}
                  </div>
                )}
              </div>
            );
          })}
          {thoughts.filter(t => t.bookId === book.id).length > 3 && (
            <div style={{ fontSize: 10, color: 'var(--ink-4)', fontStyle: 'italic', textAlign: 'right' }}>
              +{thoughts.filter(t => t.bookId === book.id).length - 3} more — click to view all
            </div>
          )}
        </div>
      )}
    </div>
  );
}
