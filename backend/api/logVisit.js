import fs from 'fs';
import path from 'path';
import geoip from 'geoip-lite';

export default function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);

  if (!geo || !geo.country) {
    return res.status(200).json({ error: 'Could not determine country from IP' });
  }

  const country = geo.country;
  const visitsPath = path.resolve(process.cwd(), 'backend/storage/visits.json');
  const visits = JSON.parse(fs.readFileSync(visitsPath, 'utf-8'));

  visits[country] = (visits[country] || 0) + 1;

  fs.writeFileSync(visitsPath, JSON.stringify(visits, null, 2));

  // Redirect to the SVG endpoint with the highlight
  res.writeHead(302, {
    Location: `/api/getMapSVG?highlight=${country}`
  });
  res.end();
}
