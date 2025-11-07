import { Hono } from 'hono';
import { TagController } from '../controllers/TagController';

const router = new Hono();

// GET /tags - Get all tags
router.get('/tags', TagController.getAll);

// GET /tags/:id - Get tag by ID
router.get('/tags/:id', TagController.get);

// POST /tags - Create new tag
router.post('/tags', TagController.create);

// PUT /tags/:id - Update tag
router.put('/tags/:id', TagController.update);

// DELETE /tags/:id - Delete tag
router.delete('/tags/:id', TagController.delete);

export default router;