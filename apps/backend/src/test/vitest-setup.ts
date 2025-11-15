// Set test database URL BEFORE importing anything else
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMITING = 'true';

import { testPool } from './setup';
import { beforeEach } from 'vitest';

// Clean up test data before each test
beforeEach(async () => {
  try {
    console.log('🧹 Cleaning up test data before test...');
    // Clear all tables in reverse order of foreign key dependencies
    await testPool.query('DELETE FROM item_tags');
    await testPool.query('DELETE FROM item_users');
    await testPool.query('DELETE FROM items');
    await testPool.query('DELETE FROM tasks');
    await testPool.query('DELETE FROM columns');
    await testPool.query('DELETE FROM tags');
    await testPool.query('DELETE FROM boards');
    await testPool.query('DELETE FROM board_users');
    await testPool.query('DELETE FROM invalidated_tokens');
    await testPool.query('DELETE FROM refresh_tokens');
    await testPool.query('DELETE FROM users');
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
});


