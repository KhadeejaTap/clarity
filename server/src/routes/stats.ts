import { Router } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { xpToNextLevel } from '../services/xp.js';
import type { User, AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

// GET /api/stats/overview
router.get('/overview', (req, res) => {
  const authReq = req as AuthRequest;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(authReq.userId) as User;

  const todosCompleted = db.prepare(
    'SELECT COUNT(*) as count FROM todos WHERE user_id = ? AND completed = 1'
  ).get(authReq.userId) as { count: number };

  const totalPomodoros = db.prepare(
    'SELECT COALESCE(SUM(pomodoros_completed), 0) as total FROM focus_sessions WHERE user_id = ?'
  ).get(authReq.userId) as { total: number };

  const goalsCompleted = db.prepare(
    "SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND status = 'completed'"
  ).get(authReq.userId) as { count: number };

  const nextLevel = xpToNextLevel(user.xp);

  res.json({
    xp: user.xp,
    level: user.level,
    next_level: nextLevel,
    current_streak: user.current_streak,
    total_focus_minutes: user.total_focus_minutes,
    total_focus_hours: Math.round(user.total_focus_minutes / 60 * 10) / 10,
    todos_completed: todosCompleted.count,
    total_pomodoros: totalPomodoros.total,
    goals_completed: goalsCompleted.count,
  });
});

// GET /api/stats/heatmap
// Returns daily activity counts for the last year (for GitHub-style heatmap)
router.get('/heatmap', (req, res) => {
  const authReq = req as AuthRequest;

  // Get sessions grouped by date for the last 365 days
  const sessions = db.prepare(`
    SELECT date, SUM(pomodoros_completed) as pomodoros, SUM(duration_minutes) as minutes
    FROM focus_sessions
    WHERE user_id = ? AND date >= date('now', '-365 days')
    GROUP BY date
    ORDER BY date ASC
  `).all(authReq.userId) as { date: string; pomodoros: number; minutes: number }[];

  // Get todos completed by date
  const todos = db.prepare(`
    SELECT date(completed_at) as date, COUNT(*) as count
    FROM todos
    WHERE user_id = ? AND completed = 1 AND completed_at >= datetime('now', '-365 days')
    GROUP BY date(completed_at)
    ORDER BY date ASC
  `).all(authReq.userId) as { date: string; count: number }[];

  const todoMap = new Map(todos.map((t) => [t.date, t.count]));

  const heatmap = sessions.map((s) => ({
    date: s.date,
    pomodoros: s.pomodoros,
    focus_minutes: s.minutes,
    todos_completed: todoMap.get(s.date) || 0,
    // Activity level 0-4 based on pomodoros (for color intensity)
    level: s.pomodoros >= 8 ? 4 : s.pomodoros >= 5 ? 3 : s.pomodoros >= 3 ? 2 : s.pomodoros >= 1 ? 1 : 0,
  }));

  res.json({ heatmap });
});

// GET /api/stats/weekly
// Returns summary for the current week (Mon-Sun)
router.get('/weekly', (req, res) => {
  const authReq = req as AuthRequest;

  const sessions = db.prepare(`
    SELECT COALESCE(SUM(pomodoros_completed), 0) as pomodoros,
           COALESCE(SUM(duration_minutes), 0) as minutes,
           COUNT(*) as session_count
    FROM focus_sessions
    WHERE user_id = ? AND date >= date('now', 'weekday 1', '-7 days')
  `).get(authReq.userId) as { pomodoros: number; minutes: number; session_count: number };

  const todosCompleted = db.prepare(`
    SELECT COUNT(*) as count
    FROM todos
    WHERE user_id = ? AND completed = 1
    AND completed_at >= datetime('now', 'weekday 1', '-7 days')
  `).get(authReq.userId) as { count: number };

  const todosCreated = db.prepare(`
    SELECT COUNT(*) as count
    FROM todos
    WHERE user_id = ? AND created_at >= datetime('now', 'weekday 1', '-7 days')
  `).get(authReq.userId) as { count: number };

  res.json({
    week: {
      pomodoros: sessions.pomodoros,
      focus_minutes: sessions.minutes,
      focus_hours: Math.round(sessions.minutes / 60 * 10) / 10,
      sessions: sessions.session_count,
      todos_completed: todosCompleted.count,
      todos_created: todosCreated.count,
    },
  });
});

export default router;
