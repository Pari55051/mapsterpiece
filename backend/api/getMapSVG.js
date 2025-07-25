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

    // load SVG
    const svgPath = path.resolve(process.cwd(), 'public/world.svg');
    const svgRaw = fs.readFileSync(svgPath, 'utf-8');
    const $ = load(svgRaw, { xmlMode: true });

    // theme
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

    // Fetch all country visit counts from redis db
    const keys = await redis.keys('visits:*');
    const visits = {};

    for (const key of keys) {
      const countryCode = key.split(':')[1]; 
      const count = await redis.get(key);
      visits[countryCode] = parseInt(count || 0, 10);
    }

    const maxCount = Math.max(...Object.values(visits), 1);

    // apply base style for visibility
    $('path, g').each((_, el) => {
      const $el = $(el);
      if (!$el.attr('style')) {
        $el.attr('style', `fill: ${defaultFill}; stroke: ${defaultStroke}; stroke-width: 0.3;`);
      }
    });

    // color visited countries
    for (const [countryCode, count] of Object.entries(visits)) {
      const countryId = countryCode.toLowerCase();
      let el = $(`g[id="${countryId}"]`);
      if (el.length === 0) el = $(`path[id="${countryId}"]`);

      if (el.length > 0) {
        const fillColor = getColorFromCode(countryCode);
        // const rawOpacity = count / maxCount;
        // const opacity = Math.max(Math.min(rawOpacity, 1), 0.4).toFixed(2); // min opacity = 0.4
        const rawOpacity = count / maxCount;
        const opacity = Math.max(Math.min(rawOpacity, 1), 0.5).toFixed(2);


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
    console.error('Error generating SVG map:', error);
    res.status(500).json({ error: 'Failed to generate SVG map' });
  }
}

// generate color for highlighting visited countries
function getColorFromCode(code) {
  const hash = [...code].reduce((acc, c) => acc + c.charCodeAt(0), 0);

  // avoiding gray colors
  const allowedHueRanges = [
    [10, 30],   // warm oranges
    [30, 50],   // bright yellows
    [60, 90],   // yellow-green
    [100, 140], // bright greens
    [160, 180], // cyan
    [200, 240], // strong blues
    [260, 280], // purples
    [290, 320], // pinks
    [330, 360]  // reds
  ];

  const range = allowedHueRanges[hash % allowedHueRanges.length];
  const hue = range[0] + (hash % (range[1] - range[0]));

  const saturation = 85;
  const lightness = 50;  

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

