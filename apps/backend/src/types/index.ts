export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
}

// New types for boards feature
export interface Board {
  id: number;
  name: string;
  description?: string;
  background?: string;
  column_theme?: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  background?: string;
  column_theme?: string;
}

export interface Column {
  id: number;
  board_id: number;
  name: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface Item {
  id: number;
  column_id: number;
  title: string;
  description?: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

// Request/Response types
export interface CreateColumnRequest {
  name: string;
  position?: number;
}

export interface CreateItemRequest {
  title: string;
  description?: string;
  position?: number;
}

export interface MoveItemRequest {
  column_id: number;
  position: number;
}

export interface BoardWithColumns extends Board {
  columns: (Column & { items: Item[] })[];
}