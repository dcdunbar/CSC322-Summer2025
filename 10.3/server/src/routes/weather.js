import express from 'express';
import { getCache, setCache } from '../cache.js';
import { cToF } from '../utils.js';

const router = express.Router();
function keyFor(lat, lon, units) {
  const a = Number.parseFloat(lat).toFixed(3);
  const b = Number.parseFloat(lon).toFixed(3);
  return 'weather:' + a + ':' + b + ':' + units;
}
function mmToIn(v){ return Math.round((v / 25.4) * 100) / 100; } // 2 decimals

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;
  let { units } = req.query;
  units = (units === 'metric' || units === 'imperial') ? units : 'imperial';
  if (!lat || !lon) { res.status(400).json({ error: 'lat and lon are required' }); return; }

  const cacheKey = keyFor(lat, lon, units);
  const cached = getCache(cacheKey);
  if (cached) { res.json({ source: 'cache', ...cached }); return; }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code');
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum');
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('timezone', 'auto');

  try {
    const r = await fetch(url.toString());
    if (!r.ok) { res.status(502).json({ error: 'Failed to fetch weather' }); return; }
    const data = await r.json();

    // annotate precip unit
    if (data?.daily) data.daily.precipitation_unit = 'mm';

    if (units === 'imperial') {
      if (data?.current_weather?.temperature != null)
        data.current_weather.temperature = Math.round(cToF(data.current_weather.temperature));
      if (Array.isArray(data?.hourly?.temperature_2m))
        data.hourly.temperature_2m = data.hourly.temperature_2m.map(v => Math.round(cToF(v)));
      if (Array.isArray(data?.daily?.temperature_2m_max))
        data.daily.temperature_2m_max = data.daily.temperature_2m_max.map(v => Math.round(cToF(v)));
      if (Array.isArray(data?.daily?.temperature_2m_min))
        data.daily.temperature_2m_min = data.daily.temperature_2m_min.map(v => Math.round(cToF(v)));
      if (Array.isArray(data?.daily?.precipitation_sum)) {
        data.daily.precipitation_sum = data.daily.precipitation_sum.map(mmToIn);
        data.daily.precipitation_unit = 'in';
      }
      data.units = 'imperial';
    } else {
      data.units = 'metric';
    }

    const payload = { data };
    setCache(cacheKey, payload, 600);
    res.json({ source: 'api', ...payload });
  } catch {
    res.status(502).json({ error: 'Failed to fetch weather' });
  }
});

export default router;
