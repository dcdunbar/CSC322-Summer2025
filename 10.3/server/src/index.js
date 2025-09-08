import express from 'express';
import cors from 'cors';
import { PORT, HOST, CORS_ORIGIN } from './config.js';
import authRoutes from './routes/auth.js';
import weatherRoutes from './routes/weather.js';
import userRoutes from './routes/user.js';
import geocodeRoutes from './routes/geocode.js';

const app = express();
const allowed = Array.isArray(CORS_ORIGIN) ? CORS_ORIGIN : [CORS_ORIGIN];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS: ' + origin));
  }
}));

app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, HOST, () => {
  console.log('Server listening on http://' + HOST + ':' + PORT);
});
