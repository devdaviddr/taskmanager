import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { pool } from '../config/database';
import crypto from 'crypto';
import type { User, CreateUserRequest, LoginRequest, AuthResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

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
    const refreshToken = this.generateRefreshToken();
    await this.storeRefreshToken(user.id, refreshToken);

    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
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
    const refreshToken = this.generateRefreshToken();
    await this.storeRefreshToken(user.id, refreshToken);

    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
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
      await pool.query('DELETE FROM refresh_tokens WHERE expires_at <= NOW()');
    } catch (error) {
      console.error('Error during token cleanup:', error);
    }
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static async storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, tokenHash, expiresAt]
      );
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw error;
    }
  }

  static async validateRefreshToken(refreshToken: string): Promise<User | null> {
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      const result = await pool.query(
        'SELECT user_id FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
        [tokenHash]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return UserModel.findById(result.rows[0].user_id);
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return null;
    }
  }

  static async invalidateRefreshTokens(userId: number): Promise<void> {
    try {
      await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    } catch (error) {
      console.error('Error invalidating refresh tokens:', error);
    }
  }
}