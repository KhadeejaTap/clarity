import db from './database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function runMigrations(): void {
  console.log('Running migrations...');

  // Create migrations tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const migrations = [
    '001_initial.sql',
  ];

  const applied = db
    .prepare('SELECT name FROM _migrations')
    .all() as { name: string }[];
  const appliedNames = new Set(applied.map((m) => m.name));

  for (const migration of migrations) {
    if (appliedNames.has(migration)) {
      continue;
    }

    console.log(`  Applying: ${migration}`);
    const sql = readFileSync(
      join(__dirname, 'migrations', migration),
      'utf-8'
    );
    db.exec(sql);
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(migration);
  }

  console.log('Migrations complete.');
}
