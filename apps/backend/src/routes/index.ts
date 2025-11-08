import { Hono } from 'hono';
import taskRoutes from './tasks';
import boardRoutes from './boards';
import columnRoutes from './columns';
import itemRoutes from './items';
import tagRoutes from './tags';
import authRoutes from './auth';
import userRoutes from './users';
import adminRoutes from './admin';

const router = new Hono();

// Health check route
router.get('/health', async (c) => {
  try {
    // Import pool dynamically to avoid circular dependency
    const { pool } = await import('../config/database');
    await pool.query('SELECT 1');
    return c.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      status: 'error',
      database: 'disconnected',
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Mount routes
router.route('/auth', authRoutes);
router.route('/admin', adminRoutes);
router.route('/', userRoutes);
router.route('/', taskRoutes);
router.route('/', boardRoutes);
router.route('/', columnRoutes);
router.route('/', itemRoutes);
router.route('/', tagRoutes);

export default router;