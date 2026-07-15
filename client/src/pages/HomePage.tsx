import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const features = [
  { icon: '🎮', title: 'Fun Games', desc: 'Memory, Quiz, Spelling & more' },
  { icon: '📚', title: 'Flashcards', desc: 'Learn words with images & audio' },
  { icon: '🏆', title: 'Earn Rewards', desc: 'XP, levels, coins & achievements' },
  { icon: '🔥', title: 'Daily Streak', desc: 'Learn every day, grow your streak' },
];

const games = [
  { to: '/games/memory', icon: '🧩', name: 'Memory Match', color: 'from-purple-400 to-indigo-500' },
  { to: '/games/image-quiz', icon: '🖼️', name: 'Image Quiz', color: 'from-blue-400 to-cyan-500' },
  { to: '/games/word-quiz', icon: '📝', name: 'Word Quiz', color: 'from-green-400 to-emerald-500' },
  { to: '/games/spelling', icon: '✏️', name: 'Spelling', color: 'from-orange-400 to-red-500' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-4 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🍎</div>
          <div className="absolute top-32 right-20 text-6xl">🐶</div>
          <div className="absolute bottom-10 left-1/3 text-7xl">⭐</div>
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl font-black md:text-6xl"
          >
            Learn. Play. Remember.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-primary-100"
          >
            The fun way for kids to learn English through games and flashcards
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            {isAuthenticated ? (
              <>
                <Link to="/games" className="rounded-xl bg-white px-8 py-3 font-bold text-primary-600 hover:bg-primary-50">
                  Play Now 🎮
                </Link>
                <Link to="/categories" className="rounded-xl border-2 border-white/50 px-8 py-3 font-bold hover:bg-white/10">
                  Browse Cards 📚
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="rounded-xl bg-white px-8 py-3 font-bold text-primary-600 hover:bg-primary-50">
                  Start Free 🚀
                </Link>
                <Link to="/categories" className="rounded-xl border-2 border-white/50 px-8 py-3 font-bold hover:bg-white/10">
                  Try Demo 👀
                </Link>
              </>
            )}
          </motion.div>
          {isAuthenticated && user && (
            <p className="mt-6 text-primary-200">
              Welcome back, {user.avatar} {user.username}! Level {user.level} · {user.xp} XP
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-10">Why BrainCards?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="game-card text-center"
            >
              <span className="text-4xl">{f.icon}</span>
              <h3 className="mt-3 font-display font-bold text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-primary-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-bold text-center text-primary-800 mb-10">Popular Games</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((g) => (
              <Link key={g.to} to={g.to} className="group">
                <div className={`rounded-2xl bg-gradient-to-br ${g.color} p-6 text-white text-center transition group-hover:scale-105`}>
                  <span className="text-4xl">{g.icon}</span>
                  <h3 className="mt-2 font-display font-bold">{g.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
