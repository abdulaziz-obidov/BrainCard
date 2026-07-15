import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth.js';
import * as authService from '../services/auth.service.js';
import * as contentService from '../services/content.service.js';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
  age: z.number().int().min(3).max(120).optional(),
  country: z.string().max(3).optional(),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    await authService.logout(refreshToken);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z
      .object({
        username: z.string().min(3).max(30).optional(),
        avatar: z.string().max(10).optional(),
        country: z.string().max(3).optional(),
        age: z.number().int().min(3).max(120).optional(),
      })
      .parse(req.body);
    const user = await authService.updateProfile(req.user!.userId, data);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await contentService.listCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const category = await contentService.getCategory(req.params.slug as string);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      slug: z.string().min(2),
      name: z.string().min(2),
      description: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().default('#6366f1'),
      sortOrder: z.number().int().default(0),
      isPublic: z.boolean().default(true),
    }).parse(req.body);
    const category = await contentService.createCategory(data);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      slug: z.string().min(2).optional(),
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      sortOrder: z.number().int().optional(),
      isPublic: z.boolean().optional(),
    }).parse(req.body);
    const category = await contentService.updateCategory(String(req.params.id), data);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await contentService.deleteCategory(String(req.params.id));
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getFlashcards(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cards = await contentService.listFlashcards({
      categoryId: req.query.categoryId as string | undefined,
      difficulty: req.query.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | undefined,
      search: req.query.search as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(cards);
  } catch (err) {
    next(err);
  }
}

export async function getFlashcard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const card = await contentService.getFlashcard(req.params.id as string);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

export async function createFlashcard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      word: z.string().min(1),
      translation: z.string().min(1),
      pronunciation: z.string().optional(),
      exampleSentence: z.string().optional(),
      imageUrl: z.string().optional(),
      audioUrl: z.string().optional(),
      difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('BEGINNER'),
      categoryId: z.string(),
      tags: z.array(z.string()).default([]),
      isPublic: z.boolean().default(true),
    }).parse(req.body);
    const card = await contentService.createFlashcard(data);
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

export async function updateFlashcard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = z.object({
      word: z.string().min(1).optional(),
      translation: z.string().min(1).optional(),
      pronunciation: z.string().optional(),
      exampleSentence: z.string().optional(),
      imageUrl: z.string().optional(),
      audioUrl: z.string().optional(),
      difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
      categoryId: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
    }).parse(req.body);
    const card = await contentService.updateFlashcard(String(req.params.id), data);
    res.json(card);
  } catch (err) {
    next(err);
  }
}

export async function deleteFlashcard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await contentService.deleteFlashcard(String(req.params.id));
    res.json({ message: 'Flashcard deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getGameCards(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cards = await contentService.getGameCards(
      req.query.categoryId as string | undefined,
      req.query.count ? Number(req.query.count) : 8,
    );
    res.json(cards);
  } catch (err) {
    next(err);
  }
}

const gameResultSchema = z.object({
  gameType: z.enum([
    'MEMORY_MATCH',
    'IMAGE_QUIZ',
    'WORD_QUIZ',
    'AUDIO_QUIZ',
    'SPELLING',
    'TRUE_FALSE',
    'DRAG_DROP',
    'SURVIVAL',
    'DAILY_CHALLENGE',
  ]),
  categoryId: z.string().optional(),
  score: z.number().int().min(0),
  correctAnswers: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  durationSec: z.number().int().min(0),
  comboMax: z.number().int().min(0).optional(),
});

export async function submitGame(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = gameResultSchema.parse(req.body);
    const result = await contentService.submitGameResult(req.user!.userId, data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await contentService.getUserStats(req.user!.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const board = await contentService.getLeaderboard(limit);
    res.json(board);
  } catch (err) {
    next(err);
  }
}

export async function toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await contentService.toggleFavorite(req.user!.userId, req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getFavorites(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const favorites = await contentService.getFavorites(req.user!.userId);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
}

export async function getAchievements(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const achievements = await contentService.listAchievements();
    res.json(achievements);
  } catch (err) {
    next(err);
  }
}

export async function getDemoCategories(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await contentService.listCategories(true);
    const demo = categories.slice(0, 3);
    res.json({ message: 'Guest demo — register to save progress', categories: demo });
  } catch (err) {
    next(err);
  }
}

// ========= PARENT =========

export async function linkChild(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { username } = z.object({ username: z.string().min(3) }).parse(req.body);
    const result = await contentService.linkChild(req.user!.userId, username);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getChildren(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const children = await contentService.getChildren(req.user!.userId);
    res.json(children);
  } catch (err) {
    next(err);
  }
}

export async function getChildStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stats = await contentService.getChildStats(req.user!.userId, String(req.params.childId));
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function unlinkChild(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await contentService.unlinkChild(req.user!.userId, String(req.params.childId));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ========= TEACHER / CLASSROOM =========

export async function createClassroom(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, description } = z.object({
      name: z.string().min(2),
      description: z.string().optional(),
    }).parse(req.body);
    const classroom = await contentService.createClassroom(req.user!.userId, name, description);
    res.status(201).json(classroom);
  } catch (err) {
    next(err);
  }
}

export async function getTeacherClassrooms(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const classrooms = await contentService.getTeacherClassrooms(req.user!.userId);
    res.json(classrooms);
  } catch (err) {
    next(err);
  }
}

export async function getClassroomDetails(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const classroom = await contentService.getClassroomDetails(String(req.params.id), req.user!.userId);
    res.json(classroom);
  } catch (err) {
    next(err);
  }
}

export async function joinClassroom(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { code } = z.object({ code: z.string().min(4) }).parse(req.body);
    const result = await contentService.joinClassroom(req.user!.userId, code);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteClassroom(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await contentService.deleteClassroom(String(req.params.id), req.user!.userId);
    res.json({ message: 'Classroom deleted' });
  } catch (err) {
    next(err);
  }
}

// ========= DAILY CHALLENGE =========

export async function getDailyChallenge(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const cards = await contentService.getDailyChallenge();
    res.json(cards);
  } catch (err) {
    next(err);
  }
}

