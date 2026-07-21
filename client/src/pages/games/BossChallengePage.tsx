import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { shuffle, pickWrongOptions } from '../../components/GameResultModal';
import type { Flashcard, GameReward } from '../../types';

const TOTAL_QUESTIONS = 30;
const TIME_LIMIT_SEC = 300; // 5 minutes

export default function BossChallengePage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [result, setResult] = useState<GameReward | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SEC);
  const [startTime, setStartTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const { data } = useQuery({
    queryKey: ['game-cards-boss'],
    queryFn: () => contentApi.gameCards(undefined, TOTAL_QUESTIONS).then((r) => r.data as Flashcard[]),
  });

  const submit = useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.submitGame>[0]) =>
      contentApi.submitGame(payload),
    onSuccess: (res) => {
      setResult(res.data.reward);
      refreshUser();
    },
  });

  // Timer
  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, TIME_LIMIT_SEC - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setGameOver(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [started, startTime, gameOver]);

  // Submit on game over (time up or all answered)
  useEffect(() => {
    if (gameOver && !result && isAuthenticated && !submit.isPending) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      submit.mutate({
        gameType: 'BOSS_CHALLENGE',
        score,
        correctAnswers: correct,
        totalQuestions: Math.min(current + 1, cards.length),
        durationSec: elapsed,
        comboMax: maxCombo,
      });
    }
  }, [gameOver]);

  const setupOptions = useCallback(
    (cardIdx: number, allCards: Flashcard[]) => {
      const allTranslations = allCards.map((c) => c.translation);
      const wrongOpts = pickWrongOptions(allCards[cardIdx].translation, allTranslations);
      setOptions(shuffle([allCards[cardIdx].translation, ...wrongOpts]));
    },
    []
  );

  const startGame = useCallback(() => {
    if (!data) return;
    const shuffled = shuffle(data as Flashcard[]).slice(0, TOTAL_QUESTIONS);
    setCards(shuffled);
    setCurrent(0);
    setScore(0);
    setCorrect(0);
    setCombo(0);
    setMaxCombo(0);
    setAnswered(null);
    setResult(null);
    setGameOver(false);
    setTimeLeft(TIME_LIMIT_SEC);
    setStartTime(Date.now());
    setStarted(true);
    setupOptions(0, shuffled);
  }, [data, setupOptions]);

  const handleAnswer = (ans: string) => {
    if (answered || gameOver) return;
    setAnswered(ans);
    const isCorrect = ans === cards[current].translation;

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(Math.max(maxCombo, newCombo));
      setCorrect((c) => c + 1);
      // Speed bonus: more points for faster answers
      const timeBonus = timeLeft > TIME_LIMIT_SEC / 2 ? 5 : 0;
      setScore((s) => s + 10 + (newCombo >= 3 ? 5 : 0) + timeBonus);
    } else {
      setCombo(0);
    }

    setTimeout(() => {
      const next = current + 1;
      if (next >= cards.length) {
        setGameOver(true);
      } else {
        setCurrent(next);
        setAnswered(null);
        setupOptions(next, cards);
      }
    }, 600);
  };

  // Format time as mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="game-card">
          <span className="text-6xl block mb-4">👑</span>
          <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Boss Challenge</h1>
          <p className="text-slate-500 mb-2">
            The ultimate test! Answer {TOTAL_QUESTIONS} questions in {TIME_LIMIT_SEC / 60} minutes.
          </p>
          <p className="text-sm text-orange-500 font-medium mb-6">
            ⚡ Speed bonuses • 🔥 Combo multipliers • 👑 Glory awaits
          </p>
          <button onClick={startGame} disabled={!data} className="btn-primary text-lg px-8 py-3">
            {data ? 'Accept Challenge 👑' : 'Loading...'}
          </button>
          <Link to="/games" className="block mt-4 text-sm text-primary-500 hover:underline">← Back to Games</Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <GameResultModal
        reward={result}
        score={score}
        correct={correct}
        total={Math.min(current + 1, cards.length)}
        onPlayAgain={startGame}
        playAgainLabel="Challenge Again"
      />
    );
  }

  if (gameOver && !result) {
    return (
      <div className="flex justify-center py-20 text-4xl animate-bounce">👑</div>
    );
  }

  const card = cards[current];
  const progress = ((current + 1) / cards.length) * 100;
  const timeWarning = timeLeft <= 30;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <Link to="/games" className="text-slate-400 hover:text-slate-600">← Back</Link>
        <div className={`text-lg font-bold ${timeWarning ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
        <div className="text-sm font-bold text-primary-600">Score: {score}</div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">Question {current + 1}/{cards.length}</span>
        {combo >= 3 && <span className="text-xs font-bold text-orange-500">🔥 {combo}x Combo!</span>}
      </div>

      <div className="h-2 rounded-full bg-slate-200 mb-6 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="game-card text-center mb-6">
        <span className="text-5xl block mb-3">{card.imageUrl ?? '📚'}</span>
        <h2 className="font-display text-2xl font-bold text-primary-800">{card.word}</h2>
        {card.category && <p className="text-sm text-slate-400 mt-1">{card.category.icon} {card.category.name}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          let cls = 'game-card border-2 cursor-pointer text-center font-medium transition-all';
          if (answered) {
            if (opt === card.translation) cls += ' border-green-400 bg-green-50 text-green-700';
            else if (opt === answered) cls += ' border-red-400 bg-red-50 text-red-700';
            else cls += ' opacity-50';
          } else {
            cls += ' border-slate-200 hover:border-primary-400 hover:bg-primary-50';
          }
          return (
            <button key={opt} onClick={() => handleAnswer(opt)} className={cls} disabled={!!answered}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
