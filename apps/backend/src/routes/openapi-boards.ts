import { Hono } from 'hono';
import { BoardController } from '../controllers/BoardController';
import { authMiddleware } from '../middleware/auth';

const boardRoutes = new Hono();

/**
 * GET /api/boards
 * Get all boards for the authenticated user
 */
boardRoutes.get('/api/boards', authMiddleware, async (c) => {
  return await BoardController.getAll(c);
});

/**
 * GET /api/boards/:id
 * Get a specific board by ID
 */
boardRoutes.get('/api/boards/:id', authMiddleware, async (c) => {
  return await BoardController.getById(c);
});

/**
 * GET /api/boards/:id/full
 * Get a specific board with all columns and items
 */
boardRoutes.get('/api/boards/:id/full', authMiddleware, async (c) => {
  return await BoardController.getWithColumns(c);
});

/**
 * POST /api/boards
 * Create a new board
 */
boardRoutes.post('/api/boards', authMiddleware, async (c) => {
  return await BoardController.create(c);
});

/**
 * PUT /api/boards/:id
 * Update an existing board
 */
boardRoutes.put('/api/boards/:id', authMiddleware, async (c) => {
  return await BoardController.update(c);
});

/**
 * DELETE /api/boards/:id
 * Delete a board
 */
boardRoutes.delete('/api/boards/:id', authMiddleware, async (c) => {
  return await BoardController.delete(c);
});

export default boardRoutes;
