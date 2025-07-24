
import fs from 'fs';
import path from 'path';

const visitsPath = path.resolve('backend/storage/visits.json');

const mockVisits = {
  US: 10,
  IN: 8,
  DE: 5,
  BR: 3,
  FR: 2,
  JP: 4,
};

fs.writeFileSync(visitsPath, JSON.stringify(mockVisits, null, 2), 'utf-8');

console.log('✅ Seed data written to visits.json');
