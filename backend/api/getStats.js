import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const visitsPath = path.resolve(process.cwd(), 'backend/storage/visits.json');
    const visits = JSON.parse(fs.readFileSync(visitsPath, 'utf-8'));

    const totalVisits = Object.values(visits).reduce((sum, v) => sum + v, 0);
    const totalCountries = Object.keys(visits).length;

    res.status(200).json({ totalVisits, totalCountries });
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ error: 'Could not read stats' });
  }
}
