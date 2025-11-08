import { Hono } from 'hono';
import { TagController } from '../controllers/TagController';
import { authMiddleware } from '../middleware/auth';

const router = new Hono();

// GET /tags - Get all tags
router.get('/tags', authMiddleware, TagController.getAll);

// GET /tags/:id - Get tag by ID
router.get('/tags/:id', authMiddleware, TagController.get);

// POST /tags - Create new tag
router.post('/tags', authMiddleware, TagController.create);

// PUT /tags/:id - Update tag
router.put('/tags/:id', authMiddleware, TagController.update);

// DELETE /tags/:id - Delete tag
router.delete('/tags/:id', authMiddleware, TagController.delete);

export default router;