import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { testConnection } from './config/database';
import routes from './routes';
import { errorHandler, logger } from './middleware';
import { AuthService } from './services/AuthService';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow frontend origins
  credentials: true, // Allow cookies to be sent
}));

// Middleware
app.use('*', errorHandler);
app.use('*', logger);

// Routes
app.route('/', routes);

// Root route
app.get('/', (c) => c.text('Task Manager API - Hello Hono!'));

async function startServer() {
  try {
    // Test database connection
    await testConnection();
  } catch (error) {
    console.error('❌ Database connection failed, exiting...');
    process.exit(1);
  }

  serve({ fetch: app.fetch, port: 3001 }, (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
    console.log(`📚 API Documentation available at http://localhost:${info.port}`);
  });

  // Start token cleanup interval (run every hour)
  setInterval(async () => {
    try {
      await AuthService.cleanupExpiredTokens();
    } catch (error) {
      console.error('Error during token cleanup:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
}

startServer();