## 5. Tasks

### 5.1 Create Task

**Endpoint:** `POST /tickets/{ticket_id}/tasks`

**Description:** Creates a new task within a ticket.

**Assignment Rules:**
- The `assignee_id` field can only be assigned to users with the **Developer** role.
- Scrum Masters and Product Owners cannot be assigned to tasks.
- If `assignee_id` is provided, the backend must validate that the user has the Developer role.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member (creator becomes the task owner).

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Request Body:**
```json
{
  "title": "string",
  "description": "string | null",
  "assignee_id": "uuid | null"  // Must be a user with Developer role
}
```

**Success Response:** `201 Created`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string | null",
	"status": "in_progress",
  	"created_by": "uuid (owner)",
	"assignee_id": "uuid | null",
	"ticket_id": "uuid"
}
```

**Error Responses:**

`422 Unprocessable Entity` - Invalid input
```json
{
  "detail": [
	{
	  "type": "string",
	  "loc": ["body", "field_name"],
	  "msg": "validation error message",
	  "input": "invalid_value"
	}
  ]
}
```

`400 Bad Request` - Invalid assignee role
```json
{
  "error": {
	"code": "INVALID_ASSIGNEE",
	"message": "Only users with Developer role can be assigned to tasks"
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

### 5.2 List Tasks

**Endpoint:** `GET /tickets/{ticket_id}/tasks"`

**Description:** Returns all tasks belonging to a specific ticket.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member.

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Query Parameters:**
- status – in_progress | completed

**Examples:**
- `GET /tickets/{ticket_id}/tasks`
- `GET /tickets/{ticket_id}/tasks?status=in_progress`
- `GET /tickets/{ticket_id}/tasks?status=completed`

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"title": "string",
		"status": "in_progress | completed",
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

### 5.3 Get Task Details

**Endpoint:** `GET /tasks/{task_id}`

**Description:** Returns detailed information about a specific task.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member.

**URL Parameters:**
- `task_id` - UUID of the task


**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string | null",
	"status": "in_progress | completed",
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

### 5.4 Update Task

**Endpoint:** `PATCH /tasks/{task_id}`

**Description:** Updates task information.

**Assignment Rules:**
- The `assignee_id` field can only be assigned to users with the **Developer** role.
- Scrum Masters and Product Owners cannot be assigned to tasks.
- If `assignee_id` is provided, the backend must validate that the user has the Developer role.

**Authentication:** Required (JWT)

**Permissions:**
- Scrum Master
- Product Owner
- Developer (Task owner/assignee)

**URL Parameters:**
- `task_id` - UUID of the task

**Request Body:**
```json
{
	"title": "string (optional)",
	"description": "string (optional)",
	"status": "in_progress | completed (optional)",
	"assignee_id": "uuid | null (optional)"  // Must be a user with Developer role
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string | null",
	"status": "in_progress | completed",
	"created_by": "uuid (owner)",
	"assignee_id": "uuid | null",
	"ticket_id": "uuid"
}
```

**Error Responses:**

`422 Unprocessable Entity` - Invalid input
```json
{
  "detail": [
	{
	  "type": "string",
	  "loc": ["body", "field_name"],
	  "msg": "validation error message",
	  "input": "invalid_value"
	}
  ]
}
```

`400 Bad Request` - Invalid assignee role
```json
{
  "error": {
	"code": "INVALID_ASSIGNEE",
	"message": "Only users with Developer role can be assigned to tasks"
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

### 5.5 Delete Task

**Endpoint:** `DELETE /tasks/{task_id}`

**Description:** Deletes a task.

**Authentication:** Required (JWT)

**Permissions:**
- Scrum Master
- Product Owner
- Developer (Task owner)

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
