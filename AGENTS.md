# AGENTS.md

## Commands
- **Build**: `npm run build` (root) or `npm run build --workspace=apps/frontend` / `npm run build --workspace=apps/backend`
- **Dev**: `npm run dev` (root) or `npm run dev --workspace=apps/frontend` / `npm run dev --workspace=apps/backend`
- **Lint**: `npm run lint --workspace=apps/frontend` (ESLint + TypeScript strict rules, React hooks, no unused vars)
- **Test**: No test framework configured - add tests using Jest/Vitest for backend, Vitest/RTL for frontend
- **Migrate**: `npm run migrate --workspace=apps/backend` (database migrations)

## Code Style Guidelines

### TypeScript
- Strict mode enabled, no unused variables/parameters, verbatim module syntax
- PascalCase for classes/components/interfaces, camelCase for functions/variables
- Use interfaces for API types, avoid `any`, prefer string enums, `import type` for type-only imports
- Optional chaining (`?.`), nullish coalescing (`??`), strict null checks

### Backend (Node.js + Hono + PostgreSQL)
- ES modules with `"type": "module"`, Controller → Service → Model architecture
- Class-based controllers with static methods, parameterized queries, connection pooling
- Try-catch error handling with `console.error` logging, throw specific Error messages
- Input validation in services, instanceof checks for error types
- Production-ready with security headers, rate limiting, CORS, enhanced logging, graceful shutdown

### Frontend (React + Vite + Tailwind)
- Function components with default exports, forwardRef for custom components
- React Query for server state, useState/useReducer for local state, Axios with centralized config
- React Router for routing, lazy loading for performance, ESLint with React hooks/refresh plugins
- Template literals for className concatenation, displayName for forwardRef components
- Atomic structure: `ui/` (atoms), `composites/` (molecules/organisms), `sections/` (page sections)

### Security & Best Practices
- Input validation on client and server, parameterized queries to prevent SQL injection
- Never commit secrets, use .env files, HTTPS in production, proper CORS config
- Security headers (HSTS, CSP, X-Frame-Options), rate limiting, request timeouts
- Environment-aware configuration, structured logging, graceful shutdown handling