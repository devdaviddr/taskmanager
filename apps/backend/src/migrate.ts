import { pool } from './config/database';

async function runMigrations() {
  try {
    console.log('Running database migrations...');

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

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);`);

    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations();