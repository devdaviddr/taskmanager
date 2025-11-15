import { OpenAPIHono } from '@hono/zod-openapi';
import {
  UserSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
} from './schemas';

// Create OpenAPI Hono app
export const app = new OpenAPIHono();

export {
  UserSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
};
