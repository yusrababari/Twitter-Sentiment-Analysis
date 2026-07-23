import React from 'react';

function renderHighlightedText(text, hits) {
  if (!hits || hits.length === 0) return text;

  const hitMap = new Map();
  hits.forEach(h => {
    if (h.word) hitMap.set(h.word.toLowerCase(), h.positive);
  });

  const wordsToMatch = Array.from(hitMap.keys()).sort((a, b) => b.length - a.length);
  if (wordsToMatch.length === 0) return text;

  const escaped = wordsToMatch.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(^|[^\\w])(${escaped})(?![\\w])`, 'gi');

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const prefix = match[1];
    const matchedWord = match[2];
    const matchIndex = match.index;

    if (matchIndex + prefix.length > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex + prefix.length));
    }

    const isPositive = hitMap.get(matchedWord.toLowerCase());
    const cls = isPositive ? 'hl-pos' : 'hl-neg';

    parts.push(
      <span key={`${matchIndex}-${prefix.length}`} className={cls}>
        {matchedWord}
      </span>
    );

    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function ResultRow({ item, index, maxAbs }) {
  const { line, score, hits, cls } = item;
  const pct = Math.min(50, (Math.abs(score) / maxAbs) * 50);
  const barColor = cls === 'pos' ? 'var(--pos)' : cls === 'neg' ? 'var(--neg)' : 'var(--paper-mute)';
  const barLeft = score < 0 ? 50 - pct : 50;
  const barWidth = score === 0 ? 0 : pct;
  const label = cls === 'pos' ? 'positive' : cls === 'neg' ? 'negative' : 'neutral';

  const formattedIdx = String(index + 1).padStart(2, '0');
  const formattedScore = (score > 0 ? '+' : '') + score.toFixed(1);

  return (
    <div className="row">
      <div className="row-top">
        <div className="row-idx">{formattedIdx}</div>
        <div className="wave">
          <div className="wave-mid" />
          <div
            className="wave-bar"
            style={{
              left: `${barLeft}%`,
              width: `${barWidth}%`,
              background: barColor,
            }}
          />
        </div>
        <div className={`row-label ${cls}`}>{label}</div>
        <div className={`row-score ${cls}`}>{formattedScore}</div>
      </div>
      <div className="row-text">{renderHighlightedText(line, hits)}</div>
    </div>
  );
}
