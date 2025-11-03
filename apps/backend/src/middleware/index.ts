import type { MiddlewareHandler } from 'hono';

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  console.log(`${c.req.method} ${c.req.path} - ${end - start}ms`);
};