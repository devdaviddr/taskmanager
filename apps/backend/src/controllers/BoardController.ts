import type { Context } from 'hono';
import { BoardService } from '../services/BoardService';
import type { CreateBoardRequest } from '../types';

export class BoardController {
  static async getAll(c: Context) {
    try {
      const userId = 1; // TODO: Get from authentication
      const boards = await BoardService.getAllBoards(userId);
      return c.json(boards);
    } catch (error) {
      console.error('Controller error - getAll boards:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async getById(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid board ID' }, 400);
      }

      const board = await BoardService.getBoardById(id);
      return c.json(board);
    } catch (error) {
      console.error('Controller error - getById board:', error);
      if (error instanceof Error && error.message === 'Board not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async getWithColumns(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid board ID' }, 400);
      }

      const board = await BoardService.getBoardWithColumns(id);
      return c.json(board);
    } catch (error) {
      console.error('Controller error - getWithColumns board:', error);
      if (error instanceof Error && error.message === 'Board not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async create(c: Context) {
    try {
      const body: CreateBoardRequest = await c.req.json();

      const board = await BoardService.createBoard(body);
      return c.json(board, 201);
    } catch (error) {
      console.error('Controller error - create board:', error);
      if (error instanceof Error && error.message.includes('Validation error')) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async update(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid board ID' }, 400);
      }

      const body: Partial<CreateBoardRequest> = await c.req.json();
      const board = await BoardService.updateBoard(id, body);

      return c.json(board);
    } catch (error) {
      console.error('Controller error - update board:', error);
      if (error instanceof Error && (error.message === 'Board not found or no changes made' || error.message.includes('Validation error'))) {
        return c.json({ error: error.message }, error.message === 'Board not found or no changes made' ? 404 : 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  static async delete(c: Context) {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid board ID' }, 400);
      }

      await BoardService.deleteBoard(id);
      return c.json({ message: 'Board deleted successfully' });
    } catch (error) {
      console.error('Controller error - delete board:', error);
      if (error instanceof Error && error.message === 'Board not found') {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}