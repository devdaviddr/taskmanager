-- Create tasks table
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