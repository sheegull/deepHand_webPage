export const rateLimit = () => {
  return async (c, next) => {
    const ip = c.req.headers.get('CF-Connecting-IP');
    if (!ip) {
      return c.json({ error: 'Rate limit error' }, 400);
    }

    const key = `rate_limit:${ip}`;
    const maxRequests = 10; // Updated to 10 requests per hour
    const now = Date.now();
    const hour = Math.floor(now / 3600000);

    const currentValue = await c.env.KV.get(key);
    const requests = currentValue ? JSON.parse(currentValue) : { count: 0, hour };

    if (requests.hour !== hour) {
      requests.count = 0;
      requests.hour = hour;
    }

    if (requests.count >= maxRequests) {
      return c.json({ 
        error: 'Rate limit exceeded. Please try again in an hour.',
        remainingTime: (hour + 1) * 3600000 - now
      }, 429);
    }

    requests.count++;
    await c.env.KV.put(key, JSON.stringify(requests), { expirationTtl: 3600 });

    await next();
  };
};