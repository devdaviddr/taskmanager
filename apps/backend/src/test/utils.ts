import { testPool } from './setup';

// Mock environment variables for tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';

// Export test utilities
export { testPool, setupTestDatabase, teardownTestDatabase, testConnection } from './setup';

// Helper to create mock request
export const createMockRequest = (method: string, url: string, body?: any, headers?: Record<string, string>) => {
  return new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
};

// Helper to parse response
export const parseResponse = async (response: Response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};