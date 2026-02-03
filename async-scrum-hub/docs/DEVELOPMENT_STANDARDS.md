# Development Standards & Best Practices
## Async Scrum Hub - Team Guidelines

**These are MANDATORY practices for successful remote collaboration.**

# Development Standards

This document defines how we work as a team.
These rules exist to reduce friction, avoid integration issues,
and keep the project shippable at all times.

If something here is unclear, we discuss it before coding.

---

## 1. Branching & Git Rules

### Branches
- `main` → protected, demo-ready only
- `dev` → integration branch
- `feat/<short-name>` → feature work (e.g. `feat/standups-ui`)

### Rules
- No direct commits to `main`
- All work goes through a Pull Request (PR) into `dev`
- `dev` → `main` merges only at milestone checkpoints

---

## 2. Pull Requests (PRs)

### What is a PR?
A Pull Request is a request to merge your feature branch into `dev`.
All PRs must be reviewed by at least one teammate.

---

## 3. Definition of Done (MANDATORY)

A PR can be merged only if **all** items below are true:

- Code compiles and runs locally
- No errors or warnings in browser console
- Types updated (including shared types if needed)
- Frontend + backend validation implemented
- Seed/demo data updated if feature affects data
- Feature is demoable manually
- No unrelated changes in the PR

If one item is missing → PR stays open.

---

## 4. API-First Development

- Backend defines endpoints and request/response shapes first
- API contracts are written before frontend integration
- Frontend builds against the contract, not assumptions

---

## 5. API Contracts & Types

- API contracts are documented in `docs/API_CONTRACTS.md`
- **Backend** (Python/FastAPI): Uses Pydantic schemas for request/response validation
- **Frontend** (TypeScript/React): Defines its own TypeScript interfaces

### API Contract Change Rule (MANDATORY)
If an API contract changes:
1. Update `docs/API_CONTRACTS.md`
2. Update backend Pydantic schemas
3. Notify the team in the communication channel
4. Frontend updates TypeScript types before merge

Breaking changes without notice are not allowed.

---

## 6. Authentication Strategy

- Authentication uses **JWT Bearer tokens**
- Frontend stores token and sends via `Authorization: Bearer <token>` header
- Backend validates tokens using `OAuth2PasswordBearer` (FastAPI)
- Token contains user ID in `sub` claim

This is a security decision and should not be changed mid-project.

---

## 7. Real-Time Scope (STRICT)

Real-time features are limited to:
- Task status changes
- Standup posts appearing
- Blockers raised or resolved

Everything else uses REST APIs.

No new WebSocket features are added without team agreement.

---

## 8. Code Style & Formatting

- TypeScript is used everywhere
- Prettier config is shared
- Format-on-save is enabled
- No formatting-only PRs

---

## 9. Component-Driven Frontend Development

- UI components are built in isolation first
- Components live in the design system
- Pages compose components, not custom styles

---

## 10. Data & Demo Discipline

- Seed data must look realistic
- No placeholder text like "test test test"
- Analytics features rely on seeded sprint data

Seed data is part of the product.

---

## 11. When in Doubt

- Ask before implementing
- Prefer simpler solutions
- Protect the demo at all times
---

## 🎯 Core Principles

1. **TypeScript Everywhere** - Catch bugs before they happen
2. **API-First Development** - Frontend and backend work in parallel
3. **Atomic Commits** - Small, focused, reversible changes
4. **Component Isolation** - Build UI in isolation, integrate later
5. **Realistic Test Data** - No "test test test", use real scenarios

---

## 💻 TypeScript Guidelines

### ✅ Always Use Strict Mode

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### ✅ Import Shared Types

**GOOD:**
```typescript
// Frontend
import type { User, LoginRequest, AuthResponse } from '@shared/types';

function LoginForm() {
  const handleSubmit = async (data: LoginRequest): Promise<void> => {
    const response: AuthResponse = await api.auth.login(data);
    // TypeScript knows response.user and response.token exist
  };
}
```

**BAD:**
```typescript
// ❌ Don't do this
function LoginForm() {
  const handleSubmit = async (data: any) => {  // ❌ "any" is forbidden
    const response = await api.auth.login(data);  // ❌ No type safety
  };
}
```

### ✅ Define API Types (Backend + Frontend)

When adding a new API endpoint, define types on both sides:

**1. Backend (Python/Pydantic):**
```python
# backend/src/notifications/schemas.py
from pydantic import BaseModel
from enum import Enum

class NotificationType(str, Enum):
    TASK_ASSIGNED = "task_assigned"
    BLOCKER_RAISED = "blocker_raised"
    COMMENT_ADDED = "comment_added"

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str

class CreateNotificationRequest(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
```

**2. Frontend (TypeScript):**
```typescript
// frontend/src/types/notification.ts
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export type NotificationType = 'task_assigned' | 'blocker_raised' | 'comment_added';
```

**3. Update API Contract:** Document in `docs/API_CONTRACTS.md`
**4. Notify team:** "Added notification endpoint - see API_CONTRACTS.md"

### ✅ Type API Responses

**Backend (FastAPI auto-validates with Pydantic):**
```python
# backend/src/auth/schemas.py
class AuthResponse(BaseModel):
    user: UserResponse
    token: str

# backend/src/auth/routes.py
@router.post("/login", response_model=AuthResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    # FastAPI validates response matches AuthResponse schema
    return {"user": user, "token": token}
```

**Frontend (TypeScript interfaces):**
```typescript
// frontend/src/types/auth.ts
interface AuthResponse {
  user: User;
  token: string;
}

// frontend/src/api/auth.ts
const response = await fetch('/api/v1/auth/login', { method: 'POST', body });
const data: AuthResponse = await response.json();
setUser(data.user);  // TypeScript knows structure
```

---

## 🌿 Git Workflow

### Branch Strategy

```
main (production-ready, protected)
 └── dev (integration branch)
      ├── feat/auth-login          (Daniel)
      ├── feat/design-system        (You)
      ├── feat/sprint-backend       (Freddy)
      └── feat/websocket-setup      (Malu)
```

### Creating a Feature Branch

```bash
# 1. Start from dev
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feat/auth-login

# 3. Work on feature (make commits)
git add .
git commit -m "feat(auth): implement login endpoint"

# 4. Push to remote
git push origin feat/auth-login

# 5. Open PR on GitHub: feat/auth-login → dev
```

### Branch Naming Convention

| Type | Example | Description |
|------|---------|-------------|
| `feat/` | `feat/auth-login` | New feature |
| `fix/` | `fix/login-validation` | Bug fix |
| `docs/` | `docs/api-contracts` | Documentation |
| `refactor/` | `refactor/auth-service` | Code refactoring |
| `test/` | `test/auth-endpoints` | Tests |
| `chore/` | `chore/update-deps` | Maintenance |

**Rules:**
- Lowercase only
- Use hyphens (not underscores or spaces)
- Be descriptive
- Max 50 characters

---

## 📝 Commit Messages

### Format: `<type>(<scope>): <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Scope:**
- Component/module name
- Examples: `auth`, `button`, `api`, `database`

**Description:**
- Imperative mood (not past tense)
- Lowercase
- No period at end
- Max 72 characters

### ✅ GOOD Commits:

```bash
git commit -m "feat(auth): add login endpoint with JWT generation"
git commit -m "feat(button): add hover and active states"
git commit -m "fix(validation): handle edge case in email validator"
git commit -m "docs(api): add examples to auth endpoints"
git commit -m "refactor(auth): extract password hashing to utility"
git commit -m "test(auth): add unit tests for login service"
git commit -m "chore(deps): update dependencies to latest versions"
```

### ❌ BAD Commits:

```bash
git commit -m "stuff"                    # ❌ Not descriptive
git commit -m "Fixed bug"                # ❌ What bug? Where?
git commit -m "Updated files"            # ❌ Which files? Why?
git commit -m "WIP"                      # ❌ Don't commit WIP
git commit -m "Added login page."        # ❌ Has period, past tense
git commit -m "feat: everything"         # ❌ Too broad
```

### Atomic Commits

**Each commit should be:**
- One logical change
- Independently testable
- Easily revertable
- Descriptive enough to understand without reading code

**Example of breaking work into atomic commits:**
```bash
# ❌ BAD: One huge commit
git commit -m "feat(auth): complete auth system"

# ✅ GOOD: Multiple atomic commits
git commit -m "feat(auth): add User model to Prisma schema"
git commit -m "feat(auth): implement password hashing utility"
git commit -m "feat(auth): add JWT generation and verification"
git commit -m "feat(auth): create register endpoint"
git commit -m "feat(auth): create login endpoint"
git commit -m "feat(auth): add auth middleware for protected routes"
git commit -m "test(auth): add unit tests for auth service"
```

**Benefits:**
- Easy to review (small PRs)
- Easy to debug (bisect to find breaking commit)
- Easy to rollback (revert specific change)
- Clear project history

---

## 🎨 Code Formatting

### Prettier (Auto-Format)

`.prettierrc.json`:
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

**VSCode settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**Command line:**
```bash
# Format all files
npm run format

# Check formatting (CI)
npm run format:check
```

**What Prettier handles:**
- Semicolons
- Quotes (single vs double)
- Line length
- Indentation
- Trailing commas

**What you still control:**
- Naming
- Logic
- Architecture

---

### Component Template

`src/components/ui/Button/Button.tsx`:
```typescript
import React from 'react';
import type { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';

  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-300',
    secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

`src/components/ui/Button/Button.types.ts`:
```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
```

`src/components/ui/Button/index.ts`:
```typescript
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

### Component Usage

```typescript
// ✅ GOOD
import { Button } from '@/components/ui/Button';

function LoginForm() {
  return (
    <Button variant="primary" size="lg" onClick={handleLogin}>
      Log In
    </Button>
  );
}

// ❌ BAD - Don't create buttons inline everywhere
function LoginForm() {
  return (
    <button className="bg-blue-500 text-white px-4 py-2">
      Log In
    </button>
  );
}
```

### Component Ownership

- **Miguel** (Frontend Lead) own all `/components/ui/` components
- Others can request new components in Discord
- Others should NOT modify existing components (create PR request instead)
- Keep components generic and reusable

---

## 🔌 API-First Development

### The Problem

**Traditional flow (slower):**
1. Backend implements endpoint
2. Frontend waits...
3. Backend finishes
4. Frontend integrates
5. Find bugs, iterate

**Our flow (faster):**
1. Daniela defines API contract (types + docs)
2. Frontend uses mock data (parallel work)
3. Backend implements real endpoint (parallel work)
4. Frontend switches mock → real (minimal changes)

### Step-by-Step Process

#### 1. Daniela Defines API Contract (Monday Week 1)

`docs/API_CONTRACTS.md`:
```markdown
### POST /api/auth/register

**Request:**
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
      "id": "550e8400-e29b-41d4-a716-446655440000",
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
- `400` - Email already exists
- `422` - Validation failed (password too weak, invalid email format)
```

#### 2. Daniel Creates TypeScript Types

`shared/types/auth.types.ts`:
```typescript
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
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

#### 3. Frontend Creates Mock API (Tuesday)

`frontend/src/lib/mockApi.ts`:
```typescript
import type { RegisterRequest, AuthResponse } from '@shared/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    await delay(1000);  // Simulate network delay

    // Simulate validation error
    if (data.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Return mock success
    return {
      user: {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token-' + Date.now(),
    };
  },
};
```

#### 4. Frontend Uses Mock (Can Start Immediately)

```typescript
import { mockAuthApi } from '@/lib/mockApi';

function SignupForm() {
  const handleSubmit = async (data: RegisterRequest) => {
    try {
      const response = await mockAuthApi.register(data);
      // This works NOW, even though backend isn't ready
      console.log('User:', response.user);
      console.log('Token:', response.token);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### 5. Backend Implements Real Endpoint (Parallel)

```python
# backend/src/auth/routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database import get_db
from src.auth.schemas import RegisterRequest, AuthResponse

router = APIRouter()

@router.post("/register", response_model=AuthResponse)
def register(dto: RegisterRequest, db: Session = Depends(get_db)):
    # Real implementation
    hashed_password = hash_password(dto.password)
    user = User(
        email=dto.email,
        password_hash=hashed_password,
        name=dto.name,
    )
    db.add(user)
    db.commit()
    token = create_access_token(user.id)

    return {"user": user, "token": token}
```

#### 6. Frontend Switches to Real API (One Line Change)

```typescript
// Before (using mock)
import { mockAuthApi } from '@/lib/mockApi';
const response = await mockAuthApi.register(data);

// After (using real backend) - SAME TYPES!
import { authApi } from '@/lib/api';
const response = await authApi.register(data);
```

### Benefits

- ✅ Frontend and backend work in parallel (faster)
- ✅ TypeScript catches integration bugs early
- ✅ Frontend can demo features before backend is done
- ✅ Clear contracts prevent miscommunication
- ✅ Easy to switch mock → real (same types)

---

## 🧪 Testing with Realistic Data

### ❌ BAD Test Data

```typescript
// Don't do this
const users = [
  { email: 'test@test.com', name: 'Test User' },
  { email: 'test2@test.com', name: 'Test Test' },
];

const tasks = [
  { title: 'test', description: 'test test test' },
];
```

**Problems:**
- Hard to demo
- Doesn't reveal UX issues
- Evaluators see lazy work

### ✅ GOOD Test Data

```typescript
// backend/prisma/seed.ts
const users = [
  {
    email: 'alice@42lisboa.com',
    name: 'Alice Chen',
    passwordHash: await bcrypt.hash('SecurePass123!', 10),
  },
  {
    email: 'bob.smith@42lisboa.com',
    name: 'Bob Smith',
    passwordHash: await bcrypt.hash('DevPassword456!', 10),
  },
  {
    email: 'carol.davis@42lisboa.com',
    name: 'Carol Davis',
    passwordHash: await bcrypt.hash('CodeMaster789!', 10),
  },
];

const organizations = [
  {
    name: '42 Lisboa - Transcendence Team',
    owner: alice,
  },
  {
    name: 'Remote Scrum Innovators',
    owner: bob,
  },
];

const projects = [
  {
    name: 'ft_transcendence MVP',
    description: 'Building Async Scrum Hub for remote teams',
    organization: org1,
  },
  {
    name: 'Design System Library',
    description: 'Reusable React components with Tailwind',
    organization: org1,
  },
];

const tasks = [
  {
    title: 'Setup Docker Compose with PostgreSQL',
    description: 'Configure multi-container environment for local development',
    status: 'done',
    priority: 'high',
    assignee: bob,
  },
  {
    title: 'Implement JWT authentication endpoints',
    description: 'POST /auth/register and POST /auth/login with bcrypt password hashing',
    status: 'doing',
    priority: 'high',
    assignee: alice,
  },
  {
    title: 'Design sprint board Kanban layout',
    description: 'Three columns (Todo/Doing/Done) with drag-and-drop support',
    status: 'todo',
    priority: 'medium',
    assignee: carol,
  },
  {
    title: 'Research WebSocket libraries for real-time updates',
    description: 'Compare Socket.io vs native WebSockets, document pros/cons',
    status: 'todo',
    priority: 'medium',
  },
];

const standups = [
  {
    user: alice,
    date: today,
    yesterday: 'Setup Prisma schema, created initial migrations, added seed data',
    today: 'Implement auth endpoints, write unit tests, integrate with frontend',
    blockers: null,
  },
  {
    user: bob,
    date: today,
    yesterday: 'Configured Docker Compose, added PostgreSQL service with health checks',
    today: 'Setup Nginx reverse proxy for HTTPS, test SSL certificates',
    blockers: 'Need clarification on password reset flow - does it require email verification?',
  },
];

const blockers = [
  {
    title: 'HTTPS not working in Docker container',
    description: `Getting "ERR_SSL_PROTOCOL_ERROR" when accessing https://localhost:3001.
    Self-signed certificate might not be trusted by browser. Need to investigate mkcert setup.`,
    raisedBy: bob,
    assignedTo: alice,
    status: 'open',
  },
];
```

### Benefits of Realistic Data

- ✅ Demo-ready from day 1
- ✅ Reveals UX issues (long names, edge cases)
- ✅ Evaluators see professional work
- ✅ Easier to develop (context makes sense)
- ✅ Better testing (real-world scenarios)

---

## 📊 Code Review Guidelines

### When to Request Review

- All PRs to `dev` or `main` require 1 approval
- Assign reviewer based on area:
  - Backend code → @Daniela
  - Frontend code → @Miguel
  - Shared types → @Daniela
  - Documentation → @Freddy

### How to Request Review

1. **Open PR with clear description:**
```markdown
## What
Implement POST /api/auth/register endpoint

## Why
Users need to create accounts

## How
- Added User model to Prisma schema
- Created AuthService with bcrypt password hashing
- Implemented validation using class-validator
- Added unit tests (80% coverage)

## Testing
- [x] Unit tests pass
- [x] Manual testing with Postman
- [x] Tested validation errors

## Screenshots
(If UI changes, add screenshots)
```

2. **Assign reviewer**
3. **Wait for feedback (max 24h)**
4. **Address comments**
5. **Merge after approval**

### How to Review Code

#### Checklist:

- [ ] Does it match the API contract?
- [ ] Are TypeScript types correct? (no `any`)
- [ ] Is code formatted? (Prettier)
- [ ] Are variable names clear?
- [ ] Is there error handling?
- [ ] Are there tests? (if applicable)
- [ ] No console.logs left in code?
- [ ] No commented-out code?

#### Feedback Style:

✅ **GOOD (Constructive):**
```markdown
Consider using `useMemo` here to avoid recalculating on every render:
```typescript
const filteredTasks = useMemo(
  () => tasks.filter(t => t.status === 'done'),
  [tasks]
);
```

Why did you choose bcrypt over argon2? Just curious about the tradeoff.

Looks good overall! Just two minor suggestions above.
```

❌ **BAD (Not constructive):**
```markdown
This is wrong.

You should know this already.

Did you even test this?
```

#### Response Times:

- **Non-urgent:** Within 24 hours
- **Urgent (marked in Discord):** Within 3 hours
- **Blocking deploy:** Within 1 hour

---

## 🚀 Deployment Checklist

### Before Merging to Main:

- [ ] All tests pass locally
- [ ] Code is formatted (Prettier)
- [ ] No TypeScript errors
- [ ] No console.logs or debugger statements
- [ ] ENV variables documented in .env.example
- [ ] README updated if needed
- [ ] PR approved by reviewer
- [ ] Tested in Docker environment

### Docker Compose Health Check:

```bash
# Test full stack
docker-compose up --build

# Check services
docker-compose ps

# Should see:
# async-scrum-frontend   Up   5173/tcp
# async-scrum-backend    Up   3001/tcp
# async-scrum-db         Up   5432/tcp (healthy)

# Test endpoints
curl http://localhost:3001/health
# Expected: {"status":"ok"}

# Test frontend
open http://localhost:5173
# Should load without errors

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

---

## 📞 Communication Best Practices

### Daily Async Standups (Discord)

Post by 12 AM your timezone:
```
📅 Jan 15, 2024 - Miguel

Yesterday:
- ✅ Implemented Button and Input components
- ✅ Setup Tailwind dark mode
- 🔄 Started work on LoginForm (70% done)

Today:
- 🎯 Finish LoginForm component
- 🎯 Integrate with auth API
- 🎯 Add form validation with Zod

Blockers:
- ⚠️ Need API contract for /auth/login endpoint (@Daniel)

Mood: 🚀 (excited to see login working!)
```

### When to Use Discord

- ✅ Daily standups
- ✅ Quick questions ("Where is the Button component?")
- ✅ Blockers ("Stuck on TypeScript error")
- ✅ Announcements ("Auth endpoints ready!")
- ✅ Demos ("Check out the new design!")

### When to Use GitHub

- ✅ Code reviews
- ✅ Bug reports (create issue)
- ✅ Feature requests (create issue)
- ✅ Technical discussions (in PR comments)
- ✅ Documentation changes

### Response Time Expectations

| Type | Response Time | Example |
|------|---------------|---------|
| Urgent (production down) | 1 hour | "Database not connecting" |
| Blocker (can't work) | 3 hours | "Need API contract to continue" |
| Question (not blocking) | 24 hours | "How should we handle errors?" |
| PR review | 24 hours | "Please review my login PR" |
| General discussion | 48 hours | "Should we use Redux or Context?" |

---

## ✅ Quality Checklist (Recommended)

Before considering ANY task "done":

### Code Quality:
- [ ] TypeScript types are correct (no `any`)
- [ ] Code is formatted (Prettier auto-format)
- [ ] ESLint shows no errors
- [ ] No unused imports or variables
- [ ] No console.logs (use proper logging if needed)
- [ ] Error handling implemented
- [ ] Edge cases considered

### Testing:
- [ ] Works in development environment
- [ ] Works in Docker environment
- [ ] Manual testing performed
- [ ] Unit tests added (if applicable)
- [ ] Integration tested with other features

### Documentation:
- [ ] Code is self-documenting (clear variable names)
- [ ] Complex logic has comments
- [ ] API changes documented
- [ ] README updated if needed
- [ ] Types added to /shared if needed

### Git:
- [ ] Atomic commits (one logical change per commit)
- [ ] Clear commit messages (feat/fix/docs format)
- [ ] Pushed to correct branch
- [ ] PR description is clear
- [ ] Assigned correct reviewer

### User Experience:
- [ ] Loading states shown
- [ ] Error messages are helpful
- [ ] Success feedback provided
- [ ] Keyboard accessible (if UI)
- [ ] Mobile responsive (if UI)
- [ ] Dark mode works (if UI)

---

## 🎉 Summary

These practices ensure:

✅ **Fast development** - Frontend/backend work in parallel
✅ **Fewer bugs** - TypeScript catches issues early
✅ **Easy collaboration** - Clear boundaries, no conflicts
✅ **Professional quality** - Code evaluators expect
✅ **Remote-friendly** - Async-first, clear communication

**Remember:** These aren't bureaucracy, they're tools to help us ship faster and better. 🚀

**Questions?** Ask in Discord! We're a team.
