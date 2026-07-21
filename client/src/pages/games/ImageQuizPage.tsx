import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { pickWrongOptions, shuffle, useGameTimer } from '../../components/GameResultModal';
import { speakWord } from '../../components/FlashCardView';
import type { Flashcard, GameReward } from '../../types';

export default function ImageQuizPage() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const { isAuthenticated, refreshUser } = useAuth();
  const getDuration = useGameTimer();

  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ reward: GameReward; score: number } | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['game-cards-quiz', categoryId],
    queryFn: () => contentApi.gameCards(categoryId, 8).then((r) => r.data as Flashcard[]),
  });

  const totalRounds = Math.min(8, cards?.length ?? 8);
  const current = cards?.[round];
  const options = current
    ? shuffle([
        current,
        ...pickWrongOptions(
          current.id,
          (cards ?? []).map((c) => c.id),
          3,
        ).map((id) => (cards ?? []).find((c) => c.id === id)!),
      ].filter(Boolean))
    : [];

  const handleAnswer = async (selectedId: string) => {
    if (finished || !current) return;
    const isCorrect = selectedId === current.id;
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newCombo = isCorrect ? combo + 1 : 0;
    const newMaxCombo = Math.max(maxCombo, newCombo);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setCorrect(newCorrect);
    setCombo(newCombo);
    setMaxCombo(newMaxCombo);

    setTimeout(async () => {
      setFeedback(null);
      if (round + 1 >= totalRounds) {
        const score = newCorrect * 100 + newMaxCombo * 10;
        const durationSec = getDuration();
        setFinished(true);
        if (isAuthenticated) {
          try {
            const { data } = await contentApi.submitGame({
              gameType: 'IMAGE_QUIZ',
              categoryId,
              score,
              correctAnswers: newCorrect,
              totalQuestions: totalRounds,
              durationSec,
              comboMax: newMaxCombo,
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

  const restart = () => {
    setRound(0);
    setCorrect(0);
    setCombo(0);
    setMaxCombo(0);
    setFinished(false);
    setResult(null);
  };

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-bounce">🖼️</div>;
  if (!current) return <div className="text-center py-20">Not enough cards</div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-primary-600 text-sm hover:underline">← Games</Link>
        <span className="text-sm font-bold text-primary-700">Q {round + 1}/{totalRounds} · ✅ {correct}</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-center mb-6">🖼️ Image Quiz</h1>

      <div className={`game-card text-center mb-6 transition ${feedback === 'correct' ? 'ring-4 ring-green-400' : feedback === 'wrong' ? 'ring-4 ring-red-400' : ''}`}>
        <p className="text-sm text-slate-500 mb-2">Which image matches this word?</p>
        <h2 className="font-display text-4xl font-bold text-primary-700">{current.word}</h2>
        <button onClick={() => speakWord(current.word)} className="mt-3 text-primary-500 text-sm hover:underline">🔊 Listen</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleAnswer(opt.id)}
            disabled={!!feedback}
            className="aspect-square rounded-xl border-2 border-primary-200 bg-white text-5xl hover:border-primary-400 hover:bg-primary-50 transition disabled:opacity-70"
          >
            {opt.imageUrl ?? '📚'}
          </button>
        ))}
      </div>

      {result && (
        <GameResultModal reward={result.reward} score={result.score} correct={correct} total={totalRounds} onPlayAgain={restart} />
      )}
    </div>
  );
}
