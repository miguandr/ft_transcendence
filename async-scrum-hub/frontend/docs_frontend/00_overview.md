# Frontend Overview

## What is ScrumHub?

**ScrumHub** is an async-first scrum collaboration platform designed for distributed teams. It reduces meeting overhead by providing asynchronous standups, sprint visibility, blocker tracking, and team health monitoring—all without requiring everyone to be online at the same time.

### Core Features
- **Async Standups**: Team members submit daily updates on their schedule
- **Sprint Board**: Kanban-style task tracking with drag-and-drop functionality
- **Blocker Management**: Centralized visibility into team blockers and dependencies
- **Analytics Dashboard**: Sprint velocity, burndown charts, and completion metrics
- **Team Health**: Sentiment tracking and proactive recommendations

### Tech Stack
- **Build Tool**: Vite 7.2.4 (lightning-fast HMR and optimized builds)
- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Routing**: React Router v7 (client-side navigation)
- **Styling**: Tailwind CSS v4 (utility-first approach)
- **Icons**: lucide-react (1000+ SVG components)
- **Charts**: recharts (React-native data visualizations)

---

## Application Routes

### Authentication Flow (6 screens)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/welcome` | `Welcome.tsx` | Landing page with sign up / log in options |
| `/login` | `Login.tsx` | Email/password authentication |
| `/signup` | `SignUp.tsx` | New user registration |
| `/role-selection` | `RoleSelection.tsx` | Choose role (Admin, Member, etc.) |
| `/team-creation` | `TeamCreation.tsx` | Create a new team/organization |
| `/team-join` | `TeamJoin.tsx` | Join an existing team via invite |

### Main Application (8 screens)
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `Dashboard.tsx` | Home screen with sprint overview and updates |
| `/board` | `SprintBoard.tsx` | Kanban board for current sprint tasks |
| `/standup` | `AsyncStandup.tsx` | Daily standup submission and history |
| `/standup-empty` | `AsyncStandupEmpty.tsx` | Empty state for first-time standup |
| `/blockers` | `Blockers.tsx` | List of active blockers across team |
| `/blockers-empty` | `BlockersEmpty.tsx` | Empty state for blockers |
| `/analytics` | `Analytics.tsx` | Sprint metrics and team performance |
| `/team-health` | `TeamHealth.tsx` | Sentiment trends and team wellness |

**Total**: 14 screens (6 auth + 8 features)

---

## Data Integration Status

### Current State: Mock-Driven Development
All screens currently use **static data** or **local component state**. No real backend API calls exist yet.

| Feature Area | Status | Implementation |
|-------------|--------|----------------|
| **Authentication** | 🟡 Partial | Login form wired to mock API with JWT simulation |
| **Dashboard** | 🔴 Mock | Hard-coded stats and recent updates |
| **Sprint Board** | 🔴 Mock | Local state for columns and tasks |
| **Standups** | 🔴 Mock | Static standup entries |
| **Blockers** | 🔴 Mock | Static list, actions are UI-only |
| **Analytics** | 🔴 Mock | Hard-coded chart data |
| **Team Health** | 🔴 Mock | Static signals and recommendations |

### Next Steps for Backend Integration
1. ✅ **Login API** - Mock service created (`services/api.ts`) matching `API_CONTRACTS.md`
2. 🔲 **Complete Auth Flow** - Wire SignUp, RoleSelection, TeamCreation
3. 🔲 **Dashboard API** - Fetch real sprint stats and updates
4. 🔲 **Sprint Board API** - CRUD operations for tasks with WebSocket updates
5. 🔲 **Standups API** - Submit and retrieve standup entries
6. 🔲 **Blockers API** - Create, update, resolve blockers
7. 🔲 **Analytics API** - Pull metrics from backend (velocity, burndown)
8. 🔲 **Team Health API** - Submit sentiment and fetch trends

---

## Project Organization

```
frontend/src/
├── components/
│   ├── layout/         # Sidebar, TopBar (shared layout)
│   └── ui/             # 50+ reusable primitives (Button, Card, Dialog, etc.)
├── features/           # Feature-based modules
│   ├── auth/           # 6 authentication screens
│   ├── dashboard/      # Home dashboard
│   ├── sprint_board/   # Kanban board
│   ├── standups/       # Async standup screens
│   ├── blockers/       # Blocker tracking
│   ├── analytics/      # Charts and metrics
│   └── team_health/    # Team wellness
└── services/
    └── api.ts          # Mock API layer (JWT auth ready)
```

See `02_folder_structure.md` for complete directory tree.

---

## Development Progress

### Completed ✅
- [x] Vite + React + TypeScript scaffold
- [x] Tailwind CSS integration
- [x] React Router setup with all 14 routes
- [x] 50+ UI primitives (shadcn/ui style components)
- [x] All 14 screens designed and rendered
- [x] Mock API service with JWT simulation
- [x] Login form with validation and error handling

### In Progress 🔄
- [ ] SignUp form with validation
- [ ] Backend API integration (replacing mocks)
- [ ] Extracting reusable components (Button, Card, Avatar)

### Planned 📋
- [ ] Unit tests (Vitest + Testing Library)
- [ ] E2E tests (Playwright)
- [ ] State management (Zustand or React Query)
- [ ] WebSocket integration for real-time updates
- [ ] Accessibility audit (ARIA labels, keyboard navigation)

---

## Documentation Index

| File | Purpose |
|------|---------|
| `00_overview.md` | This file - high-level project summary |
| `01_setup_and_tooling.md` | Vite setup, dependency installation, common errors |
| `02_folder_structure.md` | Complete directory tree and conventions |
| `05_ui_components.md` | Inventory of all UI primitives and usage tracking |
| `06_deps_and_why.md` | Explanation of every package.json dependency |
| `07_modules.md` | Feature module breakdowns (TBD) |
| `08_dev_log` | Daily work logs and progress notes |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Test Credentials** (mock API):
- Email: `miguel@example.com`
- Password: `password123`

