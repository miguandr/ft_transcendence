# Team Tasks by Member

This document summarizes responsibilities per member based on the current project architecture and folder ownership.

## Daniela (✨) — Backend Architecture & Core Infrastructure
  - `__init__.py`, `session.py`, `base.py`.
  - Core models: `user.py`, `organization.py`, `membership.py`.
  - `router.py`, `deps.py`, `permissions.py`, `authorize.py`.
  - `routes.py`, `schemas.py`, `service.py`.
  - `routes.py`, `schemas.py`, `service.py`.
  - `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/AUTHORIZATION_MODEL.md`, `docs/PERMISSIONS_MATRIX.md`, `docs/DEVELOPMENT_STANDARDS.md`.
## Daniela (✨) — Backend Architecture & Core Infrastructure
- Define and evolve overall backend architecture decisions.
- Maintain the FastAPI entrypoint at `backend/src/main.py`.
- Manage backend configuration in `backend/src/config/` (`settings.py`, `security.py`).
- Build and maintain the database foundation in `backend/src/database/`:
  - `__init__.py`, `session.py`, `base.py`.
  - Core models: `user.py`, `organization.py`, `membership.py`.
- Implement and maintain API infrastructure in `backend/src/api/`:
  - `router.py`, `deps.py`, `permissions.py`, `authorize.py`.
- Implement and maintain the auth domain base in `backend/src/auth/`:
  - `routes.py`, `schemas.py`, `service.py`.
- Implement and maintain the users domain base in `backend/src/users/`:
  - `routes.py`, `schemas.py`, `service.py`.
- Maintain backend docs and standards:
  - `docs/ARCHITECTURE.md`, `docs/API_CONTRACTS.md`, `docs/AUTHORIZATION_MODEL.md`, `docs/PERMISSIONS_MATRIX.md`, `docs/DEVELOPMENT_STANDARDS.md`.
- Maintain `.gitignore` and the root `README.md` structure.
- Set up Alembic (initial) and base testing scaffolding.

- Owns implementation for organizations domain in `backend/src/organizations/`:
- Owns implementation for tickets domain in `backend/src/tickets/`:
## Freddy (🚀) — Backend Feature Domains
- Implement the organizations domain in `backend/src/organizations/`:
  - `routes.py`, `schemas.py`, `service.py`.
- Implement the tickets domain in `backend/src/tickets/`:
  - `routes.py`, `schemas.py`, `service.py`.
- Implement the tasks domain in `backend/src/tasks/` (shared with Malu).
- Build and maintain database models for `ticket.py` and `task.py`.
- Write and maintain feature tests under `backend/tests/` for assigned domains.
- Contributes to feature tests under `backend/tests/` for assigned domains.
## Malu (🌊) — Backend Features, Real-Time, and Docker
  - `routes.py`, `schemas.py`, `service.py`.
- Owns database models for `standup.py` and `blocker.py`.
## Malu (🌊) — Backend Features, Real-Time, and Docker
- Implement the standups domain in `backend/src/standups/`:
  - `routes.py`, `schemas.py`, `service.py`.
- Implement the blockers domain in `backend/src/blockers/`:
  - `routes.py`, `schemas.py`, `service.py`.
- Implement the tasks domain in `backend/src/tasks/` (shared with Freddy).
- Build and maintain database models for `standup.py` and `blocker.py`.
- Maintain real-time docs and events under `realtime/`:
  - `README.md`, `events.md`.
- Maintain the root Dockerfile in `backend/Dockerfile` and `docker-compose.yml`.
- Write and maintain feature tests under `backend/tests/` for assigned domains.
- Owns root Dockerfile in `backend/Dockerfile` and `docker-compose.yml`.
## Miguel (🎨) — Frontend
- Owns frontend application in `frontend/`.
- Owns UI and UX work in `frontend/src/`:
  - `components/ui/` and `components/layout/`.
## Miguel (🎨) — Frontend
- Build and maintain the frontend application in `frontend/`.
- Design and implement UI/UX in `frontend/src/`:
  - `features/` (auth, organizations, tickets, tasks, standups, blockers).
  - `components/ui/` and `components/layout/`.
  - `services/`, `hooks/`, `styles/`, `main.tsx`.
- Maintain frontend build/dev tooling:
  - `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`.
- Maintain frontend docs in `frontend/docs_frontend/`.
- Maintains frontend build/dev tooling:
# Team Tasks Checklist

Single checklist per member, based on the project guide and current repo structure.

## Daniela (✨) — Backend Architecture & Core Infrastructure
- [ ] Verify required software versions and install VS Code extensions.
- [ ] Set up GitHub SSH key, confirm repo access, and pull latest `dev`.
- [ ] Define and evolve backend architecture decisions.
- [ ] Maintain FastAPI entrypoint at `backend/src/main.py`.
- [ ] Configure backend settings in `backend/src/config/` (`settings.py`, `security.py`).
- [ ] Build and maintain database foundation in `backend/src/database/` (`__init__.py`, `session.py`, `base.py`, core models).
- [ ] Maintain API infrastructure in `backend/src/api/` (`router.py`, `deps.py`, `permissions.py`, `authorize.py`).
- [ ] Implement and maintain auth and users domains (`backend/src/auth/`, `backend/src/users/`).
- [ ] Keep architecture and policy docs current in `docs/`.
- [ ] Maintain Alembic setup and base testing scaffolding.
- [ ] Ensure Week 1 success criteria: docker-compose runs, changes pushed, contracts/types accessible, team unblocked.

## Freddy (🚀) — Backend Feature Domains
- [ ] Verify required software versions and install VS Code extensions.
- [ ] Set up GitHub SSH key, confirm repo access, and pull latest `dev`.
- [ ] Implement organizations domain in `backend/src/organizations/`.
- [ ] Implement tickets domain in `backend/src/tickets/`.
- [ ] Implement tasks domain in `backend/src/tasks/` (shared with Malu).
- [ ] Build and maintain database models for `ticket.py` and `task.py`.
- [ ] Write and maintain feature tests under `backend/tests/` for assigned domains.
- [ ] Maintain user stories and acceptance criteria.
- [ ] Ensure Week 1 success criteria: docker-compose runs, changes pushed, contracts/types accessible, team unblocked.

## Malu (🌊) — Backend Features, Real‑Time, and Docker
- [ ] Verify required software versions and install VS Code extensions.
- [ ] Set up GitHub SSH key, confirm repo access, and pull latest `dev`.
- [ ] Implement standups domain in `backend/src/standups/`.
- [ ] Implement blockers domain in `backend/src/blockers/`.
- [ ] Implement tasks domain in `backend/src/tasks/` (shared with Freddy).
- [ ] Build and maintain database models for `standup.py` and `blocker.py`.
- [ ] Maintain real‑time docs and events in `realtime/` (`README.md`, `events.md`).
- [ ] Maintain Docker setup (`backend/Dockerfile`, `docker-compose.yml`).
- [ ] Write and maintain feature tests under `backend/tests/` for assigned domains.
- [ ] Ensure Week 1 success criteria: docker-compose runs, changes pushed, contracts/types accessible, team unblocked.

## Miguel (🎨) — Frontend
- [ ] Verify required software versions and install VS Code extensions.
- [ ] Set up GitHub SSH key, confirm repo access, and pull latest `dev`.
- [ ] Build and maintain the frontend app in `frontend/`.
- [ ] Implement UI/UX in `frontend/src/` (feature screens, shared components, services, hooks, styles, `main.tsx`).
- [ ] Maintain frontend tooling (`package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`).
- [ ] Maintain frontend docs in `frontend/docs_frontend/`.
- [ ] Ensure Week 1 success criteria: docker-compose runs, changes pushed, contracts/types accessible, team unblocked.
