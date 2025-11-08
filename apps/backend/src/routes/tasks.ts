import { Hono } from 'hono';
import { TaskController } from '../controllers/TaskController';
import { authMiddleware } from '../middleware/auth';

const taskRoutes = new Hono();

taskRoutes.get('/tasks', authMiddleware, TaskController.getAll);
taskRoutes.get('/tasks/:id', authMiddleware, TaskController.getById);
taskRoutes.post('/tasks', authMiddleware, TaskController.create);
taskRoutes.put('/tasks/:id', authMiddleware, TaskController.update);
taskRoutes.delete('/tasks/:id', authMiddleware, TaskController.delete);

export default taskRoutes;