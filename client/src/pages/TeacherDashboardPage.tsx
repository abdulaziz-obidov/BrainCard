import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface ClassroomMember {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    xp: number;
    level: number;
    streak: { currentStreak: number } | null;
    _count: { gameSessions: number };
  };
}

interface Classroom {
  id: string;
  name: string;
  code: string;
  description: string | null;
  _count?: { members: number };
  members?: ClassroomMember[];
}

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: classrooms, isLoading: classesLoading } = useQuery({
    queryKey: ['teacher-classrooms'],
    queryFn: () => teacherApi.getClassrooms().then((r) => r.data as Classroom[]),
  });

  const { data: selectedClass, isLoading: detailsLoading } = useQuery({
    queryKey: ['teacher-classroom-details', selectedClassId],
    queryFn: () => teacherApi.getClassroomDetails(selectedClassId!).then((r) => r.data as Classroom),
    enabled: !!selectedClassId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => teacherApi.createClassroom(data.name, data.description),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Classroom created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['teacher-classrooms'] });
      setName('');
      setDescription('');
    },
    onError: (err: any) => setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create classroom' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teacherApi.deleteClassroom(id),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Classroom deleted' });
      queryClient.invalidateQueries({ queryKey: ['teacher-classrooms'] });
      setSelectedClassId(null);
    },
  });

  if (user?.role !== 'TEACHER') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>This page is for teachers only. Your role: {user?.role}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-primary-800 mb-2">Teacher Dashboard 👩‍🏫</h1>
      <p className="text-slate-500 mb-8">Manage your classes and students</p>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-center font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="game-card">
            <h2 className="font-bold border-b pb-2 mb-4">Create Classroom</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name, description }); }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Class Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
              />
              <input
                type="text"
                placeholder="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
              />
              <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
                Create
              </button>
            </form>
          </div>

          <div className="game-card">
            <h2 className="font-bold border-b pb-2 mb-4">My Classrooms</h2>
            {classesLoading ? (
              <div className="animate-pulse">Loading...</div>
            ) : classrooms?.length === 0 ? (
              <p className="text-sm text-slate-500">No classes yet.</p>
            ) : (
              <ul className="space-y-2">
                {classrooms?.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedClassId(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedClassId === c.id ? 'bg-primary-100 text-primary-700 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{c.name}</span>
                        <span className="text-xs bg-white px-2 py-1 rounded-full border">{c._count?.members ?? 0}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Main Panel */}
        <div className="md:col-span-2">
          {selectedClassId ? (
            detailsLoading ? (
              <div className="game-card animate-pulse text-center py-10">Loading class details...</div>
            ) : selectedClass ? (
              <div className="game-card">
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold font-display text-primary-800">{selectedClass.name}</h2>
                    <p className="text-slate-500 text-sm mt-1">{selectedClass.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Invite Code</p>
                    <div className="text-2xl font-bold tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                      {selectedClass.code}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Students ({selectedClass.members?.length ?? 0})</h3>
                  <button
                    onClick={() => { if(confirm('Delete this classroom?')) deleteMutation.mutate(selectedClass.id); }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete Class
                  </button>
                </div>

                {selectedClass.members?.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No students joined yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Share the code <b>{selectedClass.code}</b> with them.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="p-3 text-sm font-semibold text-slate-600">Student</th>
                          <th className="p-3 text-sm font-semibold text-slate-600">Level</th>
                          <th className="p-3 text-sm font-semibold text-slate-600">XP</th>
                          <th className="p-3 text-sm font-semibold text-slate-600">Games</th>
                          <th className="p-3 text-sm font-semibold text-slate-600">Streak</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClass.members?.map((m) => (
                          <tr key={m.id} className="border-b hover:bg-slate-50 transition">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{m.user.avatar ?? '🦊'}</span>
                                <span className="font-bold">{m.user.username}</span>
                              </div>
                            </td>
                            <td className="p-3 text-slate-600">{m.user.level}</td>
                            <td className="p-3 font-bold text-primary-600">{m.user.xp}</td>
                            <td className="p-3 text-slate-600">{m.user._count.gameSessions}</td>
                            <td className="p-3 text-orange-500 font-bold">{m.user.streak?.currentStreak ?? 0} 🔥</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null
          ) : (
            <div className="game-card text-center py-20 text-slate-500">
              <span className="text-6xl mb-4 block">🏫</span>
              <p>Select a classroom from the left or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
