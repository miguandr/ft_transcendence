//Domain value types
export type TicketStatus = "todo" | "in_progress" | "completed";
export type TaskStatus = "in_progress" | "completed";
export type Priority = "high" | "medium" | "low";
export type UserRole = "product_owner" | "scrum_master" | "developer";
export type BlockerStatus = "open" | "resolved";

//Domain Entities
export interface Ticket {
	id: string;
	title: string;
	description: string | null;
	status: TicketStatus;
	priority: Priority;
	created_by: UserRef;
	assignee_id: string | null;
	organization_id: string;
	created_at: string;
	updated_at: string;
}

export interface ListTicketsBoard
{
	id: string;
	title: string;
	status: TicketStatus,
	priority: Priority;
	assignee: UserRef | null;
	created_at: string;
	updated_at: string;
}

export interface Task
{
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	created_by: UserRef;
	assignee_id: string;
	ticket_id: string;
}

export type TaskSummary = Pick<Task, 'id' | 'title' | 'status'>;

export interface Blocker
{
	id: string;
	description: string;
	status: BlockerStatus;
	created_by: UserRef;
	assignee_id: string | null;
	ticket_id: string | null;
	created_at: string;
	resolved_at: string | null;
}

export interface UserRef {
	id: string;
	name: string;
	avatar_url : string | null;
}
