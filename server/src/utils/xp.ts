const LEVEL_THRESHOLDS: number[] = [0];

for (let level = 2; level <= 100; level++) {
  const prev = LEVEL_THRESHOLDS[level - 2] ?? 0;
  LEVEL_THRESHOLDS.push(prev + Math.floor(100 + (level - 2) * 25));
}

export function calculateLevel(xp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, 100);
}

export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel >= 100) return LEVEL_THRESHOLDS[99];
  return LEVEL_THRESHOLDS[currentLevel] ?? 100;
}

export function xpProgress(xp: number, level: number): { current: number; needed: number; percent: number } {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 100;
  const current = xp - currentThreshold;
  const needed = nextThreshold - currentThreshold;
  const percent = needed > 0 ? Math.min(100, Math.round((current / needed) * 100)) : 100;
  return { current, needed, percent };
}

export interface GameRewardInput {
  correctAnswers: number;
  totalQuestions: number;
  durationSec: number;
  isPerfect?: boolean;
  comboMax?: number;
}

export interface GameReward {
  xpEarned: number;
  coinsEarned: number;
  isPerfect: boolean;
}

export function calculateGameReward(input: GameRewardInput): GameReward {
  const { correctAnswers, totalQuestions, durationSec, comboMax = 0 } = input;
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const isPerfect = accuracy === 1 && totalQuestions > 0;

  let xpEarned = correctAnswers * 10;
  if (isPerfect) xpEarned += 20;
  if (durationSec > 0 && correctAnswers > 0) {
    const avgSec = durationSec / correctAnswers;
    if (avgSec < 5) xpEarned += 5 * correctAnswers;
  }
  if (comboMax >= 3) xpEarned += Math.floor(comboMax / 3) * 10;

  const coinsEarned = Math.floor(correctAnswers / 2) + (isPerfect ? 5 : 0);

  return { xpEarned, coinsEarned, isPerfect };
}

export { LEVEL_THRESHOLDS };
