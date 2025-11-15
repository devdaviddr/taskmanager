import { testPool } from './setup';
import app from '../app';

// Mock environment variables for tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMITING = 'true'; // Disable rate limiting in tests

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

// Delay helper for rate limit safety
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test data factories
export const testData = {
  validUser: {
    email: 'testuser@example.com',
    password: 'TestPassword123!@#',
    name: 'Test User',
  },
  validUser2: {
    email: 'testuser2@example.com',
    password: 'TestPassword456!@#',
    name: 'Test User 2',
  },
  invalidPassword: 'weak',
  invalidEmail: 'not-an-email',
};

// Authentication helpers
export const auth = {
  /**
   * Register a new user and return user data + tokens
   */
  async register(userData = testData.validUser) {
    const res = await app.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await parseResponse(res);
    
    // In test environments, tokens are returned in response body
    return {
      status: res.status,
      data,
      accessToken: data.token,
      refreshToken: data.refreshToken,
    };
  },

  /**
   * Login a user and return user data + tokens
   */
  async login(email = testData.validUser.email, password = testData.validUser.password) {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await parseResponse(res);
    
    // In test environments, tokens are returned in response body
    return {
      status: res.status,
      data,
      accessToken: data.token,
      refreshToken: data.refreshToken,
    };
  },

  /**
   * Get current user profile using token
   */
  async getMe(accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request('/auth/me', {
      method: 'GET',
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });
    const data = await parseResponse(res);
    return {
      status: res.status,
      data,
    };
  },

  /**
   * Logout user (invalidate tokens)
   */
  async logout(accessToken?: string, refreshToken?: string) {
    const cookieParts = [];
    if (accessToken) cookieParts.push(`accessToken=${accessToken}`);
    if (refreshToken) cookieParts.push(`refreshToken=${refreshToken}`);
    const cookieHeader = cookieParts.join('; ');

    const res = await app.request('/auth/logout', {
      method: 'POST',
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });
    const data = await parseResponse(res);
    return {
      status: res.status,
      data,
    };
  },

  /**
   * Refresh access token
   */
  async refresh(accessToken?: string, refreshToken?: string) {
    const cookieParts = [];
    if (accessToken) cookieParts.push(`accessToken=${accessToken}`);
    if (refreshToken) cookieParts.push(`refreshToken=${refreshToken}`);
    const cookieHeader = cookieParts.join('; ');

    const res = await app.request('/auth/refresh', {
      method: 'POST',
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });
    const data = await parseResponse(res);
    
    // Tokens would be in cookies in real HTTP, but we don't have those in tests
    // The route should return updated tokens in the response
    return {
      status: res.status,
      data,
      accessToken: undefined,
      refreshToken: undefined,
    };
  },
};