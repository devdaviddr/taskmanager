import { testPool } from './setup';
import app from '../app';

// Mock environment variables for tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';
process.env.DISABLE_RATE_LIMITING = 'true'; // Disable rate limiting in tests

// Export test utilities
export { testPool, teardownTestDatabase, testConnection } from './setup';

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
const createValidUser = () => ({
  email: `testuser${Date.now()}${Math.random()}@example.com`,
  password: 'TestPassword123!@#',
  name: 'Test User',
});

const createValidUser2 = () => ({
  email: `testuser2${Date.now()}${Math.random()}@example.com`,
  password: 'TestPassword456!@#',
  name: 'Test User 2',
});

export const testData = {
  get validUser() {
    return createValidUser();
  },
  get validUser2() {
    return createValidUser2();
  },
  invalidPassword: 'weak',
  invalidEmail: 'not-an-email',
  validBoard: {
    name: 'Test Board',
    description: 'A test board for integration tests',
    background: 'bg-blue-50',
    column_theme: 'light',
  },
  validBoard2: {
    name: 'Test Board 2',
    description: 'Another test board',
    background: 'bg-green-50',
    column_theme: 'dark',
  },
  validColumn: {
    name: 'Test Column',
    position: 0,
  },
  validColumn2: {
    name: 'In Progress',
    position: 1,
  },
  validColumn3: {
    name: 'Done',
    position: 2,
  },
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
    
    // In test environments, tokens are returned in response body
    // In production, they would be in HTTP-only cookies
    return {
      status: res.status,
      data,
      accessToken: data.token,
      refreshToken: data.refreshToken,
    };
  },
};

// Board API helpers
export const boards = {
  /**
   * Create a new board
   */
  async create(boardData = testData.validBoard, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request('/api/boards', {
      method: 'POST',
      body: JSON.stringify(boardData),
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });
    const data = await parseResponse(res);
    return {
      status: res.status,
      data,
    };
  },

  /**
   * Get all boards for authenticated user
   */
  async getAll(accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request('/api/boards', {
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
   * Get a specific board by ID
   */
  async getById(boardId: number, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/boards/${boardId}`, {
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
   * Get board with all its columns
   */
  async getWithColumns(boardId: number, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/boards/${boardId}/full`, {
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
   * Update a board
   */
  async update(boardId: number, updates: any, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });
    const data = await parseResponse(res);
    return {
      status: res.status,
      data,
    };
  },

  /**
   * Delete a board
   */
  async delete(boardId: number, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/boards/${boardId}`, {
      method: 'DELETE',
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });
    const data = await parseResponse(res);
    return {
      status: res.status,
      data,
    };
  },
};

// Column API helpers
export const columns = {
  /**
   * Create a new column in a board
   */
  async create(boardId: number, columnData: any, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify(columnData),
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });
    const data = await parseResponse(res);
    return {
      status: res.status,
      data,
    };
  },

  /**
   * Get all columns for a board
   */
  async getAll(boardId: number, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/boards/${boardId}/columns`, {
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
   * Get a specific column by ID (Note: no boardId needed in the URL)
   */
  async getById(columnId: number, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/columns/${columnId}`, {
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
   * Update a column (Note: no boardId needed in the URL)
   */
  async update(columnId: number, updates: any, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });
    const data = await parseResponse(res);
    return {
      status: res.status,
      data,
    };
  },

  /**
   * Delete a column (Note: no boardId needed in the URL)
   */
  async delete(columnId: number, accessToken?: string) {
    const cookieHeader = accessToken ? `accessToken=${accessToken}` : '';
    const res = await app.request(`/api/columns/${columnId}`, {
      method: 'DELETE',
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });
    const data = await parseResponse(res);
    return {
      status: res.status,
      data,
    };
  },
};