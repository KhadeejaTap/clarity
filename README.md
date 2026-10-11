# Clarity

A focus timer Chrome extension paired with an Express and SQLite backend.

## Features

- **Stopwatch Focus Timer**: Counts up elapsed focus time and persists across popup closures.
- **Dynamic Site Blocker**: Blocks distracting sites via Chrome's Declarative Net Request API only while the focus timer is actively running.
- **Level and XP System**: Awards 1 XP for every hour of completed focus time, leveling up every 10 XP.
- **SQLite Persistence**: Stores focus sessions and accumulated stats permanently in a local SQLite database.
- **Input Sanitization**: Automatically normalizes blocked website entries and prevents duplicate rules.

## Setup

### 1. Start the Backend

```bash
cd backend
npm install
npm start
```

The server runs on `http://localhost:3000`.

### 2. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Turn on **Developer mode** in the top right.
3. Click **Load unpacked** and select this project directory.
4. Open the extension popup from your browser toolbar.

## Project Structure

```text
├── manifest.json       # Extension configuration (Manifest V3)
├── ui/
│   ├── index.html      # Popup interface
│   ├── popup.js        # Timer loop, dynamic rules toggle, backend sync
│   ├── blocklist.html  # Blocklist options page
│   ├── blocklist.js    # Domain sanitization and storage logic
│   └── style.css       # Interface styling
├── backend/
│   ├── server.js       # Express REST API
│   ├── db.js           # SQLite setup and schema
│   └── clarity.db      # SQLite database file
└── utils/              # Project icons
```
