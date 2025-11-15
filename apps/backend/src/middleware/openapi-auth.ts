import { Context, MiddlewareHandler } from 'hono';
import { AuthService } from '../services/AuthService';

/**
 * OpenAPI Bearer token authentication middleware
 * Extracts JWT token from Authorization header and validates it
 * Attaches user data to context if valid
 */
export const openapiAuth: MiddlewareHandler = async (c: Context, next) => {
  // Get Authorization header
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Don't block request, let the route handle authentication
    // This allows unauthenticated routes to work
    return next();
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.slice(7);

  // Verify token
  const payload = AuthService.verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Check if token is blacklisted
  const isBlacklisted = await AuthService.isTokenBlacklisted(token);
  if (isBlacklisted) {
    return c.json({ error: 'Token has been invalidated' }, 401);
  }

  // Attach user payload to context for protected routes to use
  c.set('user', payload);

  return next();
};

/**
 * Helper to require authentication
 * Use this in route handlers that need auth
 */
export const requireAuth = (c: Context) => {
  const user = c.get('user');
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
};
