// scripts/resetVisits.js
import fs from 'fs';
import path from 'path';

const visitsPath = path.resolve('backend/storage/visits.json');

fs.writeFileSync(visitsPath, '{}', 'utf-8');
console.log('✅ visits.json has been reset.');
