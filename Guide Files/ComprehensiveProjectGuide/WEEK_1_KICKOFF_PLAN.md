# Week 1 Kickoff Plan - Remote Team Setup Guide
## Async Scrum Hub - Foundation Week

**Sprint Goal:** Dev environment ready, architecture locked, team can work independently

**Timeline:** 7 days (Mon-Sun)
**Team:** 4 developers (You, Daniel, Freddy, Maria Luiza)
**Mode:** 100% Remote - Async standups + 1 sync call Wednesday

---

## 🎯 Week 1 Success Criteria

By Friday EOD, every team member should be able to:
- ✅ Run `docker-compose up` and see all services running
- ✅ Make a code change in their area and push to GitHub
- ✅ Access shared API contract document and type definitions
- ✅ Work independently without blocking others

---

## 📋 Pre-Week Checklist (Do BEFORE Monday)

### Everyone Must Complete:

#### 1. Software Installation
```bash
# Check versions:
node --version          # Should be 20+ LTS
npm --version           # Should be 10+
docker --version        # Should be 24+
docker-compose --version # Should be 2.20+
git --version           # Should be 2.30+
```

**Install if missing:**
- Node.js 20 LTS: https://nodejs.org/
- Docker Desktop: https://www.docker.com/products/docker-desktop/
- VSCode: https://code.visualstudio.com/
- mkcert (for HTTPS): `brew install mkcert` (Mac) or https://github.com/FiloSottile/mkcert

#### 2. VSCode Extensions (Required)
Open VSCode → Extensions → Install:
- `dbaeumer.vscode-eslint` (ESLint)
- `esbenp.prettier-vscode` (Prettier)
- `Prisma.prisma` (if using Prisma)
- `ms-azuretools.vscode-docker` (Docker)

#### 3. GitHub Access
- ✅ Confirm you have access to the repo (Daniel creates on Monday)
- ✅ Setup SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
- ✅ Test: `ssh -T git@github.com`

#### 4. Communication Channels
- ✅ Join Discord/Slack workspace (Daniel creates)
- ✅ Test notifications: Enable desktop notifications

---

## 🗓️ Day-by-Day Breakdown

### **Monday - Project Bootstrap**

#### Morning (Async - Everyone)

**1. Repository Setup (Daniel - CRITICAL PATH)**
- [ ] Create GitHub repo: `async-scrum-hub` (private)
- [ ] Add all team members as collaborators
- [ ] Setup branch protection:
  - `main`: Require PR reviews, no direct commits
  - `dev`: Integration branch
- [ ] Create initial folder structure:
```
async-scrum-hub/
├── frontend/           # React app
├── backend/            # NestJS/Express app
├── shared/             # Shared TypeScript types
│   └── types/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── docs/
    ├── API_CONTRACTS.md
    └── ARCHITECTURE.md
```
- [ ] Push initial commit to `main`
- [ ] Post in Discord: "Repo ready - everyone clone now"

**Clone command for everyone:**
```bash
git clone git@github.com:your-org/async-scrum-hub.git
cd async-scrum-hub
git checkout -b dev
git push origin dev
```

**2. Initial Configuration Files (Daniel)**

Create `.gitignore`:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Env files
.env
.env.local
.env.production

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/extensions.json
.idea/

# Docker
volumes/
```

Create `.prettierrc.json`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "Prisma.prisma",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "bradlc.vscode-tailwindcss"
  ]
}
```

**3. Everyone: Pull Latest & Create Feature Branches**
```bash
git pull origin dev
git checkout -b feat/<your-area>
# Examples:
# Migual: feat/design-system-setup
# Daniela: feat/backend-scaffolding
# Freddy: feat/user-stories
# Maria Luiza: feat/websocket-research
```

#### Afternoon (Parallel Work - Independent)

**Daniela's Tasks (Backend Scaffolding):**
```bash
cd backend
npm init -y
npm install --save express typescript @types/express @types/node
npm install --save-dev ts-node nodemon prettier eslint
npx tsc --init
```

Create `backend/src/index.ts`:
```typescript
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'async-scrum-hub-backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
```

Create `backend/package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] Commit: `git commit -m "feat(backend): initial Express setup with TypeScript"`
- [ ] Push: `git push origin feat/backend-scaffolding`

**You's Tasks (Frontend Scaffolding):**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Create `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
```

Create `frontend/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50;
  }
}
```

Create design tokens file `frontend/src/styles/tokens.ts`:
```typescript
export const colors = {
  primary: {
    main: '#0ea5e9',
    hover: '#0284c7',
    active: '#0369a1',
  },
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
} as const;
```

- [ ] Commit: `git commit -m "feat(frontend): initial Vite + React + Tailwind setup with design tokens"`
- [ ] Push: `git push origin feat/design-system-setup`

**Freddy's Tasks (Documentation & User Stories):**

Create `docs/USER_STORIES.md`:
```markdown
# User Stories - Async Scrum Hub

## Epic 1: Authentication
- As a developer, I want to sign up with email/password so I can access the platform
- As a user, I want to log in securely so I can see my teams

## Epic 2: Organizations
- As a team lead, I want to create an organization so I can invite my team
- As a member, I want to join an organization so I can collaborate

## Epic 3: Projects & Sprints
- As a product owner, I want to create projects so I can organize work
- As a scrum master, I want to create sprints so I can time-box work

## Epic 4: Async Standups
- As a developer, I want to submit daily standups so my team knows my progress
- As a team member, I want to see teammates' standups so I stay informed

## Epic 5: Blocker Management
- As a developer, I want to raise blockers so I can get help
- As a team lead, I want to assign blockers so they get resolved

## Epic 6: Sprint Board
- As a developer, I want to see tasks in Todo/Doing/Done so I know what's next
- As a user, I want to drag tasks between columns so I can update status

(Continue for all features...)
```

Create `docs/ACCEPTANCE_CRITERIA.md`:
```markdown
# Acceptance Criteria

## User Registration
Given I'm on the signup page
When I enter valid email, password, name
Then my account is created and I'm logged in
And I see the dashboard

Validation:
- Email must be valid format
- Password must be 8+ chars with 1 uppercase, 1 number
- Name must be 2+ chars
```

- [ ] Commit: `git commit -m "docs: add user stories and acceptance criteria"`
- [ ] Push: `git push origin feat/user-stories`

**Maria Luiza's Tasks (WebSocket Research & Docker Setup):**

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: async-scrum-db
    environment:
      POSTGRES_USER: scrumadmin
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: async_scrum_hub
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U scrumadmin"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: async-scrum-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://scrumadmin:dev_password_123@postgres:5432/async_scrum_hub
      - JWT_SECRET=dev_secret_change_in_production
      - PORT=3001
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: async-scrum-frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev -- --host

volumes:
  postgres_data:
```

Create `backend/Dockerfile.dev`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
```

Create `frontend/Dockerfile.dev`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

Create `.env.example`:
```env
# Database
DATABASE_URL=postgresql://scrumadmin:dev_password_123@localhost:5432/async_scrum_hub

# Backend
JWT_SECRET=change_this_in_production
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001

# Email (Optional - for later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Create research document `docs/WEBSOCKET_ARCHITECTURE.md`:
```markdown
# WebSocket Architecture Research - Maria Luiza

## Socket.io with NestJS
- Gateway decorator pattern
- Rooms for sprint isolation
- JWT authentication in handshake

## Real-time Events Planned:
- task:updated
- standup:posted
- blocker:raised
- user:online
- user:offline

## Implementation Plan:
Week 5: Basic events (task updates)
Week 6: Advanced (presence, typing indicators)

(Add more research findings)
```

- [ ] Commit: `git commit -m "chore: add Docker setup and WebSocket research"`
- [ ] Push: `git push origin feat/docker-setup`

#### End of Monday Checklist:
- [ ] Daniela: Backend runs locally (`npm run dev`)
- [ ] Miguel: Frontend runs locally (`npm run dev`)
- [ ] Maria Luiza: Docker Compose drafted
- [ ] Freddy: User stories documented
- [ ] Everyone: Pushed to feature branch

---

### **Tuesday - API Contracts & Shared Types**

#### Morning (Daniela - CRITICAL PATH)

**Create Shared Types Structure:**

`shared/types/api.types.ts`:
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

`shared/types/auth.types.ts`:
```typescript
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

`shared/types/organization.types.ts`:
```typescript
export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}
```

`shared/types/project.types.ts`:
```typescript
export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  organizationId: string;
  name: string;
  description?: string;
}
```

`shared/types/sprint.types.ts`:
```typescript
export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string;
  status: 'planning' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSprintRequest {
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string;
}
```

`shared/types/task.types.ts`:
```typescript
export interface Task {
  id: string;
  sprintId: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  sprintId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'doing' | 'done';
  assigneeId?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}
```

`shared/types/standup.types.ts`:
```typescript
export interface StandupEntry {
  id: string;
  sprintId: string;
  userId: string;
  yesterday: string;
  today: string;
  blockers?: string;
  createdAt: string;
}

export interface CreateStandupRequest {
  sprintId: string;
  yesterday: string;
  today: string;
  blockers?: string;
}
```

`shared/types/blocker.types.ts`:
```typescript
export interface Blocker {
  id: string;
  sprintId: string;
  raisedBy: string;
  assignedTo?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockerRequest {
  sprintId: string;
  title: string;
  description: string;
  assignedTo?: string;
}
```

`shared/types/index.ts`:
```typescript
export * from './api.types';
export * from './auth.types';
export * from './organization.types';
export * from './project.types';
export * from './sprint.types';
export * from './task.types';
export * from './standup.types';
export * from './blocker.types';
```

**Create API Contract Document:**

`docs/API_CONTRACTS.md`:
```markdown
# API Contracts - Async Scrum Hub

## Base URL
Development: `http://localhost:3001/api`

## Authentication
All protected routes require JWT token in header:
`Authorization: Bearer <token>`

---

## Authentication Endpoints

### POST /api/auth/register
**Request Body:**
```json
{
  "email": "alice@42.fr",
  "password": "SecurePass123!",
  "name": "Alice Chen"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "alice@42.fr",
      "name": "Alice Chen",
      "avatarUrl": null,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- 400: Email already exists
- 422: Validation failed (weak password, invalid email)

### POST /api/auth/login
**Request Body:**
```json
{
  "email": "alice@42.fr",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* same as register */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- 401: Invalid credentials

### GET /api/auth/me
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "alice@42.fr",
    "name": "Alice Chen",
    "avatarUrl": "https://..."
  }
}
```

---

## Organizations

### POST /api/organizations
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "42 Lisboa Transcendence Team"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "org-uuid",
    "name": "42 Lisboa Transcendence Team",
    "ownerId": "user-uuid",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### GET /api/organizations
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "org-uuid",
      "name": "42 Lisboa Transcendence Team",
      "ownerId": "user-uuid",
      "role": "admin",  // Current user's role
      "memberCount": 4,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

(Continue for all endpoints: Projects, Sprints, Tasks, Standups, Blockers, Notifications, Files...)
```

- [ ] Commit: `git commit -m "feat(shared): add TypeScript type definitions for all entities"`
- [ ] Commit: `git commit -m "docs: add complete API contracts documentation"`
- [ ] Push: `git push origin feat/api-contracts`
- [ ] **Post in Discord:** "🎯 API contracts ready - frontend can start mocking, backend can implement"

#### Afternoon (Everyone - Parallel)

**You: Create Mock Data Provider**

`frontend/src/lib/mockApi.ts`:
```typescript
import type { User, AuthResponse } from '@shared/types';

// Mock delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  auth: {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
      await delay(1000);
      return {
        user: {
          id: 'mock-user-id',
          email: data.email,
          name: data.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token',
      };
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
      await delay(1000);
      // Simulate success for demo user
      if (data.email === 'demo@42.fr' && data.password === 'password123') {
        return {
          user: {
            id: 'demo-user-id',
            email: 'demo@42.fr',
            name: 'Demo User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock-jwt-token',
        };
      }
      throw new Error('Invalid credentials');
    },
  },
};
```

**Daniela: Setup Prisma Schema**

```bash
cd backend
npm install prisma @prisma/client
npx prisma init
```

`backend/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  avatarUrl    String?  @map("avatar_url")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  organizationMemberships OrganizationMember[]
  ownedOrganizations      Organization[]       @relation("OrganizationOwner")

  @@map("users")
}

model Organization {
  id        String   @id @default(uuid())
  name      String
  ownerId   String   @map("owner_id")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  owner    User                 @relation("OrganizationOwner", fields: [ownerId], references: [id])
  members  OrganizationMember[]
  projects Project[]

  @@map("organizations")
}

model OrganizationMember {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  userId         String   @map("user_id")
  role           Role     @default(MEMBER)
  joinedAt       DateTime @default(now()) @map("joined_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@map("organization_members")
}

enum Role {
  ADMIN
  MEMBER
}

model Project {
  id             String   @id @default(uuid())
  organizationId String   @map("organization_id")
  name           String
  description    String?
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  sprints      Sprint[]

  @@map("projects")
}

model Sprint {
  id        String       @id @default(uuid())
  projectId String       @map("project_id")
  name      String
  startDate DateTime     @map("start_date")
  endDate   DateTime     @map("end_date")
  goal      String?
  status    SprintStatus @default(PLANNING)
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")

  project        Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks          Task[]
  standupEntries StandupEntry[]
  blockers       Blocker[]

  @@map("sprints")
}

enum SprintStatus {
  PLANNING
  ACTIVE
  COMPLETED
}

model Task {
  id          String       @id @default(uuid())
  sprintId    String       @map("sprint_id")
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  assigneeId  String?      @map("assignee_id")
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?    @map("due_date")
  createdBy   String       @map("created_by")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  sprint Sprint @relation(fields: [sprintId], references: [id], onDelete: Cascade)

  @@map("tasks")
}

enum TaskStatus {
  TODO
  DOING
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
}

// Add remaining models: StandupEntry, Blocker, Comment, Notification, File
// (Truncated for brevity - full schema in actual implementation)
```

Run migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

- [ ] Commit: `git commit -m "feat(backend): add Prisma schema and initial migration"`

**Freddy: Create Seed Data**

`backend/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@42.fr',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Alice Chen',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@42.fr',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Bob Smith',
    },
  });

  console.log('✅ Created users');

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: '42 Lisboa Transcendence Team',
      ownerId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: 'ADMIN' },
          { userId: bob.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✅ Created organization');

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'ft_transcendence MVP',
      organizationId: org.id,
      description: 'Building Async Scrum Hub',
    },
  });

  // Create sprint
  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1: Foundation',
      projectId: project.id,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-21'),
      goal: 'Setup development environment and architecture',
      status: 'ACTIVE',
    },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        sprintId: sprint.id,
        title: 'Setup Docker Compose',
        status: 'DONE',
        assigneeId: bob.id,
        createdBy: alice.id,
        priority: 'HIGH',
      },
      {
        sprintId: sprint.id,
        title: 'Implement JWT authentication',
        status: 'DOING',
        assigneeId: alice.id,
        createdBy: alice.id,
        priority: 'HIGH',
      },
      {
        sprintId: sprint.id,
        title: 'Design login page mockup',
        status: 'TODO',
        createdBy: alice.id,
        priority: 'MEDIUM',
      },
    ],
  });

  console.log('✅ Created project, sprint, and tasks');
  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

**Maria Luiza: Test Docker Setup**
```bash
# From repo root
docker-compose up --build
# Check all services start
# Test connections:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3001/health
# - Database: psql -h localhost -U scrumadmin -d async_scrum_hub
```

#### End of Tuesday Checklist:
- [ ] All shared types defined
- [ ] API contracts documented
- [ ] Prisma schema created + migrated
- [ ] Seed data working
- [ ] Docker Compose running all services
- [ ] Everyone can access database

---

### **Wednesday - Sync Call + Integration**

#### Morning (Async Work)

**Everyone: Merge Feature Branches to Dev**
```bash
git checkout dev
git pull origin dev
git merge feat/<your-feature>
# Resolve any conflicts
git push origin dev
```

#### Afternoon (SYNC CALL - 1 hour max)

**Agenda:**
1. **Demo Round (5 min each = 20 min)**
   - Daniela: Show backend running, database schema, API contracts
   - Miguel: Show frontend running, design tokens, Tailwind config
   - Freddy: Walk through user stories, acceptance criteria
   - Maria Luiza: Show Docker Compose, all services running

2. **Integration Check (15 min)**
   - Test: Frontend can call backend health endpoint
   - Test: Database connection from backend works
   - Test: Seed data visible in database

3. **Blockers & Questions (15 min)**
   - Any blocking issues?
   - Clarifications needed?
   - Adjust plan if needed

4. **Week 1 Goals Review (10 min)**
   - What's left for Friday?
   - Who needs help?

#### After Call (Async)

**Create Integration Tasks for Thursday/Friday:**

- [ ] Daniela: Implement POST /api/auth/register endpoint
- [ ] You: Create Login form component
- [ ] Freddy: Test registration flow manually
- [ ] Maria Luiza: Add WebSocket placeholder endpoint

---

### **Thursday - First Integrations**

**Daniela: Auth Endpoints**
- [ ] Implement POST /api/auth/register (with bcrypt hashing)
- [ ] Implement POST /api/auth/login (JWT generation)
- [ ] Implement GET /api/auth/me (JWT verification)
- [ ] Test with Postman/Insomnia

**You: Auth UI**
- [ ] Create Button component
- [ ] Create Input component
- [ ] Create LoginForm component
- [ ] Create SignupForm component
- [ ] Wire up to mock API (not real backend yet)

**Freddy: Organizations Backend**
- [ ] Implement POST /api/organizations
- [ ] Implement GET /api/organizations (filtered by user membership)
- [ ] Add permission checks (must be logged in)

**Maria Luiza: File Upload Prep**
- [ ] Create uploads/ folder in backend
- [ ] Setup Multer middleware
- [ ] Create POST /api/files endpoint (basic version)

---

### **Friday - Week 1 Demo**

#### Morning: Final Polish
- [ ] All code merged to dev branch
- [ ] README updated with setup instructions
- [ ] All services start with `docker-compose up`

#### Afternoon: Team Demo (Async - Record Video)

**Each person records 3-min screen recording showing:**
- What you built this week
- How to run it
- What's coming next week

**Daniela's Demo:**
- Show database schema (Prisma Studio)
- Show API endpoints working (Postman)
- Show seed data
- Login endpoint returns JWT

**Your Demo:**
- Show design system (colors, typography)
- Show Button + Input components
- Show Login form (with mock API)
- Show dark mode ready

**Freddy's Demo:**
- Show user stories document
- Show acceptance criteria
- Show seed data matches stories
- Show organizations endpoint working

**Maria Luiza's Demo:**
- Show Docker Compose starting all services
- Show WebSocket research doc
- Show file upload endpoint basics

#### End of Week Checklist:
- [ ] Docker Compose starts all services
- [ ] Database has seed data
- [ ] Backend health endpoint responds
- [ ] Frontend loads in browser
- [ ] API contracts documented
- [ ] All team members pushed code
- [ ] README has setup instructions

---

## 🚀 Week 1 Deliverables Summary

### Repository Structure:
```
async-scrum-hub/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── styles/
│   │   │   └── tokens.ts
│   │   └── lib/
│   │       └── mockApi.ts
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── shared/
│   └── types/
│       ├── auth.types.ts
│       ├── organization.types.ts
│       └── (all other types)
├── docs/
│   ├── API_CONTRACTS.md
│   ├── USER_STORIES.md
│   ├── ACCEPTANCE_CRITERIA.md
│   └── WEBSOCKET_ARCHITECTURE.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .prettierrc.json
├── .vscode/
│   ├── settings.json
│   └── extensions.json
└── README.md
```

### What Everyone Can Do Now:
- ✅ Run entire stack with one command
- ✅ Access shared type definitions
- ✅ Reference API contracts
- ✅ Work independently on feature branches
- ✅ Test with realistic seed data

---

## 📞 Communication Protocol

### Daily Async Standups (Use Discord)
**Post by 10 AM your timezone:**
```
📅 Jan 15 - Alice

Yesterday:
- Setup Tailwind config
- Created design tokens file

Today:
- Build Button component
- Build Input component

Blockers:
- None
```

### When to Sync:
- Wednesday: 1-hour team call
- Urgent blockers: Immediate Discord ping
- Code reviews: Tag person in GitHub PR

### Response Times:
- Discord questions: Within 3 hours during work day
- PR reviews: Within 24 hours
- Urgent (@everyone): Within 1 hour

---

## ⚠️ Common Pitfalls to Avoid

1. **Not pulling latest dev before starting work**
   - Always: `git checkout dev && git pull origin dev` before creating feature branch

2. **Committing node_modules or .env**
   - Check .gitignore is working
   - Run `git status` before committing

3. **Breaking someone else's code**
   - Always create feature branches
   - Never commit directly to main or dev
   - Get code review before merging

4. **TypeScript "any" types**
   - Use proper types from /shared/types
   - If you don't know the type, ask in Discord

5. **Not testing Docker Compose**
   - Run `docker-compose up` daily to ensure it still works

---

## 🎯 Success Metrics

By end of Week 1, you should be able to:
- [ ] Clone repo on fresh machine and run `docker-compose up` successfully
- [ ] See frontend at http://localhost:5173
- [ ] See backend at http://localhost:3001/health
- [ ] Login to database and see seed data
- [ ] Make code change, commit, push, open PR
- [ ] Reference API contract for any endpoint
- [ ] Import types from /shared/types

---

## 📚 Resources

### Documentation:
- React + TypeScript: https://react-typescript-cheatsheet.netlify.app/
- NestJS: https://docs.nestjs.com/
- Prisma: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Socket.io: https://socket.io/docs/v4/

### Tools:
- Prisma Studio: `npx prisma studio` (visual DB browser)
- Postman: Test backend APIs
- Thunder Client: VSCode extension for API testing

---

## 🆘 Getting Help

1. **Check documentation first** (links above)
2. **Search Discord history** (probably answered before)
3. **Ask in Discord** with context:
   ```
   Question: How do I import shared types in frontend?
   What I tried: import { User } from '@shared/types'
   Error: Module not found
   ```
4. **Tag specific person** if urgent:
   - Backend: @Daniela
   - Frontend: @Miguel
   - Real-time: @Maria Luiza
   - Product: @Freddy

---

## 🎉 Let's Build This!

Remember:
- ✅ Communication is key for remote work
- ✅ Atomic commits help everyone
- ✅ TypeScript prevents bugs
- ✅ Ask questions early
- ✅ We're a team - help each other!

**First commit of the week should be exciting. Let's go! 🚀**
