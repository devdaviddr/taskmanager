import { describe, test, expect } from 'vitest';
import { auth, testData, parseResponse } from '../test/utils';
import app from '../app';

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('Register a new user successfully', async () => {
      const userData = testData.validUser;
      const result = await auth.register(userData);

      expect(result.status).toBe(201);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe(userData.email);
      expect(result.data.user.name).toBe(userData.name);
      expect(result.data.user).not.toHaveProperty('password_hash');
      expect(result.data.token).toBeDefined(); // Non-production env
      expect(result.data.refreshToken).toBeDefined(); // Non-production env
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    test('Register fails with invalid email', async () => {
      const result = await auth.register({
        ...testData.validUser,
        email: testData.invalidEmail,
      });

      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Validation error');
      expect(result.data.details).toBeDefined();
    });

    test('Register fails with weak password', async () => {
      const result = await auth.register({
        ...testData.validUser,
        password: testData.invalidPassword,
      });

      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Validation error');
      expect(result.data.details).toBeDefined();
    });

    test('Register fails with duplicate email', async () => {
      // First registration with a fixed email
      const fixedEmail = { ...testData.validUser, email: `duplicate_${Date.now()}@example.com` };
      await auth.register(fixedEmail);

      // Try to register again with same email
      const result = await auth.register(fixedEmail);

      expect(result.status).toBe(400);
      expect(result.data.error).toContain('already exists');
    });

    test('Register fails with missing email', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ password: testData.validUser.password }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(400);
      const data = await parseResponse(res);
      expect(data.error).toBe('Validation error');
    });

    test('Register fails with missing password', async () => {
      const res = await app.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: testData.validUser.email }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(400);
      const data = await parseResponse(res);
      expect(data.error).toBe('Validation error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('Login with valid credentials', async () => {
      // First register a user
      const userData = testData.validUser;
      const registrationResult = await auth.register(userData);

      // Then login
      const result = await auth.login(registrationResult.data.user.email, userData.password);

      expect(result.status).toBe(200);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe(registrationResult.data.user.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    test('Login fails with non-existent user', async () => {
      const result = await auth.login('nonexistent@example.com', 'Password123!@#');

      expect(result.status).toBe(400);
      expect(result.data.error).toContain('Invalid credentials');
    });

    test('Login fails with incorrect password', async () => {
      // Register user first and capture the registered user data
      const userData = testData.validUser;
      const registrationResult = await auth.register(userData);

      // Try to login with wrong password
      const result = await auth.login(registrationResult.data.user.email, 'WrongPassword123!@#');

      expect(result.status).toBe(400);
      expect(result.data.error).toContain('Invalid credentials');
    });

    test('Login fails with missing email', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: testData.validUser.password }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(400);
      const data = await parseResponse(res);
      expect(data.error).toBe('Validation error');
    });

    test('Login fails with missing password', async () => {
      const res = await app.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: testData.validUser.email }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(400);
      const data = await parseResponse(res);
      expect(data.error).toBe('Validation error');
    });

    test('Login fails with invalid email format', async () => {
      const result = await auth.login(testData.invalidEmail, testData.validUser.password);

      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Validation error');
    });
  });

  describe('GET /api/auth/me', () => {
    test('Get current user profile with valid token', async () => {
      // Register and login
      const registerResult = await auth.register(testData.validUser);

      // Get current user
      const result = await auth.getMe(registerResult.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe(registerResult.data.user.email);
      expect(result.data.user).not.toHaveProperty('password_hash');
    });

    test('Get current user fails without token', async () => {
      const result = await auth.getMe();

      expect(result.status).toBe(401);
      expect(result.data.error).toBe('Unauthorized');
    });

    test('Get current user fails with invalid token', async () => {
      const result = await auth.getMe('invalid.token.here');

      expect(result.status).toBe(401);
      expect(result.data.error).toContain('Invalid token');
    });

    test('Get current user fails with empty token', async () => {
      const result = await auth.getMe('');

      expect(result.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('Logout successfully', async () => {
      // Register and login
      const registerResult = await auth.register(testData.validUser);

      // Logout
      const logoutResult = await auth.logout(registerResult.accessToken, registerResult.refreshToken);

      expect(logoutResult.status).toBe(200);
      expect(logoutResult.data.message).toContain('Logged out successfully');
    });

    test('Logout invalidates access token', async () => {
      // Register and login
      const registerResult = await auth.register(testData.validUser);

      // Logout
      await auth.logout(registerResult.accessToken, registerResult.refreshToken);

      // Try to use the token
      const meResult = await auth.getMe(registerResult.accessToken);

      expect(meResult.status).toBe(401);
      expect(meResult.data.error).toContain('invalidated');
    });

    test('Logout without token returns 401', async () => {
      const result = await auth.logout();

      expect(result.status).toBe(401);
    });

    test('Logout with only access token succeeds', async () => {
      const registerResult = await auth.register(testData.validUser);

      const result = await auth.logout(registerResult.accessToken);

      expect(result.status).toBe(200);
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('Refresh access token successfully', async () => {
      // Register and login
      const userData = testData.validUser;
      const registrationResult = await auth.register(userData);
      const loginResult = await auth.login(registrationResult.data.user.email, userData.password);

      // Refresh token
      const result = await auth.refresh(loginResult.accessToken, loginResult.refreshToken);

      expect(result.status).toBe(200);
      expect(result.data.user).toBeDefined();
      // Tokens would normally be different but might not be in tests depending on JWT implementation
    });

    test('Refresh fails without refresh token', async () => {
      const result = await auth.refresh('some-access-token');

      expect(result.status).toBe(401);
      expect(result.data.error).toContain('Refresh token required');
    });

    test('Refresh fails with invalid refresh token', async () => {
      const result = await auth.refresh('some-access-token', 'invalid-refresh-token');

      expect(result.status).toBe(401);
      expect(result.data.error).toContain('Invalid refresh token');
    });

    test('Old access token is invalidated after refresh', async () => {
      // Register and login
      const userData = testData.validUser;
      const registrationResult = await auth.register(userData);
      const loginResult = await auth.login(registrationResult.data.user.email, userData.password);
      const oldAccessToken = loginResult.accessToken;

      // Refresh token
      const refreshResult = await auth.refresh(oldAccessToken, loginResult.refreshToken);

      // Try to use old token
      const meResult = await auth.getMe(oldAccessToken);

      expect(meResult.status).toBe(401);
      expect(meResult.data.error).toContain('invalidated');

      // New token should work
      const newMeResult = await auth.getMe(refreshResult.accessToken);
      expect(newMeResult.status).toBe(200);
    });

    test('Refresh invalidates old refresh token', async () => {
      // Register and login
      const userData = testData.validUser;
      const registrationResult = await auth.register(userData);
      const loginResult = await auth.login(registrationResult.data.user.email, userData.password);
      const oldRefreshToken = loginResult.refreshToken;

      // Refresh once
      const firstRefresh = await auth.refresh(loginResult.accessToken, oldRefreshToken);

      // Try to use old refresh token again
      const secondRefresh = await auth.refresh(firstRefresh.accessToken, oldRefreshToken);

      expect(secondRefresh.status).toBe(401);
      expect(secondRefresh.data.error).toContain('Invalid refresh token');
    });
  });

  describe('Token Security', () => {
    test('Multiple users have different tokens', async () => {
      const user1 = await auth.register(testData.validUser);
      const user2 = await auth.register(testData.validUser2);

      expect(user1.accessToken).not.toBe(user2.accessToken);
      expect(user1.refreshToken).not.toBe(user2.refreshToken);
    });

    test('Token provides access to correct user data', async () => {
      const user1 = await auth.register(testData.validUser);
      const user2 = await auth.register(testData.validUser2);

      const me1 = await auth.getMe(user1.accessToken);
      const me2 = await auth.getMe(user2.accessToken);

      // Compare with the emails from the registration response
      expect(me1.data.user.email).toBe(user1.data.user.email);
      expect(me2.data.user.email).toBe(user2.data.user.email);
      expect(me1.data.user.email).not.toBe(me2.data.user.email);
    });
  });

  describe('Password Requirements', () => {
    test('Password must be at least 12 characters', async () => {
      const result = await auth.register({
        ...testData.validUser,
        password: 'Short1!@#',
      });

      expect(result.status).toBe(400);
      expect(result.data.details).toBeDefined();
    });

    test('Password must contain uppercase letter', async () => {
      const result = await auth.register({
        ...testData.validUser,
        password: 'lowercase123!@#',
      });

      expect(result.status).toBe(400);
    });

    test('Password must contain lowercase letter', async () => {
      const result = await auth.register({
        ...testData.validUser,
        password: 'UPPERCASE123!@#',
      });

      expect(result.status).toBe(400);
    });

    test('Password must contain number', async () => {
      const result = await auth.register({
        ...testData.validUser,
        password: 'NoNumbers!@#abc',
      });

      expect(result.status).toBe(400);
    });

    test('Password must contain special character', async () => {
      const result = await auth.register({
        ...testData.validUser,
        password: 'NoSpecial123abc',
      });

      expect(result.status).toBe(400);
    });
  });
});
