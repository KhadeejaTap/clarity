import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { runMigrations } from './db/migrate.js';
import authRoutes from './routes/auth.js';
import goalRoutes from './routes/goals.js';
import todoRoutes from './routes/todos.js';
import sessionRoutes from './routes/sessions.js';
import statRoutes from './routes/stats.js';
import achievementRoutes from './routes/achievements.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/achievements', achievementRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'Clarity API' });
});

// Run migrations and start server
runMigrations();

app.listen(PORT, () => {
  console.log(`✦ Clarity API running on http://localhost:${PORT}`);
});
