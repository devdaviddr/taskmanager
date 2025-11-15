import { describe, test, expect } from 'vitest';
import { auth, boards, columns, items, testData } from '../test/utils';

describe('Item API', () => {
  describe('POST /api/columns/:columnId/items - Create Item', () => {
    test('Create item successfully with valid data', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const result = await items.create(column.data.id, testData.validItem, user.accessToken);

      expect(result.status).toBe(201);
      expect(result.data.id).toBeDefined();
      expect(result.data.title).toBe(testData.validItem.title);
      expect(result.data.description).toBe(testData.validItem.description);
      expect(result.data.position).toBe(testData.validItem.position);
      expect(result.data.column_id).toBe(column.data.id);
      expect(result.data.archived).toBe(false);
    });

    test('Create item fails without authentication', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const result = await items.create(column.data.id, testData.validItem);

      expect(result.status).toBe(401);
    });

    test('Create item fails with missing title', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const invalidItem = { description: 'Test description' } as any;
      const result = await items.create(column.data.id, invalidItem, user.accessToken);

      expect(result.status).toBe(400);
    });

    test('Create item fails for non-existent column', async () => {
      const user = await auth.register();

      const result = await items.create(99999, testData.validItem, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('User cannot create item in other user\'s column', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);

      // User 2 tries to create item in user 1's column
      const result = await items.create(column.data.id, testData.validItem, user2.accessToken);

      expect(result.status).toBe(403);
    });
  });

  describe('GET /api/items/:id - Get Item', () => {
    test('Get item by ID successfully', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user.accessToken);

      const result = await items.getById(item.data.id, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.id).toBe(item.data.id);
      expect(result.data.title).toBe(testData.validItem.title);
    });

    test('Get item fails for non-existent item', async () => {
      const user = await auth.register();

      const result = await items.getById(99999, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('User cannot access other user\'s item', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user1.accessToken);

      // User 2 tries to access user 1's item
      const result = await items.getById(item.data.id, user2.accessToken);

      expect(result.status).toBe(403);
    });

    test('Get item fails without authentication', async () => {
      const result = await items.getById(1);

      expect(result.status).toBe(401);
    });
  });

  describe('GET /api/columns/:columnId/items - Get Items by Column', () => {
    test('Get all items for a column', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      // Create multiple items
      await items.create(column.data.id, testData.validItem, user.accessToken);
      await items.create(column.data.id, testData.validItem2, user.accessToken);

      const result = await items.getByColumn(column.data.id, user.accessToken);

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThanOrEqual(2);
    });

    test('Get items returns empty array for column with no items', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);

      const result = await items.getByColumn(column.data.id, user.accessToken);

      expect(result.status).toBe(200);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBe(0);
    });

    test('User cannot access items from other user\'s column', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);

      // User 2 tries to access user 1's column items
      const result = await items.getByColumn(column.data.id, user2.accessToken);

      expect(result.status).toBe(403);
    });

    test('Get items fails without authentication', async () => {
      const result = await items.getByColumn(1);

      expect(result.status).toBe(401);
    });
  });

  describe('PUT /api/items/:id - Update Item', () => {
    test('Update item successfully', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user.accessToken);

      const updates = {
        title: 'Updated Item Title',
        description: 'Updated description',
        priority: 'high' as const,
      };

      const result = await items.update(item.data.id, updates, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.title).toBe(updates.title);
      expect(result.data.description).toBe(updates.description);
      expect(result.data.priority).toBe(updates.priority);
    });

    test('Update item - only owner can update', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user1.accessToken);

      // User 2 tries to update user 1's item
      const result = await items.update(item.data.id, { title: 'Hacked Title' }, user2.accessToken);

      expect(result.status).toBe(403);
    });

    test('Update non-existent item returns 404', async () => {
      const user = await auth.register();

      const result = await items.update(99999, { title: 'Test' }, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('Update item fails without authentication', async () => {
      const result = await items.update(1, { title: 'Test' });

      expect(result.status).toBe(401);
    });
  });

  describe('PUT /api/items/:id/move - Move Item', () => {
    test('Move item to different column successfully', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column1 = await columns.create(board.data.id, testData.validColumn, user.accessToken);
      const column2 = await columns.create(board.data.id, testData.validColumn2, user.accessToken);

      const item = await items.create(column1.data.id, testData.validItem, user.accessToken);

      const moveData = {
        column_id: column2.data.id,
        position: 1,
      };

      const result = await items.move(item.data.id, moveData, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.column_id).toBe(column2.data.id);
      expect(result.data.position).toBe(1);
    });

    test('Move item - only owner can move', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column1 = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const column2 = await columns.create(board.data.id, testData.validColumn2, user1.accessToken);
      const item = await items.create(column1.data.id, testData.validItem, user1.accessToken);

      // User 2 tries to move user 1's item
      const moveData = { column_id: column2.data.id, position: 1 };
      const result = await items.move(item.data.id, moveData, user2.accessToken);

      expect(result.status).toBe(403);
    });

    test('Move item fails without authentication', async () => {
      const moveData = { column_id: 1, position: 1 };
      const result = await items.move(1, moveData);

      expect(result.status).toBe(401);
    });
  });

  describe('PUT /api/items/:id/archive - Archive Item', () => {
    test('Archive item successfully', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user.accessToken);

      const result = await items.archive(item.data.id, true, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.archived).toBe(true);
    });

    test('Unarchive item successfully', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user.accessToken);

      // First archive it
      await items.archive(item.data.id, true, user.accessToken);

      // Then unarchive
      const result = await items.archive(item.data.id, false, user.accessToken);

      expect(result.status).toBe(200);
      expect(result.data.archived).toBe(false);
    });

    test('Archive item - only owner can archive', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user1.accessToken);

      // User 2 tries to archive user 1's item
      const result = await items.archive(item.data.id, true, user2.accessToken);

      expect(result.status).toBe(403);
    });
  });

  describe('DELETE /api/items/:id - Delete Item', () => {
    test('Delete item successfully', async () => {
      const user = await auth.register();
      const board = await boards.create(testData.validBoard, user.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user.accessToken);

      const result = await items.delete(item.data.id, user.accessToken);

      expect(result.status).toBe(200);

      // Verify item is deleted
      const getResult = await items.getById(item.data.id, user.accessToken);
      expect(getResult.status).toBe(404);
    });

    test('Delete item - only owner can delete', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user1.accessToken);

      // User 2 tries to delete user 1's item
      const result = await items.delete(item.data.id, user2.accessToken);

      expect(result.status).toBe(403);

      // Verify item still exists
      const getResult = await items.getById(item.data.id, user1.accessToken);
      expect(getResult.status).toBe(200);
    });

    test('Delete non-existent item returns 404', async () => {
      const user = await auth.register();

      const result = await items.delete(99999, user.accessToken);

      expect(result.status).toBe(404);
    });

    test('Delete item fails without authentication', async () => {
      const result = await items.delete(1);

      expect(result.status).toBe(401);
    });
  });

  describe('POST /api/items/:id/users - Assign User to Item', () => {
    test('Assign user to item successfully', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user1.accessToken);

      const result = await items.assignUser(item.data.id, user2.data.user.id, user1.accessToken);

      expect(result.status).toBe(200);
    });

    test('Assign user - only board owner can assign', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);
      const user3 = await auth.register();

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user1.accessToken);

      // User 2 tries to assign user 3 to the item (user 2 is not the board owner)
      const result = await items.assignUser(item.data.id, user3.data.user.id, user2.accessToken);

      expect(result.status).toBe(403);
    });
  });

  describe('DELETE /api/items/:id/users/:userId - Remove User from Item', () => {
    test('Remove user from item successfully', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user1.accessToken);

      // First assign user
      await items.assignUser(item.data.id, user2.data.user.id, user1.accessToken);

      // Then remove user
      const result = await items.removeUser(item.data.id, user2.data.user.id, user1.accessToken);

      expect(result.status).toBe(200);
    });

    test('Remove user - only board owner can remove', async () => {
      const user1 = await auth.register();
      const user2 = await auth.register(testData.validUser2);
      const user3 = await auth.register();

      const board = await boards.create(testData.validBoard, user1.accessToken);
      const column = await columns.create(board.data.id, testData.validColumn, user1.accessToken);
      const item = await items.create(column.data.id, testData.validItem, user1.accessToken);

      // Assign user 2 first
      await items.assignUser(item.data.id, user2.data.user.id, user1.accessToken);

      // User 3 tries to remove user 2 (user 3 is not the board owner)
      const result = await items.removeUser(item.data.id, user2.data.user.id, user3.accessToken);

      expect(result.status).toBe(403);
    });
  });
});