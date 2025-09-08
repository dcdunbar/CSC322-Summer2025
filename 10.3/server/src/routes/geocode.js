import express from 'express';

const router = express.Router();

async function asJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('geocode ' + r.status);
  return r.json();
}

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) { res.status(400).json({ error: 'q required' }); return; }

  try {
    // US ZIP: 5 digits
    if (/^\d{5}$/.test(q)) {
      const z = await asJson('https://api.zippopotam.us/us/' + q);
      const p = z.places && z.places[0];
      if (!p) throw new Error('no zip');
      res.json({
        lat: parseFloat(p.latitude),
        lon: parseFloat(p.longitude),
        name: p['place name'] + ', ' + z['state abbreviation'],
        source: 'zip'
      });
      return;
    }

    // City search via Open-Meteo Geocoding
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name', q);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');
    url.searchParams.set('format', 'json');

    const g = await asJson(url.toString());
    if (!g?.results?.length) throw new Error('no city');
    const r0 = g.results[0];
    res.json({
      lat: r0.latitude,
      lon: r0.longitude,
      name: [r0.name, r0.admin1, r0.country_code].filter(Boolean).join(', '),
      source: 'city'
    });
  } catch {
    res.status(404).json({ error: 'Location not found' });
  }
});

export default router;
