import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { DB_PATH } from '../config.js';

const db: DatabaseType = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
