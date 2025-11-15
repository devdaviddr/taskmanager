import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Test database configuration - will be updated by global setup
let testDatabaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';

// Create test pool - will be recreated if URL changes
let testPoolInstance: Pool | null = null;

export const getTestPool = (): Pool => {
  const currentUrl = process.env.DATABASE_URL || testDatabaseUrl;
  if (!testPoolInstance || testPoolInstance.options.connectionString !== currentUrl) {
    // Close existing pool if URL changed
    if (testPoolInstance) {
      testPoolInstance.end().catch(() => {});
    }
    testPoolInstance = new Pool({
      connectionString: currentUrl,
      max: 1,  // Reduced from 5 to minimize CPU usage during tests
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return testPoolInstance;
};

// For backward compatibility
export const testPool = getTestPool();

// Teardown test database
export const teardownTestDatabase = async (): Promise<void> => {
  try {
    if (testPoolInstance) {
      await testPoolInstance.end();
      testPoolInstance = null;
    }
  } catch (error) {
    // Ignore pool close errors
  }

  // Optionally drop the test database
  try {
    const adminConnectionString = process.env.DATABASE_URL?.replace('/taskmanager_test', '/postgres') ||
                                  'postgresql://postgres:password@localhost:5432/postgres';
    const adminPool = new Pool({
      connectionString: adminConnectionString,
    });

    // Terminate all connections
    await adminPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'taskmanager_test'
      AND pid <> pg_backend_pid()
    `).catch(() => {
      // Ignore if database doesn't exist
    });

    await adminPool.query('DROP DATABASE IF EXISTS taskmanager_test WITH (FORCE)').catch(() => {
      // Ignore errors
    });

    await adminPool.end();
  } catch (error) {
    console.warn('Failed to drop test database:', (error as Error).message);
  }
};

// Test connection
export const testConnection = async (): Promise<void> => {
  try {
    await testPool.query('SELECT 1');
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', (error as Error).message);
    throw error;
  }
};




