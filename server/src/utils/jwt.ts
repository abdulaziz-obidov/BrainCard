import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export function getRefreshExpiry(): Date {
  const days = parseInt(env.JWT_REFRESH_EXPIRES) || 7;
  const ms = env.JWT_REFRESH_EXPIRES.includes('d')
    ? days * 24 * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}
