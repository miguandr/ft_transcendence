## User Onboarding & Team Model

Async Scrum Hub supports team-based collaboration.

During first-time signup:
- Users select a role (Scrum Master, Product Owner, Developer).
- Scrum Masters and Product Owners can either:
  - create a new team (generating a join code), or
  - join an existing team using a code.
- Developers must join an existing team using a join code.

A user is considered fully onboarded once:
- a role is selected, and
- the user belongs to a team.

After onboarding, users are redirected to the dashboard.

# Routing & Access Control

The application separates routes into:
- pre-auth routes (no layout)
- app routes (with sidebar and topbar)

Route access is determined by:
- authentication state
- role selection
- team assignment

# Onboarding Flow & Team Assignment

## User State Model

Each user has:
- role: null | SM | PO | DEV
- teamId: null | string

Onboarding is complete when:
- role !== null
- teamId !== null

## Role Selection Step

If role is null, the user is redirected to /role-selection.

## Team Assignment Step

If teamId is null:

- Developers:
  - must join a team using a join code

- Scrum Masters / Product Owners:
  - can create a new team (generates a join code), OR
  - join an existing team using a code

## Join Code Behavior

- A team has a unique joinCode.
- Entering a valid joinCode assigns the user to that team.
- Team membership is automatic and persistent.

## Returning Users

If a user already has:
- a role
- a teamId

They skip onboarding and are redirected directly to the dashboard.

## Guard Rules

1. If user is not authenticated → redirect to /login
2. If role is null → redirect to /role-selection
3. If teamId is null:
   - DEV → /team-join
   - SM/PO → /team-step
4. Otherwise → allow access to app routes
