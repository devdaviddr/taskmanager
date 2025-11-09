import type { MiddlewareHandler } from 'hono';

export const compression: MiddlewareHandler = async (_c, next) => {
  await next();
  // Compression headers will be set automatically by Hono/Node.js for supported content types
};