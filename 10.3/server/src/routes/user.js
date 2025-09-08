import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/prefs', requireAuth, (req, res) => {
  const row = db.prepare('SELECT user_id, units, default_lat, default_lon FROM user_settings WHERE user_id = ?').get(req.user.uid);
  if (!row) return res.json({ units: 'imperial', default_lat: null, default_lon: null });
  return res.json(row);
});

router.put('/prefs', requireAuth, (req, res) => {
  const { units, default_lat, default_lon } = req.body || {};
  const valUnits = (units === 'metric' || units === 'imperial') ? units : 'imperial';
  const sql =
    "INSERT INTO user_settings(user_id, units, default_lat, default_lon, updated_at) " +
    "VALUES(?, ?, ?, ?, datetime('now')) " +
    "ON CONFLICT(user_id) DO UPDATE SET " +
    "units=excluded.units, default_lat=excluded.default_lat, default_lon=excluded.default_lon, updated_at=excluded.updated_at";
  db.prepare(sql).run(req.user.uid, valUnits, default_lat, default_lon);
  const row = db.prepare('SELECT user_id, units, default_lat, default_lon FROM user_settings WHERE user_id = ?').get(req.user.uid);
  return res.json(row);
});

router.get('/favorites', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT id, name, lat, lon FROM favorites WHERE user_id = ? ORDER BY created_at DESC').all(req.user.uid);
  return res.json(rows);
});

router.post('/favorites', requireAuth, (req, res) => {
  const { name, lat, lon } = req.body || {};
  if (!name || lat == null || lon == null) return res.status(400).json({ error: 'name, lat, lon required' });
  const info = db.prepare('INSERT INTO favorites(user_id, name, lat, lon) VALUES (?, ?, ?, ?)').run(req.user.uid, name, lat, lon);
  const row = db.prepare('SELECT id, name, lat, lon FROM favorites WHERE id = ?').get(info.lastInsertRowid);
  return res.status(201).json(row);
});

router.delete('/favorites/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(req.params.id, req.user.uid);
  return res.json({ ok: true });
});

export default router;
