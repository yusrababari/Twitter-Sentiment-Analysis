import React from 'react';

export default function TweetInput({ value, onChange, onRun }) {
  const lines = value.split('\n').map(l => l.trim()).filter(Boolean);
  const count = lines.length;

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    }
  };

  return (
    <div>
      <div className="field-label">
        <span>input — one tweet per line</span>
        <span>{count} {count === 1 ? 'line' : 'lines'}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`just tried the new update and honestly it's a mess, so disappointed
crying at how good this album is, best thing i've heard all year
weather's fine i guess, nothing special either way`}
      />
      <div className="controls">
        <span className="hint">⌘ / ctrl + enter to run</span>
        <button className="run" onClick={onRun}>
          Read signal
        </button>
      </div>
    </div>
  );
}
