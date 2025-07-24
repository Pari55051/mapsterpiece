import fs from 'fs';
import path from 'path';
import geoip from 'geoip-lite';

const visitsPath = path.resolve(process.cwd(), 'backend/storage/visits.json');

export default async function handler(req, res) {
  try {
    // Get IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

    // Lookup IP → geo
    const geo = geoip.lookup(ip) || geoip.lookup('8.8.8.8'); // fallback for localhost

    if (!geo || !geo.country) {
      return res.status(400).json({ error: 'Could not determine country from IP' });
    }

    const country = geo.country;

    // Read visit data
    const data = fs.existsSync(visitsPath)
      ? JSON.parse(fs.readFileSync(visitsPath, 'utf8'))
      : {};

    // Increment visit count
    data[country] = (data[country] || 0) + 1;

    // Save visit data
    fs.writeFileSync(visitsPath, JSON.stringify(data, null, 2));

    // 🔁 Redirect to map with highlight
    res.writeHead(302, {
      Location: `/api/getMapSVG?highlight=${country}`,
    });
    res.end();
  } catch (err) {
    console.error('💥 Error logging visit:', err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
}
