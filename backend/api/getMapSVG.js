import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

export default async function handler(req, res) {
  try {
    // Load the visits JSON
    const visitsPath = path.resolve(process.cwd(), 'backend/storage/visits.json');
    const visitsRaw = fs.readFileSync(visitsPath, 'utf-8');
    const visits = JSON.parse(visitsRaw);

    // Load the SVG map
    const svgPath = path.resolve(process.cwd(), 'public/world.svg');
    const svgRaw = fs.readFileSync(svgPath, 'utf-8');

    // Parse with Cheerio
    const $ = load(svgRaw, { xmlMode: true });  // ✅ Correct

    // Color each visited country (your SVG uses <g id="xx">)
    for (const [countryCode, count] of Object.entries(visits)) {
      const countryId = countryCode.toLowerCase(); // match lowercase IDs like "us"
      let el = $(`g[id="${countryId}"]`);

      // fallback for <path id="xx"> if needed
      if (el.length === 0) {
        el = $(`path[id="${countryId}"]`);
      }

      if (el.length > 0) {
        // Apply a basic fill style (can customize)
        el.attr('style', 'fill: #007acc; fill-opacity: 0.7;');
      }
    }

    // Return updated SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send($.xml());
  } catch (error) {
    console.error('💥 Error generating SVG map:', error);
    res.status(500).json({ error: 'Failed to generate SVG map' });
  }
}
