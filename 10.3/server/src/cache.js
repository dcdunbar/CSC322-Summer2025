import { db } from './db.js';
import { CACHE_TTL_SECONDS } from './config.js';

export function getCache(key) {
  const row = db.prepare('SELECT value, expires_at FROM cache WHERE key = ?').get(key);
  if (!row) return null;
  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at <= now) {
    db.prepare('DELETE FROM cache WHERE key = ?').run(key);
    return null;
  }
  try { return JSON.parse(row.value); } catch { return null; }
}

export function setCache(key, value, ttl = CACHE_TTL_SECONDS) {
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const payload = JSON.stringify(value);
  const sql =
    'INSERT INTO cache(key, value, expires_at) VALUES(?, ?, ?) ' +
    'ON CONFLICT(key) DO UPDATE SET value=excluded.value, expires_at=excluded.expires_at';
  db.prepare(sql).run(key, payload, expires);
}
