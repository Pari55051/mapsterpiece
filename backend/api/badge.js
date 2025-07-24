import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    const theme = req.query.theme === 'dark' ? 'dark' : 'light';

    const keys = await redis.keys('visits:*');
    const visits = {};

    for (const key of keys) {
      const countryCode = key.split(':')[1];
      const count = await redis.get(key);
      visits[countryCode] = parseInt(count || 0);
    }

    const totalVisits = Object.values(visits).reduce((a, b) => a + b, 0);
    const totalCountries = Object.keys(visits).length;

    const isDark = theme === 'dark';

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      schemaVersion: 1,
      label: 'Mapsterpiece',
      message: `${totalCountries} countries • ${totalVisits} visits`,
      color: isDark ? 'yellow' : 'blue',
      labelColor: isDark ? 'black' : 'gray',
      style: 'flat-square',
      namedLogo: 'world-map',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      schemaVersion: 1,
      label: 'Mapsterpiece',
      message: 'error',
      color: 'red',
    });
  }
}
