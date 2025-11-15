import { Pool } from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

// Test database configuration
const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';

export const testPool = new Pool({
  connectionString: testDatabaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Flag to prevent duplicate setup
let isSetup = false;

// Setup test database
export const setupTestDatabase = async (): Promise<void> => {
  if (isSetup) return;
  isSetup = true;

  const adminPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Terminate all connections to the test database
    await adminPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'taskmanager_test'
      AND pid <> pg_backend_pid()
    `);

    // Drop existing test database
    await adminPool.query('DROP DATABASE IF EXISTS taskmanager_test');
    
    // Small delay to ensure database is fully dropped
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create fresh test database
    await adminPool.query('CREATE DATABASE taskmanager_test');
    await adminPool.end();
  } catch (error) {
    await adminPool.end();
    console.error('Failed to setup test database:', (error as Error).message);
    throw error;
  }

  // Run migrations on test database
  execSync('npm run migrate', {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: 'inherit',
  });
};

// Teardown test database
export const teardownTestDatabase = async (): Promise<void> => {
  await testPool.end();

  // Optionally drop the test database
  try {
    const adminPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    await adminPool.query('DROP DATABASE IF EXISTS taskmanager_test WITH (FORCE)');
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
