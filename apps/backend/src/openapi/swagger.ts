import { swaggerUI } from '@hono/swagger-ui';

/**
 * Swagger UI configuration
 * - Serves API documentation at /docs
 * - Includes built-in Bearer token authentication
 * - Points to OpenAPI spec at /openapi.json
 */
export const swaggerUIMiddleware = swaggerUI({
  url: '/openapi.json',
  defaultModelsExpandDepth: 1,
  defaultModelExpandDepth: 1,
  docExpansion: 'list',
  filter: true,
});
