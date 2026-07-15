import { useQuery } from '@tanstack/react-query';
import { contentApi, authApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import XPBar from '../components/XPBar';
import type { LeaderboardEntry } from '../types';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data: board, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => contentApi.leaderboard(20).then((r) => r.data as LeaderboardEntry[]),
  });

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-bounce">🏆</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Leaderboard 🏆</h1>
      <p className="text-slate-500 mb-8">Top learners this week</p>

      <div className="space-y-2">
        {board?.map((entry, i) => {
          const isMe = user?.id === entry.id;
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <div
              key={entry.id}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 ${
                isMe ? 'bg-primary-100 border-2 border-primary-400' : 'bg-white border border-slate-200'
              }`}
            >
              <span className="w-8 text-center font-bold text-lg">{i < 3 ? medals[i] : `#${i + 1}`}</span>
              <span className="text-2xl">{entry.avatar ?? '🦊'}</span>
              <div className="flex-1">
                <div className="font-bold">{entry.username}{isMe && ' (You)'}</div>
                <div className="text-xs text-slate-500">Level {entry.level} · {entry.country ?? '🌍'}</div>
              </div>
              <div className="font-bold text-primary-600">{entry.xp} XP</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const avatars = ['🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄', '🐰'];

  const updateAvatar = async (avatar: string) => {
    await authApi.updateMe({ avatar });
    await refreshUser();
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-primary-800 mb-8">Profile</h1>
      <div className="game-card">
        <div className="text-center mb-6">
          <span className="text-6xl">{user.avatar ?? '🦊'}</span>
          <h2 className="mt-2 font-display text-xl font-bold">{user.username}</h2>
          <p className="text-slate-500">{user.email}</p>
        </div>
        <XPBar xp={user.xp} level={user.level} />
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div className="rounded-xl bg-yellow-50 p-3">
            <div className="text-xl font-bold">{user.coins} 🪙</div>
            <div className="text-xs text-slate-500">Coins</div>
          </div>
          <div className="rounded-xl bg-primary-50 p-3">
            <div className="text-xl font-bold">{user.role}</div>
            <div className="text-xs text-slate-500">Role</div>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Change Avatar</p>
          <div className="flex flex-wrap gap-2">
            {avatars.map((a) => (
              <button
                key={a}
                onClick={() => updateAvatar(a)}
                className={`text-2xl rounded-xl p-2 border-2 ${user.avatar === a ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
