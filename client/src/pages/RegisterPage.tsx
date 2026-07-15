import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const avatars = ['🦊', '🐱', '🐶', '🐼', '🦁', '🐸', '🦄', '🐰'];

export default function RegisterPage() {
  const [form, setForm] = useState<{ email: string; username: string; password: string; age: number; avatar: string; role: 'STUDENT' | 'PARENT' | 'TEACHER' }>({ email: '', username: '', password: '', age: 8, avatar: '🦊', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ email: form.email, username: form.username, password: form.password, age: form.age, role: form.role });
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md game-card">
        <div className="text-center mb-8">
          <span className="text-5xl">🚀</span>
          <h1 className="mt-2 font-display text-2xl font-bold text-primary-700">Join BrainCards!</h1>
          <p className="text-slate-500">Start your learning adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Choose Avatar</label>
            <div className="flex flex-wrap gap-2">
              {avatars.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setForm({ ...form, avatar: a })}
                  className={`text-2xl rounded-xl p-2 border-2 ${form.avatar === a ? 'border-primary-500 bg-primary-50' : 'border-slate-200'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">I am a...</label>
            <div className="flex gap-2">
              {(['STUDENT', 'PARENT', 'TEACHER'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition ${form.role === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-field"
              minLength={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              min={3}
              max={80}
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field"
              minLength={6}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
