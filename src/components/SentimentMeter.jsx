import React from 'react';

export default function SentimentMeter({ posCount, neuCount, negCount, total, avgScore }) {
  if (!total) return null;

  const posPct = (posCount / total) * 100;
  const neuPct = (neuCount / total) * 100;
  const negPct = (negCount / total) * 100;

  const leanLabel =
    avgScore > 0.5 ? 'leans positive' : avgScore < -0.5 ? 'leans negative' : 'roughly balanced';
  const formattedAvg = (avgScore > 0 ? '+' : '') + avgScore.toFixed(2);

  return (
    <div>
      <div className="meter">
        <div className="meter-seg" style={{ width: `${posPct}%`, background: 'var(--pos)' }} />
        <div className="meter-seg" style={{ width: `${neuPct}%`, background: 'var(--hair-strong)' }} />
        <div className="meter-seg" style={{ width: `${negPct}%`, background: 'var(--neg)' }} />
      </div>
      <div className="meter-caption">
        <span>Overall lean</span>
        <span>{leanLabel} (avg {formattedAvg})</span>
      </div>
    </div>
  );
}
