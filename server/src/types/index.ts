export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  xp: number;
  level: number;
  current_streak: number;
  last_active_date: string;
  total_focus_minutes: number;
  created_at: string;
}

export interface UserPublic {
  id: number;
  email: string;
  username: string;
  xp: number;
  level: number;
  current_streak: number;
  last_active_date: string;
  total_focus_minutes: number;
  created_at: string;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  due_date: string | null;
  created_at: string;
}

export interface Todo {
  id: number;
  user_id: number;
  goal_id: number | null;
  title: string;
  xp_reward: number;
  completed: number; // SQLite uses 0/1 for booleans
  completed_at: string | null;
  created_at: string;
}

export interface FocusSession {
  id: number;
  user_id: number;
  duration_minutes: number;
  pomodoros_completed: number;
  date: string;
  started_at: string;
}

export interface Achievement {
  id: number;
  user_id: number;
  achievement_key: string;
  unlocked_at: string;
}

// JWT payload
export interface JwtPayload {
  userId: number;
}

// Express request with user
import type { Request } from 'express';
export interface AuthRequest extends Request {
  userId?: number;
}
