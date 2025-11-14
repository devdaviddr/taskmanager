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

// Global refresh function reference
let refreshTokenFunction: (() => Promise<void>) | null = null;

export const setRefreshTokenFunction = (fn: () => Promise<void>) => {
  refreshTokenFunction = fn;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true, // Enable sending cookies with requests
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
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't redirect on auth endpoints (me, login, register, refresh) as these are expected to fail when not authenticated
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }
      
      // If we have a refresh function, try to refresh the token
      if (refreshTokenFunction) {
        originalRequest._retry = true;
        try {
          await refreshTokenFunction();
          // Retry the original request
          return api.request(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed, redirecting to login:', refreshError);
          // If refresh fails, redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh function available, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Legacy task API
export const getHealth = () => api.get('/health')

// Health API
export const healthAPI = {
  get: () => api.get('/health'),
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id: number, data: { name?: string; email?: string }) => api.put(`/users/${id}`, data),
}

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  updateUserDetails: (id: number, data: { role?: 'user' | 'admin' | 'superadmin'; name?: string; email?: string }) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
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