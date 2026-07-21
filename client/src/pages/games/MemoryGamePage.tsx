import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { shuffle, useGameTimer } from '../../components/GameResultModal';
import type { Flashcard, GameReward } from '../../types';

interface Card {
  id: string;
  pairId: string;
  content: string;
  type: 'word' | 'image';
  matched: boolean;
  flipped: boolean;
}

export default function MemoryGamePage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const getDuration = useGameTimer();
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ reward: GameReward; score: number } | null>(null);
  const [lock, setLock] = useState(false);

  const { data: flashcards, isLoading } = useQuery({
    queryKey: ['game-cards-memory'],
    queryFn: () => contentApi.gameCards(undefined, 6).then((r) => r.data as Flashcard[]),
  });

  useEffect(() => {
    if (flashcards?.length) initGame(flashcards);
  }, [flashcards]);

  const initGame = (items: Flashcard[]) => {
    const pairs = items.slice(0, 6);
    const deck: Card[] = [];
    pairs.forEach((fc) => {
      deck.push({ id: `${fc.id}-w`, pairId: fc.id, content: fc.word, type: 'word', matched: false, flipped: false });
      deck.push({ id: `${fc.id}-i`, pairId: fc.id, content: fc.imageUrl ?? '📚', type: 'image', matched: false, flipped: false });
    });
    setCards(shuffle(deck));
    setSelected([]);
    setMoves(0);
    setFinished(false);
    setResult(null);
  };

  const handleClick = (id: string) => {
    if (lock || finished) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.matched || card.flipped) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
    const newSelected = [...selected, id];
    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
      const [a, b] = newSelected.map((sid) => newCards.find((c) => c.id === sid)!);
      if (a.pairId === b.pairId) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.pairId === a.pairId ? { ...c, matched: true, flipped: true } : c)),
          );
          setSelected([]);
          setLock(false);
          const allMatched = newCards.every((c) => c.pairId === a.pairId || c.matched);
          if (allMatched || newCards.filter((c) => !c.matched).length <= 2) {
            checkFinish(newCards.map((c) => (c.pairId === a.pairId ? { ...c, matched: true } : c)), moves + 1);
          }
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => (newSelected.includes(c.id) ? { ...c, flipped: false } : c)));
          setSelected([]);
          setLock(false);
        }, 800);
      }
    }
  };

  const checkFinish = async (currentCards: Card[], totalMoves: number) => {
    if (!currentCards.every((c) => c.matched)) return;
    setFinished(true);
    const pairs = flashcards?.length ?? 6;
    const score = Math.max(0, pairs * 100 - totalMoves * 10);
    const durationSec = getDuration();

    if (isAuthenticated) {
      try {
        const { data } = await contentApi.submitGame({
          gameType: 'MEMORY_MATCH',
          score,
          correctAnswers: pairs,
          totalQuestions: pairs,
          durationSec,
        });
        setResult({ reward: data.reward, score });
        await refreshUser();
      } catch {
        setResult({ reward: { xpEarned: pairs * 10, coinsEarned: pairs, isPerfect: true }, score });
      }
    } else {
      setResult({ reward: { xpEarned: pairs * 10, coinsEarned: 0, isPerfect: true }, score });
    }
  };

  useEffect(() => {
    if (cards.length && cards.every((c) => c.matched) && !finished) {
      checkFinish(cards, moves);
    }
  }, [cards]);

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-bounce">🧩</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-primary-600 text-sm hover:underline">← Games</Link>
        <span className="font-bold text-primary-700">Moves: {moves}</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-center mb-6">🧩 Memory Match</h1>

      {!isAuthenticated && (
        <p className="text-center text-sm text-orange-600 mb-4">Guest mode — <Link to="/register" className="underline">Sign up</Link> to save XP!</p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`aspect-square rounded-xl border-2 text-lg font-bold transition-all duration-300 ${
              card.flipped || card.matched
                ? 'border-primary-300 bg-white scale-100'
                : 'border-primary-400 bg-primary-500 text-white hover:bg-primary-600'
            } ${card.matched ? 'opacity-60' : ''}`}
          >
            {(card.flipped || card.matched) ? (
              card.type === 'image' ? <span className="text-3xl">{card.content}</span> : <span className="text-sm px-1">{card.content}</span>
            ) : '?'}
          </button>
        ))}
      </div>

      {result && (
        <GameResultModal
          reward={result.reward}
          score={result.score}
          correct={6}
          total={6}
          onPlayAgain={() => flashcards && initGame(flashcards)}
        />
      )}
    </div>
  );
}
