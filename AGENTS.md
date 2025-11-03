# AGENTS.md

## Commands
- **Build**: `npm run build` (root) or `npm run build --workspace=apps/frontend` / `npm run build --workspace=apps/backend`
- **Dev**: `npm run dev` (root) or `npm run dev --workspace=apps/frontend` / `npm run dev --workspace=apps/backend`
- **Lint**: `npm run lint --workspace=apps/frontend` (ESLint with React rules)
- **Test**: No test framework configured

## Code Style & Best Practices

### Backend (Node.js + Hono + TypeScript + PostgreSQL)
- **Modules**: ES modules with `"type": "module"` and strict TypeScript
- **Architecture**: Controller → Service → Model pattern with separation of concerns
- **Controllers**: Class-based with static methods, Hono Context handling
- **Services**: Business logic, validation, and error transformation
- **Models**: Data access layer with parameterized queries (SQL injection prevention)
- **Database**: PostgreSQL with connection pooling, proper indexing, and transactions where needed
- **Error Handling**: Try-catch blocks with specific error messages, console.error logging
- **Validation**: Input validation in service layer with descriptive error messages
- **Imports**: `import type` for type-only imports, avoid runtime overhead

### Frontend (React + TypeScript + Vite + Tailwind CSS)
- **Components**: Function components with default exports, hooks for state/effects
- **TypeScript**: Strict mode with no unused variables/parameters
- **Styling**: Tailwind CSS with utility-first approach, responsive design
- **State Management**: React Query for server state, local state with useState/useReducer
- **API Integration**: Axios with centralized configuration, proper error handling
- **Routing**: React Router with nested routes and protected routes when needed
- **Performance**: React.memo for expensive components, lazy loading for routes
- **ESLint**: Recommended rules + React hooks + React refresh for hot reloading

### General TypeScript Best Practices
- **Naming**: PascalCase (classes/components/interfaces), camelCase (functions/variables)
- **Types**: Interface definitions for API requests/responses, avoid `any` type
- **Null Safety**: Use optional chaining (`?.`), nullish coalescing (`??`), strict null checks
- **Generics**: Use generics for reusable components and utility functions
- **Type Guards**: Implement type guards for runtime type checking
- **Enums**: Use string enums for better debugging and serialization

### PostgreSQL Best Practices
- **Connection**: Use connection pooling (pg.Pool) for efficient resource management
- **Queries**: Always use parameterized queries to prevent SQL injection
- **Indexing**: Create indexes on frequently queried columns and foreign keys
- **Transactions**: Use transactions for multi-step operations requiring consistency
- **Migrations**: Version-controlled schema changes (consider migration tools)
- **Constraints**: Use database constraints (NOT NULL, UNIQUE, FOREIGN KEY) for data integrity

### React Best Practices
- **Hooks**: Custom hooks for reusable logic, follow rules of hooks strictly
- **Components**: Keep components small and focused, use composition over inheritance
- **Props**: Use destructuring, default props, and PropTypes/interfaces for type safety
- **Effects**: Proper cleanup in useEffect, avoid infinite loops
- **Keys**: Stable, unique keys for list rendering
- **Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation

### Security Best Practices
- **Input Validation**: Validate and sanitize all user inputs on both client and server
- **Authentication**: Implement proper auth (JWT, sessions) for protected routes
- **CORS**: Configure CORS properly for cross-origin requests
- **Environment Variables**: Never commit secrets, use .env files
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Implement rate limiting for API endpoints