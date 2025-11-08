import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Legacy task API
export const getHealth = () => api.get('/health')

// Boards API
export const boardsAPI = {
  getAll: () => api.get('/boards'),
  getById: (id: number) => api.get(`/boards/${id}`),
  getWithColumns: (id: number) => api.get(`/boards/${id}/full`),
  create: (data: { name: string; description?: string; background?: string; column_theme?: string }) => api.post('/boards', data),
  update: (id: number, data: { name?: string; description?: string; background?: string; column_theme?: string; archived?: boolean }) => api.put(`/boards/${id}`, data),
  delete: (id: number) => api.delete(`/boards/${id}`),
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
  create: (columnId: number, data: { title: string; description?: string; position?: number; start_date?: string; end_date?: string; effort?: number; label?: string; priority?: 'high' | 'medium' | 'low'; tag_ids?: number[] }) => api.post(`/columns/${columnId}/items`, data),
  update: (id: number, data: { title?: string; description?: string; position?: number; start_date?: string; end_date?: string; effort?: number; label?: string | null; priority?: 'high' | 'medium' | 'low' | null; tag_ids?: number[] }) => api.put(`/items/${id}`, data),
  archive: (id: number, archived: boolean = true) => api.put(`/items/${id}/archive`, { archived }),
  delete: (id: number) => api.delete(`/items/${id}`),
  move: (id: number, data: { column_id: number; position: number }) => api.put(`/items/${id}/move`, data),
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