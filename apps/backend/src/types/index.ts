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