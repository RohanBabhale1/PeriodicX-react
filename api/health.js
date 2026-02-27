// api/health.js  — returns server health + quota snapshot

// Import the same limiter instance (Vercel bundles each function separately,
// so this is a lightweight duplicate; for shared state use Vercel KV)
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Return a minimal health + quota payload
  // The full limiter lives in chat.js; here we just confirm the API key is set
  const apiKeyOk = !!process.env.GROQ_API_KEY;

  return res.status(apiKeyOk ? 200 : 503).json({
    ok:     apiKeyOk,
    status: apiKeyOk ? 'operational' : 'missing_api_key',
    model:  'llama-3.3-70b-versatile',
    limits: {
      dailyTokenQuota:   100_000,
      maxConcurrentUsers: 5,
      userRpm:            6,
      cooldownMs:         3_000,
    },
  });
}