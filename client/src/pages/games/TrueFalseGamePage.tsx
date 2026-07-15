import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import GameResultModal, { shuffle, useGameTimer } from '../../components/GameResultModal';
import { speakWord } from '../../components/FlashCardView';
import type { Flashcard, GameReward } from '../../types';

interface TFQuestion {
  flashcard: Flashcard;
  shownTranslation: string;
  isCorrect: boolean;
}

function generateQuestions(cards: Flashcard[]): TFQuestion[] {
  const questions: TFQuestion[] = [];
  const shuffled = shuffle([...cards]);

  shuffled.forEach((fc, i) => {
    const correct = Math.random() > 0.5;
    if (correct) {
      questions.push({ flashcard: fc, shownTranslation: fc.translation, isCorrect: true });
    } else {
      const others = shuffled.filter((_, idx) => idx !== i);
      const wrong = others[Math.floor(Math.random() * others.length)];
      questions.push({ flashcard: fc, shownTranslation: wrong?.translation ?? '???', isCorrect: false });
    }
  });

  return questions;
}

export default function TrueFalseGamePage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const getDuration = useGameTimer();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ reward: GameReward; score: number } | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [questions, setQuestions] = useState<TFQuestion[]>([]);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['game-cards-tf'],
    queryFn: () => contentApi.gameCards({ count: 10 }).then((r) => r.data as Flashcard[]),
  });

  useEffect(() => {
    if (cards?.length) setQuestions(generateQuestions(cards));
  }, [cards]);

  const totalRounds = questions.length;
  const current = questions[round];

  const handleAnswer = async (userSaidTrue: boolean) => {
    if (finished || !current) return;
    const isCorrect = userSaidTrue === current.isCorrect;
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
              gameType: 'TRUE_FALSE',
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
    }, 700);
  };

  const restart = () => {
    if (cards?.length) setQuestions(generateQuestions(cards));
    setRound(0);
    setCorrect(0);
    setCombo(0);
    setMaxCombo(0);
    setFinished(false);
    setResult(null);
  };

  if (isLoading || !current) return <div className="flex justify-center py-20 text-4xl animate-bounce">✅</div>;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/games" className="text-primary-600 text-sm hover:underline">← Games</Link>
        <span className="text-sm font-bold text-primary-700">Q {round + 1}/{totalRounds} · ✅ {correct}</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-center mb-6">✅ True or False</h1>

      {!isAuthenticated && (
        <p className="text-center text-sm text-orange-600 mb-4">Guest mode — <Link to="/register" className="underline">Sign up</Link> to save XP!</p>
      )}

      <div className={`game-card text-center mb-6 transition ${feedback === 'correct' ? 'ring-4 ring-green-400' : feedback === 'wrong' ? 'ring-4 ring-red-400' : ''}`}>
        <div className="text-6xl mb-4">{current.flashcard.imageUrl ?? '📚'}</div>
        <h2 className="font-display text-3xl font-bold text-primary-700 mb-2">{current.flashcard.word}</h2>
        <button onClick={() => speakWord(current.flashcard.word)} className="text-primary-500 text-sm hover:underline mb-4">🔊 Listen</button>
        <div className="border-t border-slate-200 pt-4 mt-4">
          <p className="text-slate-500 text-sm mb-1">Does this mean…</p>
          <p className="text-2xl font-bold text-slate-800">{current.shownTranslation}</p>
        </div>
      </div>

      {combo > 1 && <div className="text-center text-sm font-bold text-orange-500 mb-3">🔥 Combo x{combo}!</div>}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={!!feedback}
          className="rounded-xl border-2 border-green-300 bg-green-50 py-6 text-2xl font-bold text-green-700 hover:bg-green-100 transition disabled:opacity-60"
        >
          ✅ True
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={!!feedback}
          className="rounded-xl border-2 border-red-300 bg-red-50 py-6 text-2xl font-bold text-red-700 hover:bg-red-100 transition disabled:opacity-60"
        >
          ❌ False
        </button>
      </div>

      {result && (
        <GameResultModal reward={result.reward} score={result.score} correct={correct} total={totalRounds} onPlayAgain={restart} />
      )}
    </div>
  );
}
