import { pool } from '../config/database';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';

export class TaskModel {
  static async findAll(): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, title, description, completed, user_id, created_at, updated_at
      FROM tasks
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  static async findById(id: number): Promise<Task | null> {
    const result = await pool.query(`
      SELECT id, title, description, completed, user_id, created_at, updated_at
      FROM tasks
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async findByUserId(userId: number): Promise<Task[]> {
    const result = await pool.query(`
      SELECT id, title, description, completed, user_id, created_at, updated_at
      FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    return result.rows;
  }

  static async create(taskData: CreateTaskRequest & { user_id: number }): Promise<Task> {
    const result = await pool.query(`
      INSERT INTO tasks (title, description, completed, user_id, created_at, updated_at)
      VALUES ($1, $2, false, $3, NOW(), NOW())
      RETURNING id, title, description, completed, user_id, created_at, updated_at
    `, [taskData.title, taskData.description || null, taskData.user_id]);
    return result.rows[0];
  }

  static async update(id: number, taskData: UpdateTaskRequest): Promise<Task | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (taskData.title !== undefined) {
      fields.push(`title = $${paramCount}`);
      values.push(taskData.title);
      paramCount++;
    }

    if (taskData.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(taskData.description);
      paramCount++;
    }

    if (taskData.completed !== undefined) {
      fields.push(`completed = $${paramCount}`);
      values.push(taskData.completed);
      paramCount++;
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, completed, user_id, created_at, updated_at
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}