import React from 'react';

export default function SummaryCards({ posCount, neuCount, negCount }) {
  return (
    <div className="summary-grid">
      <div className="summary-cell pos">
        <div className="summary-num">{posCount}</div>
        <div className="summary-cap">Positive</div>
      </div>
      <div className="summary-cell neu">
        <div className="summary-num">{neuCount}</div>
        <div className="summary-cap">Neutral</div>
      </div>
      <div className="summary-cell neg">
        <div className="summary-num">{negCount}</div>
        <div className="summary-cap">Negative</div>
      </div>
    </div>
  );
}
