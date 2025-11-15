import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { rateLimiter } from 'hono-rate-limiter';
import { testConnection } from './config/database';
import routes from './routes';
import {
  errorHandler,
  logger,
  securityHeaders,
  compression,
  timeout
} from './middleware';
import { AuthService } from './services/AuthService';
import { isProduction, getCorsOrigins } from './utils/environment';

const app = new Hono();

// Environment-aware CORS configuration
const corsOrigins = getCorsOrigins();

// Rate limiting - strict limits for auth endpoints
app.use('/auth/login', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Only 5 login attempts per 15 minutes
  standardHeaders: true,
  keyGenerator: (c) => {
    return c.req.header('CF-Connecting-IP') ||
           c.req.header('X-Forwarded-For') ||
           c.req.header('X-Real-IP') ||
           'unknown';
  },
}));

app.use('/auth/register', rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // Only 3 registration attempts per hour
  standardHeaders: true,
  keyGenerator: (c) => {
    return c.req.header('CF-Connecting-IP') ||
           c.req.header('X-Forwarded-For') ||
           c.req.header('X-Real-IP') ||
           'unknown';
  },
}));

// Global rate limiting
app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isProduction ? 100 : 1000, // stricter in production
  standardHeaders: true,
  keyGenerator: (c) => {
    // Use IP address for rate limiting
    return c.req.header('CF-Connecting-IP') ||
           c.req.header('X-Forwarded-For') ||
           c.req.header('X-Real-IP') ||
           'unknown';
  },
}));

// CORS middleware
app.use('*', cors({
  origin: corsOrigins,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
}));

// Security headers
app.use('*', securityHeaders);

// Compression
app.use('*', compression);

// Request timeout
app.use('*', timeout);

// Logging middleware
app.use('*', logger);

// Error handler (must be after other middleware)
app.use('*', errorHandler);

// Routes
app.route('/', routes);

// Root route
app.get('/', (c) => c.json({
  message: 'Task Manager API',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
}));

// Health check route
app.get('/health', async (c) => {
  try {
    // Import pool dynamically to avoid circular dependency
    const { pool } = await import('./config/database');
    await pool.query('SELECT 1');

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };

    return c.json(health);
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: (error as Error).message
    }, 503);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

async function startServer() {
  try {
    // Test database connection
    await testConnection();
  } catch (error) {
    console.error('❌ Database connection failed, exiting...');
    process.exit(1);
  }

  const port = parseInt(process.env.PORT || '3001');

  const server = serve({
    fetch: app.fetch,
    port,
    hostname: process.env.HOST || '0.0.0.0'
  }, (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
    console.log(`📚 API Documentation available at http://localhost:${info.port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS Origins: ${corsOrigins.join(', ')}`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

    // Close database connections
    try {
      const { closeConnection } = await import('./config/database');
      await closeConnection();
      console.log('✅ Database connections closed');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }

    // Close server
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });

  // Start token cleanup interval (run every hour)
  setInterval(async () => {
    try {
      await AuthService.cleanupExpiredTokens();
    } catch (error) {
      console.error('Error during token cleanup:', error);
    }
  }, 60 * 60 * 1000); // 1 hour

  return server;
}

// Start server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});