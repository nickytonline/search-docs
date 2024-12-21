import type { APIContext } from 'astro';
import { limiter } from '../lib/rate-limiter';

export function rateLimit(context: APIContext) {
  const ip = context.clientAddress || 'anonymous';
  const result = limiter.check(ip);

  if (!result.success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetAt.toString(),
        'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString()
      }
    });
  }

  // Add rate limit headers
  context.response.headers.set('X-RateLimit-Limit', '10');
  context.response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  context.response.headers.set('X-RateLimit-Reset', result.resetAt.toString());

  return null;
}