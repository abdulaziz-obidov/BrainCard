import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface ChildUser {
  id: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  coins: number;
  streak: { currentStreak: number; longestStreak: number } | null;
  _count: { gameSessions: number };
}

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [childUsername, setChildUsername] = useState('');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: children, isLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => parentApi.getChildren().then((r) => r.data as ChildUser[]),
  });

  const { data: childStats } = useQuery({
    queryKey: ['child-stats', selectedChild],
    queryFn: () => parentApi.getChildStats(selectedChild!).then((r) => r.data),
    enabled: !!selectedChild,
  });

  const linkMutation = useMutation({
    mutationFn: (username: string) => parentApi.linkChild(username),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Child linked successfully!' });
      queryClient.invalidateQueries({ queryKey: ['parent-children'] });
      setChildUsername('');
    },
    onError: (err: any) => setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to link child' }),
  });

  const unlinkMutation = useMutation({
    mutationFn: (childId: string) => parentApi.unlinkChild(childId),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Child unlinked' });
      queryClient.invalidateQueries({ queryKey: ['parent-children'] });
      setSelectedChild(null);
    },
  });

  if (user?.role !== 'PARENT') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>This page is for parents only. Your role: {user?.role}</p>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center py-20 text-4xl animate-bounce">👨‍👩‍👧</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Parent Dashboard 👨‍👩‍👧</h1>
      <p className="text-slate-500 mb-8">Monitor your children's learning progress</p>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-center font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Link Child */}
      <div className="game-card mb-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Link a Child</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); if (childUsername.trim()) linkMutation.mutate(childUsername.trim()); }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={childUsername}
            onChange={(e) => setChildUsername(e.target.value)}
            className="input-field flex-1"
            placeholder="Child's username..."
          />
          <button type="submit" disabled={linkMutation.isPending} className="btn-primary px-6">
            {linkMutation.isPending ? '...' : 'Link'}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-2">Enter your child's BrainCards username to see their progress.</p>
      </div>

      {/* Children list */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {children?.map((child) => (
          <div
            key={child.id}
            onClick={() => setSelectedChild(child.id)}
            className={`game-card cursor-pointer transition hover:shadow-lg ${selectedChild === child.id ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{child.avatar ?? '🦊'}</span>
              <div>
                <h3 className="font-bold text-primary-700">{child.username}</h3>
                <p className="text-xs text-slate-500">Level {child.level}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-primary-50 p-2">
                <div className="font-bold text-primary-600">{child.xp}</div>
                <div className="text-[10px] text-slate-500">XP</div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-2">
                <div className="font-bold text-yellow-600">{child.coins}</div>
                <div className="text-[10px] text-slate-500">Coins</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-2">
                <div className="font-bold text-orange-600">{child.streak?.currentStreak ?? 0}</div>
                <div className="text-[10px] text-slate-500">Streak</div>
              </div>
              <div className="rounded-lg bg-green-50 p-2">
                <div className="font-bold text-green-600">{child._count.gameSessions}</div>
                <div className="text-[10px] text-slate-500">Games</div>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm('Unlink this child?')) unlinkMutation.mutate(child.id); }}
              className="mt-3 text-xs text-red-500 hover:underline"
            >
              Unlink
            </button>
          </div>
        ))}
        {children?.length === 0 && (
          <div className="game-card text-center col-span-2 py-10">
            <span className="text-4xl">👶</span>
            <p className="mt-2 text-slate-500">No children linked yet. Add your child's username above.</p>
          </div>
        )}
      </div>

      {/* Child Stats */}
      {selectedChild && childStats && (
        <div className="game-card">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            {childStats.user?.username}'s Detailed Stats 📊
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center rounded-xl bg-primary-50 p-3">
              <div className="text-2xl font-bold text-primary-600">{childStats.stats?.gamesPlayed ?? 0}</div>
              <div className="text-xs text-slate-500">Games Played</div>
            </div>
            <div className="text-center rounded-xl bg-green-50 p-3">
              <div className="text-2xl font-bold text-green-600">{childStats.stats?.accuracy ?? 0}%</div>
              <div className="text-xs text-slate-500">Accuracy</div>
            </div>
            <div className="text-center rounded-xl bg-blue-50 p-3">
              <div className="text-2xl font-bold text-blue-600">{Math.floor((childStats.stats?.studyTimeSec ?? 0) / 60)}m</div>
              <div className="text-xs text-slate-500">Study Time</div>
            </div>
            <div className="text-center rounded-xl bg-yellow-50 p-3">
              <div className="text-2xl font-bold text-yellow-600">{childStats.stats?.bestScore ?? 0}</div>
              <div className="text-xs text-slate-500">Best Score</div>
            </div>
          </div>

          {childStats.recentSessions && childStats.recentSessions.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">Recent Sessions</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {childStats.recentSessions.slice(0, 10).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg px-3 py-2">
                    <span className="font-medium">{s.gameType.replace(/_/g, ' ')}</span>
                    <span>{s.correctAnswers}/{s.totalQuestions} · +{s.xpEarned}XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
