import { describe, test, expect } from 'vitest';
import { auth, boards, columns, testData } from '../test/utils';

describe('Column API', () => {
  describe('POST /api/boards/:boardId/columns - Create Column', () => {
    test('Create column successfully with valid data', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const result = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      expect(result.status).toBe(201);
      expect(result.data.id).toBeDefined();
      expect(result.data.name).toBe(testData.validColumn.name);
      expect(result.data.board_id).toBe(board.data.id);
      expect(result.data.position).toBe(testData.validColumn.position);
    });

    test('Create column fails without authentication', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const result = await columns.create(board.data.id, testData.validColumn);

      expect(result.status).toBe(401);
    });

    test('Create column fails with non-existent board', async () => {
      const user = await auth.register();
      const result = await columns.create(99999, testData.validColumn, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('Create column fails with missing name', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const result = await columns.create(board.data.id, { position: 0 }, user.accessToken);

      expect(result.status).toBe(400);
    });

    test('Create multiple columns in same board', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);

      const col1 = await columns.create(board.data.id, testData.validColumn, user.accessToken);
      const col2 = await columns.create(board.data.id, testData.validColumn2, user.accessToken);
      const col3 = await columns.create(board.data.id, testData.validColumn3, user.accessToken);

      expect(col1.status).toBe(201);
      expect(col2.status).toBe(201);
      expect(col3.status).toBe(201);
      expect(col1.data.id).not.toBe(col2.data.id);
      expect(col2.data.id).not.toBe(col3.data.id);
    });
  });

  describe('GET /api/boards/:boardId/columns - List Columns', () => {
    test('Get all columns for a board', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);

      await columns.create(board.data.id, testData.validColumn, user.accessToken);
      await columns.create(board.data.id, testData.validColumn2, user.accessToken);

      const result = await columns.getAll(board.data.id, user.accessToken);

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(2);
    });

    test('Get columns returns empty list for board with no columns', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);

      const result = await columns.getAll(board.data.id, user.accessToken);

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(0);
    });

    test('Get columns fails for non-existent board', async () => {
      const user = await auth.register();
      const result = await columns.getAll(99999, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('Get columns fails without authentication', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);

      const result = await columns.getAll(board.data.id);

      expect(result.status).toBe(401);
    });

    test('User can only access columns of boards they own', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register();

      const board = await boards.create(testData.validBoard, user1.accessToken);
      await columns.create(board.data.id, testData.validColumn, user1.accessToken);

      const result = await columns.getAll(board.data.id, user2.accessToken);

      expect(result.status).toBe(403);
    });
  });

  describe('PUT /api/columns/:id - Update Column', () => {
    test('Update column successfully', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const result = await columns.update(column.data.id, { name: 'Updated Column' }, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.name).toBe('Updated Column');
    });

    test('Update column - only owner can update', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register();

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);

      const result = await columns.update(column.data.id, { name: 'Updated' }, user2.accessToken);

      expect(result.status).toBe(403);
    });

    test('Update non-existent column returns 404', async () => {
      const user = await auth.register();

      const result = await columns.update(99999, { name: 'Updated' }, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('Update column fails without authentication', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const result = await columns.update(column.data.id, { name: 'Updated' });

      expect(result.status).toBe(401);
    });
  });

  describe('DELETE /api/columns/:id - Delete Column', () => {
    test('Delete column successfully', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const result = await columns.delete(column.data.id, user.accessToken);

      expect(result.status).toBe(200);

      // Verify column is deleted
      const getResult = await columns.getAll(board.data.id, user.accessToken);
      expect(getResult.data.length).toBe(0);
    });

    test('Delete column - only owner can delete', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register();

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);

      const result = await columns.delete(column.data.id, user2.accessToken);

      expect(result.status).toBe(403);
    });

    test('Delete non-existent column returns 404', async () => {
      const user = await auth.register();

      const result = await columns.delete(99999, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('Delete column fails without authentication', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const result = await columns.delete(column.data.id);

      expect(result.status).toBe(401);
    });

    test('Deleting column removes all related items', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      // TODO: Create items in the column when item tests are written

      const result = await columns.delete(column.data.id, user.accessToken);

      expect(result.status).toBe(200);
    });
  });

  describe('Column Data Validation', () => {
    test('Create column with minimal data', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const minimal = { name: 'Minimal Column' } as any;

      const result = await columns.create(board.data.id, minimal, user.accessToken);

      expect(result.status).toBe(201);
      expect(result.data.name).toBe('Minimal Column');
    });

    test('Update column - preserve unmodified fields', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const updated = await columns.update(column.data.id, { name: 'New Name' }, user.accessToken);

      expect(updated.data.name).toBe('New Name');
      expect(updated.data.position).toBe(testData.validColumn.position);
      expect(updated.data.board_id).toBe(board.data.id);
    });
  });

  describe('Column State Transitions', () => {
    test('Column can be created and updated multiple times', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      // Update 1
      const updated1 = await columns.update(column.data.id, { name: 'First Update' }, user.accessToken);
      expect(updated1.data.name).toBe('First Update');

      // Update 2
      const updated2 = await columns.update(column.data.id, { name: 'Second Update' }, user.accessToken);
      expect(updated2.data.name).toBe('Second Update');

      // Verify final state
      const list = await columns.getAll(board.data.id, user.accessToken);
      expect(list.data[0].name).toBe('Second Update');
    });

    test('Creating new columns does not affect existing columns', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);

      const col1Result = await columns.create(board.data.id, testData.validColumn, user.accessToken);
      const col1Id = col1Result.data.id;

      // Create another column
      await columns.create(board.data.id, testData.validColumn2, user.accessToken);

      // Verify col1 is unchanged
      const check = await columns.getAll(board.data.id, user.accessToken);
      const col1 = check.data.find((c: any) => c.id === col1Id);
      expect(col1?.name).toBe(testData.validColumn.name);
    });
  });
});
