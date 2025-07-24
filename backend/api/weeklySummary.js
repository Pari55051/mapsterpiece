import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function getWeekKey(countryCode, week) {
  return `week:${week}:visits:${countryCode}`;
}

function getCurrentWeekNumber() {
  const now = new Date();
  const firstJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - firstJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((now.getDay() + 1 + days) / 7);
}

export default async function handler(req, res) {
  try {
    const currentWeek = getCurrentWeekNumber();
    const keys = await redis.keys(`week:${currentWeek}:visits:*`);
    let totalVisits = 0;
    const countries = new Set();

    for (const key of keys) {
      const country = key.split(':').pop();
      const count = parseInt((await redis.get(key)) || 0, 10);
      if (count > 0) {
        totalVisits += count;
        countries.add(country);
      }
    }

    const message = `This week: **${totalVisits}** new visit${totalVisits !== 1 ? 's' : ''} from **${countries.size}** countr${countries.size === 1 ? 'y' : 'ies'}.`;

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      totalVisits,
      newCountries: countries.size,
      message,
    });
  } catch (error) {
    console.error('❌ Failed to get weekly summary:', error);
    res.status(500).json({ error: 'Could not fetch weekly stats' });
  }
}
