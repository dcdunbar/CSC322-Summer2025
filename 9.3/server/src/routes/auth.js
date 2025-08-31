import { db } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import express from 'express';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const hash = await bcrypt.hash(password, 10);
    try {
      db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email.toLowerCase(), hash);
    } catch (e) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return res.status(201).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const row = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email.toLowerCase());
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ uid: row.id, email: row.email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  return res.json({ ok: true });
});

router.get('/me', (req, res) => {
  return res.json({ note: 'Use /api/auth/login to get a token; include as Authorization: Bearer <token>' });
});

export default router;
