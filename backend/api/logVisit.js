import geoip from 'geoip-lite';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('Missing Redis environment variables');
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

    const geo = geoip.lookup(ip) || geoip.lookup('8.8.8.8'); // fallback
    if (!geo || !geo.country) {
      console.warn('🟡 Could not determine country for IP:', ip);
      return res.status(400).json({ error: 'Could not determine country from IP' });
    }

    const country = geo.country;
    const key = `visits:${country}`;

    await redis.incr(key);
    console.log(`✅ Visit logged for ${country} (${ip})`);

    res.status(200).json({ message: `Visit from ${country} logged.` });
  } catch (err) {
    console.error('❌ Error in logVisit:', err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
}
