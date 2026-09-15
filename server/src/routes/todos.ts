import { Router } from 'express';
import { z } from 'zod';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { awardXp } from '../services/xp.js';
import { checkAchievements } from '../services/achievements.js';
import type { Todo, AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  goal_id: z.number().int().nullable().default(null),
  xp_reward: z.number().int().min(1).max(1000).default(10),
});

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  goal_id: z.number().int().nullable().optional(),
  xp_reward: z.number().int().min(1).max(1000).optional(),
});

// GET /api/todos
router.get('/', (req, res) => {
  const authReq = req as AuthRequest;
  const { goal_id, completed } = req.query;

  let query = 'SELECT * FROM todos WHERE user_id = ?';
  const params: unknown[] = [authReq.userId];

  if (goal_id) {
    query += ' AND goal_id = ?';
    params.push(goal_id);
  }

  if (completed !== undefined) {
    query += ' AND completed = ?';
    params.push(completed === 'true' ? 1 : 0);
  }

  query += ' ORDER BY completed ASC, created_at DESC';

  const todos = db.prepare(query).all(...params) as Todo[];
  res.json({ todos });
});

// POST /api/todos
router.post('/', validate(createSchema), (req, res) => {
  const authReq = req as AuthRequest;
  const { title, goal_id, xp_reward } = req.body;

  const result = db.prepare(
    'INSERT INTO todos (user_id, goal_id, title, xp_reward) VALUES (?, ?, ?, ?)'
  ).run(authReq.userId, goal_id, title, xp_reward);

  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid) as Todo;
  res.status(201).json({ todo });
});

// PATCH /api/todos/:id
router.patch('/:id', validate(updateSchema), (req, res) => {
  const authReq = req as AuthRequest;
  const todo = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(req.params.id, authReq.userId) as Todo | undefined;

  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
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
    db.prepare(`UPDATE todos SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id) as Todo;
  res.json({ todo: updated });
});

// PATCH /api/todos/:id/complete
router.patch('/:id/complete', (req, res) => {
  const authReq = req as AuthRequest;
  const todo = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?').get(req.params.id, authReq.userId) as Todo | undefined;

  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  if (todo.completed) {
    res.status(400).json({ error: 'Todo already completed' });
    return;
  }

  db.prepare(
    "UPDATE todos SET completed = 1, completed_at = datetime('now') WHERE id = ?"
  ).run(req.params.id);

  // Award XP
  const user = awardXp(authReq.userId!, todo.xp_reward);
  const newAchievements = checkAchievements(authReq.userId!);

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id) as Todo;
  res.json({
    todo: updated,
    xp_earned: todo.xp_reward,
    user: { xp: user.xp, level: user.level },
    new_achievements: newAchievements,
  });
});

// DELETE /api/todos/:id
router.delete('/:id', (req, res) => {
  const authReq = req as AuthRequest;
  const result = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?').run(req.params.id, authReq.userId);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }

  res.json({ success: true });
});

export default router;
