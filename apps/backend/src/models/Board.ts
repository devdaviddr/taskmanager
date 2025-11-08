import { pool } from '../config/database';
import type { Board, CreateBoardRequest, UpdateBoardRequest, BoardWithColumns } from '../types';

export class BoardModel {
  static async findAll(userId: number = 1): Promise<Board[]> {
    const result = await pool.query(`
      SELECT id, name, description, background, column_theme, archived, user_id, created_at, updated_at
      FROM boards
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    return result.rows;
  }

  static async findById(id: number): Promise<Board | null> {
    const result = await pool.query(`
      SELECT id, name, description, background, column_theme, archived, user_id, created_at, updated_at
      FROM boards
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async findByIdWithColumns(id: number): Promise<BoardWithColumns | null> {
    const boardResult = await pool.query(`
      SELECT id, name, description, background, column_theme, archived, user_id, created_at, updated_at
      FROM boards
      WHERE id = $1
    `, [id]);

    if (!boardResult.rows[0]) return null;

    const columnsResult = await pool.query(`
      SELECT
        c.id, c.board_id, c.name, c.position, c.created_at, c.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'column_id', i.column_id,
              'title', i.title,
              'description', i.description,
              'position', i.position,
              'start_date', i.start_date,
              'end_date', i.end_date,
              'effort', i.effort,
              'label', i.label,
              'priority', i.priority,
              'archived', i.archived,
              'created_at', i.created_at,
              'updated_at', i.updated_at,
              'tags', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', t.id,
                      'name', t.name,
                      'color', t.color,
                      'created_at', t.created_at,
                      'updated_at', t.updated_at
                    )
                  )
                  FROM item_tags it2
                  JOIN tags t ON it2.tag_id = t.id
                  WHERE it2.item_id = i.id
                ),
                '[]'::json
              )
            ) ORDER BY i.position
          ) FILTER (WHERE i.id IS NOT NULL AND i.archived = FALSE),
          '[]'::json
        ) as items
      FROM columns c
      LEFT JOIN items i ON c.id = i.column_id AND i.archived = FALSE
      WHERE c.board_id = $1
      GROUP BY c.id, c.board_id, c.name, c.position, c.created_at, c.updated_at
      ORDER BY c.position
    `, [id]);

    return {
      ...boardResult.rows[0],
      columns: columnsResult.rows
    };
  }

  static async create(boardData: CreateBoardRequest, userId: number): Promise<Board> {
    const result = await pool.query(`
      INSERT INTO boards (name, description, background, column_theme, archived, user_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, name, description, background, column_theme, archived, user_id, created_at, updated_at
    `, [boardData.name, boardData.description || null, boardData.background || 'bg-gray-50', boardData.column_theme || 'dark', boardData.archived || false, userId]);
    return result.rows[0];
  }

  static async update(id: number, boardData: Partial<UpdateBoardRequest>): Promise<Board | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (boardData.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(boardData.name);
      paramCount++;
    }

    if (boardData.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(boardData.description);
      paramCount++;
    }

    if ('background' in boardData) {
      fields.push(`background = $${paramCount}`);
      values.push(boardData.background);
      paramCount++;
    }

    if ('column_theme' in boardData) {
      fields.push(`column_theme = $${paramCount}`);
      values.push(boardData.column_theme);
      paramCount++;
    }

    if ('archived' in boardData) {
      fields.push(`archived = $${paramCount}`);
      values.push(boardData.archived);
      paramCount++;
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE boards
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, description, background, column_theme, archived, user_id, created_at, updated_at
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM boards WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}