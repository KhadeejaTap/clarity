import { Router } from 'express';
import { z } from 'zod';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { awardXp, XP_REWARDS } from '../services/xp.js';
import { checkAchievements } from '../services/achievements.js';
import type { Goal, AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).default(''),
  due_date: z.string().nullable().default(null),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  due_date: z.string().nullable().optional(),
});

// GET /api/goals
router.get('/', (req, res) => {
  const authReq = req as AuthRequest;
  const status = req.query.status as string | undefined;

  let goals: Goal[];
  if (status) {
    goals = db.prepare('SELECT * FROM goals WHERE user_id = ? AND status = ? ORDER BY created_at DESC').all(authReq.userId, status) as Goal[];
  } else {
    goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(authReq.userId) as Goal[];
  }

  res.json({ goals });
});

// POST /api/goals
router.post('/', validate(createSchema), (req, res) => {
  const authReq = req as AuthRequest;
  const { title, description, due_date } = req.body;

  const result = db.prepare(
    'INSERT INTO goals (user_id, title, description, due_date) VALUES (?, ?, ?, ?)'
  ).run(authReq.userId, title, description, due_date);

  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid) as Goal;
  res.status(201).json({ goal });
});

// PATCH /api/goals/:id
router.patch('/:id', validate(updateSchema), (req, res) => {
  const authReq = req as AuthRequest;
  const goal = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(req.params.id, authReq.userId) as Goal | undefined;

  if (!goal) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  const updates = req.body;
  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length > 0) {
    values.push(req.params.id);
    db.prepare(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  // If goal was completed, award XP
  if (updates.status === 'completed' && goal.status !== 'completed') {
    awardXp(authReq.userId!, XP_REWARDS.COMPLETE_GOAL);
    checkAchievements(authReq.userId!);
  }

  const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id) as Goal;
  res.json({ goal: updated });
});

// DELETE /api/goals/:id
router.delete('/:id', (req, res) => {
  const authReq = req as AuthRequest;
  const result = db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(req.params.id, authReq.userId);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Goal not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
