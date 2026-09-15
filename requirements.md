# Requirements

## Stage 1 — Chrome Extension ✅

### Must Have
- [x] Pomodoro timer (configurable work/break durations)
- [x] Manual site blocklist (add/remove domains)
- [x] Category-based blocking (Social Media, Entertainment, News, Shopping, Gaming)
- [x] Sites blocked only during work sessions, unblocked during breaks
- [x] Streak counter (consecutive days of focus sessions)
- [x] "Site blocked" redirect page
- [x] Popup UI with tabs (Timer, Sites, Categories)

### Nice to Have
- [ ] Notification sounds
- [ ] Custom categories (user-defined)
- [ ] Whitelist mode (block everything except allowed sites)
- [ ] Daily stats page (pomodoros completed, focus time)
- [ ] Export/import settings

## Stage 2 — Backend API ✅

- [x] Express + SQLite backend
- [x] User auth (register, login, JWT)
- [x] Goals CRUD
- [x] Todos CRUD + completion with XP
- [x] Focus sessions logging
- [x] XP + Levels system (level = floor(sqrt(xp/50)) + 1)
- [x] Streak tracking (server-side)
- [x] Achievements system (8 unlockable badges)
- [x] Stats endpoints (overview, heatmap, weekly summary)

### Not Yet Done
- [ ] Extension syncs focus sessions to server
- [ ] Login UI in extension popup
- [ ] Full web app frontend (dashboard, goals, todos UI)
- [ ] GitHub-style contribution heatmap (frontend)
- [ ] Charts & graphs (frontend)
- [ ] Retro / pixel-art UI theme

## Stage 3 — AI Assistant (Future)

- [ ] Smart insights ("You're most productive on Tuesdays")
- [ ] AI task prioritization
- [ ] Chat assistant for goal planning
