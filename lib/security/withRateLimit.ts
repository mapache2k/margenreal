import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { rateLimit } from './RateLimiter';

interface Options {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export function withRateLimit(handler: NextApiHandler, opts: Options): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip  = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown');
    const key = `${opts.keyPrefix ?? 'api'}:${ip}`;
    const { allowed, remaining, resetAt } = rateLimit(key, opts.maxRequests, opts.windowMs);

    res.setHeader('X-RateLimit-Limit',     opts.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset',     Math.ceil(resetAt / 1000));

    if (!allowed) {
      return res.status(429).json({ error: 'Demasiados intentos. Esperá unos minutos.' });
    }
    return handler(req, res);
  };
}
