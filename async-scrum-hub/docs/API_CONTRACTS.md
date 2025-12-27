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

## Authentication

This API uses JWT-based authentication.
All endpoints (except public ones) require a valid JWT token sent in the Authorization header:

```
Authorization: Bearer <jwt_token>
```
---

### Common HTTP Status Codes (Used in this API)

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` – Request successful, no response body 
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Authenticated but not authorized | Insufficient permissions
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

**Success Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string"
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
  "name": "string"
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

**Description:** Creates a new organization. The creator automatically becomes the admin.

**Authentication:** Required (JWT)

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
  "name": "string"
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

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string"
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

**Description:** Returns the list of members of the specified organization. If admins, they can see the 'delete' option next each member name.

**Authentication:** Required (JWT)

**URL Parameters:**
- `org_id` - UUID of the organization

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string",
		"role": "admin | member"
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

`403 Forbidden` - User not a member of this organization
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this organization"
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
  "role": "admin | member"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "string",
  "role": "admin | member"
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

## 4. Projects

### 4.1 Create Project

**Endpoint:** `POST /organizations/{org_id}/projects`

**Description:** Creates a new Project. The creator automatically becomes the admin.

**Authentication:** Required (JWT)

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
  "name": "string"
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

`403 Forbidden` - User not a member of this organization
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this organization"
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

**URL Parameters:**
- `org_id` - UUID of the organization

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string"
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

`403 Forbidden` - User not a member of this organization
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this organization"
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

**Description:** Returns the list of members assigned to a specific project. If admins, they can see the 'delete' option next each member name.

**Authentication:** Required (JWT)

**URL Parameters:**
- `proj_id` - UUID of the project

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string",
		"role": "admin | member"
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

`403 Forbidden` - User not a member of this project
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this project"
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
- Project admin

**URL Parameters:**
- `proj_id` - UUID of the project

**Request Body:**
```json
{
  "email": "string",
  "role": "admin | member"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "string",
  "role": "admin | member"
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
- Project admin

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

## 5. Sprints

### 5.1 Create Sprint

**Endpoint:** `POST /projects/{proj_id}/sprints`

**Description:** Creates a new sprint within a project.

**Authentication:** Required (JWT)

**Permissions:** 
- Project admin

**URL Parameters:**
- `proj_id` - UUID of the project

**Request Body:**
```json
{
  "name": "string",
  "start_date": "2025-01-01 (optional)",
  "end_date": "2025-01-14 (optional)"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "string",
  "status": "active",
  "start_date": "2025-01-01 (optional)",
  "end_date": "2025-01-14 (optional)"
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

### 5.2 List Project Sprints

**Endpoint:** `GET /projects/{proj_id}/sprints`

**Description:** Returns all sprints belonging to a specific project.

**Authentication:** Required (JWT)

**URL Parameters:**
- `proj_id` - UUID of the project

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"name": "string",
		"status": "active | completed",
		"start_date": "2025-01-01 (optional)",
		"end_date": "2025-01-14 (optional)"
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

`403 Forbidden` - User not a member of this project
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this project"
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

### 5.3 Get Sprint Details

**Endpoint:** `GET /sprints/{sprint_id}`

**Description:** Returns detailed information about a specific sprint.

**Authentication:** Required (JWT)

**URL Parameters:**
- `sprint_id` - UUID of the sprint

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"name": "string",
	"status": "active | completed",
	"start_date": "2025-01-01 (optional)",
	"end_date": "2025-01-14 (optional)"
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

`403 Forbidden` - User not a member of this project
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this project"
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

### 5.4 Get Sprint Tasks

**Endpoint:** `GET /sprints/{sprint_id}/tasks`

**Description:** Returns all tasks assigned to a specific sprint.

**Authentication:** Required (JWT)

**Permissions:** 
- Project admin
- Project member

**URL Parameters:**
- `sprint_id` - UUID of the sprint

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"status": "todo | in_progress | done",
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

`403 Forbidden` - User not a member of this project
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this project"
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

### 5.5 Update Sprint

**Endpoint:** `PATCH /sprints/{sprint_id}`

**Description:** Updates sprint information (e.g. name, dates).

**Authentication:** Required (JWT)

**URL Parameters:**
- `sprint_id` - UUID of the sprint

**Request Body:**
```json
{
  "name": "string (optional)",
  "status": "active | completed (optional)",
  "start_date": "2025-01-01 (optional)",
  "end_date": "2025-01-14 (optional)"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"name": "string",
	"status": "active | completed",
	"start_date": "2025-01-01 (optional)",
	"end_date": "2025-01-14 (optional)"
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

`403 Forbidden` - User not a member of this project
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this project"
  }
}
```

`404 Not Found` - Sprint not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Sprint not found"
  }
}
```
---

## 6. Tasks

### 6.1 Create Task

**Endpoint:** `POST /projects/{proj_id}/tasks`

**Description:** Creates a new task within a project.

**Authentication:** Required (JWT)

**Permissions:** 
- Project member (becomes the owner).

**URL Parameters:**
- `proj_id` - UUID of the project

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)"
}
```

**Success Response:** `201 Created`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string (optional)",
	"status": "todo",
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

`403 Forbidden` - User not a member of this project
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this project"
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

### 6.2 List Project Tasks

**Endpoint:** `GET /projects/{proj_id}/tasks`

**Description:** Returns all tasks belonging to a specific project.

**Authentication:** Required (JWT)

**URL Parameters:**
- `proj_id` - UUID of the project


**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"title": "string",
		"status": "todo | in_progress | done",
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

`403 Forbidden` - User not a member of this project
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this project"
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

### 6.3 Get Task Details

**Endpoint:** `GET /tasks/{task_id}`

**Description:** Returns detailed information about a specific task.

**Authentication:** Required (JWT)

**URL Parameters:**
- `task_id` - UUID of the task


**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string (optional)",
	"status": "todo | in_progress | done",
  	"created_by": "uuid (owner)",
	"assignee_id": "uuid (optional)",
	"sprint_id": "uuid (optional)"
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

`403 Forbidden` - User not a member of this project
```json
{
  "error": {
	"code": "FORBIDDEN",
	"message": "You are not a member of this project"
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

**Description:** Updates task information (title, description, status, assignee, sprint).

**Authentication:** Required (JWT)

**Permissions:**
- Project admin
- Task owner (creator)

**URL Parameters:**
- `task_id` - UUID of the task

**Request Body:**
```json
{
	"title": "string (optional)",
	"description": "string (optional)",
	"status": "todo | in_progress | done (optional)"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string (optional)",
	"description": "string (optional)",
	"status": "todo | in_progress | done (optional)",
	"created_by": "uuid (owner)",
	"assignee_id": "uuid (optional)",
	"sprint_id": "uuid (optional)"
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

`404 Not Found` - Task, sprint or user not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Task, sprint or user not found"
  }
}
```
---

### 6.5 Delete Task

**Endpoint:** `DELETE /tasks/{task_id}`

**Description:** Deletes a task.

**Authentication:** Required (JWT)

**Permissions:**
- Project admin
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

### 6.6 Assign Task to Sprint

**Endpoint:** `PATCH /tasks/{task_id}/sprint`

**Description:** Assigns a task to a sprint or removes it from its current sprint.

**Authentication:** Required (JWT)

**Permissions:**
- Project admin
- Task owner (creator)

**URL Parameters:**
- `task_id` - UUID of the task

**Request Body:**
```json
{
  "sprint_id": "uuid (assigns task) | null (removes task)"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string (optional)",
	"status": "todo | in_progress | done",
  	"created_by": "uuid (owner)",
	"assignee_id": "uuid (optional)",
	"sprint_id": "uuid | null"
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

`404 Not Found` - Task or sprint not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Task or sprint not found"
  }
}
```
---

### 6.7 Assign Task to User

**Endpoint:** `PATCH /tasks/{task_id}/assignee`

**Description:** Assigns a task to a user or removes the current assignee.

**Authentication:** Required (JWT)

**Permissions:**
- Project admin
- Task owner (creator)

**URL Parameters:**
- `task_id` - UUID of the task

**Request Body:**
```json
{
  "assignee_id": "uuid (assigns assignee) | null (removes assignee)"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string (optional)",
	"status": "todo | in_progress | done",
  	"created_by": "uuid (owner)",
	"assignee_id": "uuid (optional)",
	"sprint_id": "uuid | null"
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

`404 Not Found` - Task or user not found
```json
{
  "error": {
	"code": "NOT_FOUND",
	"message": "Task or sprint not found"
  }
}
```
---
