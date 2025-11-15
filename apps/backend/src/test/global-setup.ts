import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export default async function globalSetup() {
  const adminPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔧 Global setup: Preparing test database...');

    // Drop existing test database with FORCE (don't terminate connections here as they may be from current runs)
    try {
      await adminPool.query('DROP DATABASE IF EXISTS taskmanager_test WITH (FORCE)');
    } catch (error) {
      // Ignore if database is being used
    }
    
    // Wait to ensure database is fully dropped
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create fresh test database
    await adminPool.query('CREATE DATABASE taskmanager_test');
    
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Test database created');

    // Now run migrations
    const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/taskmanager_test';
    const testPool = new Pool({
      connectionString: testDatabaseUrl,
    });

    try {
      // Drop all tables first (shouldn't exist yet, but just in case)
      await testPool.query(`
        DROP TABLE IF EXISTS item_tags CASCADE;
        DROP TABLE IF EXISTS item_users CASCADE;
        DROP TABLE IF EXISTS board_users CASCADE;
        DROP TABLE IF EXISTS invalidated_tokens CASCADE;
        DROP TABLE IF EXISTS refresh_tokens CASCADE;
        DROP TABLE IF EXISTS items CASCADE;
        DROP TABLE IF EXISTS columns CASCADE;
        DROP TABLE IF EXISTS tags CASCADE;
        DROP TABLE IF EXISTS boards CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `).catch(() => {
        // Tables don't exist yet
      });

      const migrations = [
        `
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
        `CREATE INDEX idx_users_email ON users(email);`,
        `
          CREATE TABLE boards (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            background VARCHAR(255) DEFAULT 'bg-gray-50',
            column_theme VARCHAR(255) DEFAULT 'light',
            archived BOOLEAN NOT NULL DEFAULT FALSE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
        `
          CREATE TABLE columns (
            id SERIAL PRIMARY KEY,
            board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(board_id, name)
          );
        `,
        `
          CREATE TABLE items (
            id SERIAL PRIMARY KEY,
            column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            position INTEGER NOT NULL DEFAULT 0,
            start_date TIMESTAMP WITH TIME ZONE,
            end_date TIMESTAMP WITH TIME ZONE,
            effort INTEGER CHECK (effort >= 0 AND effort <= 10),
            label TEXT,
            priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
            archived BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
        `
          CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            color VARCHAR(7) DEFAULT '#3B82F6',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
        `
          CREATE TABLE item_tags (
            item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
            tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            PRIMARY KEY (item_id, tag_id)
          );
        `,
        `
          CREATE TABLE item_users (
            item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            PRIMARY KEY (item_id, user_id)
          );
        `,
        `
          CREATE TABLE board_users (
            board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role VARCHAR(20) DEFAULT 'member',
            PRIMARY KEY (board_id, user_id)
          );
        `,
        `
          CREATE TABLE invalidated_tokens (
            id SERIAL PRIMARY KEY,
            token_hash VARCHAR(128) NOT NULL UNIQUE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
        `CREATE INDEX idx_invalidated_tokens_hash ON invalidated_tokens(token_hash);`,
        `CREATE INDEX idx_invalidated_tokens_expires_at ON invalidated_tokens(expires_at);`,
        `
          CREATE TABLE refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(128) NOT NULL UNIQUE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
        `CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);`,
        `CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);`,
        `CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);`,
      ];

      for (const migration of migrations) {
        await testPool.query(migration);
      }

      console.log('✅ Migrations completed');
    } finally {
      await testPool.end();
    }
  } finally {
    await adminPool.end();
  }
}
