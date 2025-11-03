import { Hono } from 'hono';
import { ItemController } from '../controllers/ItemController';

const itemRoutes = new Hono();

itemRoutes.get('/columns/:columnId/items', ItemController.getByColumn);
itemRoutes.post('/columns/:columnId/items', ItemController.create);
itemRoutes.put('/items/:id', ItemController.update);
itemRoutes.delete('/items/:id', ItemController.delete);
itemRoutes.put('/items/:id/move', ItemController.move);

export default itemRoutes;