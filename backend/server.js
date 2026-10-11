const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS so Chrome extension can communicate with server
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	if (req.method === 'OPTIONS') return res.sendStatus(200);
	next();
});

app.use((req, res, next) => {
	console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
	next();
});

// GET current XP and Level stats
app.get('/stats', (req, res) => {
	const stats = db.prepare('SELECT xp FROM stats WHERE id = 1').get();
	const sessionCount = db.prepare('SELECT COUNT(*) as count, TOTAL(duration) as totalSeconds FROM sessions').get();
	const level = Math.floor(stats.xp / 10) + 1;

	res.json({
		xp: stats.xp,
		level: level,
		totalSessions: sessionCount.count,
		totalFocusSeconds: sessionCount.totalSeconds
	});
});

// GET all sessions
app.get('/sessions', (req, res) => {
	const sessions = db.prepare('SELECT * FROM sessions ORDER BY completed_at DESC').all();
	res.json(sessions);
});

// POST a new focus session
app.post('/sessions', (req, res) => {
	const { duration } = req.body;

	if (typeof duration !== 'number' || duration <= 0) {
		return res.status(400).json({ error: "duration must be a positive number" });
	}

	const stmt = db.prepare('INSERT INTO sessions (duration) VALUES (?)');
	const result = stmt.run(duration);

	// 1 XP for every full hour (3600 seconds)
	const xpEarned = Math.floor(duration / 3600);
	if (xpEarned > 0) {
		db.prepare('UPDATE stats SET xp = xp + ? WHERE id = 1').run(xpEarned);
	}

	const stats = db.prepare('SELECT xp FROM stats WHERE id = 1').get();
	const level = Math.floor(stats.xp / 10) + 1;

	const newSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid);
	res.status(201).json({
		session: newSession,
		xpEarned,
		totalXp: stats.xp,
		level
	});
});

// GET a single session by id
app.get('/sessions/:id', (req, res) => {
	const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
	if (!session) {
		return res.status(404).json({ error: "Session not found" });
	}
	res.json(session);
});

// DELETE a session
app.delete('/sessions/:id', (req, res) => {
	const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
	if (result.changes === 0) {
		return res.status(404).json({ error: "Session not found" });
	}
	res.status(204).send();
});

app.listen(PORT, () => {
	console.log(`server running on http://localhost:${PORT}`);
});
