# Weather App — Final (10.3)

**Author:** David Dunbar  
**Title:** Weather App  
**Description:** A modern, responsive weather app that shows current, hourly, and 7-day forecasts with dynamic themes. Includes user accounts (register/login), password change, personal preferences (°F/°C and default location), and favorites. Normal users search by **city or ZIP**—no lat/long needed.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start (Local Preview)](#quick-start-local-preview)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Build & Deploy](#build--deploy)
- [Troubleshooting](#troubleshooting)
- [Contributor Guidelines](#contributor-guidelines)
- [License](#license)
- [References](#references)

---

## Features
- **City/ZIP search** (server geocoding) and “Use My Location”
- **Responsive layout**: 3-column (logged out) or 4-column (logged in) that fills the header width
- **Units**: °F/°C toggle; in °F mode precipitation is shown in **inches** (imperial), °C shows **mm**
- **Clean display**: proper degree symbol, simplified dates (e.g., Sun 9 - 7)
- **User accounts**: register, login, logout
- **Password change** (authenticated)
- **Preferences**: save default units and default location
- **Favorites**: save named locations, one-click load
- **Caching**: server caches API responses for faster repeat loads

---

## Architecture
- **Client**: React + Vite (`10.3/client/`)
- **Server**: Node.js + Express + better-sqlite3 (`10.3/server/`)
- **DB/Cache**: SQLite (created on first run at `10.3/server/data/app.db`)
- **Weather API**: Open-Meteo  
- **Geocoding**: Open-Meteo Geocoding (city) and Zippopotam (US ZIP)

---

## Prerequisites
- **Node.js**: v18+ (tested on Node 18–22)
- **npm**: v9+  
- Windows PowerShell or macOS/Linux shell

---

## Quick Start (Local Preview)

### 1) Start the API (server)
    cd 10.3\server
    npm install
    Copy-Item .env.example .env -Force
    npm start

You should see: Server listening on http://127.0.0.1:4000  
Health check: http://127.0.0.1:4000/api/health → {"ok":true}

### 2) Start the Web App (client)
    cd ..\client
    npm install
    npm run dev

Open the printed URL (usually http://127.0.0.1:5173).

Note: If either port is already in use, kill the process on that port or let Vite pick the next open port.

---

## Usage
- In the search box, type a **city** (e.g., Louisville) or **ZIP** (e.g., 40202) and click **Search**.
- Or click **Use My Location** to use browser geolocation.
- Toggle **°F/°C**. In °F, precipitation shows as **inches**; in °C, **mm**.
- **Register** and **Login** to:
  - Save **Preferences** (units + default location)
  - Add **Favorites** (name + location) and load them with one click
  - **Change Password**

---

## API Endpoints
**Base:** http://127.0.0.1:4000/api

- `GET /health` → `{ ok: true }`
- `GET /geocode?q=<city or ZIP>` → `{ lat, lon, name, source }`
- `GET /weather?lat=<lat>&lon=<lon>&units=imperial|metric` → `{ source, data }` (cached ~10 min)

**Auth**
- `POST /auth/register` → `{ ok: true }`
- `POST /auth/login` → `{ token }`
- `PATCH /auth/password` (Bearer) → `{ ok: true }`

**User**
- `GET /user/prefs` (Bearer) → user preferences  
- `PUT /user/prefs` (Bearer) → upsert preferences  
- `GET /user/favorites` (Bearer) → list favorites  
- `POST /user/favorites` (Bearer) → create favorite  
- `DELETE /user/favorites/:id` (Bearer) → remove favorite

---

## Build & Deploy

### Frontend (static)
    cd 10.3\client
    npm run build
(Output in `client/dist` — can be hosted on GitHub Pages, Netlify, Vercel, etc.)

### Backend (server)
Deploy to a Node host (Render, Railway, fly.io, VPS, etc.).  
Env vars:
    PORT=4000
    HOST=127.0.0.1
    CORS_ORIGIN=<your frontend origin, e.g., http://127.0.0.1:5173>
    JWT_SECRET=<change me>
    CACHE_TTL_SECONDS=600

### Add link on portfolio index
In your portfolio `index.html`, add:
    <li><a href="./10.3/client/">Weather App (Final 10.3)</a></li>

---

## Troubleshooting
- **Client can’t reach API / red proxy errors**  
  Ensure server is running and http://127.0.0.1:4000/api/health returns ok.
- **Port already in use (4000/5173)**  
    netstat -ano | findstr :4000
    taskkill /PID <PID> /F
  (Repeat for 5173.)
- **CORS blocked**  
  Set `CORS_ORIGIN` in `10.3/server/.env` to your client origin (e.g., http://127.0.0.1:5173) and restart server.
- **better-sqlite3 build/install issues**  
    cd 10.3\server
    npm rebuild better-sqlite3

---

## Contributor Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, etc.).
- Keep components small and focused.
- Don’t commit `.env`, `server/data/*.db`, or `client/dist/`.
- PRs should include a quick before/after note or screenshot for UI changes.

---

## License
MIT — see `LICENSE` in this folder.

---

## References
- kc-clintone — The Ultimate Guide to Writing a Great README.md for Your Project
- Open-Meteo Weather & Geocoding APIs
- Zippopotam.us (US ZIP geocoding)
