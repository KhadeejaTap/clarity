const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'clarity.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        xp INTEGER DEFAULT 0
    );
    INSERT OR IGNORE INTO stats (id, xp) VALUES (1, 0);

    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration INTEGER NOT NULL,
        completed_at TEXT DEFAULT (datetime('now'))
    );
`);

module.exports = db;
