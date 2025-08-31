import express from 'express';
import cors from 'cors';
import { PORT, CORS_ORIGIN } from './config.js';
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js';

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: false }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
