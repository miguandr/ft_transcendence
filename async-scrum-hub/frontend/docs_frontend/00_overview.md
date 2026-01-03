# Frontend overview

## Goal

ScrumHub is an async-scrum collaboration dashboard for distributed teams. The frontend provides UI for async standups, sprint visibility (kanban board), blocker tracking, lightweight analytics, and team health insights. It's implemented with Vite + React + TypeScript and Tailwind CSS. The product goal is to reduce meeting overhead while keeping teams aligned and visible on progress and blockers.

## Screens / Routes

- `/welcome` — Welcome (src/features/auth/Welcome.tsx)
- `/login` — Login (src/features/auth/Login.tsx)
- `/signup` — SignUp (src/features/auth/SignUp.tsx)
- `/role-selection` — RoleSelection (src/features/auth/RoleSelection.tsx)
- `/team-creation` — TeamCreation (src/features/auth/TeamCreation.tsx)
- `/team-join` — TeamJoin (src/features/auth/TeamJoin.tsx)
- `/` — Dashboard (src/features/dashboard/Dashboard.tsx)
- `/board` — Sprint Board (src/features/sprint_board/SprintBoard.tsx)
- `/standup` — Async Standup (src/features/standups/AsyncStandup.tsx)
- `/standup-empty` — Async Standup (empty) (src/features/standups/AsyncStandupEmpty.tsx)
- `/blockers` — Blockers (src/features/blockers/Blockers.tsx)
- `/blockers-empty` — Blockers (empty) (src/features/blockers/BlockersEmpty.tsx)
- `/analytics` — Analytics (src/features/analytics/Analytics.tsx)
- `/team-health` — Team Health (src/features/team_health/TeamHealth.tsx)

## Current data wiring status (mock vs wired)

All screens currently render local/static example data or manage client-side state. A codebase-wide search shows no direct HTTP (fetch/axios) or websocket/graphql calls in `src`, and many files include comments like "In a real app, this would create the account." Therefore, every screen is currently mock-driven and not wired to backend APIs:

- Auth screens: Mock (forms navigate locally; no API calls yet)
- Dashboard: Mock (hard-coded stats & updates)
- Sprint Board: Mock (local columns and tasks; create-ticket handled in component state)
- Async Standup: Mock (static standup data)
- Blockers: Mock (static list; actions are UI-only)
- Analytics: Mock (static chart data)
- Team Health: Mock (static signals & recommendations)

## Recommended next steps

1. Add `src/services/api.ts` as an API wrapper and centralize base URL via environment variables.
2. Wire authentication (login/signup) first; add token storage, protected routes, and error handling.
3. Implement feature services incrementally: tickets (sprint board), standups, blockers, analytics.
4. Add loading and error UI patterns (skeletons, toasts) and unit/integration tests for critical flows.
5. Improve project organization incrementally: create barrels for `components/ui` and `features`, co-locate feature components, and add `src/hooks` / `src/services` folders.

If you want, I can implement step 1 (create `src/services/api.ts`) and step 2 (wire Login/SignUp) now as a small, testable change.

