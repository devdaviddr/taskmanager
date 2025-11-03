import { pool } from '../config/database';
import type { Item, CreateItemRequest, MoveItemRequest } from '../types';

export class ItemModel {
  static async findByColumnId(columnId: number): Promise<Item[]> {
    const result = await pool.query(`
      SELECT id, column_id, title, description, position, created_at, updated_at
      FROM items
      WHERE column_id = $1
      ORDER BY position
    `, [columnId]);
    return result.rows;
  }

  static async findById(id: number): Promise<Item | null> {
    const result = await pool.query(`
      SELECT id, column_id, title, description, position, created_at, updated_at
      FROM items
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create(columnId: number, itemData: CreateItemRequest): Promise<Item> {
    // Get the highest position for this column
    const positionResult = await pool.query(`
      SELECT COALESCE(MAX(position), -1) + 1 as next_position
      FROM items
      WHERE column_id = $1
    `, [columnId]);

    const position = itemData.position ?? positionResult.rows[0].next_position;

    const result = await pool.query(`
      INSERT INTO items (column_id, title, description, position, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, column_id, title, description, position, created_at, updated_at
    `, [columnId, itemData.title, itemData.description || null, position]);
    return result.rows[0];
  }

  static async update(id: number, itemData: Partial<CreateItemRequest>): Promise<Item | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (itemData.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(itemData.title);
      paramCount++;
    }

    if (itemData.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(itemData.description);
      paramCount++;
    }

    if (itemData.position !== undefined) {
      fields.push(`position = $${paramCount}`);
      values.push(itemData.position);
      paramCount++;
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE items
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, column_id, title, description, position, created_at, updated_at
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM items WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async moveItem(id: number, moveData: MoveItemRequest): Promise<Item | null> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current item
      const currentItem = await client.query(`
        SELECT column_id, position FROM items WHERE id = $1
      `, [id]);

      if (currentItem.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const { column_id: oldColumnId, position: oldPosition } = currentItem.rows[0];
      const { column_id: newColumnId, position: newPosition } = moveData;

      if (oldColumnId === newColumnId) {
        // Moving within the same column
        if (newPosition > oldPosition) {
          // Moving down: shift items between old and new position up
          await client.query(`
            UPDATE items
            SET position = position - 1
            WHERE column_id = $1 AND position > $2 AND position <= $3
          `, [oldColumnId, oldPosition, newPosition]);
        } else {
          // Moving up: shift items between new and old position down
          await client.query(`
            UPDATE items
            SET position = position + 1
            WHERE column_id = $1 AND position >= $2 AND position < $3
          `, [oldColumnId, newPosition, oldPosition]);
        }
      } else {
        // Moving to a different column
        // Shift items in old column up
        await client.query(`
          UPDATE items
          SET position = position - 1
          WHERE column_id = $1 AND position > $2
        `, [oldColumnId, oldPosition]);

        // Shift items in new column down
        await client.query(`
          UPDATE items
          SET position = position + 1
          WHERE column_id = $1 AND position >= $2
        `, [newColumnId, newPosition]);
      }

      // Update the item
      const result = await client.query(`
        UPDATE items
        SET column_id = $1, position = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, column_id, title, description, position, created_at, updated_at
      `, [newColumnId, newPosition, id]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}