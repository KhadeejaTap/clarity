import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUserAchievements } from '../services/achievements.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();
router.use(authenticate);

// GET /api/achievements
router.get('/', (req, res) => {
  const authReq = req as AuthRequest;
  const achievements = getUserAchievements(authReq.userId!);
  res.json({ achievements });
});

export default router;
