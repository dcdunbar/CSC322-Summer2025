import express from 'express';
import fetch from 'node-fetch';
import { getCache, setCache } from '../cache.js';

const router = express.Router();

function makeKey(lat, lon) {
  const l1 = parseFloat(lat).toFixed(3);
  const l2 = parseFloat(lon).toFixed(3);
  return `weather:${l1}:${l2}`;
}

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

  const key = makeKey(lat, lon);
  const cached = getCache(key);
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
    const payload = { data };
    setCache(key, payload, 600);
    return res.json({ source: 'api', ...payload });
  } catch (e) {
    return res.status(502).json({ error: 'Failed to fetch weather' });
  }
});

export default router;
