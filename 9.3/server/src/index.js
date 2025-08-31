import express from 'express';
import cors from 'cors';
import { PORT, CORS_ORIGIN } from './config.js';
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js';

const HOST = process.env.HOST || '127.0.0.1'; // force IPv4 bind on Windows

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: false }));
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

// Start server (bind to HOST explicitly)
const server = app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
