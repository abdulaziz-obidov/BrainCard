import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { useGameTimer } from '../../components/GameResultModal';
import { speakWord } from '../../components/FlashCardView';
import type { Flashcard, GameReward } from '../../types';

export default function SpellingGamePage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const getDuration = useGameTimer();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [input, setInput] = useState('');
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ reward: GameReward; score: number } | null>(null);
  const [hint, setHint] = useState('');

  const { data: cards, isLoading } = useQuery({
    queryKey: ['game-cards-spelling'],
    queryFn: () => contentApi.gameCards(undefined, 8).then((r) => r.data as Flashcard[]),
  });

  const totalRounds = Math.min(8, cards?.length ?? 8);
  const current = cards?.[round];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || finished) return;

    const isCorrect = input.trim().toLowerCase() === current.word.toLowerCase();
    const newCorrect = isCorrect ? correct + 1 : correct;
    setCorrect(newCorrect);
    setHint(isCorrect ? '✅ Correct!' : `❌ Answer: ${current.word}`);

    setTimeout(async () => {
      setHint('');
      setInput('');
      if (round + 1 >= totalRounds) {
        const score = newCorrect * 100;
        setFinished(true);
        if (isAuthenticated) {
          try {
            const { data } = await contentApi.submitGame({
              gameType: 'SPELLING',
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
    }, 1000);
  };

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-bounce">✏️</div>;
  if (!current) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-primary-600 text-sm hover:underline">← Games</Link>
        <span className="text-sm font-bold">Q {round + 1}/{totalRounds}</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-center mb-6">✏️ Spelling Challenge</h1>

      <div className="game-card text-center mb-6">
        <span className="text-7xl">{current.imageUrl ?? '📚'}</span>
        <p className="mt-4 text-slate-500">{current.translation}</p>
        <button type="button" onClick={() => speakWord(current.word)} className="mt-2 text-primary-500 text-sm">🔊 Hint: Listen</button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field text-center text-xl font-bold"
          placeholder="Type the word..."
          autoFocus
          disabled={!!hint}
        />
        {hint && <p className="text-center font-bold">{hint}</p>}
        <button type="submit" disabled={!input.trim() || !!hint} className="btn-primary w-full">Check ✓</button>
      </form>

      {result && (
        <GameResultModal reward={result.reward} score={result.score} correct={correct} total={totalRounds} onPlayAgain={() => { setRound(0); setCorrect(0); setFinished(false); setResult(null); }} />
      )}
    </div>
  );
}
