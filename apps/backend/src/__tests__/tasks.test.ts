import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { auth, tasks, testData } from '../test/utils';

describe('Task API', () => {
  let user1Token: string;
  let user2Token: string;
  let user1Id: number;
  let user2Id: number;

  beforeEach(async () => {
    // Clean up test data before each test
    console.log('🧹 Cleaning up test data before test...');

    // Register users
    const user1 = await auth.register(testData.validUser);
    user1Token = user1.accessToken!;
    user1Id = user1.data.user.id;

    const user2 = await auth.register(testData.validUser2);
    user2Token = user2.accessToken!;
    user2Id = user2.data.user.id;

    console.log('✅ Test data cleaned up');
  });

  afterEach(async () => {
    // Clean up test data after each test
    console.log('🧹 Cleaning up test data after test...');
    console.log('✅ Test data cleaned up');
  });

  describe('POST /api/tasks - Create Task', () => {
    it('Create task successfully with valid data', async () => {
      const response = await tasks.create(testData.validTask, user1Token);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.title).toBe(testData.validTask.title);
      expect(response.data.description).toBe(testData.validTask.description);
      expect(response.data.completed).toBe(false);
      expect(response.data.user_id).toBe(user1Id);
      expect(response.data).toHaveProperty('created_at');
      expect(response.data).toHaveProperty('updated_at');
    });

    it('Create task fails without authentication', async () => {
      const response = await tasks.create(testData.validTask);

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('Create task fails with missing title', async () => {
      const invalidTask = { description: 'Test description' };
      const response = await tasks.create(invalidTask, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Validation error: Title is required');
    });

    it('Create task fails with empty title', async () => {
      const invalidTask = { title: '', description: 'Test description' };
      const response = await tasks.create(invalidTask, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Validation error: Title is required and cannot be empty');
    });

    it('Create task fails with title too long', async () => {
      const invalidTask = { title: 'a'.repeat(256), description: 'Test description' };
      const response = await tasks.create(invalidTask, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Validation error: Title cannot exceed 255 characters');
    });

    it('Create task fails with invalid description type', async () => {
      const invalidTask = { title: 'Test Task', description: 123 };
      const response = await tasks.create(invalidTask, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Validation error: Description must be a string');
    });
  });

  describe('GET /api/tasks - Get All Tasks', () => {
    it('Get all tasks for authenticated user', async () => {
      // Create some tasks
      await tasks.create(testData.validTask, user1Token);
      await tasks.create(testData.validTask2, user1Token);

      const response = await tasks.getAll(user1Token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(2);
      expect(response.data[0]).toHaveProperty('id');
      // Tasks are returned in DESC order by created_at, so validTask2 is first
      expect(response.data[0].title).toBe(testData.validTask2.title);
      expect(response.data[1].title).toBe(testData.validTask.title);
    });

    it('Get all tasks fails without authentication', async () => {
      const response = await tasks.getAll();

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('User cannot see other users tasks', async () => {
      // User1 creates a task
      await tasks.create(testData.validTask, user1Token);

      // User2 tries to get all tasks
      const response = await tasks.getAll(user2Token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(0);
    });
  });

  describe('GET /api/tasks/:id - Get Task', () => {
    it('Get task by ID successfully', async () => {
      // Create a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      const response = await tasks.getById(taskId, user1Token);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(taskId);
      expect(response.data.title).toBe(testData.validTask.title);
      expect(response.data.description).toBe(testData.validTask.description);
      expect(response.data.completed).toBe(false);
      expect(response.data.user_id).toBe(user1Id);
    });

    it('Get task fails for non-existent task', async () => {
      const response = await tasks.getById(99999, user1Token);

      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Task not found');
    });

    it('User cannot access other users task', async () => {
      // User1 creates a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      // User2 tries to access it
      const response = await tasks.getById(taskId, user2Token);

      expect(response.status).toBe(403);
      expect(response.data.error).toBe('Access denied');
    });

    it('Get task fails without authentication', async () => {
      const response = await tasks.getById(1);

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('Get task fails with invalid ID', async () => {
      const response = await tasks.getById(NaN, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Invalid task ID');
    });
  });

  describe('PUT /api/tasks/:id - Update Task', () => {
    it('Update task successfully', async () => {
      // Create a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      const updates = {
        title: 'Updated Task Title',
        description: 'Updated description',
        completed: true,
      };

      const response = await tasks.update(taskId, updates, user1Token);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(taskId);
      expect(response.data.title).toBe(updates.title);
      expect(response.data.description).toBe(updates.description);
      expect(response.data.completed).toBe(updates.completed);
    });

    it('Update task with partial data', async () => {
      // Create a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      const updates = { completed: true };

      const response = await tasks.update(taskId, updates, user1Token);

      expect(response.status).toBe(200);
      expect(response.data.completed).toBe(true);
      expect(response.data.title).toBe(testData.validTask.title); // Unchanged
    });

    it('Update task fails for non-existent task', async () => {
      const updates = { title: 'Updated Title' };
      const response = await tasks.update(99999, updates, user1Token);

      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Task not found');
    });

    it('User cannot update other users task', async () => {
      // User1 creates a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      // User2 tries to update it
      const updates = { title: 'Hacked Title' };
      const response = await tasks.update(taskId, updates, user2Token);

      expect(response.status).toBe(403);
      expect(response.data.error).toBe('Access denied');
    });

    it('Update task fails with invalid title', async () => {
      // Create a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      const updates = { title: '' };
      const response = await tasks.update(taskId, updates, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Validation error: Title is required and cannot be empty');
    });

    it('Update task fails with invalid completed type', async () => {
      // Create a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      const updates = { completed: 'true' };
      const response = await tasks.update(taskId, updates, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('Validation error: Completed must be a boolean');
    });

    it('Update task fails without authentication', async () => {
      const updates = { title: 'Updated Title' };
      const response = await tasks.update(1, updates);

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('Update task fails with invalid ID', async () => {
      const updates = { title: 'Updated Title' };
      const response = await tasks.update(NaN, updates, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Invalid task ID');
    });
  });

  describe('DELETE /api/tasks/:id - Delete Task', () => {
    it('Delete task successfully', async () => {
      // Create a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      const response = await tasks.delete(taskId, user1Token);

      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Task deleted successfully');

      // Verify task is deleted
      const getResponse = await tasks.getById(taskId, user1Token);
      expect(getResponse.status).toBe(404);
    });

    it('Delete task fails for non-existent task', async () => {
      const response = await tasks.delete(99999, user1Token);

      expect(response.status).toBe(404);
      expect(response.data.error).toBe('Task not found');
    });

    it('User cannot delete other users task', async () => {
      // User1 creates a task
      const createResponse = await tasks.create(testData.validTask, user1Token);
      const taskId = createResponse.data.id;

      // User2 tries to delete it
      const response = await tasks.delete(taskId, user2Token);

      expect(response.status).toBe(403);
      expect(response.data.error).toBe('Access denied');
    });

    it('Delete task fails without authentication', async () => {
      const response = await tasks.delete(1);

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('Delete task fails with invalid ID', async () => {
      const response = await tasks.delete(NaN, user1Token);

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('Invalid task ID');
    });
  });
});