export const rateLimit = () => {
  return async (c, next) => {
    // Skip rate limiting in development if KV is not available
    if (!c.env.IP_RATE_LIMITER) {
      console.log('Rate limiting skipped (development mode)');
      await next();
      return;
    }

    const ip = c.req.header('CF-Connecting-IP') || c.req.header('x-forwarded-for') || 'development';
    const key = `rate_limit:${ip}`;
    const maxRequests = parseInt(c.env.MAX_REQUESTS_PER_HOUR || '10');
    const now = Date.now();
    const hour = Math.floor(now / 3600000);

    try {
      const currentValue = await c.env.IP_RATE_LIMITER.get(key);
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
      await c.env.IP_RATE_LIMITER.put(key, JSON.stringify(requests), { expirationTtl: 3600 });
    } catch (err) {
      console.log('Rate limiting failed, continuing:', err);
    }

    await next();
  };
};