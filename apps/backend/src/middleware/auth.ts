import { MiddlewareHandler } from 'hono';
import { AuthService } from '../services/AuthService';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  let token: string | null = null;

  // Check Authorization header first (Bearer token)
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fall back to cookie if no Bearer token
  if (!token) {
    const cookieHeader = c.req.header('Cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken;
    }
  }

  if (!token) {
    return c.json({ error: 'Unauthorized - missing token' }, 401);
  }

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