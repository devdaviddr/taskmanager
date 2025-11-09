import type { MiddlewareHandler } from 'hono';

export const timeout: MiddlewareHandler = async (_c, next) => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 seconds
  });

  await Promise.race([next(), timeoutPromise]);
};