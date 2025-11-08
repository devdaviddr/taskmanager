import { pool } from '../config/database';
import type { Column, CreateColumnRequest } from '../types';

export class ColumnModel {
  static async findByBoardId(boardId: number): Promise<Column[]> {
    const result = await pool.query(`
      SELECT id, board_id, name, position, created_at, updated_at
      FROM columns
      WHERE board_id = $1
      ORDER BY position
    `, [boardId]);
    return result.rows;
  }

  static async findById(id: number): Promise<Column | null> {
    const result = await pool.query(`
      SELECT id, board_id, name, position, created_at, updated_at
      FROM columns
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create(boardId: number, columnData: CreateColumnRequest): Promise<Column> {
    // Get the highest position for this board
    const positionResult = await pool.query(`
      SELECT COALESCE(MAX(position), -1) + 1 as next_position
      FROM columns
      WHERE board_id = $1
    `, [boardId]);

    const position = columnData.position ?? positionResult.rows[0].next_position;

    const result = await pool.query(`
      INSERT INTO columns (board_id, name, position, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, board_id, name, position, created_at, updated_at
    `, [boardId, columnData.name, position]);
    return result.rows[0];
  }

  static async update(id: number, columnData: Partial<CreateColumnRequest>): Promise<Column | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (columnData.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(columnData.name);
      paramCount++;
    }

    if (columnData.position !== undefined) {
      fields.push(`position = $${paramCount}`);
      values.push(columnData.position);
      paramCount++;
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE columns
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, board_id, name, position, created_at, updated_at
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM columns WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async moveColumn(id: number, newPosition: number): Promise<Column | null> {
    // Get current column info
    const currentColumn = await this.findById(id);
    if (!currentColumn) return null;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Shift other columns
      if (newPosition > currentColumn.position) {
        // Moving down: shift items between old and new position up
        await client.query(`
          UPDATE columns
          SET position = position - 1
          WHERE board_id = $1 AND position > $2 AND position <= $3
        `, [currentColumn.board_id, currentColumn.position, newPosition]);
      } else {
        // Moving up: shift items between new and old position down
        await client.query(`
          UPDATE columns
          SET position = position + 1
          WHERE board_id = $1 AND position >= $2 AND position < $3
        `, [currentColumn.board_id, newPosition, currentColumn.position]);
      }

      // Update the column position
      const result = await client.query(`
        UPDATE columns
        SET position = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, board_id, name, position, created_at, updated_at
      `, [newPosition, id]);

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