# TaskManager

A modern, full-stack task management application built with React, TypeScript, Node.js, and PostgreSQL. Features a clean, responsive UI with board-based project management, user authentication, and real-time collaboration capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication**: Microsoft-style login/signup with secure session management
- **Dashboard**: Overview of all user boards with quick access and statistics
- **Board Management**: Create and manage multiple project boards
- **Task Management**: Add, edit, delete, and organize tasks within boards
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
├── AGENTS.md              # AI agent configuration
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
Currently uses session-based authentication (to be enhanced with JWT).

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

#### Tasks API

**Get All Tasks**
```http
GET /tasks
```

**Get Task by ID**
```http
GET /tasks/:id
```

**Create Task**
```http
POST /tasks
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the task manager project"
}
```

**Update Task**
```http
PUT /tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}
```

**Delete Task**
```http
DELETE /tasks/:id
```

### Response Format
```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Task description",
  "completed": false,
  "created_at": "2025-11-03T09:15:33.998Z",
  "updated_at": "2025-11-03T09:15:33.998Z"
}
```

## 🗄 Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

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
- Review the AGENTS.md for AI-assisted development

---

**Happy coding! 🎉**</content>
<parameter name="filePath">/Users/mbpro/Documents/GitHub/taskmanager/README.md