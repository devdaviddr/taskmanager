import { pool } from './config/database';

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create index on email
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);

    // Create tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create item_tags junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS item_tags (
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, tag_id)
      );
    `);

    // Create item_users junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS item_users (
        item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, user_id)
      );
    `);

    // Create board_users junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS board_users (
        board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'member',
        PRIMARY KEY (board_id, user_id)
      );
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_item_users_item_id ON item_users(item_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_item_users_user_id ON item_users(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_board_users_board_id ON board_users(board_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_board_users_user_id ON board_users(user_id);`);

    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations();