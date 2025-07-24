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

    // Load SVG
    const svgPath = path.resolve(process.cwd(), 'public/world.svg');
    const svgRaw = fs.readFileSync(svgPath, 'utf-8');
    const $ = load(svgRaw, { xmlMode: true });

    // Determine theme
    // const theme = req.query.theme === 'dark' ? 'dark' : 'light';
    // const backgroundColor = theme === 'dark' ? '#171e29ff' : '#fefefe';
    // const defaultFill = theme === 'dark' ? '#3d3d3dff' : '#cdcdcdff';
    // const defaultStroke = theme === 'dark' ? '#3d3d3dff' : '#cdcdcdff';
    const theme = req.query.theme === 'dark' ? 'dark' : 'light';
    const backgroundColor = theme === 'dark' ? '#0d1117' : '#ffffff';
    const defaultFill = theme === 'dark' ? '#2b2f33' : '#e5e5e5';
    const defaultStroke = theme === 'dark' ? '#444c56' : '#d1d1d1';

    $('svg').attr('style', `background-color: ${backgroundColor};`);

    // Add glow animation
    $('svg').prepend(`
      <style>
        @keyframes glow {
          0%   { stroke-opacity: 0.5; stroke-width: 1.5; }
          100% { stroke-opacity: 1; stroke-width: 2.5; }
        }
      </style>
    `);

    const highlightCountry = (req.query.highlight || '').toLowerCase();

    // Fetch all country visit counts from Redis
    const keys = await redis.keys('visits:*');
    const visits = {};

    for (const key of keys) {
      const countryCode = key.split(':')[1]; // e.g. 'visits:US'
      const count = await redis.get(key);
      visits[countryCode] = parseInt(count || 0, 10);
    }

    const maxCount = Math.max(...Object.values(visits), 1); // Avoid divide-by-zero

    // First: Apply base style to all countries for visibility
    $('path, g').each((_, el) => {
      const $el = $(el);
      if (!$el.attr('style')) {
        $el.attr('style', `fill: ${defaultFill}; stroke: ${defaultStroke}; stroke-width: 0.3;`);
      }
    });

    // Then: Color and annotate visited countries
    for (const [countryCode, count] of Object.entries(visits)) {
      const countryId = countryCode.toLowerCase();
      let el = $(`g[id="${countryId}"]`);
      if (el.length === 0) el = $(`path[id="${countryId}"]`);

      if (el.length > 0) {
        const fillColor = getColorFromCode(countryCode);
        const opacity = Math.min(count / maxCount, 1).toFixed(2);
        let style = `fill: ${fillColor}; fill-opacity: ${opacity}; stroke: ${defaultStroke}; stroke-width: 0.4;`;

        if (countryId === highlightCountry) {
          style += ` animation: glow 1.5s infinite alternate; stroke: #FFD700;`;
        }

        el.attr('style', style);

        // Tooltip
        el.find('title').remove();
        el.append(`<title>${countryCode}: ${count} visit${count !== 1 ? 's' : ''}</title>`);

        // Stroke for milestones
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

// Color generator: unique HSL based on country code
function getBrightColorFromCode(code) {
  const hash = [...code].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = (hash * 47) % 360;
  return `hsl(${hue}, 90%, 60%)`; // Bright, saturated, readable colors
}