import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(`
      SELECT id, email, password_hash, name, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(`
      SELECT id, email, password_hash, name, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create(userData: CreateUserRequest): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name, role, created_at, updated_at)
      VALUES ($1, $2, $3, 'user', NOW(), NOW())
      RETURNING id, email, password_hash, name, role, created_at, updated_at
    `, [userData.email, hashedPassword, userData.name || null]);
    return result.rows[0];
  }

  static async findAll(): Promise<User[]> {
    const result = await pool.query(`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      ORDER BY name, email
    `);
    return result.rows;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password_hash);
  }

  static async update(id: number, userData: UpdateUserRequest): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (userData.name !== undefined) {
      fields.push(`name = $${paramIndex}`);
      values.push(userData.name);
      paramIndex++;
    }

    if (userData.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(userData.email);
      paramIndex++;
    }

    if (userData.role !== undefined) {
      fields.push(`role = $${paramIndex}`);
      values.push(userData.role);
      paramIndex++;
    }

    if (fields.length === 0) {
      return null; // No fields to update
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, role, created_at, updated_at
    `, values);

    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    // Check if user owns any boards
    const boardCheck = await pool.query('SELECT id FROM boards WHERE user_id = $1 LIMIT 1', [id]);
    if (boardCheck.rows.length > 0) {
      throw new Error('Cannot delete user who owns boards');
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}