import db from '../db/database.js';
import { awardXp, XP_REWARDS } from './xp.js';
import type { User } from '../types/index.js';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function isYesterday(dateStr: string): boolean {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().split('T')[0];
}

export function updateStreak(userId: number): User {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
  const today = getTodayDate();

  if (user.last_active_date === today) {
    // Already updated today
    return user;
  }

  let newStreak: number;

  if (isYesterday(user.last_active_date)) {
    // Consecutive day — increment
    newStreak = user.current_streak + 1;
  } else {
    // Streak broken — reset to 1
    newStreak = 1;
  }

  db.prepare(
    'UPDATE users SET current_streak = ?, last_active_date = ? WHERE id = ?'
  ).run(newStreak, today, userId);

  // Award streak XP
  awardXp(userId, XP_REWARDS.DAILY_STREAK);

  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;
}
