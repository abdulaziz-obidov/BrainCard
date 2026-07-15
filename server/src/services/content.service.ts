import { prisma } from '../lib/prisma.js';
import type { Difficulty, GameType } from '@prisma/client';
import { calculateGameReward, calculateLevel } from '../utils/xp.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listCategories(publicOnly = true) {
  return prisma.category.findMany({
    where: publicOnly ? { isPublic: true } : undefined,
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { flashcards: true } } },
  });
}

export async function createCategory(data: { slug: string; name: string; description?: string; icon?: string; color: string; sortOrder: number; isPublic: boolean }) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: Partial<{ slug: string; name: string; description: string; icon: string; color: string; sortOrder: number; isPublic: boolean }>) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}

export async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      flashcards: { where: { isPublic: true }, orderBy: { word: 'asc' } },
      _count: { select: { flashcards: true } },
    },
  });
  if (!category) throw new AppError(404, 'Category not found');
  return category;
}

export async function listFlashcards(filters: {
  categoryId?: string;
  difficulty?: Difficulty;
  search?: string;
  limit?: number;
}) {
  const { categoryId, difficulty, search, limit = 50 } = filters;
  return prisma.flashcard.findMany({
    where: {
      isPublic: true,
      ...(categoryId && { categoryId }),
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { word: { contains: search, mode: 'insensitive' } },
          { translation: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: { category: { select: { slug: true, name: true, icon: true } } },
    take: limit,
    orderBy: { word: 'asc' },
  });
}

export async function getFlashcard(id: string) {
  const card = await prisma.flashcard.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!card) throw new AppError(404, 'Flashcard not found');
  return card;
}

export async function createFlashcard(data: { word: string; translation: string; pronunciation?: string; exampleSentence?: string; imageUrl?: string; audioUrl?: string; difficulty: Difficulty; categoryId: string; tags: string[]; isPublic: boolean }) {
  return prisma.category.findUnique({ where: { id: data.categoryId } }).then((category) => {
    if (!category) throw new AppError(404, 'Category not found');
    return prisma.flashcard.create({ data });
  });
}

export async function updateFlashcard(id: string, data: Partial<{ word: string; translation: string; pronunciation: string; exampleSentence: string; imageUrl: string; audioUrl: string; difficulty: Difficulty; categoryId: string; tags: string[]; isPublic: boolean }>) {
  return prisma.flashcard.update({ where: { id }, data });
}

export async function deleteFlashcard(id: string) {
  return prisma.flashcard.delete({ where: { id } });
}

export async function getGameCards(categoryId: string | undefined, count = 8) {
  const cards = await prisma.flashcard.findMany({
    where: {
      isPublic: true,
      ...(categoryId && { categoryId }),
    },
    include: { category: { select: { slug: true, name: true } } },
  });

  if (cards.length < 4) throw new AppError(400, 'Not enough flashcards for this category');

  const shuffled = cards.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function submitGameResult(
  userId: string,
  data: {
    gameType: GameType;
    categoryId?: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    durationSec: number;
    comboMax?: number;
  },
) {
  const reward = calculateGameReward({
    correctAnswers: data.correctAnswers,
    totalQuestions: data.totalQuestions,
    durationSec: data.durationSec,
    comboMax: data.comboMax,
  });

  const session = await prisma.gameSession.create({
    data: {
      userId,
      gameType: data.gameType,
      categoryId: data.categoryId,
      score: data.score,
      correctAnswers: data.correctAnswers,
      totalQuestions: data.totalQuestions,
      durationSec: data.durationSec,
      xpEarned: reward.xpEarned,
      coinsEarned: reward.coinsEarned,
      isPerfect: reward.isPerfect,
    },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: reward.xpEarned },
      coins: { increment: reward.coinsEarned },
    },
  });

  const newLevel = calculateLevel(user.xp);
  if (newLevel !== user.level) {
    await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
  }

  await updateStreak(userId);
  await checkAchievements(userId, data.gameType, reward.isPerfect);

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, coins: true },
  });

  return { session, reward, user: updatedUser };
}

async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.streak.findUnique({ where: { userId } });
  if (!streak) {
    await prisma.streak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    });
    return;
  }

  const last = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
  if (last) last.setHours(0, 0, 0, 0);

  if (last && last.getTime() === today.getTime()) return;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 1;
  if (last && last.getTime() === yesterday.getTime()) {
    currentStreak = streak.currentStreak + 1;
  }

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak,
      longestStreak: Math.max(streak.longestStreak, currentStreak),
      lastActiveDate: today,
    },
  });
}

async function checkAchievements(userId: string, gameType: GameType, isPerfect: boolean) {
  const [sessions, totalCorrect, streak, existing] = await Promise.all([
    prisma.gameSession.count({ where: { userId } }),
    prisma.gameSession.aggregate({ where: { userId }, _sum: { correctAnswers: true } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
  ]);

  const unlockedSlugs = new Set(existing.map((e) => e.achievement.slug));
  const memoryWins = await prisma.gameSession.count({
    where: { userId, gameType: 'MEMORY_MATCH', isPerfect: true },
  });

  const checks: Array<{ slug: string; met: boolean }> = [
    { slug: 'first-game', met: sessions >= 1 },
    { slug: 'first-win', met: sessions >= 1 },
    { slug: '100-correct', met: (totalCorrect._sum.correctAnswers ?? 0) >= 100 },
    { slug: '7-day-streak', met: (streak?.currentStreak ?? 0) >= 7 },
    { slug: 'memory-master', met: memoryWins >= 5 },
    { slug: 'quiz-champion', met: isPerfect },
  ];

  for (const check of checks) {
    if (check.met && !unlockedSlugs.has(check.slug)) {
      const achievement = await prisma.achievement.findUnique({ where: { slug: check.slug } });
      if (achievement) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: achievement.xpReward },
            coins: { increment: achievement.coinReward },
          },
        });
      }
    }
  }
}

export async function getUserStats(userId: string) {
  const [user, sessions, streak, achievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, coins: true, username: true, avatar: true },
    }),
    prisma.gameSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 20,
    }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    }),
  ]);

  const totals = await prisma.gameSession.aggregate({
    where: { userId },
    _sum: { correctAnswers: true, totalQuestions: true, durationSec: true, xpEarned: true },
    _count: true,
    _max: { score: true },
  });

  const correct = totals._sum.correctAnswers ?? 0;
  const total = totals._sum.totalQuestions ?? 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const byGameType = await prisma.gameSession.groupBy({
    by: ['gameType'],
    where: { userId },
    _count: true,
    _sum: { correctAnswers: true, totalQuestions: true },
  });

  return {
    user,
    streak,
    achievements,
    recentSessions: sessions,
    stats: {
      gamesPlayed: totals._count,
      correctAnswers: correct,
      totalQuestions: total,
      accuracy,
      studyTimeSec: totals._sum.durationSec ?? 0,
      totalXpEarned: totals._sum.xpEarned ?? 0,
      bestScore: totals._max.score ?? 0,
      byGameType,
    },
  };
}

export async function getLeaderboard(limit = 20) {
  return prisma.user.findMany({
    where: { role: 'STUDENT' },
    orderBy: { xp: 'desc' },
    take: limit,
    select: {
      id: true,
      username: true,
      avatar: true,
      xp: true,
      level: true,
      country: true,
    },
  });
}

export async function toggleFavorite(userId: string, flashcardId: string) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_flashcardId: { userId, flashcardId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId, flashcardId } });
  return { favorited: true };
}

export async function getFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      flashcard: { include: { category: { select: { slug: true, name: true, icon: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listAchievements() {
  return prisma.achievement.findMany({ orderBy: { name: 'asc' } });
}

// ========= PARENT DASHBOARD =========

export async function linkChild(parentId: string, childUsername: string) {
  const child = await prisma.user.findUnique({ where: { username: childUsername } });
  if (!child) throw new AppError(404, 'Child user not found');
  if (child.role !== 'STUDENT') throw new AppError(400, 'Can only link to student accounts');

  const existing = await prisma.parentChildLink.findUnique({
    where: { parentId_childId: { parentId, childId: child.id } },
  });
  if (existing) throw new AppError(409, 'Already linked');

  return prisma.parentChildLink.create({
    data: { parentId, childId: child.id },
    include: { child: { select: { id: true, username: true, avatar: true, xp: true, level: true } } },
  });
}

export async function getChildren(parentId: string) {
  const links = await prisma.parentChildLink.findMany({
    where: { parentId },
    include: {
      child: {
        select: {
          id: true, username: true, avatar: true, xp: true, level: true, coins: true,
          streak: true,
          _count: { select: { gameSessions: true } },
        },
      },
    },
  });
  return links.map((l) => l.child);
}

export async function getChildStats(parentId: string, childId: string) {
  const link = await prisma.parentChildLink.findUnique({
    where: { parentId_childId: { parentId, childId } },
  });
  if (!link) throw new AppError(403, 'Not your child');
  return getUserStats(childId);
}

export async function unlinkChild(parentId: string, childId: string) {
  await prisma.parentChildLink.deleteMany({ where: { parentId, childId } });
  return { unlinked: true };
}

// ========= TEACHER / CLASSROOM =========

export async function createClassroom(teacherId: string, name: string, description?: string) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prisma.classroom.create({
    data: { teacherId, name, code, description },
  });
}

export async function getTeacherClassrooms(teacherId: string) {
  return prisma.classroom.findMany({
    where: { teacherId },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getClassroomDetails(classroomId: string, teacherId: string) {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true, username: true, avatar: true, xp: true, level: true,
              streak: true,
              _count: { select: { gameSessions: true } },
            },
          },
        },
      },
    },
  });
  if (!classroom) throw new AppError(404, 'Classroom not found');
  if (classroom.teacherId !== teacherId) throw new AppError(403, 'Not your classroom');
  return classroom;
}

export async function joinClassroom(userId: string, code: string) {
  const classroom = await prisma.classroom.findUnique({ where: { code } });
  if (!classroom) throw new AppError(404, 'Classroom not found');

  const existing = await prisma.classroomMember.findUnique({
    where: { classroomId_userId: { classroomId: classroom.id, userId } },
  });
  if (existing) throw new AppError(409, 'Already joined');

  return prisma.classroomMember.create({
    data: { classroomId: classroom.id, userId },
    include: { classroom: { select: { name: true, code: true } } },
  });
}

export async function deleteClassroom(classroomId: string, teacherId: string) {
  const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
  if (!classroom) throw new AppError(404, 'Classroom not found');
  if (classroom.teacherId !== teacherId) throw new AppError(403, 'Not your classroom');
  return prisma.classroom.delete({ where: { id: classroomId } });
}

// ========= DAILY CHALLENGE =========

export async function getDailyChallenge() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Seed the random by date so same challenge for all users per day
  const seed = today.getTime();

  const count = await prisma.flashcard.count({ where: { isPublic: true } });
  if (count < 8) throw new AppError(400, 'Not enough flashcards for daily challenge');

  // Deterministic pseudo-random picks based on date
  const indices: number[] = [];
  let val = seed;
  while (indices.length < 8) {
    val = (val * 1103515245 + 12345) & 0x7fffffff;
    const idx = val % count;
    if (!indices.includes(idx)) indices.push(idx);
  }

  const allCards = await prisma.flashcard.findMany({
    where: { isPublic: true },
    orderBy: { id: 'asc' },
    include: { category: { select: { slug: true, name: true, icon: true } } },
  });

  return indices.map((i) => allCards[i % allCards.length]);
}
