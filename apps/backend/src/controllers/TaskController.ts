import type { Context } from 'hono';
import { TaskService } from '../services/TaskService';
import type { CreateTaskRequest, UpdateTaskRequest } from '../types';
import { checkTaskOwnership } from '../utils/auth';

export class TaskController {
  static async getAll(c: Context) {
    try {
      const user = c.get('user');
      const tasks = await TaskService.getAllTasksByUser(user.id);
      return c.json(tasks);
    } catch (error) {
      console.error('Controller error - getAll:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async getById(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid task ID' }, 400);
      }

      const user = c.get('user');
      
      // Check task ownership
      try {
        await checkTaskOwnership(id, user.id);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Task not found') {
            return c.json({ error: error.message }, 404);
          }
          if (error.message === 'Access denied') {
            return c.json({ error: error.message }, 403);
          }
        }
        throw error;
      }

      const task = await TaskService.getTaskById(id);
      return c.json(task);
    } catch (error) {
      console.error('Controller error - getById:', error);
      if (error instanceof Error && error.message === 'Task not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async create(c: Context) {
    try {
      const body: CreateTaskRequest = await c.req.json();
      const user = c.get('user');
      
      const task = await TaskService.createTask(body, user.id);
      return c.json(task, 201);
    } catch (error) {
      console.error('Controller error - create:', error);
      if (error instanceof Error && error.message.includes('Validation error')) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async update(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid task ID' }, 400);
      }

      const user = c.get('user');
      
      // Check task ownership
      try {
        await checkTaskOwnership(id, user.id);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Task not found') {
            return c.json({ error: error.message }, 404);
          }
          if (error.message === 'Access denied') {
            return c.json({ error: error.message }, 403);
          }
        }
        throw error;
      }

      const body: UpdateTaskRequest = await c.req.json();
      const task = await TaskService.updateTask(id, body);

      return c.json(task);
    } catch (error) {
      console.error('Controller error - update:', error);
      if (error instanceof Error && (error.message === 'Task not found or no changes made' || error.message.includes('Validation error'))) {
        return c.json({ error: error.message }, error.message === 'Task not found or no changes made' ? 404 : 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async delete(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid task ID' }, 400);
      }

      const user = c.get('user');
      
      // Check task ownership
      try {
        await checkTaskOwnership(id, user.id);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Task not found') {
            return c.json({ error: error.message }, 404);
          }
          if (error.message === 'Access denied') {
            return c.json({ error: error.message }, 403);
          }
        }
        throw error;
      }

      await TaskService.deleteTask(id);
      return c.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Controller error - delete:', error);
      if (error instanceof Error && error.message === 'Task not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}