# Weather App (Progress as of Aug 30, 2025)

This repository contains a full‑stack Weather App in progress. The goal is to provide current, hourly, and weekly forecasts with a dynamic theme and user authentication.

## Status (aligned to project plan milestones)

- ✅ M1 → O1: Repo scaffolding, README scaffold, project folders (Aug 24–25)
- ✅ M2 → O2: Choose API (Open‑Meteo) and data model; set up backend routes (Aug 26)
- ✅ M3 → O2: Implement basic caching with SQLite (Aug 27)
- ✅ M4–M5 → O3: Weather‑based theming baseline + responsive layout pass (Aug 28–29)
- ✅ M6 → O4: Auth baseline (register, login, logout endpoints + JWT) (Aug 30)
- ⬜ M7 → O4: Password change endpoint and UI (due Aug 31)
- ⬜ M8–M9 → O5: Hourly/Weekly polish (Sep 1–2)
- ⬜ M10–M11 → O6: Tests, lint, accessibility/perf checks (Sep 3–4)
- ⬜ M12–M14 → O7/Final: Deploy, buffer, submit (Sep 5–7)

## Local development

### Prereqs
- Node.js 20+ and npm
- Windows/Mac/Linux

### 1) Server
```bash
cd server
npm install
cp .env.example .env   # then edit .env values as needed
npm run dev            # or: npm start
```
Server runs on http://localhost:4000 by default.

### 2) Client
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Client starts on http://localhost:5173 and proxies `/api/*` to the server.

## Features in this snapshot
- Open‑Meteo integration through a simple Express backend with SQLite cache
- React + Vite client with current, hourly, weekly sections
- Basic responsive layout and weather‑based theme
- Auth: register/login/logout with JWT (token stored in localStorage)
- Project structure aligned with the course rubric

## Next Up (immediate)
- Add password change (server & client)
- Add form validation/UI error states & accessibility tweaks
- Improve hourly/weekly visualization and loading states
- Write unit tests and run Lighthouse/Accessibility checks

## License
MIT
