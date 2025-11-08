import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { pool } from '../config/database';
import type { User, CreateUserRequest, LoginRequest, AuthResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1h';

export class AuthService {
  static generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const existingUser = await UserModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await UserModel.create(userData);
    const token = this.generateToken(user);

    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    const user = await UserModel.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await UserModel.verifyPassword(user, loginData.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    const payload = this.verifyToken(token);
    if (!payload) return null;

    return UserModel.findById(payload.id);
  }

  static async blacklistToken(token: string): Promise<void> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) return; // Don't blacklist invalid tokens

      // Hash the token for storage (using SHA-256)
      const crypto = await import('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Calculate expiration time from token payload
      const expiresAt = new Date(payload.exp * 1000);

      await pool.query(
        'INSERT INTO invalidated_tokens (token_hash, expires_at) VALUES ($1, $2) ON CONFLICT (token_hash) DO NOTHING',
        [tokenHash, expiresAt]
      );
    } catch (error) {
      console.error('Error blacklisting token:', error);
    }
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const crypto = await import('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const result = await pool.query(
        'SELECT 1 FROM invalidated_tokens WHERE token_hash = $1 AND expires_at > NOW()',
        [tokenHash]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }

  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await pool.query('DELETE FROM invalidated_tokens WHERE expires_at <= NOW()');
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }
}