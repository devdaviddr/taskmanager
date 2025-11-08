import { Hono } from 'hono';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';

const authRoutes = new Hono();

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
    return c.json(result);
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
    return c.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.issues }, 400);
    }
    return c.json({ error: (error as Error).message }, 400);
  }
});

authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  const user = await AuthService.getUserFromToken(token);
  if (!user) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  const { password_hash, ...userWithoutPassword } = user;
  return c.json({ user: userWithoutPassword });
});

export default authRoutes;