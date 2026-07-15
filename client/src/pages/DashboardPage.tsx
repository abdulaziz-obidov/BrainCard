import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { contentApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import XPBar from '../components/XPBar';
import DailyChallengeModal from '../components/DailyChallengeModal';
export default function DashboardPage() {
  const { user } = useAuth();
  const [showDaily, setShowDaily] = useState(false);
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => contentApi.stats().then((r) => r.data),
  });

  if (isLoading || !user) {
    return <div className="flex justify-center py-20 text-4xl animate-bounce">🧠</div>;
  }

  const s = stats?.stats;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      
      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl">{user.avatar ?? '🦊'}</span>
        <div>
          <h1 className="font-display text-3xl font-bold text-primary-800">Hi, {user.username}! 👋</h1>
          <p className="text-slate-500">Ready to learn something new today?</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="game-card lg:col-span-2">
          <XPBar xp={user.xp} level={user.level} />
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-primary-50 p-3">
              <div className="text-2xl font-bold text-primary-600">{user.coins}</div>
              <div className="text-xs text-slate-500">Coins 🪙</div>
            </div>
            <div className="rounded-xl bg-orange-50 p-3">
              <div className="text-2xl font-bold text-orange-600">{stats?.streak?.currentStreak ?? 0}</div>
              <div className="text-xs text-slate-500">Day Streak 🔥</div>
            </div>
            <div className="rounded-xl bg-green-50 p-3">
              <div className="text-2xl font-bold text-green-600">{s?.accuracy ?? 0}%</div>
              <div className="text-xs text-slate-500">Accuracy 🎯</div>
            </div>
          </div>
        </div>

        <div className="game-card">
          <h2 className="font-display font-bold text-lg mb-4">Quick Play</h2>
          <div className="space-y-2">
            <button onClick={() => setShowDaily(true)} className="block w-full text-left rounded-xl bg-yellow-100 px-4 py-3 font-medium text-yellow-800 hover:bg-yellow-200">
              📅 Daily Challenge
            </button>
            <Link to="/games/memory" className="block rounded-xl bg-purple-100 px-4 py-3 font-medium text-purple-700 hover:bg-purple-200">🧩 Memory Match</Link>
            <Link to="/games/image-quiz" className="block rounded-xl bg-blue-100 px-4 py-3 font-medium text-blue-700 hover:bg-blue-200">🖼️ Image Quiz</Link>
            <Link to="/games/spelling" className="block rounded-xl bg-orange-100 px-4 py-3 font-medium text-orange-700 hover:bg-orange-200">✏️ Spelling</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: 'Games Played', value: s?.gamesPlayed ?? 0, icon: '🎮' },
          { label: 'Correct Answers', value: s?.correctAnswers ?? 0, icon: '✅' },
          { label: 'Study Time', value: `${Math.floor((s?.studyTimeSec ?? 0) / 60)}m`, icon: '⏱️' },
          { label: 'Best Score', value: s?.bestScore ?? 0, icon: '🏆' },
        ].map((item) => (
          <div key={item.label} className="game-card text-center">
            <span className="text-2xl">{item.icon}</span>
            <div className="mt-2 text-2xl font-bold text-primary-700">{item.value}</div>
            <div className="text-sm text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>

      {stats?.achievements && stats.achievements.length > 0 && (
        <div className="game-card">
          <h2 className="font-display font-bold text-lg mb-4">Achievements 🏅</h2>
          <div className="flex flex-wrap gap-3">
            {stats.achievements.map((ua: { achievement: { icon: string; name: string }; unlockedAt: string }) => (
              <div key={ua.achievement.name} className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-2 text-center">
                <span className="text-2xl">{ua.achievement.icon}</span>
                <p className="text-xs font-medium mt-1">{ua.achievement.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDaily && <DailyChallengeModal onClose={() => setShowDaily(false)} />}
    </div>
  );
}
