# User Onboarding & Team Model

This document explains how users sign up, join teams, and access the app based on their role and onboarding status.

---

## 📋 Core Concepts

### User Data Model

Every user has two critical fields that determine their onboarding status:

```typescript
{
  scrum_role: "scrum_master" | "product_owner" | "developer" | null,
  organization_id: uuid | null  // Their team/organization
}
```

### Organization (Team) Data Model

```typescript
{
  id: uuid,
  name: string,
  join_code: string,  // Shareable code like "ABC123"
  created_by: uuid    // User who created the team
}
```

### Onboarding Completion

A user is **fully onboarded** when both conditions are met:

- ✅ `scrum_role !== null` (they chose a role)
- ✅ `organization_id !== null` (they joined/created a team)

---

## 🚀 User Flows

### Flow A: New User (First Time)

Complete onboarding from scratch.

```
1. /signup
   └─> Create account with email/password

2. /role-selection
   └─> Choose: Scrum Master | Product Owner | Developer

3. Team Setup (depends on role chosen)
   │
   ├─> Developer
   │   └─> MUST go to /team-join
   │       └─> Enter join_code from SM/PO
   │       └─> Gets assigned to that organization
   │
   └─> Scrum Master / Product Owner
       └─> Goes to /team-creation
           ├─> Option 1: Create Team
           │   └─> Backend generates join_code + org_id
           │   └─> Share join_code with team
           │
           └─> Option 2: Join Existing Team
               └─> Enter join_code from another SM/PO
               └─> Gets assigned to that organization

4. Redirect to / (Dashboard)
   └─> User is now fully onboarded ✅
```

**Key Points**:

- **Developers** can only **join** teams (using a code from SM/PO)
- **SM/PO** can either **create** or **join** teams
- After step 3, user has both `scrum_role` and `organization_id` set

---

### Flow B: Returning User (Fully Onboarded)

User has already completed onboarding.

```
1. /login
   └─> Authenticate with email/password

2. Check onboarding status
   ├─> scrum_role !== null ✅
   └─> organization_id !== null ✅

3. Redirect to / (Dashboard)
   └─> Skip all onboarding steps
```

**Why it works**: Guards detect user already has role + team, so they go straight to the app.

---

### Flow C: Returning User (Incomplete Onboarding)

User started signup but didn't finish.

#### Case 1: Has account, no role

```
1. /login
   └─> Authenticated ✅

2. Check status
   ├─> scrum_role === null ❌
   └─> organization_id === null ❌

3. Force redirect to /role-selection
   └─> Must choose role before proceeding
```

#### Case 2: Has role, no team

```
1. /login
   └─> Authenticated ✅

2. Check status
   ├─> scrum_role !== null ✅ (e.g., "developer")
   └─> organization_id === null ❌

3. Force redirect based on role
   ├─> Developer → /team-join (must enter join_code)
   └─> SM/PO → /team-creation (create or join)
```

**Why it matters**: Prevents users from accessing the app without completing setup.

---

## 🛡️ Routing & Access Control

### Route Groups

#### Pre-Auth Routes (No Sidebar/TopBar)

Public or onboarding screens:

- `/welcome` - Landing page
- `/login` - Authentication
- `/signup` - New account creation
- `/role-selection` - Choose scrum role
- `/team-creation` - Create or join team (SM/PO)
- `/team-join` - Join team with code (Developers)

#### App Routes (With Sidebar + TopBar Layout)

Protected feature screens:

- `/` - Dashboard (sprint overview)
- `/board` - Sprint Board (kanban)
- `/standup` - Async Standup submission
- `/standup-empty` - Empty state
- `/blockers` - Blocker tracking
- `/blockers-empty` - Empty state
- `/analytics` - Sprint metrics
- `/team-health` - Team wellness

---

## 🔐 Guard Rules (Enforcement Logic)

These rules must be enforced to control access:

### 1. Authentication Check

```typescript
if (!isAuthenticated) {
	redirect("/login");
}
```

**Triggers**: Any app route when not logged in

---

### 2. Role Check

```typescript
if (isAuthenticated && scrum_role === null) {
	redirect("/role-selection");
}
```

**Triggers**: User logged in but hasn't chosen a role yet

---

### 3. Team Check

```typescript
if (isAuthenticated && scrum_role !== null && organization_id === null) {
	if (scrum_role === "developer") {
		redirect("/team-join");
	} else {
		redirect("/team-creation");
	}
}
```

**Triggers**: User has role but no team assigned

---

### 4. Full Access

```typescript
if (isAuthenticated && scrum_role !== null && organization_id !== null) {
	// Allow all app routes
	// User is fully onboarded ✅
}
```

---

## 📊 Visual Flow Diagram

```
┌─────────────┐
│   /welcome  │
└──────┬──────┘
       │
       ├─> /login ────┐
       │              │
       └─> /signup ───┤
                      │
                      ▼
              Is authenticated?
                   ├─ NO ──> Redirect to /login
                   │
                   └─ YES
                      │
                      ▼
              Has scrum_role?
                   ├─ NO ──> Redirect to /role-selection
                   │
                   └─ YES
                      │
                      ▼
           Has organization_id?
                   ├─ NO ──┐
                   │        ├─> Developer? → /team-join
                   │        └─> SM/PO? → /team-creation
                   │
                   └─ YES
                      │
                      ▼
              ┌──────────────┐
              │  / Dashboard │ ✅ Fully Onboarded
              └──────────────┘
```

---

## 🏗️ Current Implementation Status

### ✅ What's Built

- All 6 pre-auth screens designed and rendered
- All 8 app screens designed and rendered
- Path-based layout switching (Sidebar shown on app routes)
- Login form with validation and mock API

### 🔄 What's Next

- **Add authentication state management** (context or Zustand)
- **Implement guard rules** (check `scrum_role` and `organization_id`)
- **Wire backend APIs** for signup, role selection, team creation/join
- **Store user data** in context/state after login
- **Add protected route wrapper** component

### 📝 Current Limitation

Right now, layout decision is **path-based**, not **state-based**:

```typescript
// Current (App.tsx)
const preAuthPaths = ["/welcome", "/login", "/signup", ...];
const showLayout = !preAuthPaths.includes(location.pathname);
```

This works visually but **doesn't enforce guards**. A user could manually navigate to `/dashboard` without being authenticated.

**Next step**: Replace with state-based guards once auth state exists.

---

## 💡 Implementation Checklist

When implementing guards:

- [ ] Create auth context or store
- [ ] Store `scrum_role` and `organization_id` after login
- [ ] Create `ProtectedRoute` wrapper component
- [ ] Apply guard rules (1-4) in order
- [ ] Redirect incomplete users to appropriate onboarding step
- [ ] Test all flows (new user, returning user, incomplete)
- [ ] Add loading state while checking auth status

**Example Protected Route**:

```typescript
function ProtectedRoute({ children }) {
  const { isAuthenticated, scrum_role, organization_id } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!scrum_role) return <Navigate to="/role-selection" />;
  if (!organization_id) {
    if (scrum_role === "developer") return <Navigate to="/team-join" />;
    return <Navigate to="/team-creation" />;
  }

  return children;
}
```

---

## 🎯 Key Takeaways

1. **Two fields determine access**: `scrum_role` and `organization_id`
2. **Developers can only join** teams (not create)
3. **SM/PO can create or join** teams
4. **Guards run in order**: Auth → Role → Team
5. **Current app uses path-based layout**, not state-based guards (temporary)
6. **Next step**: Add auth state management and implement guards
