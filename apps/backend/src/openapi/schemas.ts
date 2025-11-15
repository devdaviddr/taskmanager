import { z } from 'zod';

// User schema (without password)
export const UserSchema = z.object({
  id: z.number().int().describe('User ID'),
  email: z.string().email().describe('User email address'),
  name: z.string().nullable().describe('User full name'),
  role: z.enum(['user', 'admin', 'superadmin']).describe('User role'),
  created_at: z.coerce.date().describe('User creation timestamp'),
  updated_at: z.coerce.date().describe('User last update timestamp'),
});

// Tag schema
export const TagSchema = z.object({
  id: z.number().int().describe('Tag ID'),
  name: z.string().describe('Tag name'),
  color: z.string().describe('Tag color (hex code)'),
  created_at: z.coerce.date().describe('Tag creation timestamp'),
  updated_at: z.coerce.date().describe('Tag last update timestamp'),
});

// Item schema
export const ItemSchema = z.object({
  id: z.number().int().describe('Item ID'),
  column_id: z.number().int().describe('Column ID this item belongs to'),
  title: z.string().describe('Item title'),
  description: z.string().nullable().optional().describe('Item description'),
  position: z.number().int().describe('Position in column'),
  start_date: z.string().nullable().optional().describe('Item start date'),
  end_date: z.string().nullable().optional().describe('Item end date'),
  effort: z.number().int().nullable().optional().describe('Effort estimate (1-10)'),
  label: z.string().nullable().optional().describe('Item label'),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional().describe('Item priority'),
  tags: z.array(TagSchema).optional().describe('Associated tags'),
  assigned_users: z.array(UserSchema).optional().describe('Assigned users'),
  archived: z.boolean().describe('Whether item is archived'),
  created_at: z.coerce.date().describe('Item creation timestamp'),
  updated_at: z.coerce.date().describe('Item last update timestamp'),
});

// Column schema
export const ColumnSchema = z.object({
  id: z.number().int().describe('Column ID'),
  board_id: z.number().int().describe('Board ID this column belongs to'),
  name: z.string().describe('Column name'),
  position: z.number().int().describe('Position in board'),
  items: z.array(ItemSchema).optional().describe('Items in this column'),
  created_at: z.coerce.date().describe('Column creation timestamp'),
  updated_at: z.coerce.date().describe('Column last update timestamp'),
});

// Board schema
export const BoardSchema = z.object({
  id: z.number().int().describe('Board ID'),
  name: z.string().describe('Board name'),
  description: z.string().nullable().optional().describe('Board description'),
  background: z.string().nullable().optional().describe('Board background color'),
  column_theme: z.string().nullable().optional().describe('Column theme'),
  archived: z.boolean().describe('Whether board is archived'),
  user_id: z.number().int().describe('User ID who owns the board'),
  created_at: z.coerce.date().describe('Board creation timestamp'),
  updated_at: z.coerce.date().describe('Board last update timestamp'),
  columns: z.array(ColumnSchema).optional().describe('Columns in this board'),
});

// Create/Update request schemas
export const CreateBoardRequestSchema = z.object({
  name: z.string().min(1).describe('Board name'),
  description: z.string().optional().describe('Board description'),
  background: z.string().optional().describe('Board background color'),
  column_theme: z.string().optional().describe('Column theme'),
});

export const UpdateBoardRequestSchema = z.object({
  name: z.string().optional().describe('Board name'),
  description: z.string().optional().describe('Board description'),
  background: z.string().optional().describe('Board background color'),
  column_theme: z.string().optional().describe('Column theme'),
  archived: z.boolean().optional().describe('Archive status'),
});

export const CreateColumnRequestSchema = z.object({
  name: z.string().min(1).describe('Column name'),
  position: z.number().int().optional().describe('Column position'),
});

export const UpdateColumnRequestSchema = z.object({
  name: z.string().optional().describe('Column name'),
  position: z.number().int().optional().describe('Column position'),
});

export const CreateItemRequestSchema = z.object({
  title: z.string().min(1).describe('Item title'),
  description: z.string().optional().describe('Item description'),
  position: z.number().int().optional().describe('Position in column'),
  start_date: z.string().optional().describe('Start date'),
  end_date: z.string().optional().describe('End date'),
  effort: z.number().int().min(1).max(10).optional().describe('Effort estimate (1-10)'),
  label: z.string().optional().describe('Item label'),
  priority: z.enum(['high', 'medium', 'low']).optional().describe('Item priority'),
  tag_ids: z.array(z.number().int()).optional().describe('Tag IDs'),
  user_ids: z.array(z.number().int()).optional().describe('User IDs to assign'),
});

export const UpdateItemRequestSchema = z.object({
  title: z.string().optional().describe('Item title'),
  description: z.string().optional().describe('Item description'),
  position: z.number().int().optional().describe('Position in column'),
  start_date: z.string().optional().describe('Start date'),
  end_date: z.string().optional().describe('End date'),
  effort: z.number().int().min(1).max(10).optional().describe('Effort estimate (1-10)'),
  label: z.string().nullable().optional().describe('Item label'),
  priority: z.enum(['high', 'medium', 'low']).nullable().optional().describe('Item priority'),
  tag_ids: z.array(z.number().int()).optional().describe('Tag IDs'),
  user_ids: z.array(z.number().int()).optional().describe('User IDs to assign'),
});

export const MoveItemRequestSchema = z.object({
  column_id: z.number().int().describe('Target column ID'),
  position: z.number().int().describe('New position'),
});

export const ArchiveItemRequestSchema = z.object({
  archived: z.boolean().describe('Archive status'),
});

export const CreateTagRequestSchema = z.object({
  name: z.string().min(1).describe('Tag name'),
  color: z.string().describe('Tag color (hex code)'),
});

export const UpdateTagRequestSchema = z.object({
  name: z.string().optional().describe('Tag name'),
  color: z.string().optional().describe('Tag color (hex code)'),
});

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email().describe('User email'),
  password: z.string().min(1).describe('User password'),
});

// Login response schema
export const LoginResponseSchema = z.object({
  user: UserSchema.describe('Authenticated user object'),
  token: z.string().describe('JWT access token for Bearer authentication'),
  refreshToken: z.string().describe('Refresh token for obtaining new access tokens'),
});

// Update user request schema
export const UpdateUserRequestSchema = z.object({
  name: z.string().optional().describe('User full name'),
  email: z.string().email().optional().describe('User email address'),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string().describe('Error message'),
  details: z.any().optional().describe('Additional error details'),
});

// Unauthorized response schema
export const UnauthorizedResponseSchema = z.object({
  error: z.string().describe('Unauthorized error message'),
});
