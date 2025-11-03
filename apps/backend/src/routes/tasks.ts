import { Hono } from 'hono';
import { TaskController } from '../controllers/TaskController';

const taskRoutes = new Hono();

taskRoutes.get('/tasks', TaskController.getAll);
taskRoutes.get('/tasks/:id', TaskController.getById);
taskRoutes.post('/tasks', TaskController.create);
taskRoutes.put('/tasks/:id', TaskController.update);
taskRoutes.delete('/tasks/:id', TaskController.delete);

export default taskRoutes;