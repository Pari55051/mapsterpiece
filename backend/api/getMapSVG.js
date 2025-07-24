import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';

export default async function handler(req, res) {
  try {
    // Load visit data
    const visitsPath = path.resolve(process.cwd(), 'backend/storage/visits.json');
    const visits = JSON.parse(fs.readFileSync(visitsPath, 'utf-8'));

    // Load SVG map
    const svgPath = path.resolve(process.cwd(), 'public/world.svg');
    const svgRaw = fs.readFileSync(svgPath, 'utf-8');
    const $ = load(svgRaw, { xmlMode: true });

    // Theme
    const theme = req.query.theme === 'dark' ? 'dark' : 'light';
    const backgroundColor = theme === 'dark' ? '#0D1117' : '#FFFFFF';
    $('svg').attr('style', `background-color: ${backgroundColor};`);

    // Add glowing animation style block
    $('svg').prepend(`
      <style>
        @keyframes glow {
          0%   { stroke-opacity: 0.5; stroke-width: 1.5; }
          100% { stroke-opacity: 1; stroke-width: 2.5; }
        }
      </style>
    `);

    const highlightCountry = (req.query.highlight || '').toLowerCase();
    const maxCount = Math.max(...Object.values(visits), 1); // Avoid divide-by-zero

    for (const [countryCode, count] of Object.entries(visits)) {
      const countryId = countryCode.toLowerCase();
      let el = $(`g[id="${countryId}"]`);

      if (el.length === 0) {
        el = $(`path[id="${countryId}"]`);
      }

      if (el.length > 0) {
        const fillColor = getColorFromCode(countryCode);
        const opacity = Math.min(count / maxCount, 1).toFixed(2);
        let style = `fill: ${fillColor}; fill-opacity: ${opacity};`;

        // Highlight current visitor
        if (countryId === highlightCountry) {
          el.attr('stroke', '#FFD700');
          el.attr('style', `${style} animation: glow 1.5s infinite alternate;`);
        } else {
          el.attr('style', style);
        }

        // Tooltip
        el.find('title').remove();
        el.append(`<title>${countryCode}: ${count} visit${count !== 1 ? 's' : ''}</title>`);

        // Milestone stroke
        if (count >= 10) {
          el.attr('stroke', '#000');
          el.attr('stroke-width', count >= 50 ? '0.6' : '0.3');
        }
      }
    }

    // Response
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send($.xml());

  } catch (error) {
    console.error('💥 Error generating SVG map:', error);
    res.status(500).json({ error: 'Failed to generate SVG map' });
  }
}

// Generate a unique HSL color from a country code
function getColorFromCode(code) {
  const hash = [...code].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = (hash * 37) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}
