export type CategoryId = 'social' | 'entertainment' | 'news' | 'shopping' | 'gaming';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string; // emoji
  domains: string[];
}

export interface ExtensionState {
  // Blocklist
  blockedSites: string[];
  blockedCategories: CategoryId[];

  // Timer
  timerState: 'idle' | 'work' | 'break';
  timerEndTime: number | null; // Unix timestamp ms
  pomodoroCount: number; // completed today
  workDuration: number; // minutes, default 25
  breakDuration: number; // minutes, default 5

  // Streak
  currentStreak: number;
  lastActiveDate: string; // ISO date string "YYYY-MM-DD"
  totalFocusMinutes: number;
}

export const DEFAULT_STATE: ExtensionState = {
  blockedSites: [],
  blockedCategories: [],
  timerState: 'idle',
  timerEndTime: null,
  pomodoroCount: 0,
  workDuration: 25,
  breakDuration: 5,
  currentStreak: 0,
  lastActiveDate: '',
  totalFocusMinutes: 0,
};

// Message types for communication between popup and service worker
export type MessageType =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'SKIP_BREAK' }
  | { type: 'GET_STATE' }
  | { type: 'ADD_SITE'; domain: string }
  | { type: 'REMOVE_SITE'; domain: string }
  | { type: 'TOGGLE_CATEGORY'; categoryId: CategoryId }
  | { type: 'UPDATE_SETTINGS'; workDuration: number; breakDuration: number };

export type MessageResponse =
  | { success: true; state: ExtensionState }
  | { success: false; error: string };
