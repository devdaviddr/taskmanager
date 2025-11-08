# TaskManager

A modern, full-stack task management application built with React, TypeScript, Node.js, and PostgreSQL. Features a clean, responsive UI with board-based project management, user authentication, and real-time collaboration capabilities.

## 🚀 Features

### Core Functionality
- **JWT Authentication**: Secure login/signup with HttpOnly cookies and automatic token refresh
- **Dashboard**: Overview of all user boards with quick access and statistics
- **Kanban Boards**: Drag-and-drop interface for organizing tasks into columns
- **Board Management**: Create and manage multiple project boards with customizable settings
- **Column Management**: Add, reorder, and organize columns within boards
- **Card Management**: Create, edit, and organize task cards with rich metadata
- **Tag System**: Color-coded tags for categorizing and filtering cards
- **Advanced Card Features**: Effort estimation (1-10), priority levels (high/medium/low), due dates, custom labels
- **Board Settings**: Comprehensive settings panel with tabs for general config, tag management, and danger zone actions
- **Settings**: User preferences and account management

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live synchronization across devices
- **RESTful API**: Well-documented backend with comprehensive error handling
- **Database Integration**: PostgreSQL with optimized queries and indexing
- **Type Safety**: Full TypeScript coverage on both frontend and backend
- **Docker Support**: Containerized deployment with docker-compose

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript with strict configuration
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Hono** - Fast, lightweight web framework
- **TypeScript** - Type-safe backend development
- **PostgreSQL** - Robust relational database
- **pg (node-postgres)** - PostgreSQL client for Node.js

### DevOps & Tools
- **Docker** - Containerization
- **ESLint** - Code linting and formatting
- **npm workspaces** - Monorepo management
- **Concurrently** - Run multiple commands simultaneously

## 📁 Project Structure

```
taskmanager/
├── apps/
│   ├── frontend/           # React application
│   │   ├── src/
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── pages/      # Page components
│   │   │   ├── services/   # API services
│   │   │   └── ...
│   │   ├── Dockerfile
│   │   └── package.json
│   └── backend/            # Node.js API server
│       ├── src/
│       │   ├── config/     # Database configuration
│       │   ├── controllers/# Route handlers
│       │   ├── models/     # Database models
│       │   ├── routes/     # API routes
│       │   ├── services/   # Business logic
│       │   ├── types/      # TypeScript definitions
│       │   └── ...
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml      # Docker orchestration
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (handled by Docker)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskmanager
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in root directory
   cp .env.example .env

   # Or set these environment variables:
   POSTGRES_DB=taskmanager
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   DATABASE_URL=postgresql://postgres:password@localhost:5432/taskmanager
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start PostgreSQL** (via Docker)
   ```bash
   docker-compose up postgres -d
   ```

3. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually:
   npm run dev --workspace=apps/frontend
   npm run dev --workspace=apps/backend
   ```

4. **Database setup**
   ```bash
   # The database schema is automatically initialized
   # Check health endpoint: http://localhost:3001/health
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication
Uses JWT-based authentication with HttpOnly cookies for security. Features automatic token refresh and secure logout with token blacklisting.

#### Authentication Endpoints

**Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Login User**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Get Current User**
```http
GET /auth/me
Authorization: Bearer <token> (via HttpOnly cookie)
```

**Refresh Token**
```http
POST /auth/refresh
Authorization: Bearer <refresh_token> (via HttpOnly cookie)
```

**Logout User**
```http
POST /auth/logout
Authorization: Bearer <token> (via HttpOnly cookie)
```

### Endpoints

#### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-03T09:15:33.998Z"
}
```

#### Boards API

**Get All Boards**
```http
GET /boards
```

**Get Board by ID**
```http
GET /boards/:id
```

**Create Board**
```http
POST /boards
Content-Type: application/json

{
  "name": "Project Alpha",
  "description": "Main project board"
}
```

**Update Board**
```http
PUT /boards/:id
Content-Type: application/json

{
  "name": "Updated Project",
  "background": "bg-blue-50"
}
```

**Delete Board**
```http
DELETE /boards/:id
```

#### Columns API

**Get Columns for Board**
```http
GET /boards/:boardId/columns
```

**Create Column**
```http
POST /columns
Content-Type: application/json

{
  "board_id": 1,
  "name": "To Do",
  "position": 0
}
```

**Update Column**
```http
PUT /columns/:id
Content-Type: application/json

{
  "name": "In Progress",
  "position": 1
}
```

**Delete Column**
```http
DELETE /columns/:id
```

#### Items API (Cards)

**Get Items for Column**
```http
GET /columns/:columnId/items
```

**Create Item**
```http
POST /items
Content-Type: application/json

{
  "column_id": 1,
  "title": "Implement login",
  "description": "Add user authentication",
  "effort": 5,
  "priority": "high"
}
```

**Update Item**
```http
PUT /items/:id
Content-Type: application/json

{
  "title": "Updated task",
  "completed": true
}
```

**Delete Item**
```http
DELETE /items/:id
```

#### Tags API

**Get All Tags**
```http
GET /tags
```

**Create Tag**
```http
POST /tags
Content-Type: application/json

{
  "name": "Bug",
  "color": "#EF4444"
}
```

**Update Tag**
```http
PUT /tags/:id
Content-Type: application/json

{
  "name": "Feature",
  "color": "#10B981"
}
```

**Delete Tag**
```http
DELETE /tags/:id
```

### Response Format
Standard responses include success/error status, data, and timestamps. Refer to backend route handlers for detailed schemas.

## 🗄 Database Schema

The application uses PostgreSQL with a normalized schema supporting user authentication, boards, columns, items (cards), and tags. See `erd.mermaid` for the entity-relationship diagram and `auth-flow.mermaid` for the authentication flow diagram.

### Key Tables

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Refresh Tokens
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Invalidated Tokens
```sql
CREATE TABLE invalidated_tokens (
  id SERIAL PRIMARY KEY,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Boards
```sql
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  background VARCHAR(255) DEFAULT 'bg-gray-50',
  column_theme VARCHAR(255) DEFAULT 'dark',
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  user_id INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Columns
```sql
CREATE TABLE columns (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, name)
);
```

#### Items (Cards)
```sql
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  effort INTEGER CHECK (effort >= 0 AND effort <= 10),
  label TEXT,
  priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tags
```sql
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Item Tags (Junction)
```sql
CREATE TABLE item_tags (
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);
```

### Indexes
Comprehensive indexing for performance: user_id, board_id, column_id, positions, timestamps, and tag relationships.

## 🔧 Development

### Available Scripts

**Root level:**
```bash
npm run dev      # Start both frontend and backend
npm run build    # Build both applications
```

**Frontend:**
```bash
cd apps/frontend
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Backend:**
```bash
cd apps/backend
npm run dev      # Start with tsx watch
npm run build    # Compile TypeScript
npm run start    # Start production server
```

### Code Quality

- **ESLint**: Configured with React and TypeScript rules
- **TypeScript**: Strict mode enabled
- **Prettier**: Code formatting (via ESLint)
- **Husky**: Pre-commit hooks (planned)

### Architecture Patterns

#### Backend (Layered Architecture)
1. **Routes** → Define API endpoints
2. **Controllers** → Handle HTTP requests/responses
3. **Services** → Business logic and validation
4. **Models** → Database operations
5. **Config** → Application configuration

#### Frontend (Component-Based)
- **Pages** → Route-level components
- **Components** → Reusable UI elements
- **Services** → API integration
- **Hooks** → Custom React hooks

## 🚢 Deployment

### Docker Deployment
```bash
# Build and start production containers
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables
```env
# Database
POSTGRES_DB=taskmanager
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:password@db:5432/taskmanager

# Frontend
VITE_API_URL=http://your-backend-url:3001
```

### Production Checklist
- [ ] Set secure database passwords
- [ ] Configure HTTPS certificates
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up CI/CD pipeline
- [ ] Configure environment-specific settings

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Open a Pull Request

### Code Standards
- Follow TypeScript strict mode guidelines
- Use meaningful variable and function names
- Write descriptive commit messages
- Keep components small and focused
- Add comments for complex logic
- Follow existing code patterns

### Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation update
style: code style changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React and TypeScript communities
- Hono framework for the excellent API framework
- Tailwind CSS for the utility-first approach
- PostgreSQL for the robust database

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Check the documentation in `/docs`

---

**Happy coding! 🎉**</content>
<parameter name="filePath">/Users/mbpro/Documents/GitHub/taskmanager/README.md