import db from '../db/database.js';
import type { User } from '../types/index.js';

// Level formula: level = floor(sqrt(xp / 50)) + 1
// Level 1 = 0 XP, Level 2 = 50 XP, Level 3 = 200 XP, Level 4 = 450 XP, etc.
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 50;
}

export function xpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = calculateLevel(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const progress = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  return { current: progress, needed, progress: progress / needed };
}

export function awardXp(userId: number, amount: number): User {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
  const newXp = user.xp + amount;
  const newLevel = calculateLevel(newXp);

  db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXp, newLevel, userId);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
}

// XP constants
export const XP_REWARDS = {
  COMPLETE_TODO: 10,       // default, can be overridden per todo
  COMPLETE_POMODORO: 25,
  DAILY_STREAK: 15,
  COMPLETE_GOAL: 100,
} as const;
