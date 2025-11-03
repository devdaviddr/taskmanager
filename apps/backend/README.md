# Task Manager Backend

A RESTful API for task management built with Hono.js, TypeScript, and PostgreSQL.

## Project Structure

```
src/
├── config/           # Database configuration
│   └── database.ts
├── controllers/      # Route handlers (HTTP concerns)
│   └── TaskController.ts
├── middleware/       # Custom middleware
│   └── index.ts
├── models/          # Database models and queries
│   └── Task.ts
├── routes/          # Route definitions
│   ├── index.ts
│   └── tasks.ts
├── schema/          # Database schema files
│   └── init.sql
├── services/        # Business logic layer
│   └── TaskService.ts
├── types/           # TypeScript type definitions
│   └── index.ts
└── index.ts         # Application entry point
```

## Architecture

The backend follows a layered architecture:

1. **Routes** - Define API endpoints and route HTTP requests
2. **Controllers** - Handle HTTP requests/responses, input validation
3. **Services** - Contain business logic, orchestrate operations
4. **Models** - Handle database operations and data persistence
5. **Config** - Database and application configuration

## API Endpoints

### Tasks

- `GET /tasks` - Get all tasks
- `GET /tasks/:id` - Get a specific task
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Health Check

- `GET /health` - Check API and database health

## Request/Response Examples

### Create Task
```json
POST /tasks
{
  "title": "Complete project",
  "description": "Finish the task manager project"
}
```

### Update Task
```json
PUT /tasks/1
{
  "completed": true
}
```

## Database Setup

Run the schema file to initialize the database:

```sql
-- Run the contents of src/schema/init.sql
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string