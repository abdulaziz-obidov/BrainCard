import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-3 text-base font-medium transition ${
    isActive ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
  }`;

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-primary-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="font-display text-xl font-extrabold text-primary-600">BrainCards</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/categories" className={navLinkClass}>Categories</NavLink>
            <NavLink to="/games" className={navLinkClass}>Games</NavLink>
            <NavLink to="/ai-tutor" className={navLinkClass}>AI Tutor</NavLink>
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
                <button onClick={() => logout()} className="btn-secondary text-sm py-2 px-3 hidden md:inline-flex">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-3 hidden md:inline-flex">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-3 hidden md:inline-flex">Sign Up</Link>
              </>
            )}

            {/* Hamburger button — mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-slate-600 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
            >
              <nav className="flex flex-col gap-1 p-4">
                <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>🏠 Home</NavLink>
                <NavLink to="/categories" className={mobileNavLinkClass} onClick={closeMenu}>📚 Categories</NavLink>
                <NavLink to="/games" className={mobileNavLinkClass} onClick={closeMenu}>🎮 Games</NavLink>
                <NavLink to="/ai-tutor" className={mobileNavLinkClass} onClick={closeMenu}>🤖 AI Tutor</NavLink>
                <NavLink to="/leaderboard" className={mobileNavLinkClass} onClick={closeMenu}>🏆 Leaderboard</NavLink>
                {isAuthenticated && (
                  <>
                    <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={closeMenu}>📊 Dashboard</NavLink>
                    <NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMenu}>👤 Profile</NavLink>
                    {user?.role === 'ADMIN' && (
                      <NavLink to="/admin" className={mobileNavLinkClass} onClick={closeMenu}>⚙️ Admin</NavLink>
                    )}
                    {user?.role === 'PARENT' && (
                      <NavLink to="/parent" className={mobileNavLinkClass} onClick={closeMenu}>👨‍👩‍👧 Parent Panel</NavLink>
                    )}
                    {user?.role === 'TEACHER' && (
                      <NavLink to="/teacher" className={mobileNavLinkClass} onClick={closeMenu}>👩‍🏫 Teacher Panel</NavLink>
                    )}
                  </>
                )}
                <div className="border-t border-slate-100 mt-2 pt-2">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 mb-2">
                        <span className="text-2xl">{user.avatar ?? '🦊'}</span>
                        <div>
                          <div className="font-bold text-primary-700">{user.username} · Lv.{user.level}</div>
                          <div className="text-sm text-primary-500">{user.xp} XP · 🪙{user.coins}</div>
                        </div>
                      </div>
                      <button onClick={() => { logout(); closeMenu(); }} className="btn-secondary w-full">
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Link to="/login" className="btn-secondary flex-1 text-center" onClick={closeMenu}>Login</Link>
                      <Link to="/register" className="btn-primary flex-1 text-center" onClick={closeMenu}>Sign Up</Link>
                    </div>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
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
