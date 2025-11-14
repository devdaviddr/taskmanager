import { BoardService } from '../services/BoardService';
import { ColumnService } from '../services/ColumnService';
import { ItemService } from '../services/ItemService';
import type { Board, Column, Item } from '../types';
import { pool } from '../config/database';

export async function checkBoardOwnership(boardId: number, userId: number): Promise<Board> {
  const board = await BoardService.getBoardById(boardId);
  if (!board) {
    throw new Error('Board not found');
  }
  if (board.user_id !== userId) {
    throw new Error('Access denied');
  }
  return board;
}

export async function checkBoardOwnershipViaColumn(columnId: number, userId: number): Promise<{column: Column, board: Board}> {
  const column = await ColumnService.getColumnById(columnId);
  if (!column) {
    throw new Error('Column not found');
  }
  const board = await checkBoardOwnership(column.board_id, userId);
  return { column, board };
}

export async function checkBoardOwnershipViaItem(itemId: number, userId: number): Promise<{item: Item, column: Column, board: Board}> {
  const item = await ItemService.getItemById(itemId);
  if (!item) {
    throw new Error('Item not found');
  }
  const { column, board } = await checkBoardOwnershipViaColumn(item.column_id, userId);
  return { item, column, board };
}

// Check if user has access to board (owner or assigned to tasks on the board)
export async function checkBoardAccess(boardId: number, userId: number): Promise<Board> {
  const board = await BoardService.getBoardById(boardId);
  if (!board) {
    throw new Error('Board not found');
  }
  
  // Check if user is the owner
  if (board.user_id === userId) {
    return board;
  }
  
  // Check if user is assigned to any tasks on this board
  const hasAssignedTasks = await checkUserHasTasksOnBoard(boardId, userId);
  if (!hasAssignedTasks) {
    throw new Error('Access denied');
  }
  
  return board;
}

// Check if user has access via column (owner or assigned to tasks on the board)
export async function checkBoardAccessViaColumn(columnId: number, userId: number): Promise<{column: Column, board: Board}> {
  const column = await ColumnService.getColumnById(columnId);
  if (!column) {
    throw new Error('Column not found');
  }
  const board = await checkBoardAccess(column.board_id, userId);
  return { column, board };
}

// Check if user has access via item (owner or assigned to tasks on the board)
export async function checkBoardAccessViaItem(itemId: number, userId: number): Promise<{item: Item, column: Column, board: Board}> {
  const item = await ItemService.getItemById(itemId);
  if (!item) {
    throw new Error('Item not found');
  }
  const { column, board } = await checkBoardAccessViaColumn(item.column_id, userId);
  return { item, column, board };
}

// Helper to check if user has tasks assigned on a board
async function checkUserHasTasksOnBoard(boardId: number, userId: number): Promise<boolean> {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM item_users iu
      JOIN items i ON iu.item_id = i.id
      JOIN columns c ON i.column_id = c.id
      WHERE c.board_id = $1 AND iu.user_id = $2
    )
  `, [boardId, userId]);
  
  return result.rows[0].exists;
}