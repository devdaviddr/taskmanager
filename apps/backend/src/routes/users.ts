import { Hono } from 'hono';
import type { Context } from 'hono';
import { UserModel } from '../models/User';
import { authMiddleware } from '../middleware/auth';
import type { UpdateUserRequest, User } from '../types';

// Extend Hono context to include user
type Variables = {
  user: User;
};

type AppContext = Context<{ Variables: Variables }>;

const userRoutes = new Hono<{ Variables: Variables }>();

userRoutes.get('/users', authMiddleware, async (c: AppContext) => {
  try {
    // For now, return all users. In a real app, you might want to filter by organization/team
    const users = await UserModel.findAll();
    return c.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

userRoutes.put('/users/:id', authMiddleware, async (c: AppContext) => {
  try {
    const id = parseInt(c.req.param('id'));
    const userData: UpdateUserRequest = await c.req.json();

    // Get current user from auth middleware
    const currentUser = c.get('user');
    if (currentUser.id !== id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const updatedUser = await UserModel.update(id, userData);
    if (!updatedUser) {
      return c.json({ error: 'User not found or no changes made' }, 404);
    }

    return c.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default userRoutes;