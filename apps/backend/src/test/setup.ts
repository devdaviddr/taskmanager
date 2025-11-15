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
let setupPromise: Promise<void> | null = null;

// Setup test database
export const setupTestDatabase = async (): Promise<void> => {
  if (isSetup) return;
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
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
      `).catch(() => {
        // Ignore if database doesn't exist yet
      });

      // Drop existing test database with FORCE
      try {
        await adminPool.query('DROP DATABASE IF EXISTS taskmanager_test WITH (FORCE)');
      } catch (error) {
        // Ignore if database is being used
      }
      
      // Wait to ensure database is fully dropped
      await new Promise(resolve => setTimeout(resolve, 800));

      // Create fresh test database
      try {
        await adminPool.query('CREATE DATABASE taskmanager_test');
      } catch (error) {
        // If database already exists, that's ok (parallel run already created it)
        const msg = (error as Error).message;
        if (!msg.includes('already exists') && !msg.includes('duplicate key')) {
          throw error;
        }
      }
      
      // Wait for database to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await adminPool.end();
    } catch (error) {
      await adminPool.end();
      throw error;
    }

    // Run migrations on test database
    execSync('npm run migrate', {
      env: { ...process.env, DATABASE_URL: testDatabaseUrl },
      stdio: 'inherit',
    });
  })();

  return setupPromise;
};

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




