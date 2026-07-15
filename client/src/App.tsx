import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import GamesPage from './pages/GamesPage';
import MemoryGamePage from './pages/games/MemoryGamePage';
import ImageQuizPage from './pages/games/ImageQuizPage';
import WordQuizPage from './pages/games/WordQuizPage';
import SpellingGamePage from './pages/games/SpellingGamePage';
import TrueFalseGamePage from './pages/games/TrueFalseGamePage';
import SurvivalGamePage from './pages/games/SurvivalGamePage';
import LeaderboardPage, { ProfilePage } from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/:slug" element={<CategoryDetailPage />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="games/memory" element={<MemoryGamePage />} />
              <Route path="games/image-quiz" element={<ImageQuizPage />} />
              <Route path="games/word-quiz" element={<WordQuizPage />} />
              <Route path="games/spelling" element={<SpellingGamePage />} />
              <Route path="games/true-false" element={<TrueFalseGamePage />} />
              <Route path="games/survival" element={<SurvivalGamePage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="parent" element={<ProtectedRoute><ParentDashboardPage /></ProtectedRoute>} />
              <Route path="teacher" element={<ProtectedRoute><TeacherDashboardPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
