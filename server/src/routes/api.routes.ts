import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';
import * as api from '../controllers/api.controller.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many attempts, try again later' },
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'BrainCards API', version: '1.0.0' });
});

// Auth
router.post('/auth/register', authLimiter, api.register);
router.post('/auth/login', authLimiter, api.login);
router.post('/auth/refresh', api.refresh);
router.post('/auth/logout', api.logout);
router.get('/auth/me', authenticate, api.getMe);
router.patch('/auth/me', authenticate, api.updateMe);

// Public content
router.get('/demo', api.getDemoCategories);
router.get('/categories', optionalAuth, api.getCategories);
router.get('/categories/:slug', optionalAuth, api.getCategory);
router.get('/flashcards', optionalAuth, api.getFlashcards);
router.get('/flashcards/:id', optionalAuth, api.getFlashcard);
router.get('/achievements', api.getAchievements);
router.get('/leaderboard', api.getLeaderboard);

// Games (auth required to save progress)
router.get('/games/cards', optionalAuth, api.getGameCards);
router.get('/games/daily', api.getDailyChallenge);
router.post('/games/submit', authenticate, api.submitGame);

// User data
router.get('/stats', authenticate, api.getStats);
router.get('/favorites', authenticate, api.getFavorites);
router.post('/favorites/:id', authenticate, api.toggleFavorite);

// Parent dashboard
router.get('/parent/children', authenticate, requireRole('PARENT'), api.getChildren);
router.post('/parent/children', authenticate, requireRole('PARENT'), api.linkChild);
router.get('/parent/children/:childId/stats', authenticate, requireRole('PARENT'), api.getChildStats);
router.delete('/parent/children/:childId', authenticate, requireRole('PARENT'), api.unlinkChild);

// Teacher / Classroom
router.get('/teacher/classrooms', authenticate, requireRole('TEACHER'), api.getTeacherClassrooms);
router.post('/teacher/classrooms', authenticate, requireRole('TEACHER'), api.createClassroom);
router.get('/teacher/classrooms/:id', authenticate, requireRole('TEACHER'), api.getClassroomDetails);
router.delete('/teacher/classrooms/:id', authenticate, requireRole('TEACHER'), api.deleteClassroom);
router.post('/classrooms/join', authenticate, api.joinClassroom);

// Admin
router.post('/admin/categories', authenticate, requireRole('ADMIN'), api.createCategory);
router.put('/admin/categories/:id', authenticate, requireRole('ADMIN'), api.updateCategory);
router.delete('/admin/categories/:id', authenticate, requireRole('ADMIN'), api.deleteCategory);

router.post('/admin/flashcards', authenticate, requireRole('ADMIN'), api.createFlashcard);
router.put('/admin/flashcards/:id', authenticate, requireRole('ADMIN'), api.updateFlashcard);
router.delete('/admin/flashcards/:id', authenticate, requireRole('ADMIN'), api.deleteFlashcard);

export default router;
