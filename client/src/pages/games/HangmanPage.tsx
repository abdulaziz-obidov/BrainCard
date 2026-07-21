import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { useGameTimer, shuffle } from '../../components/GameResultModal';
import type { Flashcard, GameReward } from '../../types';

const MAX_WRONG = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Simple hangman SVG parts
const HANGMAN_PARTS = [
  // Head
  <circle key="head" cx="200" cy="80" r="20" stroke="currentColor" strokeWidth="3" fill="none" />,
  // Body
  <line key="body" x1="200" y1="100" x2="200" y2="160" stroke="currentColor" strokeWidth="3" />,
  // Left arm
  <line key="larm" x1="200" y1="120" x2="170" y2="145" stroke="currentColor" strokeWidth="3" />,
  // Right arm
  <line key="rarm" x1="200" y1="120" x2="230" y2="145" stroke="currentColor" strokeWidth="3" />,
  // Left leg
  <line key="lleg" x1="200" y1="160" x2="175" y2="195" stroke="currentColor" strokeWidth="3" />,
  // Right leg
  <line key="rleg" x1="200" y1="160" x2="225" y2="195" stroke="currentColor" strokeWidth="3" />,
];

export default function HangmanPage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [_correct, setCorrect] = useState(0);
  const [wordsWon, setWordsWon] = useState(0);
  const [result, setResult] = useState<GameReward | null>(null);
  const [wordResult, setWordResult] = useState<'win' | 'lose' | null>(null);
  const [getElapsed] = useState(() => useGameTimer());

  const { data } = useQuery({
    queryKey: ['game-cards', 'hangman'],
    queryFn: () => contentApi.gameCards().then((r) => r.data as Flashcard[]),
  });

  const submit = useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.submitGame>[0]) =>
      contentApi.submitGame(payload),
    onSuccess: (res) => {
      setResult(res.data.reward);
      refreshUser();
    },
  });

  const startGame = useCallback(() => {
    if (!data) return;
    const shuffled = shuffle(data as Flashcard[]).slice(0, 8);
    setCards(shuffled);
    setCurrent(0);
    setGuessed(new Set());
    setWrongCount(0);
    setScore(0);
    setCorrect(0);
    setWordsWon(0);
    setResult(null);
    setWordResult(null);
    setStarted(true);
  }, [data]);

  const word = cards[current]?.word.toUpperCase() ?? '';
  const wordLetters = new Set(word.split(''));

  const handleGuess = (letter: string) => {
    if (guessed.has(letter) || wordResult) return;
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (word.includes(letter)) {
      // Check if word is now complete
      const allRevealed = [...wordLetters].every((l) => newGuessed.has(l));
      if (allRevealed) {
        setWordsWon((w) => w + 1);
        setCorrect((c) => c + 1);
        setScore((s) => s + 20 + Math.max(0, (MAX_WRONG - wrongCount) * 3));
        setWordResult('win');
      }
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      if (newWrong >= MAX_WRONG) {
        setWordResult('lose');
      }
    }
  };

  const nextWord = () => {
    const next = current + 1;
    if (next >= cards.length) {
      // Game over
      if (isAuthenticated) {
        submit.mutate({
          gameType: 'HANGMAN',
          score,
          correctAnswers: wordsWon,
          totalQuestions: cards.length,
          durationSec: getElapsed(),
        });
      }
    } else {
      setCurrent(next);
      setGuessed(new Set());
      setWrongCount(0);
      setWordResult(null);
    }
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="game-card">
          <span className="text-6xl block mb-4">🎯</span>
          <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Hangman</h1>
          <p className="text-slate-500 mb-6">
            Guess the word letter by letter. You only get {MAX_WRONG} wrong guesses! 💀
          </p>
          <button onClick={startGame} disabled={!data} className="btn-primary text-lg px-8 py-3">
            {data ? 'Start Game 🎯' : 'Loading...'}
          </button>
          <Link to="/games" className="block mt-4 text-sm text-primary-500 hover:underline">← Back to Games</Link>
        </div>
      </div>
    );
  }

  if (result) {
    return <GameResultModal reward={result} score={score} correct={wordsWon} total={cards.length} onPlayAgain={startGame} />;
  }

  const card = cards[current];
  const progress = ((current + 1) / cards.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-slate-400 hover:text-slate-600">← Back</Link>
        <div className="text-sm font-medium text-slate-500">Word {current + 1}/{cards.length}</div>
        <div className="text-sm font-bold text-primary-600">Score: {score}</div>
      </div>

      <div className="h-2 rounded-full bg-slate-200 mb-6 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="game-card mb-6">
        {/* Hint */}
        <div className="text-center mb-4">
          <p className="text-sm text-slate-400">Hint: Translation</p>
          <p className="text-xl font-bold text-primary-700">{card.translation}</p>
          {card.category && <p className="text-xs text-slate-400 mt-1">{card.category.icon} {card.category.name}</p>}
        </div>

        {/* Hangman drawing */}
        <div className="flex justify-center mb-4">
          <svg width="280" height="220" className="text-slate-700">
            {/* Gallows */}
            <line x1="40" y1="210" x2="160" y2="210" stroke="currentColor" strokeWidth="3" />
            <line x1="100" y1="210" x2="100" y2="30" stroke="currentColor" strokeWidth="3" />
            <line x1="100" y1="30" x2="200" y2="30" stroke="currentColor" strokeWidth="3" />
            <line x1="200" y1="30" x2="200" y2="60" stroke="currentColor" strokeWidth="3" />
            {/* Body parts */}
            {HANGMAN_PARTS.slice(0, wrongCount)}
          </svg>
        </div>

        {/* Lives indicator */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: MAX_WRONG }).map((_, i) => (
            <span key={i} className={`text-lg ${i < wrongCount ? 'grayscale opacity-30' : ''}`}>
              ❤️
            </span>
          ))}
        </div>

        {/* Word display */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {word.split('').map((letter, i) => (
            <div
              key={i}
              className={`w-10 h-12 flex items-center justify-center border-b-4 font-display text-2xl font-bold ${
                guessed.has(letter)
                  ? 'border-primary-400 text-primary-700'
                  : wordResult === 'lose'
                  ? 'border-red-400 text-red-500'
                  : 'border-slate-300'
              }`}
            >
              {guessed.has(letter) || wordResult === 'lose' ? letter : ''}
            </div>
          ))}
        </div>

        {/* Word result feedback */}
        {wordResult && (
          <div className={`text-center mb-4 p-3 rounded-xl ${
            wordResult === 'win' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <p className="font-bold text-lg">
              {wordResult === 'win' ? '🎉 Correct!' : `💀 The word was: ${word}`}
            </p>
            <button onClick={nextWord} className="btn-primary mt-3">
              {current + 1 >= cards.length ? 'See Results' : 'Next Word →'}
            </button>
          </div>
        )}
      </div>

      {/* Keyboard */}
      {!wordResult && (
        <div className="flex flex-wrap justify-center gap-2">
          {ALPHABET.map((letter) => {
            const used = guessed.has(letter);
            const isInWord = word.includes(letter);
            let cls = 'w-10 h-10 rounded-lg font-bold text-sm transition-all';
            if (used && isInWord) cls += ' bg-green-100 text-green-600 border border-green-300';
            else if (used) cls += ' bg-red-100 text-red-400 border border-red-200 opacity-50';
            else cls += ' bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-400 hover:bg-primary-50 active:scale-90';
            return (
              <button key={letter} onClick={() => handleGuess(letter)} disabled={used} className={cls}>
                {letter}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
