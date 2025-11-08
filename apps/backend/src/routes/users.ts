import { Hono } from 'hono';
import { UserModel } from '../models/User';
import { authMiddleware } from '../middleware/auth';

const userRoutes = new Hono();

userRoutes.get('/users', authMiddleware, async (c) => {
  try {
    // For now, return all users. In a real app, you might want to filter by organization/team
    const users = await UserModel.findAll();
    return c.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default userRoutes;