import React from 'react';

export default function Header({ mode, hasApiKey, onToggleMode }) {
  return (
    <>
      <header className="mast">
        <div className="mast-left">
          <div className={`dot ${mode === 'ai' ? 'ai-active' : ''}`}></div>
          <div className="word-mark">signal</div>
        </div>
        <div className="mast-right">
          <button
            className={`mode-badge ${mode === 'ai' ? 'active' : ''}`}
            onClick={onToggleMode}
            title={mode === 'ai' ? 'Switch to built-in lexicon' : 'Switch to OpenRouter AI'}
          >
            {mode === 'ai' ? '⚡ OpenRouter AI' : '📖 Built-in Lexicon'}
          </button>
        </div>
      </header>
      <div className="sub">
        {mode === 'ai' ? (
          <>
            Powered by <b>OpenRouter AI</b> ({import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/free'}). Analyzes tone, nuance, and key phrases in real-time.
            {!hasApiKey && (
              <span className="key-warning">
                {' '}⚠️ No API key found in <code>.env.local</code>. Set <code>VITE_OPENROUTER_API_KEY</code> to analyze with AI.
              </span>
            )}
          </>
        ) : (
          <>
            Paste one tweet per line. <b>Signal</b> scores each one on a lexicon of roughly 260 charged words, catches negation and boosters, and reads the aggregate as a waveform.
          </>
        )}
      </div>
    </>
  );
}
