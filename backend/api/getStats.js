import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    const keys = await redis.keys('visits:*');
    const visits = {};

    for (const key of keys) {
      const countryCode = key.split(':')[1];
      const count = await redis.get(key);
      visits[countryCode] = parseInt(count || 0);
    }

    const totalVisits = Object.values(visits).reduce((a, b) => a + b, 0);
    const totalCountries = Object.keys(visits).length;

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ totalCountries, totalVisits });
  } catch (err) {
    console.error('Failed to get stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
