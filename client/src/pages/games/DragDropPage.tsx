import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { useGameTimer, shuffle } from '../../components/GameResultModal';
import type { Flashcard, GameReward } from '../../types';

interface DropTarget {
  card: Flashcard;
  matched: boolean;
  wrong: boolean;
}

interface DragWord {
  word: string;
  cardId: string;
  placed: boolean;
}

export default function DragDropPage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const [started, setStarted] = useState(false);
  const [targets, setTargets] = useState<DropTarget[]>([]);
  const [words, setWords] = useState<DragWord[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [result, setResult] = useState<GameReward | null>(null);
  const [getElapsed] = useState(() => useGameTimer());
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const touchWordRef = useRef<string | null>(null);

  const { data } = useQuery({
    queryKey: ['game-cards', 'dragdrop'],
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
    const picked = shuffle(data as Flashcard[]).slice(0, 6);
    setTargets(picked.map((c) => ({ card: c, matched: false, wrong: false })));
    setWords(shuffle(picked.map((c) => ({ word: c.word, cardId: c.id, placed: false }))));
    setScore(0);
    setCorrect(0);
    setTotal(picked.length);
    setResult(null);
    setStarted(true);
  }, [data]);

  const checkDrop = useCallback((wordCardId: string, targetCardId: string) => {
    const isCorrect = wordCardId === targetCardId;

    setTargets((prev) =>
      prev.map((t) =>
        t.card.id === targetCardId ? { ...t, matched: isCorrect, wrong: !isCorrect } : t
      )
    );

    if (isCorrect) {
      setWords((prev) => prev.map((w) => (w.cardId === wordCardId ? { ...w, placed: true } : w)));
      setCorrect((c) => c + 1);
      setScore((s) => s + 15);
    } else {
      setTimeout(() => {
        setTargets((prev) =>
          prev.map((t) => (t.card.id === targetCardId ? { ...t, wrong: false } : t))
        );
      }, 600);
    }
  }, []);

  // Check game completion
  const matchedCount = targets.filter((t) => t.matched).length;
  const allDone = matchedCount === total && total > 0;

  if (allDone && !result && isAuthenticated && !submit.isPending) {
    submit.mutate({
      gameType: 'DRAG_DROP',
      score,
      correctAnswers: correct,
      totalQuestions: total,
      durationSec: getElapsed(),
    });
  }

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId);
    setDragging(cardId);
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    const wordCardId = e.dataTransfer.getData('cardId');
    setHoveredTarget(null);
    setDragging(null);
    if (wordCardId) checkDrop(wordCardId, targetCardId);
  };

  const handleTouchWord = (cardId: string) => {
    touchWordRef.current = touchWordRef.current === cardId ? null : cardId;
    setDragging(touchWordRef.current);
  };

  const handleTouchTarget = (targetCardId: string) => {
    if (touchWordRef.current) {
      checkDrop(touchWordRef.current, targetCardId);
      touchWordRef.current = null;
      setDragging(null);
    }
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="game-card">
          <span className="text-6xl block mb-4">🖱️</span>
          <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Drag & Drop</h1>
          <p className="text-slate-500 mb-6">Drag each word to its matching translation 🎯</p>
          <button onClick={startGame} disabled={!data} className="btn-primary text-lg px-8 py-3">
            {data ? 'Start Game 🚀' : 'Loading...'}
          </button>
          <Link to="/games" className="block mt-4 text-sm text-primary-500 hover:underline">← Back to Games</Link>
        </div>
      </div>
    );
  }

  if (result) {
    return <GameResultModal reward={result} score={score} correct={correct} total={total} onPlayAgain={startGame} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-slate-400 hover:text-slate-600">← Back</Link>
        <div className="text-sm font-medium text-slate-500">{matchedCount} / {total} matched</div>
        <div className="text-sm font-bold text-primary-600">Score: {score}</div>
      </div>
      <div className="h-2 rounded-full bg-slate-200 mb-8 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" style={{ width: `${(matchedCount / total) * 100}%` }} />
      </div>
      <p className="text-center text-slate-400 text-sm mb-6">
        {window.matchMedia('(pointer: fine)').matches ? 'Drag words to matching translations' : 'Tap a word, then tap its match'}
      </p>
      {/* Drop Targets */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {targets.map((t) => {
          let cls = 'game-card border-2 text-center min-h-[100px] flex flex-col items-center justify-center transition-all';
          if (t.matched) cls += ' border-green-400 bg-green-50';
          else if (t.wrong) cls += ' border-red-400 bg-red-50 animate-pulse';
          else if (hoveredTarget === t.card.id) cls += ' border-primary-400 bg-primary-50 scale-105';
          else cls += ' border-dashed border-slate-300';
          return (
            <div key={t.card.id} className={cls}
              onDragOver={(e) => { if (!t.matched) { e.preventDefault(); setHoveredTarget(t.card.id); } }}
              onDragLeave={() => setHoveredTarget(null)}
              onDrop={(e) => !t.matched && handleDrop(e, t.card.id)}
              onClick={() => !t.matched && handleTouchTarget(t.card.id)}
            >
              <span className="text-3xl mb-1">{t.card.imageUrl ?? '📚'}</span>
              <p className="font-bold text-slate-700">{t.card.translation}</p>
              {t.matched && <p className="text-xs text-green-600 font-medium mt-1">✅ {t.card.word}</p>}
            </div>
          );
        })}
      </div>
      {/* Draggable Words */}
      <div className="flex flex-wrap justify-center gap-3">
        {words.filter((w) => !w.placed).map((w) => (
          <div key={w.cardId} draggable
            onDragStart={(e) => handleDragStart(e, w.cardId)}
            onDragEnd={() => { setDragging(null); setHoveredTarget(null); }}
            onClick={() => handleTouchWord(w.cardId)}
            className={`game-card border-2 cursor-grab active:cursor-grabbing px-5 py-3 font-bold text-primary-700 transition-all select-none ${
              dragging === w.cardId ? 'border-primary-500 bg-primary-100 scale-110 shadow-lg' : 'border-primary-200 hover:border-primary-400'
            }`}
          >
            {w.word}
          </div>
        ))}
      </div>
    </div>
  );
}
