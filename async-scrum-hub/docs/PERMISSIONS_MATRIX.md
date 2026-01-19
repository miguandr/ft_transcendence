# Complete Permissions Matrix – Async Scrum Hub

**Base URL:** `http://localhost:8000/api/v1`

**Related Documents:**
- [API_CONTRACTS.md](API_CONTRACTS.md) - Complete API endpoint specifications
- [AUTHORIZATION_MODEL.md](AUTHORIZATION_MODEL.md) - Authorization rules and implementation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview

**Document Version:** 1.0
**Last Updated:** 2026-01-04

---

## Table of Contents
1. [Organizations](#1-organizations)
2. [Tickets](#2-tickets)
3. [Tasks](#3-tasks)
4. [Standups](#4-standups)
5. [Blockers](#5-blockers)
6. [Users](#6-users)
7. [Special Permission Legend](#special_permission_legend)
8. [Special Rules per Resource](#special_rules_per_resource)

---

## 1. Organizations

| Action                                | Organization Admin   | Scrum Master    | Product Owner   | Developer      
|---------------------------------------|----------------------|-----------------|-----------------|----------------
| **Create organization**               | ✅ (any user)        | ✅ (any user)  | ✅ (any user)   | (any user)                     
| **View organization members**         | ✅                   | ✅             | ✅              | ✅ 
| **Invite member to organization**     | ✅                   | ❌             | ❌              | ❌
| **Remove member from organization**   | ✅                   | ❌             | ❌              | ❌
| **Join organization by join_code**    | ✅                   | ✅             | ✅              | ✅

**Endpoints:**
- `POST /organizations` - Create organization
- `GET /organizations/{org_id}/members` - Get organization members
- `POST /organizations/{org_id}/members` - Invite member by email
- `DELETE /organizations/{org_id}/members/{user_id}` - Remove member
- `POST /organizations/join` - Join organization by code

---

## 2. Tickets

| Action                     | Organization Admin | Scrum Master | Product Owner  | Developer  
|----------------------------|--------------------|--------------|----------------|------------
| **Create ticket**          | ✅                 | ✅          | ✅             | ❌   
| **List tickets**           | ✅                 | ✅          | ✅             | ✅   
| **Get ticket details**     | ✅                 | ✅          | ✅             | ✅ 
| **Update ticket**          | ✅                 | ✅          | ✅             | ❌ 
| **Move ticket (status)**   | ✅                 | ✅          | ✅             | ❌ 
| **Delete ticket**          | ✅                 | ✅          | ✅             | ❌ 

**Endpoints:**
- `POST /organizations/{org_id}/tickets` - Create ticket
- `GET /organizations/{org_id}/tickets` - List tickets
- `GET /tickets/{ticket_id}` - Get ticket detailst
- `PATCH /tickets/{ticket_id}` - Update ticket
- `PATCH /tickets/{ticket_id}/move` - Move ticket
- `DELETE /tickets/{ticket_id}` - Delete ticket

---

## 3. Tasks

| Action               | Organization Admin | Scrum Master   | Product Owner  | Developer                           
|----------------------|--------------------|----------------|----------------|------------------------
| **Create task**      | ✅                 | ✅            | ✅             | ✅                     
| **List tasks**       | ✅                 | ✅            | ✅             | ✅                     
| **Get task details** | ✅                 | ✅            | ✅             | ✅                     
| **Update task**      | ✅                 | ✅            | ✅             | ✅ (owner or assignee)  
| **Delete task**      | ✅                 | ✅            | ✅             | ✅ (owner only)        

**Endpoints:**
- `POST /tickets/{ticket_id}/tasks` - Create task
- `GET /tickets/{ticket_id}/tasks` - List tasks
- `GET /tasks/{task_id}` - Get task details
- `PATCH /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task

---

## 4. Standups

| Action                   | Organization Admin | Scrum Master    | Product Owner  | Developer       
|--------------------------|--------------------|-----------------|----------------|------------------
| **Create standup**       | ✅                 | ✅             | ✅             | ✅             
| **List standups**        | ✅                 | ✅             | ✅             | ✅             
| **Get standup details**  | ✅                 | ✅             | ✅             | ✅             
| **Update standup**       | ✅                 | ✅             | ✅             | ✅ (owner only) 
| **Delete standup**       | ✅                 | ✅             | ✅             | ✅ (owner only)

**Endpoints:**
- `POST /organizations/{org_id}/standups` - Create standup
- `GET /organizations/{org_id}/standups` - List standups
- `GET /standups/{standup_id}` - Get standup details
- `PATCH /standups/{standup_id}` - Update standup
- `DELETE /standups/{standup_id}` - Delete standup

---

## 5. Blockers

| Action                   | Organization Admin | Scrum Master    | Product Owner  | Developer       
|--------------------------|--------------------|-----------------|----------------|------------------------
| **Create blocker**       | ✅                 | ✅             | ✅             | ✅             
| **List blocker**         | ✅                 | ✅             | ✅             | ✅             
| **Get blocker details**  | ✅                 | ✅             | ✅             | ✅             
| **Update blocker**       | ✅                 | ✅             | ✅             | ✅ (owner only) 
| **Resolve blocker**      | ✅                 | ✅             | ✅             | ✅ (owner or assignee)

**Endpoints:**
- `POST /organizations/{org_id}/blockers` - Create blocker
- `GET /organizations/{org_id}/blockers` - List blockers
- `GET /blockers/{blocker_id}` - Get blocker details
- `PATCH /blockers/{blocker_id}` - Update blocker
- `PATCH /blockers/{blocker_id}/resolve` - Resolve blocker

---

## 6. Users

| Action	                | All Roles	 | Notes
|-------------------------|------------|-----------
| **Register**            | ✅         | Public endpoint
| **Login**               | ✅         | Public endpoint
| **Get own profile**     | ✅         | Authenticated user only
| **Update own profile**  | ✅         | Authenticated user only

**Endpoints:**
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update current user

---

## Special Permission Legend

### 🔑 Organization Admin
- **Full control** over all organization resourcesn
- Bypasses ownership and assignment restrictions
- Puede editar/eliminar cualquier recurso aunque no sea owner ni assignee
- Can manage members and roles
- Can update or delete any resource

**How to obtain?**
- Automatically when creating an organization
- Promotion by another admin via `PATCH /organizations/{org_id}/members/{user_id}`

---

### ⚡ Owner (Resource Creator)
- The user who creates a resource becomes its **owner**
- Owners can update and delete their own resources
- Ownership is **inmutable**
- Identified by the `created_by` field

**Resources with ownership:**
- Tickets
- Tasks
- Standups
- Blockers

---

### 👤 Assignee
- The `assignee_id` field can only be assigned to users with the **Developer** role.
- Assignees have **edit permissions equivalent to owners**
- Applies to:: **Tasks, Blockers**

---

### 📝 Scrum Master vs Product Owner

**Same technical permissions:**
- Both can create, update, move, and delete tickets
- Both have identical access at API level

**Conceptual difference:**
- **Scrum Master (SM):** process, sprints, ceremonies
- **Product Owner (PO):** product vision, backlog, priorities

**How to obtain?**
- Automatically when creating an organization

---

## Special Rules per Resource

### 🎫 Tickets
- Default status: todo
- Status transitions are bidirectional.
- `todo` → `in_progress` → `done`
- Deleting a ticket cascades to tasks and blockers

---

### ✅ Tasks
- Default status: `in_process`
- Only one transition: `in_process` → `completed`
- Must belong to a ticket

---

### 📊 Standups
- One standup per user per day per organization
- Editable only on the day of creation
- No assignee

---

### 🚧 Blockers
- Cannot be deleted, only resolved
- Status: open → resolved (irreversible)
- Optional relation to a task

---

## Resource Hierarchy

```
Organization
 ├─ Ticket
 │   └─ Task
 ├─ Standup
 └─ Blocker
     └─ (optional) Task
```

---

## Global Constraints
- Organizations must always have at least one admin
- Users cannot remove themselves
- Standups: one per day, editable same day only
- Blockers: cannot be deleted

---

## Common Error Codes

| HTTP Status | Error Code                 | Description 
|-------------|----------------------------|------------------------------------
| 400         | `INVALID_INPUT`            | Invalid request data
| 400         | `INVALID_ROLE`             | Invalid role
| 400         | `INVALID_ASSIGNEE`         | Invalid assignee role 
| 401         | `UNAUTHORIZED`             | Missing or invalid JWT
| 401         | `INVALID_CREDENTIALS`      | Invalid credentials
| 403         | `FORBIDDEN`                | Insufficient permissions
| 404         | `NOT_FOUND`                | Resource not found
| 409         | `USER_EXISTS`              | User already exists
| 409         | `ALREADY_MEMBER`           | User already a member
| 409         | `STANDUP_ALREADY_EXISTS`   | Standup already created
| 409         | `EDIT_WINDOW_EXPIRED`      | Standup edit window expired
| 409         | `BLOCKER_ALREADY_RESOLVED` | Blocker already resolved

---

**End of Document**
