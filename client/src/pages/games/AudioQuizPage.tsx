import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { useGameTimer, shuffle, pickWrongOptions } from '../../components/GameResultModal';
import { speakWord } from '../../components/FlashCardView';
import type { Flashcard, GameReward } from '../../types';

export default function AudioQuizPage() {
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
  const [getElapsed] = useState(() => useGameTimer());
  const [autoPlayed, setAutoPlayed] = useState(false);

  const { data } = useQuery({
    queryKey: ['game-cards', 'audio'],
    queryFn: () => contentApi.gameCards().then((r) => r.data as Flashcard[]),
  });

  const submit = useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.submitGame>[0]) => contentApi.submitGame(payload),
    onSuccess: (res) => {
      setResult(res.data.reward);
      refreshUser();
    },
  });

  const startGame = useCallback(() => {
    if (!data) return;
    const shuffled = shuffle(data as Flashcard[]).slice(0, 10);
    setCards(shuffled);
    setCurrent(0);
    setScore(0);
    setCorrect(0);
    setCombo(0);
    setMaxCombo(0);
    setAnswered(null);
    setResult(null);
    setAutoPlayed(false);
    setStarted(true);

    // Set options for first question
    const allTranslations = (data as Flashcard[]).map((c: Flashcard) => c.translation);
    const wrongOpts = pickWrongOptions(shuffled[0].translation, allTranslations);
    setOptions(shuffle([shuffled[0].translation, ...wrongOpts]));
  }, [data]);

  const playCurrentWord = useCallback(() => {
    if (cards[current]) {
      speakWord(cards[current].word);
    }
  }, [cards, current]);

  // Auto-play word when question changes
  if (started && cards[current] && !autoPlayed) {
    setAutoPlayed(true);
    setTimeout(() => speakWord(cards[current].word), 300);
  }

  const handleAnswer = (ans: string) => {
    if (answered) return;
    setAnswered(ans);
    const isCorrect = ans === cards[current].translation;

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(Math.max(maxCombo, newCombo));
      setCorrect((c) => c + 1);
      setScore((s) => s + 10 + (newCombo >= 3 ? 5 : 0));
    } else {
      setCombo(0);
    }

    setTimeout(() => {
      const next = current + 1;
      if (next >= cards.length) {
        // Game over
        if (isAuthenticated) {
          submit.mutate({
            gameType: 'AUDIO_QUIZ',
            score: score + (isCorrect ? 10 : 0),
            correctAnswers: correct + (isCorrect ? 1 : 0),
            totalQuestions: cards.length,
            durationSec: getElapsed(),
            comboMax: Math.max(maxCombo, isCorrect ? combo + 1 : maxCombo),
          });
        }
      } else {
        setCurrent(next);
        setAnswered(null);
        setAutoPlayed(false);
        // Set new options
        const allTranslations = ((data ?? []) as Flashcard[]).map((c: Flashcard) => c.translation);
        const wrongOpts = pickWrongOptions(cards[next].translation, allTranslations);
        setOptions(shuffle([cards[next].translation, ...wrongOpts]));
      }
    }, 800);
  };

  if (!started || !cards.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="game-card">
          <span className="text-6xl block mb-4">🔊</span>
          <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Audio Quiz</h1>
          <p className="text-slate-500 mb-6">
            Listen to the word and choose its correct translation. Train your ears! 👂
          </p>
          <button onClick={startGame} disabled={!data} className="btn-primary text-lg px-8 py-3">
            {data ? 'Start Game 🎧' : 'Loading...'}
          </button>
          <Link to="/games" className="block mt-4 text-sm text-primary-500 hover:underline">
            ← Back to Games
          </Link>
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
        total={cards.length}
        onPlayAgain={startGame}
      />
    );
  }

  const card = cards[current];
  const progress = ((current + 1) / cards.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-slate-400 hover:text-slate-600">← Back</Link>
        <div className="text-sm font-medium text-slate-500">{current + 1} / {cards.length}</div>
        <div className="text-sm font-bold text-primary-600">Score: {score}</div>
      </div>

      <div className="h-2 rounded-full bg-slate-200 mb-8 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {combo >= 3 && (
        <div className="text-center mb-4 animate-bounce">
          <span className="text-sm font-bold text-orange-500">🔥 {combo}x Combo!</span>
        </div>
      )}

      <div className="game-card text-center mb-8">
        <p className="text-slate-400 text-sm mb-4">Listen and choose the correct translation</p>
        <button
          onClick={playCurrentWord}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-5xl flex items-center justify-center mx-auto hover:scale-110 active:scale-95 transition-transform shadow-lg shadow-blue-200"
        >
          🔊
        </button>
        <p className="mt-4 text-xs text-slate-400">Click to hear again</p>
        {card.category && (
          <p className="mt-2 text-sm text-slate-400">{card.category.icon} {card.category.name}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          let cls = 'game-card border-2 cursor-pointer text-center text-lg font-medium transition-all hover:scale-[1.02]';
          if (answered) {
            if (opt === card.translation) {
              cls += ' border-green-400 bg-green-50 text-green-700';
            } else if (opt === answered) {
              cls += ' border-red-400 bg-red-50 text-red-700';
            } else {
              cls += ' opacity-50';
            }
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
