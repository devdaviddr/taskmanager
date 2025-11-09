import { BoardModel } from '../models/Board';
import type { Board, CreateBoardRequest, UpdateBoardRequest, BoardWithColumns } from '../types';

export class BoardService {
  static async getAllBoards(userId: number = 1): Promise<Board[]> {
    try {
      return await BoardModel.findAll(userId);
    } catch (error) {
      console.error('Service error - getAllBoards:', error);
      throw new Error('Failed to retrieve boards');
    }
  }

  static async getBoardById(id: number): Promise<Board> {
    try {
      const board = await BoardModel.findById(id);
      if (!board) {
        throw new Error('Board not found');
      }
      return board;
    } catch (error) {
      console.error('Service error - getBoardById:', error);
      if (error instanceof Error && error.message === 'Board not found') {
        throw error;
      }
      throw new Error('Failed to retrieve board');
    }
  }

  static async getBoardWithColumns(id: number): Promise<BoardWithColumns> {
    try {
      const board = await BoardModel.findByIdWithColumns(id);
      if (!board) {
        throw new Error('Board not found');
      }
      return board;
    } catch (error) {
      console.error('Service error - getBoardWithColumns:', error);
      if (error instanceof Error && error.message === 'Board not found') {
        throw error;
      }
      throw new Error('Failed to retrieve board with columns');
    }
  }

  static async createBoard(boardData: CreateBoardRequest, userId: number): Promise<Board> {
    try {
      // Business logic validation
      this.validateCreateBoardData(boardData);

      return await BoardModel.create(boardData, userId);
    } catch (error) {
      console.error('Service error - createBoard:', error);
      if (error instanceof Error && error.message.includes('validation')) {
        throw error;
      }
      throw new Error('Failed to create board');
    }
  }

  static async updateBoard(id: number, boardData: Partial<UpdateBoardRequest>): Promise<Board> {
    try {
      // Business logic validation
      this.validateUpdateBoardData(boardData);

      const board = await BoardModel.update(id, boardData);
      if (!board) {
        throw new Error('Board not found or no changes made');
      }
      return board;
    } catch (error) {
      console.error('Service error - updateBoard:', error);
      if (error instanceof Error && (error.message === 'Board not found or no changes made' || error.message.includes('validation'))) {
        throw error;
      }
      throw new Error('Failed to update board');
    }
  }

  static async deleteBoard(id: number): Promise<void> {
    try {
      const deleted = await BoardModel.delete(id);
      if (!deleted) {
        throw new Error('Board not found');
      }
    } catch (error) {
      console.error('Service error - deleteBoard:', error);
      if (error instanceof Error && error.message === 'Board not found') {
        throw error;
      }
      throw new Error('Failed to delete board');
    }
  }

  private static validateCreateBoardData(data: CreateBoardRequest): void {
    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Validation error: Name is required and must be a string');
    }

    if (data.name.trim().length === 0) {
      throw new Error('Validation error: Name cannot be empty');
    }

    if (data.name.length > 255) {
      throw new Error('Validation error: Name cannot exceed 255 characters');
    }

    if (data.description && typeof data.description !== 'string') {
      throw new Error('Validation error: Description must be a string');
    }
  }

  private static validateUpdateBoardData(data: Partial<UpdateBoardRequest>): void {
    if (data.name !== undefined) {
      if (typeof data.name !== 'string') {
        throw new Error('Validation error: Name must be a string');
      }

      if (data.name.trim().length === 0) {
        throw new Error('Validation error: Name cannot be empty');
      }

      if (data.name.length > 255) {
        throw new Error('Validation error: Name cannot exceed 255 characters');
      }
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      throw new Error('Validation error: Description must be a string');
    }
  }
}