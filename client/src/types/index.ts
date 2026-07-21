export type Role = 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type GameType =
  | 'MEMORY_MATCH'
  | 'IMAGE_QUIZ'
  | 'WORD_QUIZ'
  | 'AUDIO_QUIZ'
  | 'SPELLING'
  | 'TRUE_FALSE'
  | 'DRAG_DROP'
  | 'SURVIVAL'
  | 'DAILY_CHALLENGE'
  | 'HANGMAN'
  | 'BOSS_CHALLENGE';

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  avatar: string | null;
  country: string | null;
  age: number | null;
  xp: number;
  level: number;
  coins: number;
  createdAt?: string;
  streak?: Streak;
  _count?: { gameSessions: number; favorites: number; userAchievements: number };
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  freezeCount: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  sortOrder: number;
  _count?: { flashcards: number };
  flashcards?: Flashcard[];
}

export interface Flashcard {
  id: string;
  word: string;
  translation: string;
  pronunciation: string | null;
  exampleSentence: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  difficulty: Difficulty;
  categoryId: string;
  tags: string[];
  category?: { slug: string; name: string; icon: string | null };
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  xpReward: number;
  coinReward: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  country: string | null;
}

export interface GameReward {
  xpEarned: number;
  coinsEarned: number;
  isPerfect: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface GameResultPayload {
  gameType: GameType;
  categoryId?: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSec: number;
  comboMax?: number;
}
