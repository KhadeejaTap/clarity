import db from '../db/database.js';
import type { Achievement } from '../types/index.js';

// Achievement definitions
export const ACHIEVEMENT_DEFS: Record<string, { name: string; description: string; check: (userId: number) => boolean }> = {
  streak_3: {
    name: 'Getting Started',
    description: '3-day focus streak',
    check: (userId) => {
      const user = db.prepare('SELECT current_streak FROM users WHERE id = ?').get(userId) as { current_streak: number } | undefined;
      return (user?.current_streak ?? 0) >= 3;
    },
  },
  streak_7: {
    name: 'On Fire',
    description: '7-day focus streak',
    check: (userId) => {
      const user = db.prepare('SELECT current_streak FROM users WHERE id = ?').get(userId) as { current_streak: number } | undefined;
      return (user?.current_streak ?? 0) >= 7;
    },
  },
  streak_30: {
    name: 'Unstoppable',
    description: '30-day focus streak',
    check: (userId) => {
      const user = db.prepare('SELECT current_streak FROM users WHERE id = ?').get(userId) as { current_streak: number } | undefined;
      return (user?.current_streak ?? 0) >= 30;
    },
  },
  tasks_10: {
    name: 'Productive',
    description: 'Complete 10 todos',
    check: (userId) => {
      const result = db.prepare('SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND completed = 1').get(userId) as { count: number };
      return result.count >= 10;
    },
  },
  tasks_100: {
    name: 'Task Machine',
    description: 'Complete 100 todos',
    check: (userId) => {
      const result = db.prepare('SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND completed = 1').get(userId) as { count: number };
      return result.count >= 100;
    },
  },
  focus_600: {
    name: 'Deep Worker',
    description: '10 hours of total focus time',
    check: (userId) => {
      const user = db.prepare('SELECT total_focus_minutes FROM users WHERE id = ?').get(userId) as { total_focus_minutes: number } | undefined;
      return (user?.total_focus_minutes ?? 0) >= 600;
    },
  },
  pomodoros_50: {
    name: 'Pomodoro Pro',
    description: 'Complete 50 pomodoro sessions',
    check: (userId) => {
      const result = db.prepare('SELECT COALESCE(SUM(pomodoros_completed), 0) as total FROM focus_sessions WHERE user_id = ?').get(userId) as { total: number };
      return result.total >= 50;
    },
  },
  first_goal: {
    name: 'Goal Setter',
    description: 'Complete your first goal',
    check: (userId) => {
      const result = db.prepare("SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND status = 'completed'").get(userId) as { count: number };
      return result.count >= 1;
    },
  },
};

// Check and unlock any new achievements for a user
export function checkAchievements(userId: number): Achievement[] {
  const existing = db
    .prepare('SELECT achievement_key FROM achievements WHERE user_id = ?')
    .all(userId) as { achievement_key: string }[];
  const existingKeys = new Set(existing.map((a) => a.achievement_key));

  const newlyUnlocked: Achievement[] = [];

  for (const [key, def] of Object.entries(ACHIEVEMENT_DEFS)) {
    if (existingKeys.has(key)) continue;

    if (def.check(userId)) {
      db.prepare(
        'INSERT INTO achievements (user_id, achievement_key) VALUES (?, ?)'
      ).run(userId, key);

      const achievement = db
        .prepare(
          'SELECT * FROM achievements WHERE user_id = ? AND achievement_key = ?'
        )
        .get(userId, key) as Achievement;

      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

// Get all achievements for a user with metadata
export function getUserAchievements(
  userId: number
): Array<{ key: string; name: string; description: string; unlocked: boolean; unlocked_at: string | null }> {
  const unlocked = db
    .prepare('SELECT * FROM achievements WHERE user_id = ?')
    .all(userId) as Achievement[];
  const unlockedMap = new Map(unlocked.map((a) => [a.achievement_key, a.unlocked_at]));

  return Object.entries(ACHIEVEMENT_DEFS).map(([key, def]) => ({
    key,
    name: def.name,
    description: def.description,
    unlocked: unlockedMap.has(key),
    unlocked_at: unlockedMap.get(key) ?? null,
  }));
}
