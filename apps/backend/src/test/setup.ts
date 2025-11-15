import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Test database configuration
const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';

export const testPool = new Pool({
  connectionString: testDatabaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Teardown test database
export const teardownTestDatabase = async (): Promise<void> => {
  try {
    await testPool.end();
  } catch (error) {
    // Ignore pool close errors
  }

  // Optionally drop the test database
  try {
    const adminPool = new Pool({
      connectionString: process.env.DATABASE_URL,
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




