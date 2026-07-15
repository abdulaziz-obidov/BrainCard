import { Link } from 'react-router-dom';

const games: Array<{
  to: string;
  icon: string;
  name: string;
  desc: string;
  color: string;
  soon?: boolean;
}> = [
  {
    to: '/games/memory',
    icon: '🧩',
    name: 'Memory Match',
    desc: 'Find matching pairs of words and images',
    color: 'border-purple-200 hover:border-purple-400 bg-purple-50',
  },
  {
    to: '/games/image-quiz',
    icon: '🖼️',
    name: 'Image Quiz',
    desc: 'Choose the correct image for each word',
    color: 'border-blue-200 hover:border-blue-400 bg-blue-50',
  },
  {
    to: '/games/word-quiz',
    icon: '📝',
    name: 'Word Quiz',
    desc: 'Pick the correct word for each image',
    color: 'border-green-200 hover:border-green-400 bg-green-50',
  },
  {
    to: '/games/spelling',
    icon: '✏️',
    name: 'Spelling Challenge',
    desc: 'Type the correct spelling',
    color: 'border-orange-200 hover:border-orange-400 bg-orange-50',
  },
  {
    to: '/games/true-false',
    icon: '✅',
    name: 'True or False',
    desc: 'Decide if the statement is correct',
    color: 'border-teal-200 hover:border-teal-400 bg-teal-50',
  },
  {
    to: '/games/survival',
    icon: '💀',
    name: 'Survival Mode',
    desc: 'Keep going until your first mistake',
    color: 'border-red-200 hover:border-red-400 bg-red-50',
  },
];

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Games 🎮</h1>
      <p className="text-slate-500 mb-8">Pick a game and start earning XP!</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <Link
            key={g.name}
            to={g.soon ? '#' : g.to}
            className={`game-card border-2 ${g.color} ${g.soon ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <span className="text-4xl">{g.icon}</span>
            <h3 className="mt-3 font-display font-bold text-lg">{g.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{g.desc}</p>
            {g.soon && <span className="mt-2 inline-block text-xs font-bold text-slate-400">Coming Soon</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
