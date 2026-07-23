import React, { useState } from 'react';
import Header from './components/Header';
import TweetInput from './components/TweetInput';
import SummaryCards from './components/SummaryCards';
import SentimentMeter from './components/SentimentMeter';
import ResultsList from './components/ResultsList';
import { scoreTweet, classify } from './utils/sentiment';

const DEFAULT_TEXT = `just tried the new update and honestly it's a mess, so disappointed
crying at how good this album is, best thing i've heard all year
weather's fine i guess, nothing special either way`;

export default function App() {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [results, setResults] = useState([]);
  const [hasRun, setHasRun] = useState(false);

  const handleRun = () => {
    const lines = inputText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setResults([]);
      setHasRun(false);
      return;
    }

    const scored = lines.map(line => {
      const { score, hits } = scoreTweet(line);
      return { line, score, hits, cls: classify(score) };
    });

    setResults(scored);
    setHasRun(true);
  };

  const posCount = results.filter(s => s.cls === 'pos').length;
  const neuCount = results.filter(s => s.cls === 'neu').length;
  const negCount = results.filter(s => s.cls === 'neg').length;
  const total = results.length;
  const avgScore = total > 0 ? results.reduce((a, s) => a + s.score, 0) / total : 0;

  return (
    <div className="wrap">
      <Header />

      <TweetInput
        value={inputText}
        onChange={setInputText}
        onRun={handleRun}
      />

      <hr className="divider" />

      {hasRun && (
        <div className="summary">
          <SummaryCards posCount={posCount} neuCount={neuCount} negCount={negCount} />
          <SentimentMeter
            posCount={posCount}
            neuCount={neuCount}
            negCount={negCount}
            total={total}
            avgScore={avgScore}
          />
        </div>
      )}

      <ResultsList items={hasRun ? results : []} />

      <footer className="note">
        Runs entirely in this page against a fixed lexicon, no live X / Twitter API connection.
        It's a reasonable read on tone, not a substitute for careful judgement, especially with sarcasm or slang it hasn't seen.
      </footer>
    </div>
  );
}
