*This project has been created as part of the 42 curriculum by miguandr, dtorrett, mrabelo-, afoth.*

---

# Async Scrum Hub

A web-based asynchronous Scrum collaboration platform designed to help small remote teams coordinate their work without relying on constant synchronous meetings. The platform provides structured tools for task management, daily standups, and blocker tracking — all in an asynchronous-first environment.

---

## Table of Contents

1. [Description](#description)
2. [Instructions](#instructions)
3. [Team Information](#team-information)
4. [Project Management](#project-management)
5. [Technical Stack](#technical-stack)
6. [Database Schema](#database-schema)
7. [Features List](#features-list)
8. [Modules](#modules)
9. [Individual Contributions](#individual-contributions)
10. [Resources](#resources)

---

## Description

**Async Scrum Hub** is a project management tool built around Scrum methodology. Teams create an organization, define their roles (Scrum Master, Product Owner, Developer), and manage their work through tickets, tasks, daily standups, and blocker reports — all without needing to be online at the same time.

**Key features:**
- Role-based organization management with invite codes
- Ticket and task tracking with status workflows
- Async daily standup submissions (auto-filled from previous day)
- Blocker reporting linked to tickets and team members
- Analytics dashboard with weekly progress charts
- Real-time updates via WebSocket for collaborative work
- Drag & drop interface for ticket and task management
- Full Privacy Policy and Terms of Service pages

---

## Instructions

### Prerequisites

- Docker and Docker Compose installed
- Git
- A `.env` file configured (see `.env.example`)

### Setup

```bash
# 1. Clone the repository
git clone git@vogsphere.42berlin.de:vogsphere/intra-uuid-7c27db9d-0748-4b59-8df4-b02b1c4c8715-7248977-dtorrett

# 2. Start the full stack
cd async-scrum-hub
make up
```

The application will be available at:
- **Application:** `https://localhost:8443`
- **API Docs (Swagger):** `https://localhost:8443/docs`

> The browser will warn about a self-signed certificate on first visit — click **Advanced → Proceed** to continue.

### Environment Variables

| Variable                      | Description
|-------------------------------|------------------------------------
| `DATABASE_URL`                | PostgreSQL connection string
| `SECRET_KEY`                  | JWT signing secret key
| `ALLOWED_ORIGINS`             | CORS allowed origins (frontend URL)

---

## Team Information

| Member      | 42 Login   | Role(s)                   |
|-------------|------------|---------------------------|
| Daniela     | `dtorrett` | Tech Lead · Developer     |
| Miguel      | `miguandr` | Product Owner · Developer |
| Maria Luiza | `mrabelo-` | Scrum Master · Developer  |
| Freddy      | `afoth`    | Developer                 |


### Responsibilities

**Daniela — Tech Lead & Backend Architecture**
Defined and maintained the overall backend architecture. Responsible for the FastAPI entrypoint, database foundation, API infrastructure (authorization system, dependency injection, permission model, configuration), auth, users, dashboard and analytics backend domains and all architecture documentation.

**Miguel — Product Owner & Frontend**
Defined product vision and feature priorities. Organized team meetings. Owns the frontend application: all page features, component design system, API client integration, and UI/UX implementation.

**Freddy — Developer & Backend Feature Domains**
Implemented the organizations, task and tickets backend domains.

**Maria Luiza — Scrum Master & DevOps**
Facilitated team coordination and tracked progress. Implemented the standups and blockers backend domains, real-time infrastructure, and owned Docker/docker-compose setup and deployment configuration.

---

## Project Management

**Work organization:** Work was divided by backend domains and frontend features. Each team member owned specific modules end-to-end (model → service → routes → tests).

**Branching strategy:**
- `main` — demo-ready only
- `dev` — integration branch
- `feat/<name>` — feature branches, merged via Pull Request into `dev`

**Tools used:**
- GitHub for version control and Pull Requests
- Slack for async communication and quick syncs
- Monday.com for sprint planning reference and feature benchmarking
- Weekly syncs to review blockers and priorities

**API-first approach:** Backend defined all API contracts (`docs/API_CONTRACTS.md`) before implementation. Frontend built against the contracts to enable parallel development.

---

## Technical Stack

### Frontend
| Technology            | Purpose
|-----------------------|---------------------------
| React 19 + TypeScript | UI framework
| Vite                  | Build tool and dev server
| Tailwind CSS          | Utility-first styling
| React Router          | Client-side navigation
| Recharts              | Analytics charts
| Lucide-react          | Icons
| WebSocket API         | Real-time updates

### Backend
| Technology       | Purpose
|------------------|------------------------------------------
| Python 3.12      | Runtime
| FastAPI          | Web framework (async, typed, auto-docs)
| SQLAlchemy       | ORM (database models and queries)
| Alembic          | Database migrations
| Pydantic         | Request/response validation and schemas
| python-jose      | JWT token creation and verification
| passlib + bcrypt | Password hashing

### Database
**PostgreSQL** — chosen for its strong relational model, UUID support, enum types, and ARRAY columns (used for `standup.blocker_ids`).

### Infrastructure
| Technology              | Purpose
|-------------------------|------------------------------------------------
| Docker + Docker Compose | Containerization and single-command deployment
| Nginx                   | Reverse proxy

### Key Technical Decisions

**Domain-driven backend structure:** Each feature domain (auth, users, tickets, tasks, standups, blockers, analytics, dashboard) is fully self-contained with its own `routes.py`, `schemas.py`, and `service.py`. This reduces coupling and makes ownership explicit.

**JWT Bearer tokens for auth:** Stateless authentication that scales horizontally without session storage. Token contains user ID in the `sub` claim and is validated on every request.

**Authorization as infrastructure:** A reusable `authorize()` function and `PERMISSIONS` dictionary centralize all permission logic. Any new endpoint declares its action string; the system handles admin override, role checks, ownership, and assignee checks automatically.

**API-first development:** All endpoints and data shapes were documented before implementation, enabling frontend and backend to work in parallel without blocking each other.

---

## Database Schema

```
users
  id (UUID PK) | email | name | password_hash | avatar_url
  organization_id (FK → organizations, nullable)
  org_role (admin | member, nullable)
  scrum_role (scrum_master | product_owner | developer, nullable)
  created_at | updated_at

organizations
  id (UUID PK) | name | join_code (unique)
  created_by (FK → users)
  created_at | updated_at

tickets
  id (UUID PK) | title | description
  status (todo | in_progress | completed)
  priority (low | medium | high)
  organization_id (FK → organizations, CASCADE)
  created_by (FK → users, CASCADE)
  assignee_id (FK → users, SET NULL, nullable)
  created_at | updated_at

tasks
  id (UUID PK) | title | description
  status (in_progress | completed)
  ticket_id (FK → tickets, CASCADE)
  organization_id (FK → organizations, CASCADE)
  created_by (FK → users, CASCADE)
  assignee_id (FK → users, SET NULL, nullable)
  created_at | updated_at

standups
  id (UUID PK) | today (text) | yesterday (text, nullable)
  blocker_ids (UUID[], nullable)
  standup_date (date)
  organization_id (FK → organizations, CASCADE)
  created_by (FK → users, CASCADE)
  created_at | updated_at
  UNIQUE (organization_id, created_by, standup_date)

blockers
  id (UUID PK) | description (text)
  status (open | resolved)
  ticket_id (FK → tickets, CASCADE)
  organization_id (FK → organizations, CASCADE)
  created_by (FK → users, CASCADE)
  assignee_id (FK → users, SET NULL, nullable)
  resolved_at (nullable) | created_at | updated_at
```

**Key relationships:**
- A user belongs to one organization (nullable until they join or create one)
- Tickets belong to an organization and contain tasks
- Blockers must be linked to a ticket
- Standups are unique per user per day per organization
- Deleting a ticket cascades to its tasks and blockers

---

## Features List

> **Frontend implementation for all features: Miguel.** The Backend Owner column below refers to the backend domain author only.

### Authentication
| Feature           | Description                              | Backend Owner |
|-------------------|------------------------------------------|---------------|
| User registration | Email + password signup with validation  | Daniela       |
| User login        | JWT token returned on success            | Daniela       |
| Protected routes  | All resource endpoints require valid JWT | Daniela       |

### User Profile
| Feature          | Description                                | Backend Owner |
|------------------|--------------------------------------------|---------------|
| View own profile | `GET /users/me` returns current user data  | Daniela       |
| Update profile   | Name and email editable                    | Daniela       |
| Upload avatar    | Image file upload with server-side storage | Daniela       |

### Organizations
| Feature             | Description                                  | Backend Owner |
|---------------------|----------------------------------------------|---------------|
| Create organization | Any user can create an org and becomes admin | Freddy        |
| Join by code        | Users join via a unique join_code            | Freddy        |
| View members        | List all members with their roles            | Freddy        |
| Invite member       | Admin can add users by email                 | Freddy        |
| Remove member       | Admin can remove members                     | Freddy        |
| Role selection      | Users select their scrum role on join        | Freddy        |

### Tickets
| Feature       | Description                                         | Backend Owner |
|---------------|-----------------------------------------------------|---------------|
| Create ticket | Scrum Master / Product Owner can create             | Freddy        |
| List tickets  | All members can view with status/priority           | Freddy        |
| Update ticket | Edit title, description, priority                   | Freddy        |
| Move ticket   | Status transitions (todo → in_progress → completed) | Freddy        |
| Delete ticket | Cascades to associated tasks                        | Freddy        |

### Tasks
| Feature     | Description                               | Backend Owner |
|-------------|-------------------------------------------|---------------|
| Create task | Any org member can create within a ticket | Freddy        |
| List tasks  | Filter by status                          | Freddy        |
| Update task | Edit title, description, assignee, status | Freddy        |
| Delete task | Owner or admin only                       | Freddy        |

### Standups
| Feature             | Description                                | Backend Owner |
|---------------------|--------------------------------------------|---------------|
| Submit standup      | One per user per day per org               | Maria Luiza   |
| Auto-fill yesterday | Previous day's "today" becomes "yesterday" | Maria Luiza   |
| Auto-link blockers  | Open blockers automatically attached       | Maria Luiza   |
| List standups       | All org members can view team standups     | Maria Luiza   |
| Update standup      | Editable only on creation day              | Maria Luiza   |

### Blockers
| Feature         | Description                                 | Backend Owner |
|-----------------|---------------------------------------------|---------------|
| Create blocker  | Any member can raise a blocker              | Maria Luiza   |
| List blockers   | Filter by status (open/resolved)            | Maria Luiza   |
| Update blocker  | Edit description, assignee, linked ticket   | Maria Luiza   |
| Resolve blocker | Irreversible; records resolved_at timestamp | Maria Luiza   |

### Dashboard
| Feature        | Description                                                               | Backend Owner |
|----------------|---------------------------------------------------------------------------|---------------|
| Summary cards  | Current user's tasks in progress, completed tickets, and active blockers  | Daniela       |
| Activity feed  | Up to 6 most recent task/ticket created or completed events in the org    | Daniela       |

### Analytics
| Feature                | Description                                  | Backend Owner |
|------------------------|----------------------------------------------|---------------|
| Task chart             | Weekly active vs resolved tasks (line chart) | Daniela       |
| Ticket chart           | Weekly completed tickets (bar chart)         | Daniela       |
| Standup stats          | Participation rate (posted / total possible) | Daniela       |
| Blocker avg cycle time | Average days from open to resolved           | Daniela       |

### Team Workload Info *(Custom Minor — Module 10, frontend only)*
| Feature                  | Description                                                                          | Owner         |
|--------------------------|--------------------------------------------------------------------------------------|---------------|
| Per-member workload view | Expandable list of each member's assigned tickets, active tasks, and open blockers   | Miguel (FE)   |
| Team-wide stat cards     | Totals across tickets, tasks, and blockers for the entire org                        | Miguel (FE)   |
| Live updates             | Workload counts update in real time via WebSocket without page refresh               | Miguel (FE)   |

### Legal
| Feature          | Description                              | Backend Owner |
|------------------|------------------------------------------|---------------|
| Privacy Policy   | Full policy page, accessible from footer | Daniela       |
| Terms of Service | Full terms page, accessible from footer  | Daniela       |

---

## Modules

**Total: 16 points** (required minimum: 14)

| #  | Type           | Module                                                  |Pts| Owner       |
|----|----------------|---------------------------------------------------------|---|-------------|
| 1  | Minor          | Use a frontend framework (React + TypeScript)           | 1 | Miguel      |
| 2  | Minor          | Use a backend framework (FastAPI)                       | 1 | Daniela     |
| 3  | Minor          | Custom design system (10+ reusable components)          | 1 | Miguel      |
| 4  | Major          | Real-time features via WebSocket                        | 2 | Maria Luiza |
| 5  | Major          | Public documented API (REST, JWT-secured, 5+ endpoints) | 2 | Daniela     |
| 6  | Minor          | ORM for database (SQLAlchemy)                           | 1 | Daniela     |
| 7  | Major          | Standard user management and authentication             | 2 | Daniela     |
| 8  | Major          | Advanced permissions system (RBAC)                      | 2 | Daniela     |
| 9  | Minor          | User activity analytics and insights dashboard          | 1 | Daniela     |
| 10 | Minor (Custom) | Team workload visibility and capacity overview          | 1 | Miguel      |
| 11 | Minor (Custom) | Drag & Drop state management system                     | 1 | Miguel      |
| 12 | Minor (Custom) | Organization system                                     | 1 | Freddy      |

### Module Details

**Module 1 — Use a frontend framework (React + TypeScript)**
The frontend is built with React 19 and TypeScript, using Vite as the build tool. The application is a fully client-side SPA with client-side routing via React Router, typed API calls, and component-level state management with React hooks.

**Module 2 — Use a backend framework (FastAPI)**
The backend is built with FastAPI, a modern Python web framework that provides automatic OpenAPI documentation, async support, dependency injection, and Pydantic-based request/response validation. FastAPI is the backend counterpart to the frontend React framework claimed in Module 1.

**Module 3 — Custom design system (10+ reusable components)**
A custom component library lives in `frontend/src/components/custom/` and includes: `Avatar`, `Badge`, `Button`, `Modal`, `PageHeader`, `StatCard`, `Spinner`, `Input`, `Select`, `Textarea`, and more. Each component has typed props and a consistent visual language (color palette, typography, spacing) built on top of Tailwind CSS.

**Module 4 — Real-time features via WebSocket**
The WebSocket server is implemented in FastAPI and handles authenticated connections — each client must present a valid JWT to establish the connection. Connections are scoped to the user's organization, ensuring members of different organizations never receive each other's events. The server broadcasts events across all major domains: tickets (`created`, `updated`, `moved`, `deleted`), tasks (`created`, `updated`, `deleted`), blockers (`created`, `updated`, `resolved`), and standups (`created`, `updated`). Client disconnections are handled gracefully, and the frontend reconnects automatically on network interruptions.

**Module 5 — Public documented API**
The REST API is documented in `docs/API_CONTRACTS.md` and exposed via Swagger at `/docs`. All endpoints require JWT Bearer token authentication. Covers 5+ resource types with full CRUD: organizations, tickets, tasks, standups, blockers, analytics, users.

**Module 6 — ORM for database (SQLAlchemy)**
The database layer is implemented using SQLAlchemy 2.0 as the ORM. All models (User, Organization, Ticket, Task, Standup, Blocker) are defined as Python classes with typed columns and relationships. Alembic handles all schema migrations.

**Module 7 — Standard user management and authentication**
Users can register with email and password, log in, update their profile (name, email), and upload a custom avatar. Passwords are hashed with bcrypt and salted before storage — plaintext passwords are never persisted. Authentication uses stateless JWT Bearer tokens: the token contains the user ID in the `sub` claim and is validated on every protected request. Avatar uploads are validated server-side for file type (JPEG, PNG, GIF, WebP) and size (max 5 MB), and the image is resized and normalized before storage. Profile data including avatar URL is returned on `GET /users/me`.

**Module 8 — Advanced permissions system (RBAC)**
Two-tier role system: organization role (`admin` | `member`) and scrum role (`scrum_master` | `product_owner` | `developer`). Permissions are centrally defined per action and evaluated in order: admin override → role check → ownership check → assignee check. See `docs/PERMISSIONS_MATRIX.md` for the full matrix.

**Module 9 — User activity analytics and insights dashboard**
The analytics endpoint aggregates the last 4 weeks of data across tasks, tickets, standups, and blockers. Returns structured data consumed by interactive charts in the frontend. Data is scoped to the user's organization.

**Module 10 — Team workload visibility and capacity overview (Custom Minor)**
The Info page provides a dedicated operational dashboard for team capacity awareness. Each member's assigned tickets (with status), active tasks, and open blockers are displayed in an expandable per-member view, aggregated from three separate domains into a single unified interface. Team-wide totals are shown in stat cards at the bottom. The view updates in real time via WebSocket — as tickets are moved or tasks are updated, the workload counts reflect the changes instantly without a page refresh. This is distinct from the analytics dashboard (Module 9), which covers historical trends over time; this module covers current workload state per person, supporting the Scrum Master and Product Owner in identifying who is overloaded and where blockers are concentrated. Implemented as a single component (~420 lines) with full test coverage (~1200 lines, 40+ test cases).

**Module 11 — Drag & Drop system (Custom Minor)**
The sprint board supports drag-and-drop to move tickets and tasks between columns (status states). Visual feedback (hover states, drop zones) provides clear affordances. Permission checks are enforced server-side before any state change is persisted. Chosen because it directly improves collaborative usability — especially for daily standups and sprint planning — and requires non-trivial real-time synchronization across connected clients.

**Module 12 — Organization system (Custom Minor)**
Users can create an organization — which makes them admin — or join an existing one using a unique auto-generated join code. Admins can invite members by email: the backend sends an SMTP email containing the join code, with both plain-text and HTML versions. On join, users select their scrum role (Scrum Master, Product Owner, or Developer), which drives permission checks throughout the application. Admins can remove members at any time. All resources (tickets, tasks, standups, blockers) are fully scoped to an organization, ensuring complete data isolation between teams.

---

## Individual Contributions

### Daniela — Tech Lead & Backend Architecture
- Designed overall backend architecture (domain-driven structure, authorization model).
- Implemented `config/settings.py`, `config/security.py`.
- Built database foundation: `session.py`, `base.py`, all core models (`user.py`, `organization.py`).
- Implemented full API infrastructure: `deps.py`, `permissions.py`, `authorize.py`, `routes.py`.
- Implemented `dashboard/` domain.
- Implemented `analytics/` domain.
- Implemented `auth/` domain (register, login, JWT) 
- Implemented `users/` domain (profile, avatar).
- Built database models: `user.py`, `organization.py`.
- Wrote backend tests for dashboard, analytics, auth and users domains
- Wrote and maintained all architecture documentation (`ARCHITECTURE.md`, `API_CONTRACTS.md`, `AUTHORIZATION_MODEL.md`, `PERMISSIONS_MATRIX.md`, `DEVELOPMENT_STANDARDS.md`).
- Set up Alembic migrations.

### Miguel — Product Owner & Frontend
- Defined product vision, feature priorities, and acceptance criteria.
- Built and maintained the entire frontend platform.
- Developed auth infrastructure with token management, protected routes and auto-logout.
- Built all feature pages: auth flow, dashboard, sprint board, standups, blockers, analytics, info.
- Implemented role-based permissions in UI.
- Designed and built the custom component design system library (`components/custom/`).
- Implemented full API client layer (`services/api.ts`) with typed request functions covering 7 domains.
- Defined the entire type system (`types/api.types.ts`).
- Maintained frontend tooling (Vite, TypeScript config, ESLint).
- Built drag & drop, ticket, task and blocker CRUD, real-time sync interface on the sprint board.
- Built the Team Workload Info page: per-member expandable view aggregating tickets, tasks, and blockers with live WebSocket updates.

### Freddy — Developer
- Implemented `organizations/` domain (create, join, member management).
- Implemented `tickets/` domain (CRUD, status transitions, priority).
- Implemented `tasks/` domain.
- Built database models: `ticket.py`, `task.py`.
- Wrote backend tests for organizations, task and tickets domains.

### Maria Luiza — Scrum Master & DevOps
- Facilitated team coordination and tracked progress.
- Implemented `standups/` domain (create, auto-fill, update, list).
- Implemented `blockers/` domain (create, update, resolve).
- Built database models: `standup.py`, `blocker.py`.
- Implemented real-time WebSocket server (`realtime/`).
- Owned Docker setup: `Dockerfile`, `docker-compose.yml`.
- Maintained `docs/DOCKER_SETUP.md`.
- Wrote backend tests for standups and blockers.

---

## Resources

### Documentation
- [FastAPI](https://fastapi.tiangolo.com/) — Backend framework
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/) — ORM
- [React](https://react.dev/) — Frontend framework
- [TypeScript](https://react.dev/learn/typescript)
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [Recharts](https://recharts.org/) — Charting library
- [Pydantic](https://docs.pydantic.dev/) — Data validation
- [python-jose](https://python-jose.readthedocs.io/) — JWT implementation
- [Alembic](https://alembic.sqlalchemy.org/) — Database migrations

### How AI was used

AI (Claude by Anthropic) was used throughout the project as a development assistant, not as a code generator. Specifically:

- **Code review and debugging:** Identifying root causes of failing tests (e.g., SQLAlchemy enum binding behavior with SQLite in test environments) and analyzing error messages.
- **Documentation review:** Cross-checking documentation files (`API_CONTRACTS.md`, `PERMISSIONS_MATRIX.md`, `AUTHORIZATION_MODEL.md`) against actual implemented code to find and fix inconsistencies.
- **Architecture validation:** Confirming that implemented authorization logic matched the documented authorization model.
- **Test analysis:** Understanding why specific test cases failed and what the fix should be, without having AI write the fix directly.

All generated or suggested content was reviewed, understood, and validated by team members before being used. Code explanations were discussed in team reviews.
