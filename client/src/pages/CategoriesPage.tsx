import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { contentApi } from '../api/client';
import type { Category } from '../types';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => contentApi.categories().then((r) => r.data as Category[]),
  });

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-bounce">📚</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Categories</h1>
      <p className="text-slate-500 mb-8">Choose a topic to explore flashcards</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories?.map((cat) => (
          <Link key={cat.id} to={`/categories/${cat.slug}`} className="game-card group">
            <div className="text-4xl mb-3">{cat.icon}</div>
            <h3 className="font-display font-bold text-lg group-hover:text-primary-600">{cat.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{cat._count?.flashcards ?? 0} cards</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
