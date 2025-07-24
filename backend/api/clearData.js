import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Optional: simple security check using secret query parameter
  const secret = req.query.secret;
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }

  try {
    // Collect visit and summary keys
    const visitKeys = await redis.keys('visits:*');
    const weeklyKeys = await redis.keys('weekly:*'); // adjust prefix if needed
    const allKeys = [...visitKeys, ...weeklyKeys];

    for (const key of allKeys) {
      await redis.del(key);
      console.log(`Deleted key: ${key}`);
    }

    res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; background: #f8f9fa; padding: 2rem;">
          <h2>🧹 Redis Data Cleared</h2>
          <p><strong>${allKeys.length}</strong> keys were deleted:</p>
          <ul>
            ${allKeys.map(key => `<li>${key}</li>`).join('')}
          </ul>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error clearing data:', err);
    res.status(500).send('Failed to clear data.');
  }
}
