import { Redis } from '@upstash/redis';
import geoip from 'geoip-lite';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
    const geo = geoip.lookup(ip) || geoip.lookup('8.8.8.8');

    if (!geo || !geo.country) {
      return res.status(400).json({ error: 'Could not determine country from IP' });
    }

    const country = geo.country;

    // Increment country visit count in Redis
    await redis.incr(`visits:${country}`);

    res.status(200).json({ message: `Visit from ${country} logged.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
}
