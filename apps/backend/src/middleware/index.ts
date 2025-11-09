import type { MiddlewareHandler } from 'hono';

const isProduction = process.env.NODE_ENV === 'production';

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);

    // In production, don't leak error details
    const errorMessage = isProduction
      ? 'Internal server error'
      : (error as Error).message;

    return c.json({
      error: errorMessage,
      ...(isProduction ? {} : { stack: (error as Error).stack })
    }, 500);
  }
};

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  const duration = end - start;

  const logData = {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: `${duration}ms`,
    ip: c.req.header('CF-Connecting-IP') ||
        c.req.header('X-Forwarded-For') ||
        c.req.header('X-Real-IP') ||
        'unknown',
    userAgent: c.req.header('User-Agent') || 'unknown'
  };

  if (duration > 1000) {
    console.warn('⚠️  Slow request:', logData);
  } else {
    console.log(`${logData.method} ${logData.path} - ${logData.status} - ${logData.duration}`);
  }
};

export { requireRole, requireAdmin, requireSuperadmin } from './roleAuth';
export { authMiddleware } from './auth';
export { securityHeaders } from './security';
export { compression } from './compression';
export { timeout } from './timeout';