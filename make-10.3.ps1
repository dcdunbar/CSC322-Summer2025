# make-10.3.ps1
$ErrorActionPreference = 'Stop'
$Root = "10.3"

function Write-File($Path, [string]$Content) {
  $Full = Join-Path -Path $Root -ChildPath $Path
  $Dir = Split-Path $Full
  New-Item -ItemType Directory -Force -Path $Dir | Out-Null
  Set-Content -LiteralPath $Full -Value $Content -Encoding UTF8
}

# ---------- Top level ----------
Write-File "LICENSE" @"
MIT License

Copyright (c) $(Get-Date -Format yyyy) David Dunbar
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
"@

Write-File "README.md" @"
# Weather App – Final (10.3)
**Author:** David Dunbar  
**Title:** Weather App  
**Description:** A responsive weather app showing current, hourly, 7-day forecasts; dynamic themes; user accounts, password change, preferences, and favorites.

## Table of Contents
- Features
- Architecture
- Setup & Installation
- Usage
- Deployment
- Contributor Guidelines
- License
- References

## Features
- Real-time weather via Open-Meteo, cached in SQLite.
- Dynamic theming (sunny/rainy/snowy/cloudy).
- User accounts: register, login, logout, **password change**.
- Preferences: °F/°C and default location.
- Favorites: save named locations and load with one click.
- Responsive UI with hourly and weekly forecasts.

## Architecture
- **Client:** React + Vite (`client/`)
- **Server:** Node + Express + better-sqlite3 (`server/`)
- **DB/Cache:** SQLite (created on first run)

## Setup & Installation
### 1) Server
\`\`\`bash
cd server
npm install
cp .env.example .env
npm start
# http://127.0.0.1:4000  (health: /api/health)
\`\`\`
### 2) Client
\`\`\`bash
cd client
npm install
npm run dev
# http://127.0.0.1:5173
\`\`\`

## Usage
- Enter lat/lon or **Use My Location**.
- **Register** → **Login** to access Settings, Favorites, Password Change.
- Toggle °F/°C, set default location, save favorites.

## API (quick)
- POST /api/auth/register, /api/auth/login, PATCH /api/auth/password
- GET/PUT /api/user/prefs
- GET/POST/DELETE /api/user/favorites
- GET /api/weather?lat&lon&units=imperial|metric

## Deployment
Frontend: Pages/Netlify/Vercel. Backend: Render/Railway. Set env: PORT, JWT_SECRET, CORS_ORIGIN.

## Contributor Guidelines
Conventional commits; small components; don’t commit .env or DB.

## License
MIT.

## References
- kc-clintone – The Ultimate Guide to Writing a Great README.md for Your Project
"@

Write-File "INDEX_LINK_SNIPPET.html" '<li><a href="./10.3/client/">Weather App (Final 10.3)</a></li>'
Write-File ".gitignore" @"
node_modules/
.env
.env.local
.env.*.local
server/data/*.db
server/data/*.db-journal
client/dist/
client/.vite/
"@

# ---------- SERVER ----------
Write-File "server/package.json" @"
{
  "name": "weather-app-server",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": { "start": "node src/index.js", "dev": "node --watch src/index.js" },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^9.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "node-fetch": "^3.3.2"
  }
}
"@

Write-File "server/.env.example" @"
PORT=4000
HOST=127.0.0.1
CORS_ORIGIN=http://127.0.0.1:5173
JWT_SECRET=please_change_me
CACHE_TTL_SECONDS=600
"@

Write-File "server/src/config.js" @"
import dotenv from 'dotenv';
dotenv.config();
export const PORT = parseInt(process.env.PORT || '4000', 10);
export const HOST = process.env.HOST || '127.0.0.1';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://127.0.0.1:5173';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
export const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '600', 10);
"@

Write-File "server/src/db.js" @"
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
db.exec(`
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS user_settings (user_id INTEGER PRIMARY KEY, units TEXT NOT NULL DEFAULT 'imperial', default_lat REAL, default_lon REAL, updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, lat REAL NOT NULL, lon REAL NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
`);
export default db;
"@

Write-File "server/src/cache.js" @"
import { db } from './db.js';
import { CACHE_TTL_SECONDS } from './config.js';
export function getCache(key) {
  const row = db.prepare('SELECT value, expires_at FROM cache WHERE key = ?').get(key);
  if (!row) return null;
  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at <= now) { db.prepare('DELETE FROM cache WHERE key = ?').run(key); return null; }
  try { return JSON.parse(row.value); } catch { return null; }
}
export function setCache(key, value, ttl = CACHE_TTL_SECONDS) {
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const payload = JSON.stringify(value);
  db.prepare(`INSERT INTO cache(key, value, expires_at) VALUES(?, ?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, expires_at=excluded.expires_at`).run(key, payload, expires);
}
"@

Write-File "server/src/middleware/auth.js" @"
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
}
"@

Write-File "server/src/utils.js" 'export function cToF(c){ return (c * 9/5) + 32; }\nexport function fToC(f){ return (f - 32) * 5/9; }\n'

Write-File "server/src/routes/auth.js" @"
import { db } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
const router = express.Router();
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const hash = await bcrypt.hash(password, 10);
    try { db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email.toLowerCase(), hash); }
    catch { return res.status(409).json({ error: 'Email already registered' }); }
    return res.status(201).json({ ok: true });
  } catch { return res.status(500).json({ error: 'Server error' }); }
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
  } catch { return res.status(500).json({ error: 'Server error' }); }
});
router.post('/logout', (req, res) => res.json({ ok: true }));
router.patch('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword required' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
    const row = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(req.user.uid);
    if (!row) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.uid);
    return res.json({ ok: true });
  } catch { return res.status(500).json({ error: 'Server error' }); }
});
export default router;
"@

Write-File "server/src/routes/user.js" @"
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
  db.prepare(`INSERT INTO user_settings(user_id, units, default_lat, default_lon, updated_at)
              VALUES(?, ?, ?, ?, datetime('now'))
              ON CONFLICT(user_id) DO UPDATE SET units=excluded.units, default_lat=excluded.default_lat, default_lon=excluded.default_lon, updated_at=excluded.updated_at`)
    .run(req.user.uid, valUnits, default_lat, default_lon);
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
"@

Write-File "server/src/routes/weather.js" @"
import express from 'express';
import fetch from 'node-fetch';
import { getCache, setCache } from '../cache.js';
import { cToF } from '../utils.js';
const router = express.Router();
function keyFor(lat, lon, units) {
  const a = parseFloat(lat).toFixed(3);
  const b = parseFloat(lon).toFixed(3);
  return `weather:${a}:${b}:${units}`;
}
router.get('/', async (req, res) => {
  const { lat, lon } = req.query;
  let { units } = req.query;
  units = (units === 'metric' || units === 'imperial') ? units : 'imperial';
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
  const cacheKey = keyFor(lat, lon, units);
  const cached = getCache(cacheKey);
  if (cached) return res.json({ source: 'cache', ...cached });
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('timezone', 'auto');
  try {
    const r = await fetch(url.toString());
    const data = await r.json();
    if (units === 'imperial') {
      if (data?.current_weather?.temperature != null) data.current_weather.temperature = Math.round(cToF(data.current_weather.temperature));
      if (Array.isArray(data?.hourly?.temperature_2m)) data.hourly.temperature_2m = data.hourly.temperature_2m.map(v => Math.round(cToF(v)));
      if (Array.isArray(data?.daily?.temperature_2m_max)) data.daily.temperature_2m_max = data.daily.temperature_2m_max.map(v => Math.round(cToF(v)));
      if (Array.isArray(data?.daily?.temperature_2m_min)) data.daily.temperature_2m_min = data.daily.temperature_2m_min.map(v => Math.round(cToF(v)));
      data.units = 'imperial';
    } else { data.units = 'metric'; }
    const payload = { data };
    setCache(cacheKey, payload, 600);
    return res.json({ source: 'api', ...payload });
  } catch { return res.status(502).json({ error: 'Failed to fetch weather' }); }
});
export default router;
"@

Write-File "server/src/index.js" @"
import express from 'express';
import cors from 'cors';
import { PORT, HOST, CORS_ORIGIN } from './config.js';
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js';
import userRoutes from './routes/user.js';
const app = express();
const allowed = Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN : [CORS_ORIGIN];
app.use(cors({ origin: (origin, cb)=>{ if(!origin) return cb(null,true); if(allowed.includes(origin)) return cb(null,true); return cb(new Error('Not allowed by CORS: '+origin)); }}));
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/user', userRoutes);
app.listen(PORT, HOST, () => { console.log(`Server listening on http://${HOST}:${PORT}`); });
"@

# ---------- CLIENT ----------
Write-File "client/package.json" @"
{
  "name": "weather-app-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1" },
  "devDependencies": { "@vitejs/plugin-react": "^4.3.1", "vite": "^5.4.2" }
}
"@

Write-File "client/vite.config.js" @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', proxy: { '/api': 'http://127.0.0.1:4000' } }
})
"@

Write-File "client/index.html" @"
<!doctype html>
<html lang='en'><head>
<meta charset='UTF-8'/><meta name='viewport' content='width=device-width, initial-scale=1.0'/>
<title>Weather App</title></head>
<body><div id='root'></div><script type='module' src='/src/main.jsx'></script></body>
</html>
"@

Write-File "client/src/main.jsx" @"
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
"@

Write-File "client/src/styles.css" @"
*{box-sizing:border-box}
:root{--bg:#0b1020;--fg:#e8eef8;--muted:#a8b3c7;--card:#141b34}
body{margin:0;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--fg)}
a{color:inherit}
.container{max-width:1080px;margin:0 auto;padding:16px}
nav{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:16px}
nav h1{font-size:20px;margin:0}
button, input, select{font-size:14px;padding:8px 10px;border-radius:8px;border:1px solid #2b365f;background:#121933;color:var(--fg)}
button{cursor:pointer}
.card{background:var(--card);border:1px solid #222b52;border-radius:14px;padding:14px;margin-bottom:12px;box-shadow:0 2px 10px rgba(0,0,0,0.2)}
.card:hover{transform:translateY(-1px);transition:transform .15s ease}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.row{display:flex;gap:8px;align-items:center}
.small{font-size:12px;color:var(--muted)}
.theme-sunny{--bg:#102018;--card:#173824}
.theme-rainy{--bg:#0f1220;--card:#171b34}
.theme-snowy{--bg:#101820;--card:#162233}
.theme-cloudy{--bg:#161a24;--card:#1c2433}
"@

Write-File "client/src/api.js" @"
function authHeaders(){ const t = localStorage.getItem('token'); return t ? { Authorization: `Bearer ${t}` } : {}; }
export async function apiGet(path){ const res = await fetch(path,{headers:{...authHeaders()},credentials:'same-origin'}); if(!res.ok) throw new Error(`GET ${path} failed: ${res.status}`); return res.json(); }
export async function apiPost(path, body){ const res = await fetch(path,{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}); if(!res.ok){const err=await res.json().catch(()=>({})); throw new Error(err.error||`POST ${path} failed: ${res.status}`)} return res.json(); }
export async function apiPatch(path, body){ const res = await fetch(path,{method:'PATCH',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}); if(!res.ok){const err=await res.json().catch(()=>({})); throw new Error(err.error||`PATCH ${path} failed: ${res.status}`)} return res.json(); }
export async function apiPut(path, body){ const res = await fetch(path,{method:'PUT',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)}); if(!res.ok){const err=await res.json().catch(()=>({})); throw new Error(err.error||`PUT ${path} failed: ${res.status}`)} return res.json(); }
export async function apiDelete(path){ const res = await fetch(path,{method:'DELETE',headers:{...authHeaders()}}); if(!res.ok){const err=await res.json().catch(()=>({})); throw new Error(err.error||`DELETE ${path} failed: ${res.status}`)} return res.json(); }
"@

Write-File "client/src/components/ThemeWrapper.jsx" 'export default function ThemeWrapper({ theme="cloudy", children }){ return <div className={`theme-${theme}`}>{children}</div> }'
Write-File "client/src/components/CurrentCard.jsx" @"
export default function CurrentCard({data, unitLabel='°'}){
  const cw = data?.current_weather;
  return (
    <div className='card'>
      <h3 style={{marginTop:0}}>Current</h3>
      {!cw ? <div className='small'>No data yet.</div> : (
        <div className='row' style={{gap:16}}>
          <div style={{fontSize:36}}>{Math.round(cw.temperature)}{unitLabel}</div>
          <div className='small'>
            <div>Wind: {Math.round(cw.windspeed)} m/s</div>
            <div>Dir: {cw.winddirection}°</div>
          </div>
        </div>
      )}
    </div>
  )
}
"@
Write-File "client/src/components/HourlyStrip.jsx" @"
export default function HourlyStrip({data, unitLabel='°'}){
  const h = data?.hourly;
  if(!h) return <div className='card'><h3 style={{marginTop:0}}>Hourly</h3><div className='small'>No data yet.</div></div>;
  const rows = h.time.slice(0,24).map((t,i)=>({
    time: new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    temp: Math.round(h.temperature_2m[i]),
    pop: h.precipitation_probability?.[i] ?? 0
  }));
  return (
    <div className='card'>
      <h3 style={{marginTop:0}}>Next 24 Hours</h3>
      <div className='row' style={{overflowX:'auto', gap:10}}>
        {rows.map((r,idx)=>(
          <div key={idx} style={{minWidth:70,textAlign:'center'}}>
            <div className='small'>{r.time}</div>
            <div style={{fontSize:20}}>{r.temp}{unitLabel}</div>
            <div className='small'>{r.pop}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
"@
Write-File "client/src/components/WeeklyGrid.jsx" @"
export default function WeeklyGrid({data, unitLabel='°'}){
  const d = data?.daily;
  if(!d) return <div className='card'><h3 style={{marginTop:0}}>Weekly</h3><div className='small'>No data yet.</div></div>;
  const days = d.time.map((t,i)=>({
    date: new Date(t).toLocaleDateString([], {weekday:'short', month:'numeric', day:'numeric'}),
    min: Math.round(d.temperature_2m_min[i]),
    max: Math.round(d.temperature_2m_max[i]),
    pr: Math.round((d.precipitation_sum?.[i] ?? 0))
  }));
  return (
    <div className='card'>
      <h3 style={{marginTop:0}}>7-Day Forecast</h3>
      <div className='grid'>
        {days.map((x,idx)=>(
          <div key={idx} className='card' style={{padding:'8px 10px'}}>
            <div className='row' style={{justifyContent:'space-between'}}>
              <div>{x.date}</div>
              <div className='small'>Rain: {x.pr}mm</div>
            </div>
            <div style={{fontSize:22, marginTop:6}}>{x.max}{unitLabel} / <span className='small'>{x.min}{unitLabel}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
"@
Write-File "client/src/components/Login.jsx" @"
import { useState } from 'react'
import { apiPost } from '../api'
export default function Login({ onLogin }){
  const [email,setEmail]=useState('test@example.com')
  const [password,setPassword]=useState('password123')
  const [error,setError]=useState('')
  async function submit(e){ e.preventDefault(); setError(''); try{ const res = await apiPost('/api/auth/login',{email,password}); onLogin(res.token) }catch(err){ setError(err.message) } }
  return (<div className='card' style={{maxWidth:420}}><h3 style={{marginTop:0}}>Login</h3><form onSubmit={submit} className='row' style={{flexDirection:'column', gap:8}}><input value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email'/><input value={password} onChange={e=>setPassword(e.target.value)} placeholder='Password' type='password'/><button type='submit'>Login</button></form>{error && <div className='small' style={{color:'#ff9',marginTop:8}}>{error}</div>}</div>)
}
"@
Write-File "client/src/components/Register.jsx" @"
import { useState } from 'react'
import { apiPost } from '../api'
export default function Register({ onDone }){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [ok,setOk]=useState(false)
  async function submit(e){ e.preventDefault(); setError(''); try{ await apiPost('/api/auth/register',{email,password}); setOk(true); onDone && onDone() }catch(err){ setError(err.message) } }
  return (<div className='card' style={{maxWidth:420}}><h3 style={{marginTop:0}}>Register</h3><form onSubmit={submit} className='row' style={{flexDirection:'column', gap:8}}><input value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email'/><input value={password} onChange={e=>setPassword(e.target.value)} placeholder='Password (min 8)' type='password'/><button type='submit'>Create Account</button></form>{ok && <div className='small' style={{color:'#9f9',marginTop:8}}>Account created. You can log in now.</div>}{error && <div className='small' style={{color:'#ff9',marginTop:8}}>{error}</div>}</div>)
}
"@
Write-File "client/src/components/PasswordChange.jsx" @"
import { useState } from 'react'
import { apiPatch } from '../api'
export default function PasswordChange(){
  const [currentPassword,setCurrent]=useState('')
  const [newPassword,setNew]=useState('')
  const [msg,setMsg]=useState('')
  const [err,setErr]=useState('')
  async function submit(e){ e.preventDefault(); setMsg(''); setErr(''); try{ await apiPatch('/api/auth/password',{currentPassword,newPassword}); setMsg('Password updated.'); setCurrent(''); setNew('') }catch(e){ setErr(e.message) } }
  return (<div className='card' style={{maxWidth:460}}><h3 style={{marginTop:0}}>Change Password</h3><form onSubmit={submit} className='row' style={{flexDirection:'column',gap:8}}><input type='password' placeholder='Current password' value={currentPassword} onChange={e=>setCurrent(e.target.value)} required/><input type='password' placeholder='New password (min 8)' value={newPassword} onChange={e=>setNew(e.target.value)} required/><button type='submit'>Update Password</button></form>{msg && <div className='small' style={{color:'#9f9',marginTop:8}}>{msg}</div>}{err && <div className='small' style={{color:'#ff9',marginTop:8}}>{err}</div>}</div>)
}
"@
Write-File "client/src/components/Settings.jsx" @"
import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '../api'
export default function Settings({ onApply }){
  const [units,setUnits]=useState('imperial')
  const [lat,setLat]=useState('')
  const [lon,setLon]=useState('')
  const [msg,setMsg]=useState('')
  const [err,setErr]=useState('')
  useEffect(()=>{ (async()=>{ try{ const p = await apiGet('/api/user/prefs'); setUnits(p.units||'imperial'); setLat(p.default_lat ?? ''); setLon(p.default_lon ?? '') }catch{} })() },[])
  async function save(e){ e.preventDefault(); setMsg(''); setErr(''); try{ const p = await apiPut('/api/user/prefs',{units, default_lat: lat?parseFloat(lat):null, default_lon: lon?parseFloat(lon):null}); setUnits(p.units||'imperial'); setLat(p.default_lat ?? ''); setLon(p.default_lon ?? ''); setMsg('Preferences saved.'); onApply && onApply(p) }catch(e){ setErr(e.message) } }
  return (<div className='card' style={{maxWidth:520}}><h3 style={{marginTop:0}}>Settings</h3><form onSubmit={save} className='row' style={{flexDirection:'column',gap:8}}><label>Units</label><div className='row'><label><input type='radio' name='units' value='imperial' checked={units==='imperial'} onChange={()=>setUnits('imperial')}/> °F</label><label style={{marginLeft:12}}><input type='radio' name='units' value='metric' checked={units==='metric'} onChange={()=>setUnits('metric')}/> °C</label></div><label>Default Location (optional)</label><div className='row'><input placeholder='lat' value={lat} onChange={e=>setLat(e.target.value)} style={{width:120}}/><input placeholder='lon' value={lon} onChange={e=>setLon(e.target.value)} style={{width:120}}/></div><button type='submit'>Save</button></form>{msg && <div className='small' style={{color:'#9f9',marginTop:8}}>{msg}</div>}{err && <div className='small' style={{color:'#ff9',marginTop:8}}>{err}</div>}</div>)
}
"@
Write-File "client/src/components/Favorites.jsx" @"
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '../api'
export default function Favorites({ onPick }){
  const [items,setItems]=useState([])
  const [name,setName]=useState('')
  const [lat,setLat]=useState('')
  const [lon,setLon]=useState('')
  const [err,setErr]=useState('')
  async function load(){ try{ setItems(await apiGet('/api/user/favorites')) }catch{} }
  useEffect(()=>{ load() },[])
  async function add(e){ e.preventDefault(); setErr(''); try{ const r = await apiPost('/api/user/favorites',{ name, lat: parseFloat(lat), lon: parseFloat(lon) }); setName(''); setLat(''); setLon(''); setItems([r,...items]) }catch(e){ setErr(e.message) } }
  async function del(id){ try{ await apiDelete('/api/user/favorites/'+id); setItems(items.filter(x=>x.id!==id)) }catch(e){ setErr(e.message) } }
  return (<div className='card'><h3 style={{marginTop:0}}>Favorites</h3><form onSubmit={add} className='row' style={{gap:8,flexWrap:'wrap'}}><input placeholder='Name (e.g., Home)' value={name} onChange={e=>setName(e.target.value)} style={{minWidth:160}} required/><input placeholder='lat' value={lat} onChange={e=>setLat(e.target.value)} style={{width:120}} required/><input placeholder='lon' value={lon} onChange={e=>setLon(e.target.value)} style={{width:120}} required/><button type='submit'>Add</button></form>{err && <div className='small' style={{color:'#ff9',marginTop:8}}>{err}</div>}<div className='grid' style={{marginTop:8}}>{items.map(i=>(<div key={i.id} className='card' style={{padding:'8px 10px'}}><div className='row' style={{justifyContent:'space-between'}}><strong>{i.name}</strong><div className='row' style={{gap:6}}><button onClick={()=>onPick && onPick(i.lat, i.lon)}>Load</button><button onClick={()=>del(i.id)}>Delete</button></div></div><div className='small'>{i.lat}, {i.lon}</div></div>))}{!items.length && <div className='small'>No favorites yet.</div>}</div></div>)
}
"@

Write-File "client/src/App.jsx" @"
import { useEffect, useMemo, useState } from 'react'
import { apiGet } from './api'
import ThemeWrapper from './components/ThemeWrapper'
import CurrentCard from './components/CurrentCard'
import HourlyStrip from './components/HourlyStrip'
import WeeklyGrid from './components/WeeklyGrid'
import Login from './components/Login'
import Register from './components/Register'
import PasswordChange from './components/PasswordChange'
import Settings from './components/Settings'
import Favorites from './components/Favorites'
export default function App(){
  const [lat,setLat]=useState('38.254')
  const [lon,setLon]=useState('-85.759')
  const [units,setUnits]=useState(localStorage.getItem('units')||'imperial')
  const [wx,setWx]=useState(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [token,setToken]=useState(localStorage.getItem('token')||'')
  const [view,setView]=useState('weather')
  const theme = useMemo(()=>{
    const code = wx?.data?.current_weather?.weathercode ?? 0
    if([0,1].includes(code)) return 'sunny'
    if([2,3].includes(code)) return 'cloudy'
    if([51,53,55,61,63,65,80,81,82].includes(code)) return 'rainy'
    if([71,73,75,77,85,86].includes(code)) return 'snowy'
    return 'cloudy'
  },[wx])
  async function loadWeather(l=lat, g=lon, u=units){
    setLoading(true); setError('')
    try{
      const data = await apiGet(`/api/weather?lat=${l}&lon=${g}&units=${u}`)
      setWx(data)
    }catch(e){ setError(e.message) } finally { setLoading(false) }
  }
  useEffect(()=>{ loadWeather() },[])
  function onGeo(){
    if(!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(pos=>{
      const la = pos.coords.latitude.toFixed(3)
      const lo = pos.coords.longitude.toFixed(3)
      setLat(la); setLon(lo); loadWeather(la, lo, units)
    },()=>alert('Unable to get location'))
  }
  useEffect(()=>{ if(lat&&lon) loadWeather(lat, lon, units) },[lat,lon,units])
  function doLogout(){ localStorage.removeItem('token'); setToken(''); setView('weather') }
  function applyPrefs(p){ if(p?.units){ setUnits(p.units); localStorage.setItem('units', p.units) } if(p?.default_lat && p?.default_lon){ setLat(String(p.default_lat)); setLon(String(p.default_lon)) } }
  const unitLabel = units === 'imperial' ? '°F' : '°C'
  return (<ThemeWrapper theme={theme}><div className='container'><nav><h1>Weather App</h1><div className='row'><button onClick={()=>setView('weather')}>Weather</button><button onClick={()=>setView('settings')}>Settings</button>{token && <button onClick={()=>setView('password')}>Password</button>}{!token && <button onClick={()=>setView('login')}>Login</button>}{!token && <button onClick={()=>setView('register')}>Register</button>}{token && <button onClick={doLogout}>Logout</button>}</div></nav>{view==='weather' && (<div><div className='card'><div className='row' style={{justifyContent:'space-between'}}><div className='row'><input value={lat} onChange={e=>setLat(e.target.value)} placeholder='lat' style={{width:120}}/><input value={lon} onChange={e=>setLon(e.target.value)} placeholder='lon' style={{width:120}}/><button onClick={()=>loadWeather()}>Refresh</button><button onClick={onGeo}>Use My Location</button></div><div className='row' style={{gap:8, alignItems:'center'}}><select value={units} onChange={e=>{ setUnits(e.target.value); localStorage.setItem('units',e.target.value) }}><option value='imperial'>°F</option><option value='metric'>°C</option></select><div className='small'>Source: {wx?.source || '-'}</div></div></div>{loading && <div className='small'>Loading...</div>}{error && <div className='small' style={{color:'#ff9'}}>{error}</div>}</div><div className='grid'><CurrentCard data={wx?.data} unitLabel={unitLabel}/><HourlyStrip data={wx?.data} unitLabel={unitLabel}/><WeeklyGrid data={wx?.data} unitLabel={unitLabel}/>{token && <Favorites onPick={(la,lo)=>{ setLat(String(la)); setLon(String(lo)); setView('weather')}} />}</div></div>)}{view==='settings' && <Settings onApply={applyPrefs}/>} {view==='password' && token && <PasswordChange/>} {view==='login' && <Login onLogin={(tok)=>{localStorage.setItem('token',tok);setToken(tok);setView('weather')}}/>} {view==='register' && <Register onDone={()=>setView('login')}/>} <div className='small' style={{marginTop:16}}>Final snapshot – Sep 4, 2025</div></div></ThemeWrapper>)
}
"@

# Zip it up
if (Test-Path $Root) { Compress-Archive -Path "$Root\*" -DestinationPath "10.3-final.zip" -Force }
Write-Host "Done. Created 10.3/ and 10.3-final.zip"
