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
- `204 No Content` - 
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- ####`403 Forbidden` - Authenticated but not authorized
- ####`404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
- ####`422 Unprocessable Entity` - Validation error
- ####`500 Internal Server Error` - Server error
---

## 1. Authentication & Authorization

### 1.1 Register New User

**Endpoint:** `POST /auth/register`

**Description:** Creates a new user account.

**Authentication:** Public

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "name": "string (required, display name)",
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
    "message": "validation error message",
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
  "email": "string (required)",
  "password": "string (required)"
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

### 1.3 Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Returns the currently authenticated user's profile.

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

**Endpoint:** `PUT /users/me`

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
  "name": "string",
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

### 3.2 Get User's Organizations

**Endpoint:** `GET /organizations`

**Description:** Returns all organizations the authenticated user belongs to.

**Authentication:** Required (JWT)

**Success Response:** `200 OK`
```json
{
    "id": "uuid",
    "name": "string",
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

### 3.3 Get Organization Members

**Endpoint:** `GET /organizations/{org_id}/members`

**Description:** Returns the list of members of the specified organization. User must be a member. If admins, they can see the 'delete' option next each member name.

**Authentication:** Required (JWT)

**URL Parameters:**
- `org_id` - UUID of the organization

**Success Response:** `200 OK`
```json
{
    "id": "uuid",
    "name": "string",
    "role": "admin/member"
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
    "code": "ORG_NOT_FOUND",
    "message": "Organization with this ID does not exist"
  }
}
```
---

### 3.4 Add Member to Organization

**Endpoint:** `POST /organizations/{org_id}/members`

**Description:** Adds a user to the organization. Only admins can add members.

**Authentication:** Required (JWT)

**URL Parameters:**
- `org_id` - UUID of the organization

**Request Body:**
```json
{
  "email": "string",
  "role": "admin/member"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "string",
  "role": "admin/member"
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
    "message": "Only the admins can add members"
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

**Description:** Removes a user from the organization. Only admins can remove members.

**Authentication:** Required (JWT)

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
    "message": "Only the organization admins can remove members"
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

