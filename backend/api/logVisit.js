import fs from 'fs';
import path from 'path';
import geoip from 'geoip-lite';

const visitsPath = path.resolve(process.cwd(), 'backend/storage/visits.json');

export default async function handler(req, res) {
  try {
    // Get visitor IP (handle x-forwarded-for or fallback)
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

    // Fallback for local testing (geoip won't resolve 127.0.0.1)
    const geo = geoip.lookup(ip) || geoip.lookup('8.8.8.8'); // Google DNS as mock
    if (!geo || !geo.country) {
      return res.status(400).json({ error: 'Could not determine country from IP' });
    }

    const country = geo.country;

    // Read visits.json
    const data = fs.existsSync(visitsPath)
      ? JSON.parse(fs.readFileSync(visitsPath, 'utf8'))
      : {};

    // Increment visit count
    data[country] = (data[country] || 0) + 1;

    // Write updated visits.json
    fs.writeFileSync(visitsPath, JSON.stringify(data, null, 2));

    res.status(200).json({ message: `Visit from ${country} logged.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
}
