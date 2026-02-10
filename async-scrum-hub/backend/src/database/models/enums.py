from enum import StrEnum

class Status(StrEnum):
	TODO = "todo"
	IN_PROGRESS = "in_progress"
	COMPLETED = "completed"

class Priority(StrEnum):
	LOW = "low"
	MEDIUM = "medium"
	HIGH = "high"


#class OrgRole(StrEnum):
#	admin = "admin"
#	member = "member"

#class ScrumRole(StrEnum):
#	scrum_master = "scrum_master"
#	product_owner = "product_owner"
#	developer = "developer"
