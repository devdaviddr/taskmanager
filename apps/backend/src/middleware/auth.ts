import { MiddlewareHandler } from 'hono';
import { AuthService } from '../services/AuthService';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);

  // Check if token is blacklisted
  const isBlacklisted = await AuthService.isTokenBlacklisted(token);
  if (isBlacklisted) {
    return c.json({ error: 'Token has been invalidated' }, 401);
  }

  const user = await AuthService.getUserFromToken(token);

  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Attach user to context
  c.set('user', user);
  await next();
};