## 4. Tickets

### 4.1 Create Tickets

**Endpoint:** `POST /organizations/{org_id}/tickets`

**Description:** Creates a new ticket within an organization.

**Assignment Rules:**
- The `assignee_id` field can only be assigned to users with the **Developer** role.
- Scrum Masters and Product Owners cannot be assigned to tickets.
- If `assignee_id` is provided, the backend must validate that the user has the Developer role.

**Authentication:** Required (JWT)

**Permissions:**
- Scrum Master
- Product Owner

**URL Parameters:**
- `org_id` - UUID of the organization

**Request Body:**
```json
{
  "title": "string",
  "description": "string | null",
  "priority": "low | medium | high",
  "assignee_id": "uuid | null"  // Must be a user with Developer role
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "status": "todo | in_progress | completed",
  "priority": "low | medium | high",
  "created_by": "uuid",
  "assignee_id": "uuid | null",
  "organization_id": "uuid",
  "created_at": "timestamp",
  "updated_at": "timestamp"
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
	"message": "Only users with Developer role can be assigned to tickets"
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

### 4.2 List Tickets (Board)

**Endpoint:** `GET /organizations/{org_id}/tickets`

**Description:** Returns tickets for an organization, optionally filtered by status.
Used to render the organization board.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member.

**URL Parameters:**
- `org_id` - UUID of the organization

**Query Parameters:**
- status – todo | in_progress | completed
- priority - low | medium | high

**Examples:**
- `GET /organizations/{org_id}/tickets`
- `GET /organizations/{org_id}/tickets?status=todo`
- `GET /organizations/{org_id}/tickets?status=in_progress`
- `GET /organizations/{org_id}/tickets?status=completed`
- `GET /organizations/{org_id}/tickets?priority=low`
- `GET /organizations/{org_id}/tickets?priority=medium`
- `GET /organizations/{org_id}/tickets?priority=high`

**Success Response:** `200 OK`
```json
[
	{
		"id": "uuid",
		"title": "string",
		"status": "todo | in_progress | completed",
		"priority": "low | medium | high",
		"assignee": {
			"id": "uuid",
			"name": "string",
			"avatar_url": "string | null"
		},
		"created_at": "timestamp",
		"updated_at": "timestamp"
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


### 4.3 Get Ticket Details

**Endpoint:** `GET /tickets/{ticket_id}`

**Description:** Returns detailed information about a specific ticket.

**Authentication:** Required (JWT)

**Permissions:**
- Any organization member.

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Success Response:** `200 OK`
```json
{
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "status": "todo | in_progress | completed",
    "priority": "low | medium | high",
    "created_by": "UserBrief",
    "assignee_id": "uuid | null",
    "organization_id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp",
	"tasks": [
            {
                "id": "uuid",
                "title": "string",
                "status": "in_progress | completed"
                
            }
		],

"blockers": [
            {
                "id": "uuid",
                "description": "string",
                "status": "open | resolved",
                
            }
	]
}

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

### 4.4 Update Ticket

**Endpoint:** `PATCH /tickets/{ticket_id}`

**Description:** Updates ticket fields such as title, description, priority, assignee, or status.

**Assignment Rules:**
- The `assignee_id` field can only be assigned to users with the **Developer** role.
- Scrum Masters and Product Owners cannot be assigned to tickets.
- Only Product Owners can change the priority.
- If `assignee_id` is provided, the backend must validate that the user has the Developer role.

**Authentication:** Required (JWT)

**Permissions:**
- Scrum Master (except priority)
- Product Owner

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Request Body:**
```json
{
	"title": "string (optional)",
	"description": "string | null (optional)",
	"priority": "low | medium | high (optional)",
	"status": "todo | in_progress | completed (optional)",
	"assignee_id": "uuid | null (optional)"  // Must be a user with Developer role
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"title": "string",
	"description": "string | null",
	"status": "todo | in_progress | completed",
	"priority": "low | medium | high",
	"created_by": "uuid",
	"assignee_id": "uuid | null",
	"organization_id": "uuid",
	"created_at": "timestamp",
	"updated_at": "timestamp"
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
	"message": "Only users with Developer role can be assigned to tickets"
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

### 4.5 Move Ticket (Drag & Drop)

**Endpoint:** `PATCH /tickets/{ticket_id}/move`

**Description:** Moves a ticket between board columns by updating its status.

**Authentication:** Required (JWT)

**Permissions:**
- Scrum Master
- Product Owner

**URL Parameters:**
- `ticket_id` - UUID of the ticket

**Request Body:**
```json
{
	"status": "todo | in_progress | completed"
}
```

**Success Response:** `200 OK`
```json
{
	"id": "uuid",
	"status": "todo | in_progress | completed",
	"updated_at": "timestamp"
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

### 4.6 Delete Ticket

**Endpoint:** `DELETE /tickets/{ticket_id}`

**Description:** Deletes a ticket and all its associated tasks and blockers.

**Authentication:** Required (JWT)

**Permissions:**
- Scrum Master
- Product Owner

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
