import axios from 'axios';
import type { AuthResponse, User } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post<Pick<AuthResponse, 'accessToken' | 'refreshToken'>>(
            '/api/v1/auth/refresh',
            { refreshToken },
          );
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (data: { email: string; username: string; password: string; age?: number; country?: string; role?: 'STUDENT' | 'PARENT' | 'TEACHER' }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get<User>('/auth/me'),
  updateMe: (data: Partial<Pick<User, 'username' | 'avatar' | 'country' | 'age'>>) =>
    api.patch<User>('/auth/me', data),
};

export const contentApi = {
  categories: () => api.get('/categories'),
  category: (slug: string) => api.get(`/categories/${slug}`),
  flashcards: (params?: Record<string, string | undefined>) => api.get('/flashcards', { params }),
  flashcard: (id: string) => api.get(`/flashcards/${id}`),
  gameCards: (categoryId?: string, count?: number) => api.get('/games/cards', { params: { categoryId, count } }),
  dailyChallenge: () => api.get('/games/daily'),
  submitGame: (data: unknown) => api.post('/games/submit', data),
  stats: () => api.get('/stats'),
  leaderboard: (limit = 20) => api.get('/leaderboard', { params: { limit } }),
  achievements: () => api.get('/achievements'),
  favorites: () => api.get('/favorites'),
  toggleFavorite: (id: string) => api.post(`/favorites/${id}`),
  demo: () => api.get('/demo'),
  health: () => api.get('/health'),
};

export const adminApi = {
  createCategory: (data: unknown) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: unknown) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
  createFlashcard: (data: unknown) => api.post('/admin/flashcards', data),
  updateFlashcard: (id: string, data: unknown) => api.put(`/admin/flashcards/${id}`, data),
  deleteFlashcard: (id: string) => api.delete(`/admin/flashcards/${id}`),
};

export const parentApi = {
  getChildren: () => api.get('/parent/children'),
  linkChild: (username: string) => api.post('/parent/children', { username }),
  getChildStats: (childId: string) => api.get(`/parent/children/${childId}/stats`),
  unlinkChild: (childId: string) => api.delete(`/parent/children/${childId}`),
};

export const teacherApi = {
  getClassrooms: () => api.get('/teacher/classrooms'),
  createClassroom: (name: string, description?: string) => api.post('/teacher/classrooms', { name, description }),
  getClassroomDetails: (id: string) => api.get(`/teacher/classrooms/${id}`),
  deleteClassroom: (id: string) => api.delete(`/teacher/classrooms/${id}`),
  joinClassroom: (code: string) => api.post('/classrooms/join', { code }),
};

export default api;
