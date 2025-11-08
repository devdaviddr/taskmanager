import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import type { User, CreateUserRequest } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(`
      SELECT id, email, password_hash, name, created_at, updated_at
      FROM users
      WHERE email = $1
    `, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(`
      SELECT id, email, password_hash, name, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  static async create(userData: CreateUserRequest): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, name, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, email, password_hash, name, created_at, updated_at
    `, [userData.email, hashedPassword, userData.name || null]);
    return result.rows[0];
  }

  static async findAll(): Promise<User[]> {
    const result = await pool.query(`
      SELECT id, email, name, created_at, updated_at
      FROM users
      ORDER BY name, email
    `);
    return result.rows;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password_hash);
  }
}