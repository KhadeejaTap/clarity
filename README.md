# ✦ Clarity

A gamified productivity app with a Chrome extension for blocking distracting websites and a backend API for tracking goals, todos, and focus sessions.

## Features

### Chrome Extension
- **Pomodoro Timer** — 25 min work / 5 min break (customizable)
- **Site Blocker** — manually add domains to block during focus sessions
- **Category Blocking** — block entire categories (Social Media, Entertainment, News, Shopping, Gaming)
- **Streak Tracker** — tracks consecutive days of focus sessions

### Backend API
- **Auth** — register, login, JWT-based authentication
- **Goals & Todos** — full CRUD, link todos to goals
- **Focus Sessions** — log pomodoros, sync from extension
- **XP & Leveling** — earn XP for completing tasks and sessions, level up
- **Achievements** — unlock badges for streaks, task milestones, focus time
- **Stats** — overview, GitHub-style heatmap data, weekly summaries

## Setup

### Extension
```bash
npm install
npm run build:ext
```

Load in Chrome:
1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

### Server
```bash
cd server
npm install
npx tsx src/index.ts
# ✦ Clarity API running on http://localhost:3001
```

## Development

```bash
# Extension
npm run dev          # Vite dev server (UI preview)
npm run build:ext    # Build extension to dist/

# Server
cd server
npm run dev          # Auto-restart on file changes
```

## Project Structure

```
├── src/                     # Chrome extension
│   ├── background/          # Service worker (timer, blocking, streaks)
│   ├── popup/               # React popup UI
│   │   ├── components/      # Timer, BlockList, Categories, Streak
│   │   └── hooks/           # useExtensionState
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Storage, categories, blocking rules
│
└── server/                  # Express API
    └── src/
        ├── db/              # SQLite connection, migrations
        ├── middleware/       # JWT auth, Zod validation
        ├── routes/          # auth, goals, todos, sessions, stats, achievements
        ├── services/        # XP, streaks, achievements logic
        └── types/           # Backend TypeScript types
```

## Tech Stack

| Layer | Tech |
|---|---|
| Extension | React, TypeScript, Vite, CSS Modules, Chrome Manifest V3 |
| Server | Express.js, TypeScript, SQLite (better-sqlite3) |
| Auth | JWT, bcrypt |
| Validation | Zod |
