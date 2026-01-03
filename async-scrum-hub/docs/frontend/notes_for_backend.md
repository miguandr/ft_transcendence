Organizations:
	DELETE /organizations/{org_id}
  - Delete organization (only if last admin)

Projects:
	DELETE /projects/{proj_id}
  - Delete project

	PATCH /projects/{proj_id}/members/{user_id}/role
  - Update member's scrum_role (scrum_master, product_owner, developer)

Sprints:
	DELETE /sprints/{sprint_id}
  - Delete sprint (Scrum Master only)

