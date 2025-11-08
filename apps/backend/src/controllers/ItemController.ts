import type { Context } from 'hono';
import { ItemService } from '../services/ItemService';
import type { CreateItemRequest } from '../types';

export class ItemController {
  static async get(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid item ID' }, 400);
      }

      const item = await ItemService.getItemById(id);
      return c.json(item);
    } catch (error) {
      console.error('Controller error - get item:', error);
      if (error instanceof Error && error.message === 'Item not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async getByColumn(c: Context) {
    try {
      const columnId = parseInt(c.req.param('columnId'));
      if (isNaN(columnId)) {
        return c.json({ error: 'Invalid column ID' }, 400);
      }

      const items = await ItemService.getItemsByColumn(columnId);
      return c.json(items);
    } catch (error) {
      console.error('Controller error - getByColumn items:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async create(c: Context) {
    try {
      const columnId = parseInt(c.req.param('columnId'));
      if (isNaN(columnId)) {
        return c.json({ error: 'Invalid column ID' }, 400);
      }

      const body: CreateItemRequest = await c.req.json();

      // Parse dates from strings
      const itemData: CreateItemRequest = {
        ...body,
        start_date: body.start_date ? new Date(body.start_date) : undefined,
        end_date: body.end_date ? new Date(body.end_date) : undefined,
      };

      const item = await ItemService.createItem(columnId, itemData);
      return c.json(item, 201);
    } catch (error) {
      console.error('Controller error - create item:', error);
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
        return c.json({ error: 'Invalid item ID' }, 400);
      }

      const body: Partial<CreateItemRequest> = await c.req.json();

      // Parse dates from strings
      const itemData: Partial<CreateItemRequest> = {
        ...body,
        start_date: body.start_date ? new Date(body.start_date) : undefined,
        end_date: body.end_date ? new Date(body.end_date) : undefined,
      };

      const item = await ItemService.updateItem(id, itemData);

      return c.json(item);
    } catch (error) {
      console.error('Controller error - update item:', error);
      if (error instanceof Error && (error.message === 'Item not found or no changes made' || error.message.includes('Validation error'))) {
        return c.json({ error: error.message }, error.message === 'Item not found or no changes made' ? 404 : 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async delete(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid item ID' }, 400);
      }

      await ItemService.deleteItem(id);
      return c.json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Controller error - delete item:', error);
      if (error instanceof Error && error.message === 'Item not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async archive(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid item ID' }, 400);
      }

      const body = await c.req.json();
      const archived = body.archived !== undefined ? body.archived : true;

      const item = await ItemService.archiveItem(id, archived);
      return c.json(item);
    } catch (error) {
      console.error('Controller error - archive item:', error);
      if (error instanceof Error && error.message === 'Item not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async assignUser(c: Context) {
    try {
      const itemId = parseInt(c.req.param('id'));
      if (isNaN(itemId)) {
        return c.json({ error: 'Invalid item ID' }, 400);
      }

      const body = await c.req.json();
      const userId = body.user_id;
      if (typeof userId !== 'number') {
        return c.json({ error: 'Invalid user ID' }, 400);
      }

      const success = await ItemService.assignUserToItem(itemId, userId);
      if (!success) {
        return c.json({ error: 'Failed to assign user' }, 500);
      }

      return c.json({ message: 'User assigned successfully' });
    } catch (error) {
      console.error('Controller error - assign user to item:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async removeUser(c: Context) {
    try {
      const itemId = parseInt(c.req.param('id'));
      const userId = parseInt(c.req.param('userId'));
      if (isNaN(itemId) || isNaN(userId)) {
        return c.json({ error: 'Invalid IDs' }, 400);
      }

      const success = await ItemService.removeUserFromItem(itemId, userId);
      if (!success) {
        return c.json({ error: 'User not assigned to item' }, 404);
      }

       return c.json({ message: 'User removed successfully' });
     } catch (error) {
       console.error('Controller error - remove user from item:', error);
       return c.json({ error: 'Internal server error' }, 500);
     }
   }
 }