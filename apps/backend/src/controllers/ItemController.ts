import type { Context } from 'hono';
import { ItemService } from '../services/ItemService';
import type { CreateItemRequest, MoveItemRequest } from '../types';

export class ItemController {
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

      const item = await ItemService.createItem(columnId, body);
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
      const item = await ItemService.updateItem(id, body);

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

  static async move(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid item ID' }, 400);
      }

      const body: MoveItemRequest = await c.req.json();

      if (typeof body.column_id !== 'number' || typeof body.position !== 'number' || body.position < 0) {
        return c.json({ error: 'Invalid move data' }, 400);
      }

      const item = await ItemService.moveItem(id, body);
      return c.json(item);
    } catch (error) {
      console.error('Controller error - move item:', error);
      if (error instanceof Error && error.message === 'Item not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}