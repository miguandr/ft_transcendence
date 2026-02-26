
## 3. Organizations

### 3.1 Create Organization

**Endpoint:** `POST /organizations`

**Description:** Creates a new organization.

**Authentication:** Required (JWT)

**Permissions:**
- The authenticated user

**Rules:**
- The user creating the organization becomes the organization admin.
- The `join_code` is generated server-side when the organization is created.
- The join code does not expire.
- The join code consists of 3 letters followed by 3 numbers.

**Request Body:**
```json
{
  "name": "string",
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

`409 Conflict` - Organization already exists
```json
{
  "error": {
	"code": "ORG_EXISTS",
	"message": "An organization with this name already exists."
  }
}
```
---
### 3.2 Select Role

**Endpoint:** `PATCH /organizations/{org_id}`

**Description:** Select the role inside the organization.

**Authentication:** Required (JWT)

**Permissions:**
- The authenticated user

**Rules:**
- The creator must choose an initial scrum role: `scrum_master` or `product_owner`.
- Only one `scrum_master` and one `product_owner` can exist per organization.
- Scrum roles are assigned only during organization creation and when joining an organization.
- Once both scrum roles are assigned, new members can only join as `developer`.

**Request Body:**
```json
{
  "scrum_role": "scrum_master | product_owner"
}
```

**Success Response:** `201 Created`
```json
{
  "scrum_role": "scrum_master | product_owner"
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

**Description:** Returns members of an organization with all their information.

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
		"avatar_url": "string | null",
		"org_role": "admin | member",
		"scrum_role": "scrum_master | product_owner | developer",

		"tickets": [
			{
				"id": "uuid",
				"title": "string",
				"status": "todo | in_progress | completed",
				"priority": "low | medium | high"
			}
		],

		"tasks": [
			{
				"id": "uuid",
				"title": "string",
				"status": "in_progress | completed",
				"ticket_id": "uuid"
			}
		],

		"blockers": [
			{
				"id": "uuid",
				"description": "string",
				"status": "open | resolved",
				"created_at": "timestamp"
			}
		]
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

### 3.4 Invite Member to Organization

**Endpoint:** `POST /organizations/{org_id}/members`

**Description:** Send an email to a user with the join_code to join the organization.

**Authentication:** Required (JWT)

**Permissions:**
- Organization admin

**URL Parameters:**
- `org_id` - UUID of the organization

**Request Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

**Success Response:** `201 Created`
```json
{
  "email": "string"
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

### 3.6 Join Organization by Code

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
  "org_role": "member | admin", //first one is admin. then all other member that joins are just members
  "scrum_role": "scrum_master | product_owner | developer"
}
```

**Error Responses:**
`400 Bad Request` - Wether a code exists
```json
{
  "error": {
	"code": "INVALID_CODE",
	"message": "Invalid code."
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

