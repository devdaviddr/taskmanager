import type { MiddlewareHandler } from 'hono';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();

  // Security headers
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // HSTS in production
  if (isProduction) {
    c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Remove X-Powered-By header
  c.res.headers.delete('X-Powered-By');
};