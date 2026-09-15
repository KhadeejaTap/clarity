import { Router } from 'express';
import { z } from 'zod';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { awardXp, XP_REWARDS } from '../services/xp.js';
import { updateStreak } from '../services/streak.js';
import { checkAchievements } from '../services/achievements.js';
import type { FocusSession, AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  duration_minutes: z.number().int().min(1),
  pomodoros_completed: z.number().int().min(1).default(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/sessions
router.get('/', (req, res) => {
  const authReq = req as AuthRequest;
  const { from, to } = req.query;

  let query = 'SELECT * FROM focus_sessions WHERE user_id = ?';
  const params: unknown[] = [authReq.userId];

  if (from) {
    query += ' AND date >= ?';
    params.push(from);
  }
  if (to) {
    query += ' AND date <= ?';
    params.push(to);
  }

  query += ' ORDER BY started_at DESC';

  const sessions = db.prepare(query).all(...params) as FocusSession[];
  res.json({ sessions });
});

// POST /api/sessions
router.post('/', validate(createSchema), (req, res) => {
  const authReq = req as AuthRequest;
  const { duration_minutes, pomodoros_completed, date } = req.body;

  const result = db.prepare(
    'INSERT INTO focus_sessions (user_id, duration_minutes, pomodoros_completed, date) VALUES (?, ?, ?, ?)'
  ).run(authReq.userId, duration_minutes, pomodoros_completed, date);

  // Update total focus minutes
  db.prepare(
    'UPDATE users SET total_focus_minutes = total_focus_minutes + ? WHERE id = ?'
  ).run(duration_minutes, authReq.userId);

  // Award XP for each pomodoro
  const xpEarned = XP_REWARDS.COMPLETE_POMODORO * pomodoros_completed;
  const user = awardXp(authReq.userId!, xpEarned);

  // Update streak
  updateStreak(authReq.userId!);

  // Check achievements
  const newAchievements = checkAchievements(authReq.userId!);

  const session = db.prepare('SELECT * FROM focus_sessions WHERE id = ?').get(result.lastInsertRowid) as FocusSession;

  res.status(201).json({
    session,
    xp_earned: xpEarned,
    user: { xp: user.xp, level: user.level, current_streak: user.current_streak },
    new_achievements: newAchievements,
  });
});

export default router;
