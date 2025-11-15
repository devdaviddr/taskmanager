import { setupTestDatabase, teardownTestDatabase, testPool } from './setup';
import { afterAll, beforeEach } from 'vitest';

// Run setup once before all tests
await setupTestDatabase();

// Clean up test data before each test
beforeEach(async () => {
  try {
    console.log('🧹 Cleaning up test data before test...');
    // Clear all tables in reverse order of foreign key dependencies
    await testPool.query('DELETE FROM item_tags');
    await testPool.query('DELETE FROM item_users');
    await testPool.query('DELETE FROM items');
    await testPool.query('DELETE FROM columns');
    await testPool.query('DELETE FROM tags');
    await testPool.query('DELETE FROM boards');
    await testPool.query('DELETE FROM refresh_tokens');
    await testPool.query('DELETE FROM users');
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
});

// Cleanup after all tests
afterAll(async () => {
  await teardownTestDatabase();
});


