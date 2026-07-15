import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/client';
import { speakWord } from './FlashCardView';
import type { Flashcard } from '../types';

export default function DailyChallengeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: () => contentApi.dailyChallenge().then((r) => r.data as Flashcard[]),
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-md text-center text-4xl animate-bounce">
          📅
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-md text-center">
          <p>No daily challenge available today.</p>
          <button onClick={onClose} className="btn-primary mt-4 w-full">Close</button>
        </div>
      </div>
    );
  }

  const isFinished = step >= cards.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold">
          ✕
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-display text-primary-800">Daily Words 📅</h2>
          <p className="text-sm text-slate-500">Learn {cards.length} new words today</p>
        </div>

        {!isFinished ? (
          <div className="text-center">
            <span className="text-xs font-bold text-primary-500 mb-2 block">
              Word {step + 1} of {cards.length}
            </span>
            <div className="game-card mb-4 bg-primary-50 border-primary-200">
              <div className="text-6xl mb-4">{cards[step].imageUrl ?? '📚'}</div>
              <h3 className="font-display text-3xl font-bold text-primary-800">{cards[step].word}</h3>
              <p className="text-lg text-slate-600 font-medium mt-1">{cards[step].translation}</p>
              {cards[step].exampleSentence && (
                <p className="text-xs text-slate-500 mt-3 italic">"{cards[step].exampleSentence}"</p>
              )}
              <button onClick={() => speakWord(cards[step].word)} className="mt-4 text-primary-500 text-sm hover:underline">
                🔊 Listen
              </button>
            </div>
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary w-full py-3 text-lg">
              Next Word →
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <span className="text-6xl mb-4 block">🎉</span>
            <h3 className="font-display text-2xl font-bold text-green-600 mb-2">Challenge Complete!</h3>
            <p className="text-slate-600 mb-6">You've reviewed today's words. Great job!</p>
            <button onClick={onClose} className="btn-primary w-full">
              Awesome!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
