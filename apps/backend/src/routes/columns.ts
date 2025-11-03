import { Hono } from 'hono';
import { ColumnController } from '../controllers/ColumnController';

const columnRoutes = new Hono();

columnRoutes.get('/boards/:boardId/columns', ColumnController.getByBoard);
columnRoutes.post('/boards/:boardId/columns', ColumnController.create);
columnRoutes.put('/columns/:id', ColumnController.update);
columnRoutes.delete('/columns/:id', ColumnController.delete);
columnRoutes.put('/columns/:id/move', ColumnController.move);

export default columnRoutes;