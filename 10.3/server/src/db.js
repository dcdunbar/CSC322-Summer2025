import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'app.db');

export const db = new Database(dbPath);

const schema =
  "CREATE TABLE IF NOT EXISTS users (" +
  "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "  email TEXT UNIQUE NOT NULL," +
  "  password_hash TEXT NOT NULL," +
  "  created_at TEXT NOT NULL DEFAULT (datetime('now'))" +
  ");" +
  "CREATE TABLE IF NOT EXISTS cache (" +
  "  key TEXT PRIMARY KEY," +
  "  value TEXT NOT NULL," +
  "  expires_at INTEGER NOT NULL" +
  ");" +
  "CREATE TABLE IF NOT EXISTS user_settings (" +
  "  user_id INTEGER PRIMARY KEY," +
  "  units TEXT NOT NULL DEFAULT 'imperial'," +
  "  default_lat REAL," +
  "  default_lon REAL," +
  "  updated_at TEXT NOT NULL DEFAULT (datetime('now'))" +
  ");" +
  "CREATE TABLE IF NOT EXISTS favorites (" +
  "  id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "  user_id INTEGER NOT NULL," +
  "  name TEXT NOT NULL," +
  "  lat REAL NOT NULL," +
  "  lon REAL NOT NULL," +
  "  created_at TEXT NOT NULL DEFAULT (datetime('now'))" +
  ");";

db.exec(schema);

export default db;
