/**
 * OpenAPI 3.0 Specification for Task Manager API
 * Provides comprehensive documentation for all API endpoints
 */

export const generateOpenAPISpec = (baseUrl: string) => ({
  openapi: '3.0.0',
  info: {
    title: 'Task Manager API',
    version: '1.0.0',
    description: 'Task Manager API with Bearer token authentication and comprehensive project management features',
    contact: {
      name: 'Task Manager Support',
    },
  },
  servers: [
    {
      url: baseUrl,
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Bearer token obtained from /auth/login endpoint',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'email', 'role', 'created_at', 'updated_at'],
        properties: {
          id: { type: 'integer', description: 'User ID' },
          email: { type: 'string', format: 'email', description: 'User email address' },
          name: { type: 'string', nullable: true, description: 'User full name' },
          role: { type: 'string', enum: ['user', 'admin', 'superadmin'], description: 'User role' },
          created_at: { type: 'string', format: 'date-time', description: 'User creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'User last update timestamp' },
        },
      },
      Tag: {
        type: 'object',
        required: ['id', 'name', 'color', 'created_at', 'updated_at'],
        properties: {
          id: { type: 'integer', description: 'Tag ID' },
          name: { type: 'string', description: 'Tag name' },
          color: { type: 'string', description: 'Tag color (hex code)' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Item: {
        type: 'object',
        required: ['id', 'column_id', 'title', 'position', 'archived', 'created_at', 'updated_at'],
        properties: {
          id: { type: 'integer' },
          column_id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          position: { type: 'integer' },
          start_date: { type: 'string', nullable: true },
          end_date: { type: 'string', nullable: true },
          effort: { type: 'integer', minimum: 1, maximum: 10, nullable: true },
          label: { type: 'string', nullable: true },
          priority: { type: 'string', enum: ['high', 'medium', 'low'], nullable: true },
          tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } },
          assigned_users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
          archived: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Column: {
        type: 'object',
        required: ['id', 'board_id', 'name', 'position', 'created_at', 'updated_at'],
        properties: {
          id: { type: 'integer' },
          board_id: { type: 'integer' },
          name: { type: 'string' },
          position: { type: 'integer' },
          items: { type: 'array', items: { $ref: '#/components/schemas/Item' } },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Board: {
        type: 'object',
        required: ['id', 'name', 'archived', 'user_id', 'created_at', 'updated_at'],
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          background: { type: 'string', nullable: true },
          column_theme: { type: 'string', nullable: true },
          archived: { type: 'boolean' },
          user_id: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          columns: { type: 'array', items: { $ref: '#/components/schemas/Column' } },
        },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string' },
          details: { type: 'object' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login',
        description: 'Authenticate with email and password to get JWT token',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', description: 'User email' },
                  password: { type: 'string', description: 'User password' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string', description: 'JWT access token' },
                    refreshToken: { type: 'string', description: 'JWT refresh token' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register',
        description: 'Create a new user account with strong password requirements',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', description: '12+ chars, uppercase, lowercase, number, special' },
                  name: { type: 'string', description: 'User full name (optional)' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Registration successful' },
          '400': { description: 'Validation error or email already exists' },
        },
      },
    },
    '/api/users': {
      get: {
        summary: 'Get users',
        description: 'Get current user or all users if admin',
        tags: ['Users'],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/users/{id}': {
      put: {
        summary: 'Update user',
        description: 'Update current user profile',
        tags: ['Users'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/boards': {
      get: {
        summary: 'List boards',
        description: 'Get all boards for the authenticated user',
        tags: ['Boards'],
        responses: {
          '200': {
            description: 'List of boards',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Board' } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create board',
        description: 'Create a new board',
        tags: ['Boards'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  background: { type: 'string' },
                  column_theme: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Board created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Board' },
              },
            },
          },
          '400': { description: 'Bad request' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/boards/{id}': {
      get: {
        summary: 'Get board',
        description: 'Get a specific board by ID',
        tags: ['Boards'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Board details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Board' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        summary: 'Update board',
        description: 'Update an existing board',
        tags: ['Boards'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  background: { type: 'string' },
                  column_theme: { type: 'string' },
                  archived: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Board updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Board' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Delete board',
        description: 'Delete a board and all its contents',
        tags: ['Boards'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Board deleted' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/boards/{id}/full': {
      get: {
        summary: 'Get board with columns and items',
        description: 'Get a board with all its columns and items populated',
        tags: ['Boards'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Complete board',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Board' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/boards/{boardId}/columns': {
      get: {
        summary: 'List columns',
        description: 'Get all columns for a specific board',
        tags: ['Columns'],
        parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'List of columns',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Column' } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create column',
        description: 'Create a new column in a board',
        tags: ['Columns'],
        parameters: [{ name: 'boardId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  position: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Column created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Column' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/columns/{id}': {
      put: {
        summary: 'Update column',
        description: 'Update a column',
        tags: ['Columns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  position: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Column updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Column' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Delete column',
        description: 'Delete a column and all its items',
        tags: ['Columns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Column deleted' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/columns/{id}/move': {
      put: {
        summary: 'Move column',
        description: 'Move a column to a new position',
        tags: ['Columns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['position'],
                properties: {
                  position: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Column moved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Column' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/items/{id}': {
      get: {
        summary: 'Get item',
        description: 'Get a specific item by ID',
        tags: ['Items'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Item details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Item' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        summary: 'Update item',
        description: 'Update an item',
        tags: ['Items'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  start_date: { type: 'string' },
                  end_date: { type: 'string' },
                  effort: { type: 'integer' },
                  label: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                  tag_ids: { type: 'array', items: { type: 'integer' } },
                  user_ids: { type: 'array', items: { type: 'integer' } },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Item updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Item' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Delete item',
        description: 'Delete an item',
        tags: ['Items'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Item deleted' },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/columns/{columnId}/items': {
      get: {
        summary: 'List items',
        description: 'Get all items in a column',
        tags: ['Items'],
        parameters: [{ name: 'columnId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'List of items',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Item' } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create item',
        description: 'Create a new item in a column',
        tags: ['Items'],
        parameters: [{ name: 'columnId', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  position: { type: 'integer' },
                  start_date: { type: 'string' },
                  end_date: { type: 'string' },
                  effort: { type: 'integer' },
                  label: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                  tag_ids: { type: 'array', items: { type: 'integer' } },
                  user_ids: { type: 'array', items: { type: 'integer' } },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Item created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Item' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/items/{id}/move': {
      put: {
        summary: 'Move item',
        description: 'Move an item to a different column',
        tags: ['Items'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['column_id', 'position'],
                properties: {
                  column_id: { type: 'integer' },
                  position: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Item moved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Item' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/items/{id}/archive': {
      put: {
        summary: 'Archive item',
        description: 'Archive or unarchive an item',
        tags: ['Items'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['archived'],
                properties: {
                  archived: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Item archived status updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Item' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/items/{id}/users': {
      post: {
        summary: 'Assign user to item',
        description: 'Assign a user to an item',
        tags: ['Items'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['user_id'],
                properties: {
                  user_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'User assigned' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/items/{id}/users/{userId}': {
      delete: {
        summary: 'Remove user from item',
        description: 'Remove a user from an item',
        tags: ['Items'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'User removed' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/tags': {
      get: {
        summary: 'List tags',
        description: 'Get all tags',
        tags: ['Tags'],
        responses: {
          '200': {
            description: 'List of tags',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Tag' } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create tag',
        description: 'Create a new tag (admin only)',
        tags: ['Tags'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'color'],
                properties: {
                  name: { type: 'string' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tag created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tag' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - admin only' },
        },
      },
    },
    '/api/tags/{id}': {
      get: {
        summary: 'Get tag',
        description: 'Get a specific tag by ID',
        tags: ['Tags'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': {
            description: 'Tag details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tag' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        summary: 'Update tag',
        description: 'Update a tag (admin only)',
        tags: ['Tags'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tag updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Tag' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - admin only' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Delete tag',
        description: 'Delete a tag (admin only)',
        tags: ['Tags'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'Tag deleted' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - admin only' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/admin/users': {
      get: {
        summary: 'List all users',
        description: 'Get all users in the system (admin only)',
        tags: ['Admin'],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - admin only' },
        },
      },
    },
    '/api/admin/users/{id}': {
      put: {
        summary: 'Update user (admin)',
        description: 'Update any user details (admin only)',
        tags: ['Admin'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['user', 'admin', 'superadmin'] },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - admin only' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Delete user (admin)',
        description: 'Delete any user from the system (admin only)',
        tags: ['Admin'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'User deleted' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - admin only' },
          '404': { description: 'Not found' },
        },
      },
    },
  },
});
