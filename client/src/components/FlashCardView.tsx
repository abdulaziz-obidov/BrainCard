import { motion } from 'framer-motion';
import type { Flashcard } from '../types';

interface Props {
  card: Flashcard;
  flipped?: boolean;
  onFlip?: () => void;
  compact?: boolean;
}

const difficultyColors = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

export default function FlashCardView({ card, flipped = false, onFlip, compact = false }: Props) {
  return (
    <motion.div
      className={`relative cursor-pointer ${compact ? 'h-48' : 'h-72'} w-full max-w-sm`}
      onClick={onFlip}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-white border-2 border-primary-200 p-6 flex flex-col items-center justify-center text-center"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        style={{ backfaceVisibility: 'hidden', boxShadow: '0 4px 20px -2px rgb(99 102 241 / 0.15)' }}
      >
        {!flipped ? (
          <>
            <span className="text-6xl mb-4">{card.imageUrl ?? '📚'}</span>
            <h3 className="font-display text-3xl font-bold text-primary-700">{card.word}</h3>
            <span className={`mt-2 rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[card.difficulty]}`}>
              {card.difficulty}
            </span>
            {card.category && (
              <p className="mt-2 text-sm text-slate-500">{card.category.icon} {card.category.name}</p>
            )}
            <p className="mt-4 text-xs text-primary-400">Tap to flip</p>
          </>
        ) : (
          <div style={{ transform: 'rotateY(180deg)' }}>
            <p className="text-2xl font-bold text-slate-800">{card.translation}</p>
            {card.pronunciation && (
              <p className="mt-2 text-primary-500 font-mono">{card.pronunciation}</p>
            )}
            {card.exampleSentence && (
              <p className="mt-4 text-sm text-slate-600 italic">"{card.exampleSentence}"</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function speakWord(word: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  }
}
