# Async Scrum Hub – API Contract

## Overview

This document defines the HTTP API contract for the Async Scrum Hub backend.
It specifies available endpoints, request parameters, and response structures.
This document is framework-agnostic and serves as a reference for frontend and backend development.

---

## Base URL

```
http://localhost:8000/api/v1
```
---
## Authentication

This API uses JWT-based authentication.
All endpoints (except public ones) require a valid JWT token sent in the Authorization header:

```
Authorization: Bearer <jwt_token>
```
---

## Roles & Permissions

This API uses a role-based access control (RBAC) model.
Permissions are scoped to specific resources (organization, project, task, etc.).

---

### Roles

### Organization Roles
- admin
	- Full control over the organization.
	- Can manage members and their roles.
	- Can create and manage projects within the organization.
- member
	- Can access organizations they belong to.
	- Can participate in projects they are assigned to.

### Scrum Roles (Project-Level)
- scrum_master
	- Can create and manage tickets.
	- Can manage project timeline and planning.
- product_owner
	- Manages product backlog and priorities.
- developer
	- Works on tasks and submits standups.

**Note:** Scrum roles are assigned per-project and affect ticket management permissions.

### Role Inheritance

- Organization admins are implicitly project admins for all projects within their organization.
- Project roles do not grant organization-level permissions.
- Permissions are always evaluated at the most specific scope.

### Ownership Rules

- The creator of a resource (task, standup, blocker) becomes its owner.
- Resource owners can update or delete their own resources, even if they are not project admins.
- Project admins can manage all resources within their project.
- The assigned user has full edit permissions over the resource (task or blocker), equivalent to the resource owner.
- Assigned user permissions only apply when the resource has an assigned user.
- If `assignee_id` is null, permissions related to the assigned user are ignored.

### Membership Management Rules

- Membership in organizations and projects is managed exclusively by organization or project admins.
- Users cannot remove themselves from organizations or projects.
- An organization must always have at least one organization admin.
- A project must always have at least one project admin.
- The last remaining admin of an organization or project cannot be removed or demoted.

---

### Common HTTP Status Codes (Used in this API)

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` – Request successful, no response body
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
---

## 1. Authentication & Authorization

### 1.1 Register New User

**Endpoint:** `POST /auth/register`

**Description:** Creates a new user account.

**Authentication:** Public

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string (min 8 chars)",
  "name": "string (display name)"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input (example: validation error)
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`409 Conflict` - User already exists
```json
{
  "error": {
	"code": "USER_EXISTS",
	"message": "User with this email already exists"
  }
}
```
---

### 1.2 Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticates a user and returns JWT tokens.

**Authentication:** Public

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "access_token": "string (JWT)",
  "token_type": "bearer"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input (example: missing fields)
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "Email or password is missing"
  }
}
```
`401 Unauthorized` - Invalid credentials
```json
{
  "error": {
	"code": "INVALID_CREDENTIALS",
	"message": "Email or password is incorrect"
  }
}
```
---

## 2. Users

### 2.1 Get Current User

**Endpoint:** `GET /users/me`

**Description:** Returns the profile of the currently authenticated user.

**Authentication:** Required (JWT)

**Permissions:**
- The authenticated user

**Success Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "current_organization_id": "uuid | null",
  "scrum_role": "scrum_master | product_owner | developer | null",
  "org_role": "admin | member | null"
}
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```
---

### 2.2 Update User

**Endpoint:** `PATCH /users/me`

**Description:** Updates the profile information of the currently authenticated user.

**Authentication:** Required (JWT)

**Permissions:**
- The authenticated user

**Request Body:**
```json
{
  "name": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "current_organization_id": "uuid | null",
  "scrum_role": "scrum_master | product_owner | developer | null",
  "org_role": "admin | member | null"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```
---

## 3. Organizations

### 3.1 Create Organization

**Endpoint:** `POST /organizations`

**Description:** Creates a new organization.

**Authentication:** Required (JWT)

**Permissions:**
- Any authenticated user (creator becomes organization admin).

**Request Body:**
```json
{
  "name": "string",
  "scrum_role": "scrum_master | product_owner | developer"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "string",
  "join_code": "SCR-493", // generated server-side when the organization is created.
  "created_by": "uuid (owner)"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```
---

### 3.2 Get User’s Organizations

**Endpoint:** `GET /organizations`

**Description:** Returns all organizations the authenticated user belongs to.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member.

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string",
		"created_by": "uuid (owner)"
	}
]
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```
---

### 3.3 Get Organization Members

**Endpoint:** `GET /organizations/{org_id}/members`

**Description:** Returns members of an organization. The client may allow admin-only actions based on the authenticated user’s org_role.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member.

**URL Parameters:**
- `org_id` - UUID of the organization

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string",
		"org_role": "admin | member",
	}
]
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Organization not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Organization not found"
  }
}
```
---

### 3.4 Add Member to Organization

**Endpoint:** `POST /organizations/{org_id}/members`

**Description:** Adds a user to the organization.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin

**URL Parameters:**
- `org_id` - UUID of the organization

**Request Body:**
```json
{
  "email": "string",
  "org_role": "admin | member"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "string",
  "org_role": "admin | member"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Organization not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Organization not found"
  }
}
```

`409 Conflict` - User already a member
```json
{
  "error": {
	"code": "ALREADY_MEMBER",
	"message": "User is already a member of this organization"
  }
}
```
---

### 3.5 Remove Member from Organization

**Endpoint:** `DELETE /organizations/{org_id}/members/{user_id}`

**Description:** Removes a user from the organization.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin

**URL Parameters:**
- `org_id` - UUID of the organization
- `user_id` - UUID of the user to remove

**Success Response:** `204 No Content`

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Organization or user not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Organization or user not found"
  }
}
```
---

## 3.6 Update Organization Member Role ##

**Endpoint:** `PATCH /organizations/{org_id}/members/{user_id}`

**Description:** Updates the role of an existing organization member.

**notes:** Reminder: an organization must always have at least one organization admin.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin

**URL Parameters:**
- `org_id` – UUID of the organization
- `user_id` – UUID of the member

**Request Body:**
```json
{
  "org_role": "admin | member"
}
```

**Success Response:** `200 OK`
```json
{
  "user_id": "uuid",
  "org_role": "admin | member"
}
```

**Error Responses:**

`400 Bad Request` - Invalid role
```json
{
  "error": {
	"code": "INVALID_ROLE",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Organization or user not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Organization or user not found"
  }
}
```
---

### 3.7 Join Organization by Code

**Endpoint:** `POST /organizations/join`

**Permissions:**
- The authenticated user

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "join_code": "SCR-493",
  "scrum_role": "scrum_master | product_owner | developer"
}
```

**Success Response:** `200 OK`
```json
{
  "organization_id": "uuid",
  "org_role": "member"
}
```

**Error Responses:**

`404 Not Found` - Organization or user not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Organization or user not found"
  }
}
```

`409 Conflict` - User already a member
```json
{
  "error": {
	"code": "ALREADY_MEMBER",
	"message": "User is already a member of this organization"
  }
}
```
---


## 4. Projects

### 4.1 Create Project

**Endpoint:** `POST /organizations/{org_id}/projects`

**Description:** Creates a new Project. The creator automatically becomes the admin.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin.

**URL Parameters:**
- `org_id` - UUID of the organization

**Request Body:**
```json
{
  "name": "string"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "string",
  "created_by": "uuid (owner)"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Organization not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Organization not found"
  }
}
```
---

### 4.2 Get Organization's Projects

**Endpoint:** `GET /organizations/{org_id}/projects`

**Description:** Returns all projects to a specific organization the authenticated user belongs to.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member.

**URL Parameters:**
- `org_id` - UUID of the organization

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string",
		"created_by": "uuid (owner)"
	}
]
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Organization not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Organization not found"
  }
}
```
---

### 4.3 Get Project Members

**Endpoint:** `GET /projects/{proj_id}/members`

**Description:** Returns the list of members assigned to a specific project. If admin, they can see the 'delete' option next each member name.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member.

**URL Parameters:**
- `proj_id` - UUID of the project

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string",
		"org_role": "admin | member",
		"scrum_role": "scrum_master | product_owner | developer"
	}
]
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Project not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Project not found"
  }
}
```
---
### 4.4 Add Member to Project

**Endpoint:** `POST /projects/{proj_id}/members`

**Description:** Adds a user to the project.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin

**URL Parameters:**
- `proj_id` - UUID of the project

**Request Body:**
```json
{
  "email": "string"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "string"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Project not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Project not found"
  }
}
```

`409 Conflict` - User already a member
```json
{
  "error": {
	"code": "ALREADY_MEMBER",
	"message": "User is already a member of this project"
  }
}
```
---

### 4.5 Remove Member from Project

**Endpoint:** `DELETE /projects/{proj_id}/members/{user_id}`

**Description:** Removes a user from the project.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin

**URL Parameters:**
- `proj_id` - UUID of the project
- `user_id` - UUID of the user to remove

**Success Response:** `204 No Content`

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Project or user not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Project or user not found"
  }
}
```
---

## 5. Tickets

### 5.1 Create Tickets

**Endpoint:** `POST /projects/{proj_id}/tickets`

**Description:** Creates a new ticket within a project.

**Authentication:** Required (JWT)

**Permissions:**
- Scrum Master
- Product Owner

**URL Parameters:**
- `proj_id` - UUID of the project

**Request Body:**
```json
{
  "title": "string",
  "description": "string | null",
  "priority": "low | medium | high",
  "assignee_id": "uuid | null"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "status": "todo | in_progress | done",
  "priority": "low | medium | high",
  "created_by": "uuid",
  "assignee_id": "uuid | null",
  "project_id": "uuid",
  "created_at": "iso",
  "updated_at": "iso"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Project not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Project not found"
  }
}
```
---

### 5.2 List Tickets (Board)

**Endpoint:** `GET /projects/{proj_id}/tickets?status=todo|in_progress|done`

**Description:** Returns tickets for a project, optionally filtered by status.
Used to render the project board.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member.

**URL Parameters:**
- `proj_id` - UUID of the project

**Query Parameters:**
- status – todo | in_progress | done

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"title": "string",
		"status": "todo | in_progress | done",
		"priority": "low | medium | high",
		"assignee_id": "uuid | null",
		"created_at": "iso",
		"updated_at": "iso"
	}
]
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Ticket not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Ticket not found"
  }
}
```
---

### 5.3 Get Ticket Details

**Endpoint:** `GET /tickets/{ticket_id}`

**Description:** Returns detailed information about a specific ticket.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member.

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string | null",
	"status": "todo | in_progress | done",
	"priority": "low | medium | high",
	"created_by": "uuid",
	"assignee_id": "uuid | null",
	"project_id": "uuid",
	"created_at": "iso",
	"updated_at": "iso"
}
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Ticket not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Ticket not found"
  }
}
```
---

### 5.4 Update Ticket

**Endpoint:** `PATCH /tickets/{ticket_id}`

**Description:** Updates ticket fields such as title, description, priority, assignee, or status.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Ticket owner (creator)
- Assigned user

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Request Body:**
```json
{
	"title": "string (optional)",
	"description": "string | null (optional)",
	"priority": "low | medium | high (optional)",
	"status": "todo | in_progress | done (optional)",
	"assignee_id": "uuid | null (optional)"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string | null",
	"status": "todo | in_progress | done",
	"priority": "low | medium | high",
	"created_by": "uuid",
	"assignee_id": "uuid | null",
	"project_id": "uuid",
	"created_at": "iso",
	"updated_at": "iso"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Ticket not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Ticket not found"
  }
}
```
---

### 5.5 Move Ticket (Drag & Drop)

**Endpoint:** `PATCH /tickets/{ticket_id}/move`

**Description:** Moves a ticket between board columns by updating its status.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Ticket owner (creator)
- Assigned user

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Request Body:**
```json
{
	"status": "todo | in_progress | done"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"status": "todo | in_progress | done",
	"updated_at": "iso"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Ticket not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Ticket not found"
  }
}
```
---

### 5.6 Delete Ticket

**Endpoint:** `DELETE /tickets/{ticket_id}`

**Description:** Deletes a ticket and all its associated tasks and blockers.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Ticket owner (creator)

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Success Response:** `204 No Content`

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Ticket not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Ticket not found"
  }
}
```
---

## 6. Tasks

### 6.1 Create Task

**Endpoint:** `POST /tickets/{ticket_id}/tasks`

**Description:** Creates a new task within a ticket.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member (creator becomes the task owner).

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Request Body:**
```json
{
  "title": "string",
  "description": "string | null",
  "assignee_id": "uuid | null"
}
```

**Success Response:** `201 Created`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string | null",
	"status": "in_process",
  	"created_by": "uuid (owner)",
	"assignee_id": "uuid | null",
	"ticket_id": "uuid"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Ticket not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Ticket not found"
  }
}
```
---

### 6.2 List Tasks

**Endpoint:** `GET /tickets/{ticket_id}/tasks`

**Description:** Returns all tasks belonging to a specific ticket.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member.

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Query Parameters:**
- status – in_process | completed

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"title": "string",
		"status": "in_process | completed",
	}
]
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Ticket not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Ticket not found"
  }
}
```
---

### 6.3 Get Task Details

**Endpoint:** `GET /tasks/{task_id}`

**Description:** Returns detailed information about a specific task.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member.

**URL Parameters:**
- `task_id` - UUID of the task


**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string | null",
	"status": "in_process | completed",
  	"created_by": "uuid (owner)",
	"assignee_id": "uuid | null",
	"ticket_id": "uuid"
}
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Task not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Task not found"
  }
}
```
---

### 6.4 Update Task

**Endpoint:** `PATCH /tasks/{task_id}`

**Description:** Updates task information.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Assigned user
- Task owner (creator)

**URL Parameters:**
- `task_id` - UUID of the task

**Request Body:**
```json
{
	"title": "string (optional)",
	"description": "string (optional)",
	"status": "in_process | completed (optional)",
	"assignee_id": "uuid | null (optional)"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string | null",
	"description": "string | null",
	"status": "in_process | completed",
	"created_by": "uuid (owner)",
	"assignee_id": "uuid | null",
	"ticket_id": "uuid"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Task not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Task not found"
  }
}
```
---

### 6.5 Delete Task

**Endpoint:** `DELETE /tasks/{task_id}`

**Description:** Deletes a task.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Task owner (creator)

**URL Parameters:**
- `task_id` - UUID of the task

**Success Response:** `204 No Content`

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Task not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Task not found"
  }
}
```
---

## 7. Standups

### 7.1 Create Standup

**Endpoint:** `POST /projects/{proj_id}/standups`

**Description:** Creates a new standup within a project.

**Rules:**
- A user can create only one standup per day per project.
- If a standup already exists for today, creation is rejected.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member (creator becomes the standup owner).

**URL Parameters:**
- `proj_id` - UUID of the project

**Request Body:**
```json
{
	"today": "string",
	"yesterday": "string | null",
	"blockers": "string | null"
}
```

**Success Response:** `201 Created`
```json
{
	"id": "uuid",
	"created_at": "timestamp (today)",
	"today": "string",
	"yesterday": "string | null",
	"blockers": "string",
	"created_by": "uuid (owner)"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Project not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Project not found"
  }
}
```

`409 Conflict` - Standup already exists for today
```json
{
  "error": {
    "code": "STANDUP_ALREADY_EXISTS",
    "message": "You have already created a standup for today"
  }
}
```
---

### 7.2 List Project Standups

**Endpoint:** `GET /projects/{proj_id}/standups`

**Description:** Returns standup entries for a project (usually filtered by date).

**Notes:**
- `preview` is a derived field generated from the first line of the standup today's input.
- This field is not persisted and is only included in list responses.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member.

**Notes:**
- This endpoint returns all standups created within the project.
- Standups are visible to all project members to provide team-wide visibility.

**URL Parameters:**
- `proj_id` - UUID of the project

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"created_at": "timestamp(today)",
		"preview": "derived field (first line of today input)",
		"blockers": "string",
		"created_by": "uuid (owner)"
	}
]
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Project not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Project not found"
  }
}
```
---
### 7.3 Get Standup Details

**Endpoint:** `GET /standups/{standup_id}`

**Description:** Returns detailed information about a specific standup.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member.

**URL Parameters:**
- `standup_id` - UUID of the standup

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"created_at": "timestamp (today)",
	"today": "string",
	"yesterday": "string | null",
	"blockers": "string",
  	"created_by": "uuid (owner)"
}
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Standup not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Standup not found"
  }
}
```
---

### 7.4 Update Standup

**Endpoint:** `PATCH /standups/{standup_id}`

**Description:** Updates standups information (today, yesterday, blockers).

**Rules:**
- A standup can only be edited on the same day it was created.
- Editing past standups is not allowed.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Standup owner (creator)

**URL Parameters:**
- `standup_id` - UUID of the Standup

**Request Body:**
```json
{
	"today": "string (optional)",
	"yesterday": "string  | null (optional)",
	"blockers": "string | null (optional)"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"created_at": "timestamp (today)",
	"today": "string",
	"yesterday": "string | null",
	"blockers": "string",
	"created_by": "uuid (owner)"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`409 Conflict` - Standup can no longer be edited
```json
{
  "error": {
    "code": "EDIT_WINDOW_EXPIRED",
    "message": "Standups can only be edited on the day they are created"
  }
}
```

`404 Not Found` - Standup not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Standup not found"
  }
}
```
---

### 7.5 Delete Standup

**Endpoint:** `DELETE /standups/{standup_id}`

**Description:** Deletes a Standup.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Standup owner (creator)

**URL Parameters:**
- `standup_id` - UUID of the standup

**Success Response:** `204 No Content`

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Standup not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Standup not found"
  }
}
```
---

## 8. Blockers

### 8.1 Create Blocker

**Endpoint:** `POST /projects/{proj_id}/blockers`

**Description:** Creates a new blocker within a project.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member (creator becomes the blocker owner).

**URL Parameters:**
- `proj_id` - UUID of the project

**Request Body:**
```json
{
	"description": "string",
	"task_id": "uuid | null",
	"assignee_id": "uuid | null"
}
```

**Success Response:** `201 Created`
```json
{
	"id": "uuid",
	"description": "string",
	"status": "open",
	"created_by": "uuid (owner)",
	"assignee_id": "uuid | null",
	"task_id": "uuid | null",
	"created_at": "timestamp (today)",
	"resolved_at": "timestamp | null"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Project not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Project not found"
  }
}
```
---

### 8.2 List Project Blockers

**Endpoint:** `GET /projects/{proj_id}/blockers`

**Description:** Returns all blockers for a project.

**Notes:**
- `preview` is a derived field generated from the first line of the blocker description.
- This field is not persisted and is only included in list responses.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member.

**URL Parameters:**
- `proj_id` - UUID of the project

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"created_by": "uuid (owner)",
		"preview": "derived field (first line of description input)",
		"status": "open | resolved",
		"assignee_id": "uuid | null"
	}
]
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Project not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Project not found"
  }
}
```
---

### 8.3 Get Blocker Details

**Endpoint:** `GET /blockers/{blocker_id}`

**Description:** Returns detailed information about a specific blocker.

**Authentication:** Required (JWT)

**Permissions:**
- Any project member.

**URL Parameters:**
- `blocker_id` - UUID of the blocker


**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"description": "string",
	"status": "open | resolved",
	"created_by": "uuid (owner)",
	"assignee_id": "uuid | null",
	"task_id": "uuid | null",
	"created_at": "timestamp (today)",
	"resolved_at": "timestamp | null"
}
```

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Blocker not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Blocker not found"
  }
}
```
---

### 8.4 Update Blocker

**Endpoint:** `PATCH /blockers/{blocker_id}`

**Description:** Updates blocker information.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Blocker owner (creator)

**URL Parameters:**
- `blocker_id` - UUID of the Blocker

**Request Body:**
```json
{
	"description": "string (optional)",
	"task_id": "uuid | null (optional)",
	"assignee_id": "uuid | null (optional)"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"description": "string",
	"status": "open | resolved",
	"created_by": "uuid (owner)",
	"assignee_id": "uuid | null",
	"task_id": "uuid | null",
	"created_at": "timestamp (today)",
	"resolved_at": "timestamp | null"
}
```

**Error Responses:**

`400 Bad Request` - Invalid input
```json
{
  "error": {
	"code": "INVALID_INPUT",
	"message": "validation error message"
  }
}
```

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Blocker not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Blocker not found"
  }
}
```
---

### 8.5 Resolve Blocker

**Endpoint:** `PATCH /blockers/{blocker_id}/resolve`

**Description:** Marks a blocker as resolved.

**Rules:**
- Blockers cannot be deleted. They can only be resolved.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin
- Assigned user
- Blocker owner (creator)

**URL Parameters:**
- `blocker_id` - UUID of the Blocker

**Success Response:** `204 No Content`

**Error Responses:**

`401 Unauthorized` - Authentication required
```json
{
  "error": {
	"code": "UNAUTHORIZED",
	"message": "Authentication required"
  }
}
```

`403 Forbidden` - Insufficient permissions
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You do not have permission to perform this action"
  }
}
```

`404 Not Found` - Blocker not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Blocker not found"
  }
}
```

`409 Conflict` - Blocker already resolved
```json
{
  "error": {
    "code": "BLOCKER_ALREADY_RESOLVED",
    "message": "Blocker already resolved"
  }
}
```
---
