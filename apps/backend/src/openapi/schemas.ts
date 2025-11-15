import { z } from 'zod';

// User schema (without password)
export const UserSchema = z.object({
  id: z.number().int().describe('User ID'),
  email: z.string().email().describe('User email address'),
  name: z.string().nullable().describe('User full name'),
  role: z.enum(['user', 'admin', 'superadmin']).describe('User role'),
  created_at: z.coerce.date().describe('User creation timestamp'),
  updated_at: z.coerce.date().describe('User last update timestamp'),
});

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email().describe('User email'),
  password: z.string().min(1).describe('User password'),
});

// Login response schema
export const LoginResponseSchema = z.object({
  user: UserSchema.describe('Authenticated user object'),
  token: z.string().describe('JWT access token for Bearer authentication'),
  refreshToken: z.string().describe('Refresh token for obtaining new access tokens'),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string().describe('Error message'),
  details: z.any().optional().describe('Additional error details'),
});

// Unauthorized response schema
export const UnauthorizedResponseSchema = z.object({
  error: z.string().describe('Unauthorized error message'),
});
