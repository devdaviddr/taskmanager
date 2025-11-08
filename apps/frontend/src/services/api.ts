import axios from 'axios'

// Types
export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Item {
  id: number;
  column_id: number;
  title: string;
  description?: string;
  position: number;
  start_date?: string;
  end_date?: string;
  effort?: number;
  label?: string;
  priority?: 'high' | 'medium' | 'low' | null;
  tags?: Tag[];
  assigned_users?: User[];
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})

// Request interceptor - no longer needed for auth headers since we use cookies
api.interceptors.request.use(
  (config) => {
    // Cookies are sent automatically by the browser
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Global refresh tracking
declare global {
  var lastRefreshTime: number;
}

const REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes in milliseconds

if (typeof window !== 'undefined') {
  if (!window.lastRefreshTime) {
    window.lastRefreshTime = 0;
  }
}

const shouldRefreshProactively = () => {
  if (typeof window === 'undefined') return false;
  return Date.now() - window.lastRefreshTime > REFRESH_INTERVAL;
};

const refreshTokenIfNeeded = async () => {
  if (shouldRefreshProactively()) {
    try {
      await api.post('/auth/refresh');
      if (typeof window !== 'undefined') {
        window.lastRefreshTime = Date.now();
      }
    } catch (error) {
      // If proactive refresh fails, we'll handle it reactively on 401
      console.warn('Proactive token refresh failed:', error);
    }
  }
};

// Request interceptor to proactively refresh tokens
api.interceptors.request.use(
  async (config) => {
    // Check if we should refresh proactively before making requests
    await refreshTokenIfNeeded();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await api.post('/auth/refresh');
        lastRefreshTime = Date.now();
        
        // Refresh succeeded, process queued requests
        processQueue(null);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, process queue with error and redirect
        processQueue(refreshError as Error, null);
        
        // Clear any auth state and redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Legacy task API
export const getHealth = () => api.get('/health')

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id: number, data: { name?: string; email?: string }) => api.put(`/users/${id}`, data),
}

// Boards API
export const boardsAPI = {
  getAll: () => api.get('/boards'),
  getById: (id: number) => api.get(`/boards/${id}`),
  getWithColumns: (id: number) => api.get(`/boards/${id}/full`),
  create: (data: { name: string; description?: string; background?: string; column_theme?: string }) => api.post('/boards', data),
  update: (id: number, data: { name?: string; description?: string; background?: string; column_theme?: string; archived?: boolean }) => api.put(`/boards/${id}`, data),
  delete: (id: number) => api.delete(`/boards/${id}`),
  assignUser: (boardId: number, userId: number, role?: string) => api.post(`/boards/${boardId}/users`, { user_id: userId, role }),
  removeUser: (boardId: number, userId: number) => api.delete(`/boards/${boardId}/users/${userId}`),
}

// Columns API
export const columnsAPI = {
  getByBoard: (boardId: number) => api.get(`/boards/${boardId}/columns`),
  create: (boardId: number, data: { name: string; position?: number }) => api.post(`/boards/${boardId}/columns`, data),
  update: (id: number, data: { name?: string; position?: number }) => api.put(`/columns/${id}`, data),
  delete: (id: number) => api.delete(`/columns/${id}`),
  move: (id: number, position: number) => api.put(`/columns/${id}/move`, { position }),
}

// Items API
export const itemsAPI = {
  getById: (id: number) => api.get(`/items/${id}`),
  getByColumn: (columnId: number) => api.get(`/columns/${columnId}/items`),
  create: (columnId: number, data: { title: string; description?: string; position?: number; start_date?: string; end_date?: string; effort?: number; label?: string; priority?: 'high' | 'medium' | 'low'; tag_ids?: number[]; user_ids?: number[] }) => api.post(`/columns/${columnId}/items`, data),
  update: (id: number, data: { title?: string; description?: string; position?: number; start_date?: string; end_date?: string; effort?: number; label?: string | null; priority?: 'high' | 'medium' | 'low' | null; tag_ids?: number[]; user_ids?: number[] }) => api.put(`/items/${id}`, data),
  archive: (id: number, archived: boolean = true) => api.put(`/items/${id}/archive`, { archived }),
  delete: (id: number) => api.delete(`/items/${id}`),
  move: (id: number, data: { column_id: number; position: number }) => api.put(`/items/${id}/move`, data),
  assignUser: (itemId: number, userId: number) => api.post(`/items/${itemId}/users`, { user_id: userId }),
  removeUser: (itemId: number, userId: number) => api.delete(`/items/${itemId}/users/${userId}`),
}

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  getById: (id: number) => api.get(`/tags/${id}`),
  create: (data: { name: string; color?: string }) => api.post('/tags', data),
  update: (id: number, data: { name?: string; color?: string }) => api.put(`/tags/${id}`, data),
  delete: (id: number) => api.delete(`/tags/${id}`),
}

export default api