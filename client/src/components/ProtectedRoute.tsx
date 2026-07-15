import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-4xl animate-bounce">🧠</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
