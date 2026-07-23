import React from 'react';
import ResultRow from './ResultRow';

export default function ResultsList({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty">
        Paste some tweets above and hit "Read signal" to see the breakdown.
      </div>
    );
  }

  const maxAbs = Math.max(1, ...items.map(s => Math.abs(s.score)));

  return (
    <div className="results">
      {items.map((item, i) => (
        <ResultRow key={i} item={item} index={i} maxAbs={maxAbs} />
      ))}
    </div>
  );
}
