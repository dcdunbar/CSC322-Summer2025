import React, { useState } from 'react';
import './App.css';

function GuessedWord({ word, target, guessIdx }) {
  return word.split('').map((ch, i) => {
    let cls;
    if (ch === target[i])          cls = 'correct';
    else if (target.includes(ch))  cls = 'wrong-place';
    else                            cls = 'not-part';
    return (
      <span key={`${guessIdx}-${i}`} className={cls}>
        {ch}
      </span>
    );
  });
}

function App() {
  const wordToGuess = 'CLOSE';
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState('');
  const [turn,    setTurn]    = useState(1);
  const [won,     setWon]     = useState(false);

  const handleChange = e => setCurrent(e.target.value.toUpperCase());
  const handleKeyDown = e => {
    if (e.key === 'Enter' && current.length === 5) {
      setHistory([...history, current]);
      if (current === wordToGuess) setWon(true);
      else setTurn(turn + 1);
      setCurrent('');
    }
  };

  return (
    <div className="App">
      <h1>Word Guess (React)</h1>

      {history.map((g, i) => (
        <p key={i}>
          <GuessedWord word={g} target={wordToGuess} guessIdx={i} />
        </p>
      ))}

      <p>
        {won
          ? `Congratulations! It took you ${turn} ${turn === 1 ? 'try' : 'tries'}.`
          : (
            <>
              <label htmlFor="guess">Guess {turn}:</label>{' '}
              <input
                id="guess"
                type="text"
                size="5"
                maxLength="5"
                value={current}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </>
          )
        }
      </p>
    </div>
  );
}

export default App;
