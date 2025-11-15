import { setupTestDatabase, teardownTestDatabase } from './setup';
import { afterAll } from 'vitest';

// Run setup once before all tests
await setupTestDatabase();

// Cleanup after all tests
afterAll(async () => {
  await teardownTestDatabase();
});


