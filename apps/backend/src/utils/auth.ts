import { BoardService } from '../services/BoardService';
import { ColumnService } from '../services/ColumnService';
import { ItemService } from '../services/ItemService';
import type { Board, Column, Item } from '../types';

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