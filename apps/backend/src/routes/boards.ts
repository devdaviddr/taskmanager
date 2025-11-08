import { Hono } from 'hono';
import { BoardController } from '../controllers/BoardController';

const boardRoutes = new Hono();

boardRoutes.get('/boards', BoardController.getAll);
boardRoutes.get('/boards/:id', BoardController.getById);
boardRoutes.get('/boards/:id/full', BoardController.getWithColumns);
boardRoutes.post('/boards', BoardController.create);
boardRoutes.put('/boards/:id', BoardController.update);
boardRoutes.delete('/boards/:id', BoardController.delete);

export default boardRoutes;