import React from 'react';

export default function Header() {
  return (
    <>
      <header className="mast">
        <div className="mast-left">
          <div className="dot"></div>
          <div className="word-mark">signal</div>
        </div>
        <div className="tag">tweet sentiment reader</div>
      </header>
      <div className="sub">
        Paste one tweet per line. <b>Signal</b> scores each one on a lexicon of roughly 260 charged words, catches negation and boosters, and reads the aggregate as a waveform.
      </div>
    </>
  );
}
