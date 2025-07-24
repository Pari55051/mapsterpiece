import fs from 'fs';
import path from 'path';
import { load } from 'cheerio';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('Missing Redis environment variables');
    }

    // Load base SVG
    const svgPath = path.resolve(process.cwd(), 'public/world.svg');
    const svgRaw = fs.readFileSync(svgPath, 'utf-8');
    const $ = load(svgRaw, { xmlMode: true });

    // Theme support
    const theme = req.query.theme === 'dark' ? 'dark' : 'light';
    const backgroundColor = theme === 'dark' ? '#0D1117' : '#FFFFFF';
    $('svg').attr('style', `background-color: ${backgroundColor};`);

    // Glowing animation for highlighted country
    $('svg').prepend(`
      <style>
        @keyframes glow {
          0%   { stroke-opacity: 0.5; stroke-width: 1.5; }
          100% { stroke-opacity: 1; stroke-width: 2.5; }
        }
      </style>
    `);

    const highlightCountry = (req.query.highlight || '').toLowerCase();

    // Get all Redis visit keys
    const keys = await redis.keys('visits:*');
    const visits = {};

    for (const key of keys) {
      const countryCode = key.split(':')[1]; // from visits:US
      const count = await redis.get(key);
      visits[countryCode] = parseInt(count || 0);
    }

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

        if (countryId === highlightCountry) {
          el.attr('stroke', '#FFD700');
          el.attr('style', `${style} animation: glow 1.5s infinite alternate;`);
        } else {
          el.attr('style', style);
        }

        el.find('title').remove();
        el.append(`<title>${countryCode}: ${count} visit${count !== 1 ? 's' : ''}</title>`);

        if (count >= 10) {
          el.attr('stroke', '#000');
          el.attr('stroke-width', count >= 50 ? '0.6' : '0.3');
        }
      }
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send($.xml());
  } catch (error) {
    console.error('❌ Error generating SVG map:', error);
    res.status(500).json({ error: 'Failed to generate SVG map' });
  }
}

// HSL color generator based on code
function getColorFromCode(code) {
  const hash = [...code].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = (hash * 37) % 360;
  return `hsl(${hue}, 70%, 55%)`;
}
