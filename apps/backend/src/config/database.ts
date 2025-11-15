import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,  // Reduced from 20 to optimize resource usage
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const testConnection = async (): Promise<void> => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Successfully connected to PostgreSQL');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', (error as Error).message);
    throw error;
  }
};

export const closeConnection = async (): Promise<void> => {
  await pool.end();
};