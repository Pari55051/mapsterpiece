import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const secret = req.query.secret;
  if (process.env.ADMIN_SECRET && secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }

  try {
    // Match general and weekly visit keys
    const generalKeys = await redis.keys('visits:*');
    const weeklyKeys = await redis.keys('week:*:visits:*');
    const allKeys = [...generalKeys, ...weeklyKeys];

    for (const key of allKeys) {
      await redis.del(key);
      console.log(`🧹 Deleted key: ${key}`);
    }

    res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; background: #f8f9fa; padding: 2rem;">
          <h2>✅ All Visit Data Cleared</h2>
          <p><strong>${allKeys.length}</strong> keys were deleted.</p>
          <details style="margin-top:1rem;"><summary>See deleted keys</summary>
            <ul>${allKeys.map(k => `<li>${k}</li>`).join('')}</ul>
          </details>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('❌ Error clearing data:', err);
    res.status(500).send('Failed to clear data.');
  }
}
