import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; age?: number; role?: 'STUDENT' | 'PARENT' | 'TEACHER' }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authApi
        .me()
        .then(({ data }) => {
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        })
        .catch(() => {
          localStorage.clear();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistAuth = (data: { user: User; accessToken: string; refreshToken: string }) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    persistAuth(data);
  };

  const register = async (data: { email: string; username: string; password: string; age?: number; role?: 'STUDENT' | 'PARENT' | 'TEACHER' }) => {
    const { data: res } = await authApi.register(data);
    persistAuth(res);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore
      }
    }
    localStorage.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await authApi.me();
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
