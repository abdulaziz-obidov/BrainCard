import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { pickWrongOptions, shuffle, useGameTimer } from '../../components/GameResultModal';
import { speakWord } from '../../components/FlashCardView';
import type { Flashcard, GameReward } from '../../types';

export default function SurvivalGamePage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const getDuration = useGameTimer();
  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(3);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ reward: GameReward; score: number } | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [allCards, setAllCards] = useState<Flashcard[]>([]);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['game-cards-survival'],
    queryFn: () => contentApi.gameCards(undefined, 30).then((r) => r.data as Flashcard[]),
  });

  useEffect(() => {
    if (cards?.length) setAllCards(shuffle([...cards]));
  }, [cards]);

  const current = allCards[round];
  const options = current
    ? shuffle([
        current,
        ...pickWrongOptions(
          current.id,
          allCards.map((c) => c.id),
          3,
        ).map((id) => allCards.find((c) => c.id === id)!),
      ].filter(Boolean))
    : [];

  const endGame = async (finalCorrect: number, finalMaxCombo: number) => {
    const score = finalCorrect * 100 + finalMaxCombo * 20;
    const durationSec = getDuration();
    setFinished(true);
    if (isAuthenticated) {
      try {
        const { data } = await contentApi.submitGame({
          gameType: 'SURVIVAL',
          score,
          correctAnswers: finalCorrect,
          totalQuestions: round + 1,
          durationSec,
          comboMax: finalMaxCombo,
        });
        setResult({ reward: data.reward, score });
        await refreshUser();
      } catch {
        setResult({ reward: { xpEarned: finalCorrect * 15, coinsEarned: finalCorrect * 2, isPerfect: false }, score });
      }
    } else {
      setResult({ reward: { xpEarned: finalCorrect * 15, coinsEarned: 0, isPerfect: false }, score });
    }
  };

  const handleAnswer = async (selectedId: string) => {
    if (finished || !current) return;
    const isCorrect = selectedId === current.id;
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newCombo = isCorrect ? combo + 1 : 0;
    const newMaxCombo = Math.max(maxCombo, newCombo);
    const newLives = isCorrect ? lives : lives - 1;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setCorrect(newCorrect);
    setCombo(newCombo);
    setMaxCombo(newMaxCombo);
    setLives(newLives);

    setTimeout(async () => {
      setFeedback(null);
      if (newLives <= 0 || round + 1 >= allCards.length) {
        await endGame(newCorrect, newMaxCombo);
      } else {
        setRound((r) => r + 1);
      }
    }, 600);
  };

  const restart = () => {
    if (cards?.length) setAllCards(shuffle([...cards]));
    setRound(0);
    setLives(3);
    setCorrect(0);
    setCombo(0);
    setMaxCombo(0);
    setFinished(false);
    setResult(null);
  };

  if (isLoading || !current) return <div className="flex justify-center py-20 text-4xl animate-bounce">💀</div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-primary-600 text-sm hover:underline">← Games</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-red-600">{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</span>
          <span className="text-sm font-bold text-primary-700">✅ {correct}</span>
        </div>
      </div>
      <h1 className="font-display text-2xl font-bold text-center mb-6">💀 Survival Mode</h1>
      <p className="text-center text-xs text-slate-500 mb-4">Keep going until you run out of lives!</p>

      {combo > 2 && <div className="text-center text-sm font-bold text-orange-500 mb-3 animate-pulse">🔥 Combo x{combo}!</div>}

      <div className={`game-card text-center mb-6 transition ${feedback === 'correct' ? 'ring-4 ring-green-400' : feedback === 'wrong' ? 'ring-4 ring-red-400 animate-shake' : ''}`}>
        <p className="text-sm text-slate-500 mb-2">What is the translation of…</p>
        <div className="text-5xl mb-3">{current.imageUrl ?? '📚'}</div>
        <h2 className="font-display text-3xl font-bold text-primary-700">{current.word}</h2>
        <button onClick={() => speakWord(current.word)} className="mt-3 text-primary-500 text-sm hover:underline">🔊 Listen</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleAnswer(opt.id)}
            disabled={!!feedback}
            className="rounded-xl border-2 border-slate-200 bg-white py-4 px-3 font-bold text-slate-700 hover:border-primary-400 hover:bg-primary-50 transition disabled:opacity-60"
          >
            {opt.translation}
          </button>
        ))}
      </div>

      {result && (
        <GameResultModal reward={result.reward} score={result.score} correct={correct} total={round + 1} onPlayAgain={restart} />
      )}
    </div>
  );
}
