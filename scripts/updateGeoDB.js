// scripts/updateGeoDB.js
import { execSync } from 'child_process';

console.log('📦 Updating geoip-lite database...');
execSync('npx geoip-lite --update', { stdio: 'inherit' });
