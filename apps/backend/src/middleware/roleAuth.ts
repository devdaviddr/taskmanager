import { MiddlewareHandler } from 'hono';
import type { User } from '../types';

export type UserRole = 'user' | 'admin' | 'superadmin';

export const requireRole = (requiredRole: UserRole): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get('user') as User;

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const roleHierarchy: Record<UserRole, number> = {
      user: 1,
      admin: 2,
      superadmin: 3,
    };

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
};

export const requireAdmin: MiddlewareHandler = requireRole('admin');
export const requireSuperadmin: MiddlewareHandler = requireRole('superadmin');