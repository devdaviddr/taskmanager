import { pool } from '../config/database';
import type { Tag, CreateTagRequest } from '../types';

export class TagModel {
  static async findAll(): Promise<Tag[]> {
    const result = await pool.query(`
      SELECT id, name, color, created_at, updated_at
      FROM tags
      ORDER BY name
    `);
    return result.rows;
  }

  static async findById(id: number): Promise<Tag | null> {
    const result = await pool.query(`
      SELECT id, name, color, created_at, updated_at
      FROM tags
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async findByName(name: string): Promise<Tag | null> {
    const result = await pool.query(`
      SELECT id, name, color, created_at, updated_at
      FROM tags
      WHERE LOWER(name) = LOWER($1)
    `, [name]);
    return result.rows[0] || null;
  }

  static async create(tagData: CreateTagRequest): Promise<Tag> {
    const result = await pool.query(`
      INSERT INTO tags (name, color, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, name, color, created_at, updated_at
    `, [tagData.name, tagData.color || '#3B82F6']);
    return result.rows[0];
  }

  static async update(id: number, tagData: Partial<CreateTagRequest>): Promise<Tag | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (tagData.name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(tagData.name);
      paramCount++;
    }

    if (tagData.color !== undefined) {
      fields.push(`color = $${paramCount}`);
      values.push(tagData.color);
      paramCount++;
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE tags
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, color, created_at, updated_at
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM tags WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async findByItemId(itemId: number): Promise<Tag[]> {
    const result = await pool.query(`
      SELECT t.id, t.name, t.color, t.created_at, t.updated_at
      FROM tags t
      INNER JOIN item_tags it ON t.id = it.tag_id
      WHERE it.item_id = $1
      ORDER BY t.name
    `, [itemId]);
    return result.rows;
  }

  static async assignToItem(itemId: number, tagId: number): Promise<void> {
    await pool.query(`
      INSERT INTO item_tags (item_id, tag_id)
      VALUES ($1, $2)
      ON CONFLICT (item_id, tag_id) DO NOTHING
    `, [itemId, tagId]);
  }

  static async removeFromItem(itemId: number, tagId: number): Promise<void> {
    await pool.query(`
      DELETE FROM item_tags
      WHERE item_id = $1 AND tag_id = $2
    `, [itemId, tagId]);
  }

  static async setItemTags(itemId: number, tagIds: number[]): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Remove all existing tags for this item
      await client.query('DELETE FROM item_tags WHERE item_id = $1', [itemId]);

      // Add new tags if any
      if (tagIds.length > 0) {
        const values = tagIds.map((tagId, index) => `($1, $${index + 2})`).join(', ');
        const params = [itemId, ...tagIds];
        await client.query(`
          INSERT INTO item_tags (item_id, tag_id)
          VALUES ${values}
        `, params);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}