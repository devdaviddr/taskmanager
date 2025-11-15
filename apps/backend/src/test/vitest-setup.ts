// Set test database URL BEFORE importing anything else
// Only set if not already set by global-setup.ts
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';
}
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMITING = 'true';

import { getTestPool, teardownTestDatabase } from './setup';
import { globalTeardown } from './global-setup';
import { beforeEach } from 'vitest';

// Clean up test data before each test
beforeEach(async () => {
  try {
    console.log('🧹 Cleaning up test data before test...');
    const testPool = getTestPool();
    // Use TRUNCATE with CASCADE to ensure clean slate
    await testPool.query(`
      TRUNCATE TABLE
        item_tags,
        item_users,
        items,
        tasks,
        columns,
        tags,
        board_users,
        boards,
        invalidated_tokens,
        refresh_tokens,
        users
      CASCADE
    `);
    console.log('✅ Test data cleaned up');

    // Verify invalidated_tokens is empty
    const result = await testPool.query('SELECT COUNT(*) as count FROM invalidated_tokens');
    console.log(`🔍 Invalidated tokens count after cleanup: ${result.rows[0].count}`);
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    throw error; // Make it fail so we know about cleanup issues
  }
});

// Global teardown to clean up database connections and test PostgreSQL container after all tests
process.on('exit', async () => {
  console.log('🔄 Global teardown: Cleaning up test database and PostgreSQL container...');
  await teardownTestDatabase();
  await globalTeardown();
  console.log('✅ Test environment fully cleaned up');
});


