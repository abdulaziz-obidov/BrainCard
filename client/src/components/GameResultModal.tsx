import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { GameReward } from '../types';

interface Props {
  reward: GameReward;
  score: number;
  correct: number;
  total: number;
  onPlayAgain: () => void;
  playAgainLabel?: string;
}

export default function GameResultModal({ reward, score, correct, total, onPlayAgain, playAgainLabel = 'Play Again' }: Props) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center"
        style={{ boxShadow: '0 4px 20px -2px rgb(99 102 241 / 0.15)' }}
      >
        <span className="text-6xl">{reward.isPerfect ? '🌟' : accuracy >= 70 ? '🎉' : '💪'}</span>
        <h2 className="mt-4 font-display text-2xl font-bold text-primary-800">
          {reward.isPerfect ? 'Perfect Round!' : accuracy >= 70 ? 'Great Job!' : 'Keep Trying!'}
        </h2>
        <p className="mt-2 text-slate-500">{correct}/{total} correct ({accuracy}%)</p>
        <p className="mt-1 text-lg font-bold text-primary-600">Score: {score}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-primary-50 p-3">
            <div className="text-xl font-bold text-primary-600">+{reward.xpEarned} XP</div>
          </div>
          <div className="rounded-xl bg-yellow-50 p-3">
            <div className="text-xl font-bold text-yellow-600">+{reward.coinsEarned} 🪙</div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onPlayAgain} className="btn-primary flex-1">{playAgainLabel}</button>
          <Link to="/dashboard" className="btn-secondary flex-1">Dashboard</Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function useGameTimer() {
  const start = Date.now();
  return () => Math.floor((Date.now() - start) / 1000);
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function pickWrongOptions(correct: string, pool: string[], count = 3): string[] {
  const wrong = pool.filter((w) => w !== correct);
  return shuffle(wrong).slice(0, count);
}
