import { describe, test, expect } from 'vitest';
import { auth, boards, testData } from '../test/utils';

describe('Board API', () => {
  describe('POST /api/boards - Create Board', () => {
    test('Create board successfully with valid data', async () => {
      const user = await auth.register();
      const result = await boards.create(testData.validBoard, user.accessToken);

      expect(result.status).toBe(201);
      expect(result.data.id).toBeDefined();
      expect(result.data.name).toBe(testData.validBoard.name);
      expect(result.data.description).toBe(testData.validBoard.description);
      expect(result.data.user_id).toBe(user.data.user.id);
      expect(result.data.archived).toBe(false);
    });

    test('Create board fails without authentication', async () => {
      const result = await boards.create(testData.validBoard);

      expect(result.status).toBe(401);
    });

    test('Create board fails with missing name', async () => {
      const user = await auth.register();
      const result = await boards.create(
        { name: '', description: 'test' } as any,
        user.accessToken
      );

      expect(result.status).toBe(400);
    });

    test('Create multiple boards for same user', async () => {
      const user = await auth.register();
      
      const board1 = await boards.create(testData.validBoard, user.accessToken);
      const board2 = await boards.create(testData.validBoard2, user.accessToken);

      expect(board1.status).toBe(201);
      expect(board2.status).toBe(201);
      expect(board1.data.id).not.toBe(board2.data.id);
    });
  });

  describe('GET /api/boards - List Boards', () => {
    test('Get all boards for authenticated user', async () => {
      const user = await auth.register();
      
      // Create some boards
      await boards.create(testData.validBoard, user.accessToken);
      await boards.create(testData.validBoard2, user.accessToken);

      // Get all boards
      const result = await boards.getAll(user.accessToken);

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThanOrEqual(2);
    });

    test('Get boards returns empty list for user with no boards', async () => {
      const user = await auth.register();
      const result = await boards.getAll(user.accessToken);

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(0);
    });

    test('User can only see their own boards', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      // User 1 creates a board
      const user1Board = await boards.create(testData.validBoard, user1.accessToken);

      // User 2 gets their boards (should be empty)
      const user2Boards = await boards.getAll(user2.accessToken);

      expect(user2Boards.data.length).toBe(0);

      // User 1 gets their boards (should have 1)
      const user1Boards = await boards.getAll(user1.accessToken);
      expect(user1Boards.data.length).toBe(1);
    });

    test('Get boards fails without authentication', async () => {
      const result = await boards.getAll();

      expect(result.status).toBe(401);
    });
  });

  describe('GET /api/boards/:id - Get Single Board', () => {
    test('Get board by ID successfully', async () => {
      const user = await auth.register();
      const created = await boards.create(testData.validBoard, user.accessToken);

      const result = await boards.getById(created.data.id, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.id).toBe(created.data.id);
      expect(result.data.name).toBe(testData.validBoard.name);
    });

    test('Get board fails for non-existent board', async () => {
      const user = await auth.register();
      const result = await boards.getById(99999, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('User cannot access other user\'s board', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const user1Board = await boards.create(testData.validBoard, user1.accessToken);

      // User 2 tries to access user 1's board
      const result = await boards.getById(user1Board.data.id, user2.accessToken);

      expect(result.status).toBe(403);
    });

    test('Get board fails without authentication', async () => {
      const result = await boards.getById(1);

      expect(result.status).toBe(401);
    });
  });

  describe('GET /api/boards/:id/full - Get Board with Columns', () => {
    test('Get board with columns endpoint', async () => {
      const user = await auth.register();
      const created = await boards.create(testData.validBoard, user.accessToken);

      const result = await boards.getWithColumns(created.data.id, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.id).toBe(created.data.id);
      expect(result.data.columns).toBeDefined();
      expect(Array.isArray(result.data.columns)).toBe(true);
    });
  });

  describe('PUT /api/boards/:id - Update Board', () => {
    test('Update board successfully', async () => {
      const user = await auth.register();
      const created = await boards.create(testData.validBoard, user.accessToken);

      const updates = {
        name: 'Updated Board Name',
        description: 'Updated description',
      };

      const result = await boards.update(created.data.id, updates, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.name).toBe(updates.name);
      expect(result.data.description).toBe(updates.description);
    });

    test('Update board - only owner can update', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const user1Board = await boards.create(testData.validBoard, user1.accessToken);

      // User 2 tries to update user 1's board
      const result = await boards.update(
        user1Board.data.id,
        { name: 'Hacked Board' },
        user2.accessToken
      );

      expect(result.status).toBe(403);
    });

    test('Update non-existent board returns 404', async () => {
      const user = await auth.register();
      const result = await boards.update(99999, { name: 'Test' }, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('Update board fails without authentication', async () => {
      const result = await boards.update(1, { name: 'Test' });

      expect(result.status).toBe(401);
    });
  });

  describe('DELETE /api/boards/:id - Delete Board', () => {
    test('Delete board successfully', async () => {
      const user = await auth.register();
      const created = await boards.create(testData.validBoard, user.accessToken);

      const result = await boards.delete(created.data.id, user.accessToken);

      expect(result.status).toBe(200);

      // Verify board is deleted
      const getResult = await boards.getById(created.data.id, user.accessToken);
      expect(getResult.status).toBe(404);
    });

    test('Delete board - only owner can delete', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const user1Board = await boards.create(testData.validBoard, user1.accessToken);

      // User 2 tries to delete user 1's board
      const result = await boards.delete(user1Board.data.id, user2.accessToken);

      expect(result.status).toBe(403);

      // Verify board still exists
      const getResult = await boards.getById(user1Board.data.id, user1.accessToken);
      expect(getResult.status).toBe(200);
    });

    test('Delete non-existent board returns 404', async () => {
      const user = await auth.register();
      const result = await boards.delete(99999, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('Delete board fails without authentication', async () => {
      const result = await boards.delete(1);

      expect(result.status).toBe(401);
    });

    test('Deleting board removes all related columns and items (cascade)', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);

      // Verify board exists with columns
      const fullBoard = await boards.getWithColumns(board.data.id, user.accessToken);
      expect(fullBoard.status).toBe(200);

      // Delete the board
      const deleteResult = await boards.delete(board.data.id, user.accessToken);
      expect(deleteResult.status).toBe(200);

      // Verify board is gone
      const getResult = await boards.getById(board.data.id, user.accessToken);
      expect(getResult.status).toBe(404);
    });
  });

  describe('Board Data Validation', () => {
    test('Create board with minimal data', async () => {
      const user = await auth.register();
      const minimal = { name: 'Minimal Board' } as any;

      const result = await boards.create(minimal, user.accessToken);

      expect(result.status).toBe(201);
      expect(result.data.name).toBe('Minimal Board');
    });

    test('Update board - preserve unmodified fields', async () => {
      const user = await auth.register();
      const created = await boards.create(testData.validBoard, user.accessToken);

      // Update only the name
      const updated = await boards.update(
        created.data.id,
        { name: 'New Name' },
        user.accessToken
      );

      // Description should remain unchanged
      expect(updated.data.description).toBe(testData.validBoard.description);
    });
  });

  describe('Board State Transitions', () => {
    test('Board can be created and updated multiple times', async () => {
      const user = await auth.register();
      const created = await boards.create(testData.validBoard, user.accessToken);

      // Update 1
      const updated1 = await boards.update(
        created.data.id,
        { name: 'First Update' },
        user.accessToken
      );
      expect(updated1.data.name).toBe('First Update');

      // Update 2
      const updated2 = await boards.update(
        created.data.id,
        { name: 'Second Update' },
        user.accessToken
      );
      expect(updated2.data.name).toBe('Second Update');

      // Verify final state
      const final = await boards.getById(created.data.id, user.accessToken);
      expect(final.data.name).toBe('Second Update');
    });

    test('Creating new boards does not affect existing boards', async () => {
      const user = await auth.register();
      
      const boardResult1 = await boards.create(testData.validBoard, user.accessToken);
      const board1Id = boardResult1.data.id;

      // Create another board
      await boards.create(testData.validBoard2, user.accessToken);

      // Verify board 1 is unchanged
      const check = await boards.getById(board1Id, user.accessToken);
      expect(check.data.name).toBe(testData.validBoard.name);
    });
  });
});
