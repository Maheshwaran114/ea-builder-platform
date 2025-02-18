// src/pages/Backtest.js
import React, { useState } from 'react';
import { runBacktest } from '../api/backtest';

function Backtest() {
  const [configuration, setConfiguration] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleBacktest = async () => {
    try {
      // Convert configuration input (a JSON string) to an object
      const configObj = JSON.parse(configuration);
      const data = await runBacktest(configObj);
      setResults(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Backtest failed: ' + err.message);
      setResults(null);
    }
  };

  return (
    <div>
      <h2>Backtest EA Model</h2>
      <textarea
        placeholder="Enter EA configuration as JSON"
        value={configuration}
        onChange={(e) => setConfiguration(e.target.value)}
        rows="10"
        cols="50"
      />
      <br />
      <button onClick={handleBacktest}>Run Backtest</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results && (
        <div>
          <h3>Backtest Results:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default Backtest;
