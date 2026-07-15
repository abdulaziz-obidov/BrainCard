import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { pickWrongOptions, shuffle, useGameTimer } from '../../components/GameResultModal';
import type { Flashcard, GameReward } from '../../types';

export default function WordQuizPage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const getDuration = useGameTimer();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ reward: GameReward; score: number } | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['game-cards-word'],
    queryFn: () => contentApi.gameCards({ count: 8 }).then((r) => r.data as Flashcard[]),
  });

  const totalRounds = Math.min(8, cards?.length ?? 8);
  const current = cards?.[round];
  const wordOptions = current
    ? shuffle([
        current.word,
        ...pickWrongOptions(current.word, (cards ?? []).map((c) => c.word), 3),
      ])
    : [];

  const handleAnswer = (word: string) => {
    if (finished || !current) return;
    const isCorrect = word === current.word;
    const newCorrect = isCorrect ? correct + 1 : correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setCorrect(newCorrect);

    setTimeout(async () => {
      setFeedback(null);
      if (round + 1 >= totalRounds) {
        const score = newCorrect * 100;
        setFinished(true);
        if (isAuthenticated) {
          try {
            const { data } = await contentApi.submitGame({
              gameType: 'WORD_QUIZ',
              score,
              correctAnswers: newCorrect,
              totalQuestions: totalRounds,
              durationSec: getDuration(),
            });
            setResult({ reward: data.reward, score });
            await refreshUser();
          } catch {
            setResult({ reward: { xpEarned: newCorrect * 10, coinsEarned: newCorrect, isPerfect: newCorrect === totalRounds }, score });
          }
        } else {
          setResult({ reward: { xpEarned: newCorrect * 10, coinsEarned: 0, isPerfect: newCorrect === totalRounds }, score });
        }
      } else {
        setRound((r) => r + 1);
      }
    }, 600);
  };

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-bounce">📝</div>;
  if (!current) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-primary-600 text-sm hover:underline">← Games</Link>
        <span className="text-sm font-bold">Q {round + 1}/{totalRounds}</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-center mb-6">📝 Word Quiz</h1>

      <div className={`game-card text-center mb-6 ${feedback === 'correct' ? 'ring-4 ring-green-400' : feedback === 'wrong' ? 'ring-4 ring-red-400' : ''}`}>
        <span className="text-7xl">{current.imageUrl ?? '📚'}</span>
        <p className="mt-4 text-slate-500">What is this?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {wordOptions.map((word) => (
          <button
            key={word}
            onClick={() => handleAnswer(word)}
            disabled={!!feedback}
            className="rounded-xl border-2 border-primary-200 py-4 font-bold text-primary-700 hover:bg-primary-50 disabled:opacity-70"
          >
            {word}
          </button>
        ))}
      </div>

      {result && (
        <GameResultModal reward={result.reward} score={result.score} correct={correct} total={totalRounds} onPlayAgain={() => { setRound(0); setCorrect(0); setFinished(false); setResult(null); }} />
      )}
    </div>
  );
}
