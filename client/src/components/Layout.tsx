import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-primary-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-display text-xl font-extrabold text-primary-600">BrainCards</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/categories" className={navLinkClass}>Categories</NavLink>
            <NavLink to="/games" className={navLinkClass}>Games</NavLink>
            <NavLink to="/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
                {user?.role === 'ADMIN' && (
                  <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
                )}
                {user?.role === 'PARENT' && (
                  <NavLink to="/parent" className={navLinkClass}>Parent Panel</NavLink>
                )}
                {user?.role === 'TEACHER' && (
                  <NavLink to="/teacher" className={navLinkClass}>Teacher Panel</NavLink>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden items-center gap-2 rounded-xl bg-primary-50 px-3 py-1.5 sm:flex">
                  <span className="text-lg">{user.avatar ?? '🦊'}</span>
                  <div className="text-xs">
                    <div className="font-bold text-primary-700">Lv.{user.level}</div>
                    <div className="text-primary-500">{user.xp} XP · 🪙{user.coins}</div>
                  </div>
                </div>
                <button onClick={() => logout()} className="btn-secondary text-sm py-2 px-3">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-3">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-3">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <p className="font-display font-bold text-primary-600">Learn. Play. Remember.</p>
        <p className="mt-1">© 2026 BrainCards — Educational platform for children</p>
      </footer>
    </div>
  );
}
