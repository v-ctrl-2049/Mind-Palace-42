import React from 'react';

// Given all thoughts, find topic tags shared by thoughts from 2+ different books
export function detectSuggestions(thoughts, existingTopics) {
  const confirmedTitles = existingTopics.map(t => t.title.toLowerCase());
  const topicMap = {}; // topic -> { bookIds: Set, thoughtIds: [] }

  thoughts.forEach(thought => {
    thought.topics.forEach(topic => {
      if (!topicMap[topic]) topicMap[topic] = { bookIds: new Set(), thoughtIds: [] };
      topicMap[topic].bookIds.add(thought.bookId);
      topicMap[topic].thoughtIds.push(thought.id);
    });
  });

  return Object.entries(topicMap)
    .filter(([topic, data]) => data.bookIds.size >= 2)
    .filter(([topic]) => !confirmedTitles.includes(topic.toLowerCase()))
    .map(([topic, data]) => ({
      suggestedTitle: topic.charAt(0).toUpperCase() + topic.slice(1),
      tag: topic,
      bookCount: data.bookIds.size,
      thoughtIds: data.thoughtIds,
    }));
}

export default function TopicSuggestions({ suggestions, thoughts, books, onConfirm, onDismiss }) {
  if (suggestions.length === 0) return null;

  return (
    <div style={{
      background: 'var(--accent-light)',
      border: '1px solid var(--accent-2)',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 13 }}>✦</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>
          Suggested topic pages
        </span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          — thoughts from multiple books share these tags
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suggestions.map(s => {
          const relatedThoughts = thoughts.filter(t => s.thoughtIds.includes(t.id));
          const relatedBooks = [...new Set(relatedThoughts.map(t => t.bookId))]
            .map(id => books.find(b => b.id === id))
            .filter(Boolean);

          return (
            <div key={s.tag} style={{
              background: 'var(--paper-card)',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                  {s.suggestedTitle}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {relatedBooks.map(b => (
                    <span key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: b.color }} />
                      <span style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>{b.title}</span>
                    </span>
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                    · {s.thoughtIds.length} thought{s.thoughtIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => onDismiss(s.tag)}
                  style={{
                    fontSize: 11, padding: '4px 10px', borderRadius: 6,
                    border: '1px solid var(--paper-3)', color: 'var(--ink-3)',
                  }}
                >
                  Dismiss
                </button>
                <button
                  onClick={() => onConfirm(s)}
                  style={{
                    fontSize: 11, padding: '4px 12px', borderRadius: 6,
                    background: 'var(--accent)', color: '#fff', border: 'none',
                  }}
                >
                  Create page →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
