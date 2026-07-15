import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/client';
import FlashCardView, { speakWord } from '../components/FlashCardView';
import type { Category, Flashcard } from '../types';

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const { data: category, isLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => contentApi.category(slug!).then((r) => r.data as Category),
    enabled: !!slug,
  });

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-bounce">📚</div>;
  if (!category) return <div className="text-center py-20">Category not found</div>;

  const cards = category.flashcards ?? [];
  const current = cards[index] as Flashcard | undefined;

  const next = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  };
  const prev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/categories" className="text-primary-600 hover:underline text-sm">← Categories</Link>
        <span className="text-3xl">{category.icon}</span>
        <h1 className="font-display text-2xl font-bold">{category.name}</h1>
      </div>

      {cards.length === 0 ? (
        <p className="text-center text-slate-500">No flashcards in this category yet.</p>
      ) : current ? (
        <div className="flex flex-col items-center">
          <p className="text-sm text-slate-500 mb-4">Card {index + 1} of {cards.length}</p>
          <FlashCardView card={current} flipped={flipped} onFlip={() => setFlipped(!flipped)} />
          <div className="mt-6 flex gap-3">
            <button onClick={prev} className="btn-secondary">← Prev</button>
            <button onClick={() => speakWord(current.word)} className="btn-secondary">🔊 Listen</button>
            <button onClick={() => setFlipped(!flipped)} className="btn-primary">Flip</button>
            <button onClick={next} className="btn-secondary">Next →</button>
          </div>
          <Link
            to={`/games/image-quiz?categoryId=${category.id}`}
            className="btn-primary mt-8"
          >
            Play Quiz with these cards 🎮
          </Link>
        </div>
      ) : null}
    </div>
  );
}
