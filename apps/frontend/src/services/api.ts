import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})

// Legacy task API
export const getHealth = () => api.get('/health')

// Boards API
export const boardsAPI = {
  getAll: () => api.get('/boards'),
  getById: (id: number) => api.get(`/boards/${id}`),
  getWithColumns: (id: number) => api.get(`/boards/${id}/full`),
  create: (data: { name: string; description?: string; background?: string }) => api.post('/boards', data),
  update: (id: number, data: { name?: string; description?: string; background?: string }) => api.put(`/boards/${id}`, data),
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
  getByColumn: (columnId: number) => api.get(`/columns/${columnId}/items`),
  create: (columnId: number, data: { title: string; description?: string; position?: number }) => api.post(`/columns/${columnId}/items`, data),
  update: (id: number, data: { title?: string; description?: string; position?: number }) => api.put(`/items/${id}`, data),
  archive: (id: number, archived: boolean = true) => api.put(`/items/${id}/archive`, { archived }),
  delete: (id: number) => api.delete(`/items/${id}`),
  move: (id: number, data: { column_id: number; position: number }) => api.put(`/items/${id}/move`, data),
}

export default api