# Getting Started - Async Scrum Hub
## Week 1 Monday Morning Checklist

**Goal:** Get everyone coding independently within 3 hours. Let's go! 🚀

---

## ⏰ Before 9 AM (Do This Weekend)

### Everyone:

#### 1. Install Required Software
```bash
# Check if you have everything:
node --version          # Need: 20+
npm --version           # Need: 10+
docker --version        # Need: 24+
docker-compose --version # Need: 2.20+
git --version           # Need: 2.30+
```

**Missing something?**
- Node.js: https://nodejs.org/ (download LTS)
- Docker: https://www.docker.com/products/docker-desktop/
- VSCode: https://code.visualstudio.com/

#### 2. Setup VSCode Extensions

Open VSCode → Extensions (Cmd/Ctrl + Shift + X) → Install:
```
ESLint (dbaeumer.vscode-eslint)
Prettier (esbenp.prettier-vscode)
Prisma (Prisma.prisma)
Docker (ms-azuretools.vscode-docker)
GitLens (eamodio.gitlens) [optional but helpful]
Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
```

#### 3. Setup GitHub SSH
```bash
# If you haven't already:
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter 3 times (default location, no passphrase)

# Copy your public key:
cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings → SSH Keys → New SSH Key

# Test connection:
ssh -T git@github.com
# Should see: "Hi username! You've successfully authenticated..."
```

#### 4. Join Communication Channels
- [ ] Join Discord/Slack workspace (Miguel sends invite)
- [ ] Enable desktop notifications
- [ ] Test by saying "Hi team! 👋"

---

## 🌅 Monday Morning

### Phase 1: Repository Setup

#### Miguel (CRITICAL PATH - Do First):

```bash
# 1. Create GitHub repo
# Go to: https://github.com/new
# Name: async-scrum-hub
# Private: Yes
# Initialize: No (we'll do it manually)

# 2. Add collaborators
# Settings → Collaborators → Add people
# Add: [teammates' GitHub usernames]

# 3. Setup branch protection
# Settings → Branches → Add rule
# Branch name: main
# ✓ Require pull request before merging
# ✓ Require approvals: 1
# Save

# 4. Create initial structure locally
mkdir async-scrum-hub
cd async-scrum-hub
git init
git checkout -b main

# Create folder structure
mkdir -p frontend backend shared/types docs .vscode

# Create .gitignore
cat > .gitignore << 'EOF'
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
EOF

# Create README
cat > README.md << 'EOF'
# Async Scrum Hub

Remote-first Scrum workspace for async teams.

## Quick Start

```bash
# Clone repo
git clone git@github.com:your-org/async-scrum-hub.git
cd async-scrum-hub

# Install dependencies
npm install

# Start services
docker-compose up
```

## Access Points

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database: localhost:5432

## Team

- Miguel (Frontend Lead)
- Daniela (Backend Lead)
- Freddy (Product Owner)
- Malu (Real-Time Specialist)

## Tech Stack

- Frontend: React + TypeScript + Tailwind
- Backend: NestJS + Prisma + PostgreSQL
- Real-time: Socket.io
- DevOps: Docker + Nginx
EOF

# Commit and push
git add .
git commit -m "chore: initial project structure"
git remote add origin git@github.com:your-org/async-scrum-hub.git
git push -u origin main

# Create dev branch
git checkout -b dev
git push -u origin dev

# Post in Discord:
echo "✅ Repo ready! Everyone clone now:"
echo "git clone git@github.com:your-org/async-scrum-hub.git"
```

#### Everyone Else (Wait for Daniela's message):

```bash
# Clone repo
git clone git@github.com:your-org/async-scrum-hub.git
cd async-scrum-hub

# Checkout dev branch
git checkout dev

# Create your feature branch
git checkout -b feat/[your-area]
# Examples:
# - feat/design-system (Alice)
# - feat/backend-scaffolding (Daniel)
# - feat/user-stories (Freddy)
# - feat/docker-setup (Malu)

# Post in Discord:
echo "✅ Cloned repo and created feature branch"
```

---

### Phase 2: Initial Setup

#### Daniela: Backend Foundation

```bash
cd async-scrum-hub/backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express typescript @types/express @types/node cors dotenv
npm install --save-dev ts-node nodemon @types/cors prettier eslint

# Install Prisma
npm install prisma @prisma/client
npm install --save-dev prisma

# Initialize TypeScript
npx tsc --init

# Edit tsconfig.json (important settings):
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create src folder
mkdir -p src

# Create basic Express server
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'async-scrum-hub-backend',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
EOF

# Update package.json scripts
npm pkg set scripts.dev="nodemon src/index.ts"
npm pkg set scripts.build="tsc"
npm pkg set scripts.start="node dist/index.js"

# Test it works
npm run dev
# Should see: "🚀 Backend server running..."
# Visit: http://localhost:3001/health
# Press Ctrl+C to stop

# Initialize Prisma
npx prisma init

# Commit
git add .
git commit -m "feat(backend): initial Express + TypeScript setup"
git push origin feat/backend-scaffolding

# Post in Discord:
echo "✅ Backend foundation ready!"
echo "Run 'cd backend && npm install && npm run dev' to test"
```

#### Miguel: Frontend Foundation

```bash
cd async-scrum-hub

# Create Vite React app
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install

# Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure Tailwind
cat > tailwind.config.js << 'EOF'
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
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
EOF

# Update src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50;
    @apply antialiased;
  }
}
EOF

# Create design tokens
mkdir -p src/styles
cat > src/styles/tokens.ts << 'EOF'
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
  },
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
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const borderRadius = {
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  full: '9999px',
} as const;
EOF

# Test it works
npm run dev
# Should open http://localhost:5173
# Press Ctrl+C to stop

# Commit
git add .
git commit -m "feat(frontend): initial Vite + React + Tailwind setup with design tokens"
git push origin feat/design-system

# Post in Discord:
echo "✅ Frontend foundation ready!"
echo "Run 'cd frontend && npm install && npm run dev' to test"
```

#### Freddy: Documentation

```bash
cd async-scrum-hub/docs

# Create user stories
cat > USER_STORIES.md << 'EOF'
# User Stories - Async Scrum Hub

## Epic 1: Authentication & User Management
- [ ] As a developer, I want to sign up with email/password so I can access the platform
- [ ] As a user, I want to log in securely so I can see my teams
- [ ] As a user, I want to update my profile (name, avatar) so others can recognize me
- [ ] As a user, I want to log out so I can secure my account

## Epic 2: Organizations & Teams
- [ ] As a team lead, I want to create an organization so I can invite my team
- [ ] As a user, I want to join an organization so I can collaborate
- [ ] As an admin, I want to manage members (add/remove) so I can control access
- [ ] As a member, I want to see my organization dashboard so I know what's happening

## Epic 3: Projects & Sprints
- [ ] As a product owner, I want to create projects so I can organize work
- [ ] As a scrum master, I want to create sprints with dates so I can time-box work
- [ ] As a user, I want to see active sprints so I know what's in progress
- [ ] As an admin, I want to close sprints so we can start new ones

## Epic 4: Sprint Board (Kanban)
- [ ] As a developer, I want to see tasks in Todo/Doing/Done so I know what's next
- [ ] As a user, I want to create tasks so I can track work
- [ ] As a user, I want to drag tasks between columns so I can update status
- [ ] As a user, I want to assign tasks to teammates so they know what to do
- [ ] As a user, I want to see task details (description, due date) so I understand requirements

## Epic 5: Async Standups
- [ ] As a developer, I want to submit daily standups (yesterday/today/blockers) so my team knows my progress
- [ ] As a team member, I want to see teammates' standups so I stay informed
- [ ] As a user, I want to comment on standups so I can provide feedback
- [ ] As a scrum master, I want to see standup participation rate so I know team engagement

## Epic 6: Blocker Management
- [ ] As a developer, I want to raise blockers so I can get help
- [ ] As a team lead, I want to assign blockers so they get resolved
- [ ] As a user, I want to see blocker status so I know if help is coming
- [ ] As a user, I want to comment on blockers so I can collaborate on solutions
- [ ] As a user, I want to attach files to blockers so I can provide context (screenshots, logs)

## Epic 7: Notifications
- [ ] As a user, I want in-app notifications so I know when I'm mentioned
- [ ] As a user, I want email notifications so I don't miss important updates
- [ ] As a user, I want to mark notifications as read so I can clear them
- [ ] As a user, I want to mute notifications so I'm not overwhelmed

## Epic 8: Analytics & Insights
- [ ] As a scrum master, I want to see standup participation rate so I know engagement
- [ ] As a team lead, I want to see blockers raised vs resolved so I know if team is stuck
- [ ] As a product owner, I want to see task completion rate so I know velocity
- [ ] As a user, I want to export sprint data so I can create reports

## Epic 9: Search
- [ ] As a user, I want to search tasks so I can find specific work items
- [ ] As a user, I want to search standups so I can see what was said
- [ ] As a user, I want to search blockers so I can find solutions to similar problems

## Epic 10: Real-time Updates
- [ ] As a user, I want to see task updates in real-time so I don't need to refresh
- [ ] As a user, I want to see when teammates post standups so I stay current
- [ ] As a user, I want to see online/offline status so I know who's available
EOF

# Create acceptance criteria
cat > ACCEPTANCE_CRITERIA.md << 'EOF'
# Acceptance Criteria

## User Registration

**Given** I'm on the signup page
**When** I enter valid email, password, name
**Then** my account is created and I'm logged in
**And** I see the dashboard

**Validation:**
- Email must be valid format (user@domain.com)
- Password must be 8+ chars with 1 uppercase, 1 number
- Name must be 2+ chars

**Error Handling:**
- Show "Email already exists" if duplicate
- Show "Password too weak" with requirements
- Show "All fields required" if missing

---

## User Login

**Given** I have an existing account
**When** I enter correct email and password
**Then** I'm logged in and see my dashboard

**Error Handling:**
- Show "Invalid credentials" if wrong password
- Show "Account not found" if email doesn't exist
- Show "All fields required" if missing

---

(Continue for all features...)
EOF

# Commit
git add .
git commit -m "docs: add user stories and acceptance criteria"
git push origin feat/user-stories

# Post in Discord:
echo "✅ User stories documented!"
echo "See docs/USER_STORIES.md"
```

#### Malu: Docker Setup

```bash
cd async-scrum-hub

# Create Docker Compose
cat > docker-compose.yml << 'EOF'
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
EOF

# Create backend Dockerfile
cat > backend/Dockerfile.dev << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
EOF

# Create frontend Dockerfile
cat > frontend/Dockerfile.dev << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
EOF

# Create .env.example
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://scrumadmin:dev_password_123@localhost:5432/async_scrum_hub

# Backend
JWT_SECRET=change_this_in_production_use_openssl_rand_hex_32
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001

# Email (Optional - configure later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF

# Copy to .env
cp .env.example .env

# Test Docker Compose
docker-compose up --build
# Should see all services starting
# Press Ctrl+C to stop

# Commit
git add .
git commit -m "chore: add Docker Compose setup for local development"
git push origin feat/docker-setup

# Post in Discord:
echo "✅ Docker setup ready!"
echo "Run 'docker-compose up' to start all services"
```

---

### Phase 3: Integration Test

#### Everyone:

```bash
# Pull latest dev
git checkout dev
git pull origin dev

# Merge your feature branch
git merge feat/[your-area]

# Push to dev
git push origin dev

# Test Docker Compose
docker-compose up --build

# Open in browser:
# - Frontend: http://localhost:5173
# - Backend health: http://localhost:3001/health

# Should see:
# ✅ All services running
# ✅ Frontend loads (even if empty)
# ✅ Backend health check works

# Post in Discord with screenshot:
echo "✅ Integration successful! All services running."
```

---

## ✅ Success Criteria for Monday

By afternoon, everyone should have:

- [ ] Cloned repository
- [ ] Created feature branch
- [ ] Pushed initial code
- [ ] Merged to dev
- [ ] Docker Compose running
- [ ] Posted standup in Discord

**If you're stuck:** Ask in Discord immediately! Don't struggle alone.

---

## 📅 Rest of Week 1

### Tuesday: API Contracts & Shared Types
- Daniela: Define all API endpoints in `docs/API_CONTRACTS.md`
- Daniela: Create TypeScript types in `/shared/types/`
- Everyone: Review API contracts, ask questions

### Wednesday: Sync Call (1 hour)
- Demo what you built
- Integration check
- Discuss blockers
- Plan Thursday/Friday work

### Thursday: First Integrations
- Daniela: Implement auth endpoints
- Miguel: Create login/signup forms
- Freddy: Test registration flow
- Malu: WebSocket placeholder

### Friday: Demo Day
- All code merged to dev
- README updated
- Record individual demos
- Celebrate! 🎉

---

## 🆘 Troubleshooting

### "npm install" fails
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Docker Compose won't start
```bash
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild
docker-compose up --build
```

### "Permission denied" on Docker
```bash
# Add your user to docker group (Linux)
sudo usermod -aG docker $USER
# Log out and log back in

# Or run with sudo (not recommended)
sudo docker-compose up
```

### Git conflicts when merging
```bash
# Pull latest
git pull origin dev

# See conflicts
git status

# Edit files, resolve conflicts (remove <<<, ===, >>>)
# Then:
git add .
git commit -m "chore: resolve merge conflicts"
git push
```

### TypeScript errors
```bash
# Make sure you installed types
npm install --save-dev @types/node @types/express

# Restart TypeScript server in VSCode
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

---

## 🎉 You're Ready!

**Remember:**
- ✅ Ask questions in Discord
- ✅ Commit often (atomic commits)
- ✅ Push daily (don't hoard code)
- ✅ Help teammates
- ✅ Have fun building! 🚀

**Let's build something amazing together!**
