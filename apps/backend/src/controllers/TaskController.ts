import type { Context } from 'hono';
import { TaskService } from '../services/TaskService';
import type { CreateTaskRequest, UpdateTaskRequest } from '../types';

export class TaskController {
  static async getAll(c: Context) {
    try {
      const tasks = await TaskService.getAllTasks();
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

      const task = await TaskService.createTask(body);
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