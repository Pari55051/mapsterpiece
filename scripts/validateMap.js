
import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';

const svgPath = path.resolve('public/world.svg');
const visitsPath = path.resolve('backend/storage/visits.json');

const svgRaw = fs.readFileSync(svgPath, 'utf-8');
const $ = cheerio.load(svgRaw, { xmlMode: true });

const svgIds = new Set();
$('path').each((_, el) => {
  const id = $(el).attr('id');
  if (id) svgIds.add(id.toUpperCase());
});

const visits = JSON.parse(fs.readFileSync(visitsPath, 'utf-8'));
const missing = [];

Object.keys(visits).forEach(code => {
  if (!svgIds.has(code.toUpperCase())) {
    missing.push(code);
  }
});

if (missing.length) {
  console.log(' Missing country codes in SVG:', missing);
} else {
  console.log(' All country codes in visits.json exist in the SVG.');
}
