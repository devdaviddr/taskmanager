import { ItemModel } from '../models/Item';
import type { Item, CreateItemRequest, MoveItemRequest } from '../types';

export class ItemService {
  static async getItemsByColumn(columnId: number): Promise<Item[]> {
    try {
      return await ItemModel.findByColumnId(columnId);
    } catch (error) {
      console.error('Service error - getItemsByColumn:', error);
      throw new Error('Failed to retrieve items');
    }
  }

  static async getItemById(id: number): Promise<Item> {
    try {
      const item = await ItemModel.findById(id);
      if (!item) {
        throw new Error('Item not found');
      }
      return item;
    } catch (error) {
      console.error('Service error - getItemById:', error);
      if (error instanceof Error && error.message === 'Item not found') {
        throw error;
      }
      throw new Error('Failed to retrieve item');
    }
  }

  static async createItem(columnId: number, itemData: CreateItemRequest): Promise<Item> {
    try {
      // Business logic validation
      this.validateCreateItemData(itemData);

      return await ItemModel.create(columnId, itemData);
    } catch (error) {
      console.error('Service error - createItem:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        throw error;
      }
      throw new Error('Failed to create item');
    }
  }

  static async updateItem(id: number, itemData: Partial<CreateItemRequest>): Promise<Item> {
    try {
      // Business logic validation
      this.validateUpdateItemData(itemData);

      const item = await ItemModel.update(id, itemData);
      if (!item) {
        throw new Error('Item not found or no changes made');
      }
      return item;
    } catch (error) {
      console.error('Service error - updateItem:', error);
      if (error instanceof Error && (error.message === 'Item not found or no changes made' || error.message.includes('validation'))) {
        throw error;
      }
      throw new Error('Failed to update item');
    }
  }

  static async deleteItem(id: number): Promise<void> {
    try {
      const deleted = await ItemModel.delete(id);
      if (!deleted) {
        throw new Error('Item not found');
      }
    } catch (error) {
      console.error('Service error - deleteItem:', error);
      if (error instanceof Error && error.message === 'Item not found') {
        throw error;
      }
      throw new Error('Failed to delete item');
    }
  }

  static async archiveItem(id: number, archived: boolean = true): Promise<Item> {
    try {
      const item = await ItemModel.archive(id, archived);
      if (!item) {
        throw new Error('Item not found');
      }
      return item;
    } catch (error) {
      console.error('Service error - archiveItem:', error);
      if (error instanceof Error && error.message === 'Item not found') {
        throw error;
      }
      throw new Error('Failed to archive item');
    }
  }

  static async moveItem(id: number, moveData: MoveItemRequest): Promise<Item> {
    try {
      const item = await ItemModel.moveItem(id, moveData);
      if (!item) {
        throw new Error('Item not found');
      }
      return item;
    } catch (error) {
      console.error('Service error - moveItem:', error);
      if (error instanceof Error && error.message === 'Item not found') {
        throw error;
      }
      throw new Error('Failed to move item');
    }
  }

  private static validateCreateItemData(data: CreateItemRequest): void {
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Validation error: Title is required and must be a string');
    }

    if (data.title.trim().length === 0) {
      throw new Error('Validation error: Title cannot be empty');
    }

    if (data.title.length > 255) {
      throw new Error('Validation error: Title cannot exceed 255 characters');
    }

    if (data.description && typeof data.description !== 'string') {
      throw new Error('Validation error: Description must be a string');
    }

    if (data.position !== undefined && (typeof data.position !== 'number' || data.position < 0)) {
      throw new Error('Validation error: Position must be a non-negative number');
    }
  }

  private static validateUpdateItemData(data: Partial<CreateItemRequest>): void {
    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        throw new Error('Validation error: Title must be a string');
      }

      if (data.title.trim().length === 0) {
        throw new Error('Validation error: Title cannot be empty');
      }

      if (data.title.length > 255) {
        throw new Error('Validation error: Title cannot exceed 255 characters');
      }
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      throw new Error('Validation error: Description must be a string');
    }

    if (data.position !== undefined && (typeof data.position !== 'number' || data.position < 0)) {
      throw new Error('Validation error: Position must be a non-negative number');
    }
  }
}