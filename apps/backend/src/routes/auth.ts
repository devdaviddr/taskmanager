import { Hono } from 'hono';
import { z } from 'zod';
import crypto from 'crypto';
import { AuthService } from '../services/AuthService';
import { validatePasswordStrength } from '../utils/passwordValidator';

const authRoutes = new Hono();
const isProduction = process.env.NODE_ENV === 'production';

// Helper to parse cookies correctly (handling JWT format with = signs)
const parseCookies = (cookieHeader: string): Record<string, string> => {
  const cookies: Record<string, string> = {};
  const cookiePairs = cookieHeader.split(';');
  
  for (const pair of cookiePairs) {
    const trimmedPair = pair.trim();
    const eqIndex = trimmedPair.indexOf('=');
    if (eqIndex === -1) continue;
    
    const name = trimmedPair.substring(0, eqIndex);
    const value = trimmedPair.substring(eqIndex + 1);
    cookies[name] = value;
  }
  
  return cookies;
};

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters long')
    .superRefine((pwd, ctx) => {
      const result = validatePasswordStrength(pwd);
      if (!result.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.errors.join('; '),
        });
      }
    }),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = registerSchema.parse(body);

    const result = await AuthService.register(validatedData);
    
    const response = c.json({ 
      user: result.user,
      // Only return token in response for non-production environments
      ...(isProduction ? {} : { token: result.token, refreshToken: result.refreshToken }),
    }, 201);
    
    // Set httpOnly cookies
    response.headers.append('Set-Cookie', `accessToken=${result.token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60}; Path=/`);
    response.headers.append('Set-Cookie', `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: (error as Error).message }, 400);
  }
});

authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);

    const result = await AuthService.login(validatedData);
    
    const response = c.json({ 
      user: result.user,
      // Only return token in response for non-production environments
      ...(isProduction ? {} : { token: result.token, refreshToken: result.refreshToken }),
    });
    
    // Set httpOnly cookies
    response.headers.append('Set-Cookie', `accessToken=${result.token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60}; Path=/`);
    response.headers.append('Set-Cookie', `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: (error as Error).message }, 400);
  }
});

authRoutes.get('/me', async (c) => {
  const cookieHeader = c.req.header('Cookie');
  if (!cookieHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const cookies = parseCookies(cookieHeader);

  const token = cookies.accessToken;
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if token is blacklisted
  const isBlacklisted = await AuthService.isTokenBlacklisted(token);
  if (process.env.NODE_ENV === 'test' && token.length > 100) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('[/me] Checking token with hash:', tokenHash.substring(0, 16) + '... isBlacklisted:', isBlacklisted);
  }
  if (isBlacklisted) {
    return c.json({ error: 'Token has been invalidated' }, 401);
  }

  const user = await AuthService.getUserFromToken(token);
  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  const { password_hash, ...userWithoutPassword } = user;
  return c.json({ user: userWithoutPassword });
});

authRoutes.post('/logout', async (c) => {
  const cookieHeader = c.req.header('Cookie');
  if (!cookieHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const cookies = parseCookies(cookieHeader);

  const token = cookies.accessToken;
  if (token) {
    // Blacklist the access token
    await AuthService.blacklistToken(token);
  }

  const refreshToken = cookies.refreshToken;
  if (refreshToken) {
    // Invalidate refresh tokens for this user
    const user = await AuthService.validateRefreshToken(refreshToken);
    if (user) {
      await AuthService.invalidateRefreshTokens(user.id);
    }
  }

  // Clear cookies
  const response = c.json({ message: 'Logged out successfully' });
  response.headers.append('Set-Cookie', 'accessToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');
  response.headers.append('Set-Cookie', 'refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');

  return response;
});

authRoutes.post('/refresh', async (c) => {
  const cookieHeader = c.req.header('Cookie');
  if (!cookieHeader) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Parse cookies manually
  const cookies = parseCookies(cookieHeader);

  const oldAccessToken = cookies.accessToken;
  const refreshToken = cookies.refreshToken;
  
  if (!refreshToken) {
    return c.json({ error: 'Refresh token required' }, 401);
  }

  const user = await AuthService.validateRefreshToken(refreshToken);
  if (!user) {
    return c.json({ error: 'Invalid refresh token' }, 401);
  }

  // Invalidate old access token (token rotation)
  if (oldAccessToken) {
    await AuthService.blacklistToken(oldAccessToken);
  }

  // Generate new tokens
  const newAccessToken = AuthService.generateToken(user);
  const newRefreshToken = AuthService.generateRefreshToken();
  
  // Store new refresh token and invalidate old one
  await AuthService.invalidateRefreshTokens(user.id);
  await AuthService.storeRefreshToken(user.id, newRefreshToken);

  const responseBody = { 
    user: { id: user.id, email: user.email, name: user.name },
    ...(isProduction ? {} : { token: newAccessToken, refreshToken: newRefreshToken }),
  };
  
  const response = c.json(responseBody);
  
  // Set new cookies
  response.headers.append('Set-Cookie', `accessToken=${newAccessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60}; Path=/`);
  response.headers.append('Set-Cookie', `refreshToken=${newRefreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

  return response;
});

export default authRoutes;