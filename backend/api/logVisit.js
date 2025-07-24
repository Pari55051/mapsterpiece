import geoip from 'geoip-lite';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Helper to calculate current ISO week number
function getCurrentWeekNumber() {
  const now = new Date();
  const janFirst = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - janFirst) / (24 * 60 * 60 * 1000));
  return Math.ceil((janFirst.getDay() + 1 + days) / 7);
}

// URL validation helper
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (_) {
    return false;
  }
}

export default async function handler(req, res) {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('Missing Redis environment variables');
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || '8.8.8.8';

    const geo = geoip.lookup(ip) || geoip.lookup('8.8.8.8'); // fallback to Google DNS
    if (!geo || !geo.country) {
      console.warn(' Could not determine country for IP:', ip);
      return res.status(400).json({ error: 'Could not determine country from IP' });
    }

    const country = geo.country;
    const totalKey = `visits:${country}`;
    await redis.incr(totalKey);

    // Track weekly visits
    const week = getCurrentWeekNumber();
    const weekKey = `week:${week}:visits:${country}`;
    await redis.incr(weekKey);

    console.log(`✅ Visit logged for ${country} (${ip}) [Week ${week}]`);

    // Optional redirect back to profile
    const redirectURL = req.query.redirect;
    if (redirectURL && isValidUrl(redirectURL)) {
      return res.writeHead(302, { Location: redirectURL }).end();
    }

    // Fallback JSON response
    res.status(200).json({ message: `Visit from ${country} logged.` });

  } catch (err) {
    console.error(' Error in logVisit:', err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
}
