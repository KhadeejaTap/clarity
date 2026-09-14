# ✦ Clarity

A Chrome extension that blocks distracting websites and helps you focus using a Pomodoro timer.

## Features

- **Pomodoro Timer** — 25 min work / 5 min break (customizable)
- **Site Blocker** — manually add domains to block during focus sessions
- **Category Blocking** — block entire categories (Social Media, Entertainment, News, Shopping, Gaming)
- **Streak Tracker** — tracks consecutive days of focus sessions

## Setup

```bash
npm install
npm run build:ext
```

## Load in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

## Development

```bash
npm run dev          # Vite dev server (for UI preview only)
npm run build:ext    # Build extension to dist/
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── background/          # Service worker (timer, blocking, streaks)
├── popup/               # React popup UI
│   ├── components/      # Timer, BlockList, Categories, Streak
│   └── hooks/           # useExtensionState
├── types/               # Shared TypeScript types
└── utils/               # Storage, categories, blocking rules
```

## Tech Stack

- React + TypeScript
- Vite (build)
- Chrome Manifest V3
- CSS Modules
