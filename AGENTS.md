# AGENTS.md

## Commands
- **Build**: `npm run build` (root) or `npm run build --workspace=apps/frontend` / `npm run build --workspace=apps/backend`
- **Dev**: `npm run dev` (root) or `npm run dev --workspace=apps/frontend` / `npm run dev --workspace=apps/backend`
- **Lint**: `npm run lint --workspace=apps/frontend` (ESLint with React rules)
- **Test**: No test framework configured

## Code Style Guidelines

### TypeScript
- Strict mode enabled, no unused variables/parameters
- PascalCase for classes/components/interfaces, camelCase for functions/variables
- Use interfaces for API types, avoid `any`, prefer string enums
- Optional chaining (`?.`), nullish coalescing (`??`), strict null checks

### Backend (Node.js + Hono + PostgreSQL)
- ES modules with `"type": "module"`
- Controller → Service → Model architecture
- Class-based controllers with static methods
- Parameterized queries, connection pooling, transactions
- `import type` for type-only imports

### Frontend (React + Vite + Tailwind)
- Function components with default exports
- React Query for server state, useState/useReducer for local state
- Axios for API calls with centralized config
- React Router for routing, lazy loading for performance
- ESLint with React hooks and refresh plugins

### Security & Best Practices
- Input validation on client and server
- Parameterized queries to prevent SQL injection
- Never commit secrets, use .env files
- HTTPS in production, proper CORS config