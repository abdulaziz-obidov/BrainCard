import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('student@braincards.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md game-card">
        <div className="text-center mb-8">
          <span className="text-5xl">🧠</span>
          <h1 className="mt-2 font-display text-2xl font-bold text-primary-700">Welcome Back!</h1>
          <p className="text-slate-500">Sign in to continue learning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account? <Link to="/register" className="font-semibold text-primary-600 hover:underline">Sign up free</Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">Demo: student@braincards.app / password123</p>
      </div>
    </div>
  );
}
