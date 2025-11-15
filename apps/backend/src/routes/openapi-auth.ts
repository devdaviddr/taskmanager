import { z } from 'zod';
import { app as openapiApp } from '../openapi';
import { LoginRequestSchema, LoginResponseSchema } from '../openapi/schemas';
import { AuthService } from '../services/AuthService';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Returns JWT token for Bearer authentication in Swagger UI
 */
openapiApp.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = LoginRequestSchema.parse(body);

    // Use existing AuthService.login
    const result = await AuthService.login(validatedData);

    // Return token in response body (for Swagger UI to copy)
    // Also set httpOnly cookies for frontend
    const response = c.json(result);

    // Set httpOnly cookies (optional, for frontend)
    response.headers.append(
      'Set-Cookie',
      `accessToken=${result.token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60}; Path=/`
    );
    response.headers.append(
      'Set-Cookie',
      `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`
    );

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: 'Validation error', details: error.issues },
        400
      );
    }
    return c.json({ error: (error as Error).message }, 400);
  }
});

export default openapiApp;
