import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshExpiry,
} from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Role } from '@prisma/client';

const userSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  avatar: true,
  country: true,
  age: true,
  xp: true,
  level: true,
  coins: true,
  createdAt: true,
};

export async function register(data: {
  email: string;
  username: string;
  password: string;
  age?: number;
  country?: string;
  role?: Role;
}) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });
  if (existing) throw new AppError(409, 'Email or username already exists');

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      passwordHash,
      age: data.age,
      country: data.country,
      role: data.role ?? 'STUDENT',
      streak: { create: {} },
    },
    select: userSelect,
  });

  const tokens = await createTokens(user.id, user.email, user.role);
  return { user, ...tokens };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(401, 'Invalid email or password');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Invalid email or password');

  const tokens = await createTokens(user.id, user.email, user.role);
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: userSelect,
  });

  return { user: profile!, ...tokens };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token expired');
  }

  await prisma.refreshToken.deleteMany({ where: { id: stored.id } });
  return createTokens(stored.user.id, stored.user.email, stored.user.role);
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

async function createTokens(userId: string, email: string, role: Role) {
  const payload = { userId, email, role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: getRefreshExpiry(),
    },
  });

  return { accessToken, refreshToken };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...userSelect,
      streak: true,
      _count: { select: { gameSessions: true, favorites: true, userAchievements: true } },
    },
  });
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

export async function updateProfile(
  userId: string,
  data: { username?: string; avatar?: string; country?: string; age?: number },
) {
  if (data.username) {
    const taken = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } },
    });
    if (taken) throw new AppError(409, 'Username already taken');
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: userSelect,
  });
}

export { userSelect };
