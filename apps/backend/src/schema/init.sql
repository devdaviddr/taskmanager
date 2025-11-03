-- Create tasks table (legacy - keep for backward compatibility)
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on completed status for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  background VARCHAR(255) DEFAULT 'bg-gray-50',
  column_theme VARCHAR(255) DEFAULT 'dark',
  user_id INTEGER NOT NULL DEFAULT 1, -- Default user for now
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(board_id, name) -- Prevent duplicate column names per board
);

-- Create items table (enhanced tasks for boards)
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_created_at ON boards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(board_id, position);
CREATE INDEX IF NOT EXISTS idx_items_column_id ON items(column_id);
CREATE INDEX IF NOT EXISTS idx_items_position ON items(column_id, position);

-- Add archived column to items table if it doesn't exist (for migrations)
ALTER TABLE items ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Add background column to boards table if it doesn't exist (for migrations)
ALTER TABLE boards ADD COLUMN IF NOT EXISTS background VARCHAR(255) DEFAULT 'bg-gray-50';

-- Add column_theme column to boards table if it doesn't exist (for migrations)
ALTER TABLE boards ADD COLUMN IF NOT EXISTS column_theme VARCHAR(255) DEFAULT 'dark';

-- Set default background for existing boards
UPDATE boards SET background = 'bg-gray-50' WHERE background IS NULL;