// Mock API - simulates backend
// Later, replace with real fetch calls to http://localhost:8000/api/v1
import type{
	User,
	OrganizationMember,
	SignUpRequest,
	SignUpResponse,
	CreateOrgRequest,
	CreateOrgResponse,
	JoinOrgRequest,
	JoinOrgResponse,
	SelectRoleResponse,
	LoginRequest,
	LoginResponse,
	UpdateUserRequest,
	AvatarRequest,
	AvatarResponse,
	InviteMemberRequest,
	InviteMemberResponse,
	DashboardData,
	CreateTicketRequest,
	TicketResponse,
	ListTicketsBoardResponse,
	UpdateTicketRequest,
	MoveTicketRequest,
	MoveTicketResponse,
	CreateTaskRequest,
	CreateTaskResponse,
	ListTaskResponse,
	TaskResponse,
	UpdateTaskRequest,
	CreateStandupRequest,
	CreateStandupResponse,
	StandupListItem,
	EditStandupRequest,
	EditStandupResponse,
	CreateBlockerRequest,
	CreateBlockerResponse,
	BlockerListItem,
	UpdateBlockerRequest,
	UpdateBlockerResponse,
	AnalitycsData,
	LegalDocuments,
} from "../types/api.types"

//const API_URL = "http://localhost:8000/api/v1";

const rawApiUrl = import.meta.env.VITE_API_URL;
if (!rawApiUrl) {
	throw new Error(
		"Missing VITE_API_URL. Set it in frontend/.env or frontend/.env.local (see frontend/.env.example)."
	);
}
const API_URL = rawApiUrl.replace(/\/+$/, "");

const CURRENT_USER_ID_KEY = "current_user_id";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// export type TicketStatus = "todo" | "in_progress" | "completed";
// export type TaskStatus = "in_progress" | "completed";
// export type BlockerStatus = "open" | "resolved";

// =============================================================
// MOCK DATA
// =============================================================

//Mock User database (in real backend, this is PostgreSQL)
const mockUsers: Array<{
	id: string;
	email: string;
	password: string; // In real backend, this would be hashed!
	name: string;
	avatar_url: string | null;
	org_name: string | null;
	organization_id: string | null;
	scrum_role: "scrum_master" | "product_owner" | "developer" | null;
	org_role: "admin" | "member" | null;
}> = [
	{
		id: "1",
		email: "miguel@example.com",
		password: "password123", // In real backend, this would be hashed!
		name: "Miguel Andrade",
		avatar_url: null,
		org_name: "Las Empanadas",
		organization_id: "2",
		scrum_role: "scrum_master",
		org_role: "admin",
	},
	{
		id: "2",
		email: "pedro@example.com",
		password: "password123", // In real backend, this would be hashed!
		name: "Pedro Perez",
		avatar_url: null,
		org_name: "Las Arepas",
		organization_id: "2",
		scrum_role: "product_owner",
		org_role: "member",
	},
	{
		id: "3",
		email: "pepa@example.com",
		password: "password123", // In real backend, this would be hashed!
		name: "Pepa Perez",
		avatar_url: null,
		org_name: "Las Cachapas",
		organization_id: "2",
		scrum_role: "developer",
		org_role: "member",
	},
];

const mockOrganizations = [
	{
		id: "2",
		name: "TeamX",
		join_code: "SRC-444",
		created_by: "user_0",
	},
];

const mockTickets: Array<{
	id: string;
	title: string;
	status: "todo" | "in_progress" | "completed";
	priority: "low" | "medium" | "high";
	assignee_id: string;
}> = [
	{
		id: "10",
		title: "Update dashboard charts",
		status: "todo",
		priority: "medium",
		assignee_id: "1",
	},
];

//Mock Tasks
const mockTasks: Array<{
	id: string;
	title: string;
	status: "in_progress" | "completed";
	ticket_id: string;
	assignee_id: string;
}> = [
	{
		id: "21",
		title: "Build login UI",
		status: "in_progress",
		ticket_id: "10",
		assignee_id: "1",
	},
];

const mockBlockers: Array<{
	id: string;
	description: string;
	status: "open" | "resolved";
	created_by: {
		id: string;
		name: string;
		avatar_url: string | null;
	};
	assignee: {
		id: string;
		name: string;
		avatar_url: string | null;
	} | null;
	ticket: {
		id: string;
		title: string;
	};
	created_at: string;
	resolved_at: string | null;
}> = [
	{
		id: "32",
		description: "Waiting for API keys from client",
		status: "open",
		created_by: {
			id: "1",
			name: "Miguel Andrade",
			avatar_url: null,
		},
		assignee: {
			id: "2",
			name: "Pepa Perez",
			avatar_url: null,
		},
		ticket: {
			id: "21",
			title: "Implement OAuth flow",
		},
		created_at: "2024-02-10T10:00:00Z",
		resolved_at: null,
	},
	{
		id: "33",
		description: "Design assets not yet approved",
		status: "resolved",
		created_by: {
			id: "2",
			name: "Pepa Perez",
			avatar_url: null,
		},
		assignee: null,
		ticket: {
			id: "1",
			title: "Design settings page",
		},
		created_at: "2026-02-08T14:30:00Z",
		resolved_at: "2026/02/17",
	},
];

const mockStandups: Array<{
	id: string;
	created_at: string;
	today: string;
	yesterday: string | null,
	blocker_ids: string[];
	created_by: {
		name: string;
		id: string;
		avatar_url: string | null;
	}
}> = [
	{
		id: "11",
		created_at: "2026-02-17T10:00:00Z",
		today: "Working on OAuth integration with Google and GitHub",
		yesterday: null, //"Completed user authentication flow, fixed session persistence bug",
		blocker_ids: ["32", "33"],
		created_by: {
			name: "Miguel Andrade",
			id: "1",
			avatar_url: null,
		}
	},
	{
		id: "12",
		created_at: "2024-02-18T14:30:00Z",
		today: "Creating responsive layouts for mobile view",
		yesterday: "Finalized dashboard redesign, updated component library",
		blocker_ids: [],
		created_by: {
			name: "Pepa Perez",
			id: "2",
			avatar_url: null,
		}
	}
]

const mockLegalDocuments: Record<string, LegalDocuments> = {
	privacy: {
		key: "privacy",
		title: "Privacy Policy",
		content: "# Privacy Policy\n\nThis is a placeholder.",
		updated_at: "2024-01-01T00:00:00Z",
	},
	terms: {
		key: "terms",
		title: "Terms of Service",
		content: "# Terms of Service\n\nThis is a placeholder.",
		updated_at: "2024-01-01T00:00:00Z",
	},
};

const mockAnalitycs : AnalitycsData = {
	tasks: [
		{ week: "Week 1", in_progress: 10, completed: 8 },
		{ week: "Week 2", in_progress: 12, completed: 14 },
		{ week: "Week 3", in_progress: 8, completed: 10 },
		{ week: "Week 4", in_progress: 5, completed: 12 },
	],
	tickets: [
		{ week: "Week 1", completed: 4 },
		{ week: "Week 2", completed: 7 },
		{ week: "Week 3", completed: 5 },
		{ week: "Week 4", completed: 9 },
	],
	standups: { posted: 115, total: 120 },
	blockers_avg_cycle_time: 1.5,
};

// ///////////////////////////////////////////////////
// // API Response types (matches API_CONTRACTS.md) //
// ///////////////////////////////////////////////////
// export interface User {
// 	id: string;
// 	email: string;
// 	name: string;
// 	avatar_url: string | null;
// 	organization_id: string | null;
// 	org_name: string | null;
// 	scrum_role: "scrum_master" | "product_owner" | "developer" | null;
// 	org_role: "admin" | "member" | null;
// }


// export interface OrganizationMember {
// 	id: string;
// 	name: string;
// 	avatar_url: string | null;
// 	org_role: "admin" | "member";
// 	scrum_role: "scrum_master" | "product_owner" | "developer";

// 	tickets: Array<{
// 		id: string;
// 		title: string;
// 		status: "todo" | "in_progress" | "completed";
// 		priority: "low" | "medium" | "high";
// 	}>;

// 	tasks: Array<{
// 		id: string;
// 		title: string;
// 		status: "in_progress" | "completed";
// 		ticket_id: string;
// 	}>;

// 	blockers: Array<{
// 		id: string;
// 		description: string;
// 		status: "open" | "resolved";
// 		created_at: string;
// 	}>;
// }



// =============================================================
// HELPER FUNCTIONS
// =============================================================

// API errors matching contract format
function createApiError(code: string, message: string): never {
	throw {
		error: { code, message },
	};
}

// Uses data from local storage
function getCurrentUserRecord() {
	const currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
	if (!currentUserId) {
		createApiError("UNAUTHORIZED", "No user logged in");
	}

	const user = mockUsers.find((u) => u.id === currentUserId);
	if (!user) {
		createApiError("UNAUTHORIZED", "User not found");
	}

	return user;
}

// // =============================================================
// // SPRINTBOARD - TICKETS
// // =============================================================

// //Interfaces
// export interface CreateTicketRequest {
// 	title: string;
// 	description: string;
// 	priority: "low" | "medium" | "high";
// 	assignee_id: string | null;
// }

// export interface TicketResponse {
// 	id: string;
// 	title: string;
// 	description: string | null;
// 	status: "todo" | "in_progress" | "completed";
// 	priority: "low" | "medium" | "high";
// 	created_by: {
// 		id: string;
// 		name: string;
// 		avatar_url: string | null;
// 	}
// 	assignee_id: string | null;
// 	organization_id: string;
// 	created_at: string;
// 	updated_at: string;
// 	tasks: Array<{
// 		id: string;
// 		title: string;
// 		status: TaskStatus;
// 	}>
// 	blockers: Array<{
// 		id: string;
// 		description: string;
// 		status: BlockerStatus;
// 		created_by: {
// 			id: string;
// 			name: string;
// 			avatar_url: string;
// 		}
// 	}>
// }

// export interface ListTicketsBoardResponse {
// 	id: string;
// 	title: string;
// 	status: "todo" | "in_progress" | "completed";
// 	priority: "low" | "medium" | "high";
// 	assignee: {
// 		id: string;
// 		name: string;
// 		avatar_url: string;
// 	} | null;
// 	created_at: string;
// 	updated_at: string;
// }

// export interface UpdateTicketRequest {
// 	title?: string;
// 	description?: string;
// 	priority?: "low" | "medium" | "high";
// 	status?: "todo" | "in_progress" | "completed";
// 	assignee_id?: string | null;
// }

// export interface MoveTicketRequest {
// 	status: "todo" | "in_progress" | "completed";
// }

// export interface MoveTicketResponse {
// 	id: string;
// 	status: "todo" | "in_progress" | "completed";
// 	updated_at: string;
// }



// // =============================================================
// // SPRINTBOARD - TASKS
// // =============================================================

// //Interfaces
// export interface CreateTaskRequest {
// 	title: string;
// 	description: string | null;
// 	assignee_id: string | null;
// }

// export interface CreateTaskResponse {
// 	id: string;
// 	title: string;
// 	description: string | null;
// 	status: "in_progress";
// 	created_by: string;
// 	assignee_id: string | null;
// 	ticket_id: string;
// }

// export interface ListTaskResponse {
// 	id: string;
// 	title: string;
// 	status: "in_progress" | "completed";
// }

// export interface TaskResponse {
// 	id: string;
// 	title: string;
// 	description: string | null;
// 	status: "in_progress" | "completed";
// 	created_by: string;
// 	assignee_id: string | null;
// 	ticket_id: string;
// }

// export interface UpdateTaskRequest {
// 	title?: string;
// 	description?: string;
// 	status?: "in_progress" | "completed";
// 	assignee_id?: string | null;
// }

// // =============================================================
// // DASHBOARD
// // =============================================================

// //Interfaces
// export interface DashboardData {
// 	summary: {
// 		tasks_in_progress: number;
// 		tickets_completed: number;
// 		active_blockers: number;
// 	};
// 	recent_updates: Array<{
// 		user: {
// 			id: string
// 			name: string;
// 			avatar_url: string;
// 		};
// 		type: "task" | "ticket";
// 		event: "created" | "completed";
// 		title: string;
// 		timestamp: string;
// 	}>;
// }



// =============================================================
// ANALITYCS
// =============================================================

// export interface AnalitycsData {
// 	tasks: Array<{
// 		week: string,
// 		in_progress: number,
// 		completed: number
// 	}>;

// 	tickets: Array<{
// 		week: string,
// 		completed: number,
// 	}>;

// 	standups: {
// 		posted: number,
// 		total: number,
// 	};
// 	blockers_avg_cycle_time: number;
// }

// export async function getAnalitycsData(
// 	org_id: string
// ) : Promise<AnalitycsData> {
// 	await delay(300);
// 	const currentUser = getCurrentUserRecord();

// 	if (!org_id) {
// 		createApiError("NOT_FOUND", "Organization not found");
// 	}
// 	if (!currentUser) {
// 		createApiError("UNAUTHORIZED", "Authentication required");
// 	}
// 	if (org_id !== currentUser.organization_id) {
// 		createApiError("FORBIDDEN", "You do not have permission to perform this action");
// 	}

// 	return (mockAnalitycs);
// }

// =============================================================
// TERMS & POLICY
// =============================================================

// export interface LegalDocuments {
// 	key: string;
// 	title: string;
// 	content: string;
// 	updated_at: string;
// }

// export async function getLegalDocument(
// 	key: "privacy" | "terms"
// ) : Promise<LegalDocuments> {
// 	await delay(200);

// 	const document = mockLegalDocuments[key];

// 	if (!document) {
// 		createApiError("NOT_FOUND", "Legal document not found");
// 	}

// 	return (document);
// }


// =============================================================
// MOCK TOPBAR
// =============================================================

//Interfaces
// interface UpdateUserRequest {
// 	name: string;
// 	email: string;
// }

// interface AvatarRequest {
// 	file: File;
// }

// interface AvatarResponse {
// 	avatar_url: string;
// }

// interface InviteMemberRequest {
// 	name: string;
// 	email: string;
// }

// interface InviteMemberResponse {
// 	email: string;
// }


// // Update user information
// export async function updateUser(
// 	data: UpdateUserRequest
// ) : Promise<User> {
// 	await delay(500);
// 	const currentUser = getCurrentUserRecord();

// 	//1. VALIDATION
// 	//Check if name isnt empty
// 	if (!data.name.trim()) {
// 		createApiError("INVALID_INPUT", "Name cant be empty");
// 	}
// 	//Check if email is valid
// 	if (!/\S+@\S+\.\S+/.test(data.email)) {
// 		createApiError("INVALID_INPUT", "Email format is invalid");
// 	}
// 	//Check if email already exists
// 	const existingEmail = mockUsers.find((e) => e.email === data.email && e.id != currentUser.id);
// 	if (existingEmail) {
// 		createApiError("INVALID_INPUT", "This email is already in use");
// 	}

// 	//2. UPDATE DATA
// 	currentUser.name = data.name;
// 	currentUser.email = data.email;

// 	//3. RETURN RESPONSE SHAPE
// 	return (currentUser);
// }

// // Upload Avatar
// export async function uploadAvatar(
// 	data: AvatarRequest
// ) : Promise<AvatarResponse> {
// 	await delay(500);
// 	const currentUser = getCurrentUserRecord();

// 	//1. VALIDATION
// 	//Check if user provided a file
// 	if (!data.file) {
// 		createApiError("INVALID_INPUT", "No file provided");
// 	}

// 	//2. UPLOAD FILE
// 	const mockUrl = `mock-avatar-${Date.now()}.jpg`;
// 	currentUser.avatar_url = mockUrl;

// 	//3. RETURN RESPONSE SHAPE
// 	return { avatar_url: mockUrl };
// }

//Invite Member to organization
export async function inviteMember(
	org_id: string,
	data: InviteMemberRequest
) : Promise<InviteMemberResponse> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	const org_info = mockOrganizations
		.find((c) => c.id === org_id);
	//	.find((c) => c.join_code);

	//1. VALIDATION
	//Checl if organization exists
	if (!org_info?.id) {
		createApiError("NOT_FOUND", "Organization not found");
	}
	//Check user's permission
	if (currentUser.org_role !== "admin") {
		createApiError("FORBIDDEN", "You do not have permission to perform this action");
	}
	//Check if name isnt empty
	if (!data.name.trim()) {
		createApiError("INVALID_INPUT", "Name cant be empty");
	}
	//Check if email is valid
	if (!/\S+@\S+\.\S+/.test(data.email)) {
		createApiError("INVALID_INPUT", "Email format is invalid");
	}
	//Check if email already exists in the organization
	const existingEmail = mockUsers.find((e) => e.email === data.email);
	if (existingEmail) {
		createApiError("ALREADY_MEMBER", "User is already a member of this organization");
	}

	return { email: data.email };
}

// // =============================================================
// // MOCK TEAM SETUP
// // =============================================================

// //Interfaces
// interface CreateOrgRequest {
// 	name: string;
// }

// interface CreateOrgResponse {
// 	id: string;
// 	name: string;
// 	join_code: string;
// 	created_by: string;
// }

// interface JoinOrgRequest {
// 	join_code: string;
// }

// interface JoinOrgResponse {
// 	organization_id: string;
// 	org_role: "admin" | "member";
// 	available_scrum_role: Array <{
// 		role: "scrum_master" | "product_owner" | "developer";
// 	}>;
// }

// interface SelectRoleResponse {
// 	organization_id: string,
// 	scrum_role: "scrum_master" | "product_owner" | "developer"
// }

//existe?
// interface OrganizationInfo {
// 	id: string;
// 	name: string;
// 	join_code: string;
// 	members_count: number;
// }


// // Create Organization
// export async function createOrganization(data: CreateOrgRequest): Promise<CreateOrgResponse> {
// 	await delay(500);
// 	const currentUser = getCurrentUserRecord();

// 	//Check if user sent empty name
// 	if (!data.name.trim()) {
// 		createApiError("INVALID_INPUT", "Organization name is required");
// 	}

// 	//Check if organization already exists
// 	//find() assigns to org the values in mockOrganizations to compare
// 	const existingOrg = mockOrganizations.find((org) => org.name === data.name);
// 	if (existingOrg) {
// 		createApiError("ORG_EXISTS", "An organization with this name already exists");
// 	}

// 	//Create new organization
// 	const newOrg = {
// 		id: `id-${Date.now()}`,
// 		name: data.name,
// 		join_code: `SCR-${Math.floor(100 + Math.random() * 900)}`,
// 		created_by: currentUser.id,
// 	};

// 	//Update user data
// 	currentUser.organization_id = newOrg.id;
// 	currentUser.org_role = "admin";

// 	//Add to mock database
// 	mockOrganizations.push(newOrg);

// 	//Return response
// 	return {
// 		id: newOrg.id,
// 		name: newOrg.name,
// 		join_code: newOrg.join_code,
// 		created_by: newOrg.created_by,
// 	};
// }


// // Join Organization
// export async function joinOrganization(data: JoinOrgRequest): Promise<JoinOrgResponse> {
// 	await delay(500);
// 	const currentUser = getCurrentUserRecord();

// 	if (!data.join_code.trim()) {
// 		throw createApiError("INVALID_CODE", "Team code is required");
// 	}

// 	const matchingOrg = mockOrganizations.find((org) => org.join_code === data.join_code);
// 	if (!matchingOrg) {
// 		throw createApiError("CODE_NOT_FOUND", "Team code not found");
// 	}

// 	if (currentUser.organization_id === matchingOrg.id) {
// 		throw createApiError("ALREADY_MEMBER", "User is already a member of this organization");
// 	}

// 	const takenRoles = mockUsers
// 		.filter((u) => u.organization_id === matchingOrg.id && u.scrum_role !== null)
// 		.map((u) => u.scrum_role as "scrum_master" | "product_owner" | "developer");

// 	const allRoles: Array<"scrum_master" | "product_owner" | "developer"> = ["scrum_master", "product_owner", "developer"];
// 	const available_scrum_role = allRoles
// 		.filter((r) => r === "developer" || !takenRoles.includes(r))
// 		.map((r) => ({ role: r }));

// 	return {
// 		organization_id: matchingOrg.id,
// 		org_role: "member",
// 		available_scrum_role,
// 	};
// }


// // Set User Role
// export async function setUserRole(data: {
// 	organization_id: string;
// 	scrum_role: "scrum_master" | "product_owner" | "developer";
// }): Promise<{ success: boolean }> {
// 	await delay(300);
// 	const currentUser = getCurrentUserRecord();

// 	const org = mockOrganizations.find((o) => o.id === data.organization_id);
// 	if (!org) createApiError("NOT_FOUND", "Organization not found");

// 	currentUser.organization_id = data.organization_id;
// 	currentUser.org_name = org.name;
// 	currentUser.org_role = "admin";
// 	currentUser.scrum_role = data.scrum_role;

// 	return { success: true };
// }


// export async function getOrganizationMembers(org_id: string): Promise<OrganizationMember[]> {
// 	await delay(300);

// 	if (!org_id) {
// 		createApiError("NOT_FOUND", "No members found in this organization");
// 	}

// 	const orgMembers = mockUsers
// 		.filter((user) => user.organization_id === org_id && user.org_role !== null && user.scrum_role !== null)
// 		.map((user) => {
// 			const userTickets = mockTickets
// 				.filter((t) => t.assignee_id === user.id)
// 				.map(({ id, title, status, priority }) => ({ id, title, status, priority }));

// 			const userTasks = mockTasks
// 				.filter((t) => t.assignee_id === user.id)
// 				.map(({ id, title, status, ticket_id }) => ({ id, title, status, ticket_id }));

// 			const userBlockers = mockBlockers
// 				.filter((b) => b.created_by.id === user.id)
// 				.map((b) => ({
// 					id: b.id,
// 					description: b.description,
// 					status: b.status,
// 					created_at: b.created_at,
// 					created_by: b.created_by.id,
// 				}));

// 			return {
// 				id: user.id,
// 				name: user.name,
// 				avatar_url: user.avatar_url,
// 				org_role: user.org_role as "admin" | "member",
// 				scrum_role: user.scrum_role as "scrum_master" | "product_owner" | "developer",
// 				tickets: userTickets,
// 				tasks: userTasks,
// 				blockers: userBlockers,
// 			};
// 		});

// 	return orgMembers;
// }


// // =============================================================
// // MOCK LOGIN
// // =============================================================

// // Interfaces
// interface LoginRequest {
// 	email: string;
// 	password: string;
// }

// interface LoginResponse {
// 	access_token: string;
// 	token_type: string;
// }


// // Login
// export async function login(credentials: LoginRequest): Promise<LoginResponse> {
// 	// Simulate network delay (500ms)
// 	await delay(500);

// 	// Find user by email
// 	const user = mockUsers.find((u) => u.email === credentials.email);

// 	// Check if user exists and password matches
// 	if (!user || user.password !== credentials.password) {
// 		createApiError("INVALID_CREDENTIALS", "Email or password is incorrect");
// 	}

// 	// Generate fake JWT token
// 	const response: LoginResponse = {
// 		access_token: `mock-jwt-token-${Date.now()}`,
// 		token_type: "bearer",
// 	};

// 	// Store token in localStorage
// 	localStorage.setItem("token", response.access_token);
// 	localStorage.setItem(CURRENT_USER_ID_KEY, user.id);

// 	return response;
// }

// // =============================================================
// // MOCK SIGNUP
// // =============================================================

// //Interfaces
// interface SignUpRequest {
// 	name: string;
// 	email: string;
// 	password: string;
// }

// interface SignUpResponse {
// 	id: string;
// 	name: string;
// 	email: string;
// }

// // Mock signup function
// export async function signup(data: SignUpRequest): Promise<SignUpResponse> {
// 	// Simulate network delay
// 	await delay(800);

// 	// Check if user already exists
// 	const existingUser = mockUsers.find((u) => u.email === data.email);
// 	if (existingUser) {
// 		createApiError("USER_EXISTS", "An account with this email already exists");
// 	}

// 	// Validate email format
// 	if (!/\S+@\S+\.\S+/.test(data.email)) {
// 		createApiError("INVALID_INPUT", "Email format is invalid");
// 	}

// 	// Create new user
// 	const newUser = {
// 		id: `user-${Date.now()}`,
// 		email: data.email,
// 		password: data.password,
// 		name: data.name,
// 		org_name: null,
// 		organization_id: null,
// 		scrum_role: null,
// 		org_role: null,
// 		avatar_url: null,
// 	};

// 	// Add to mock database
// 	mockUsers.push(newUser);

// 	// Simulate auto-login after signup
// 	localStorage.setItem("token", `mock-jwt-token-${Date.now()}`);
// 	localStorage.setItem(CURRENT_USER_ID_KEY, newUser.id);

// 	// Return response (excluding password)
// 	return {
// 		id: newUser.id,
// 		name: newUser.name,
// 		email: newUser.email,
// 	};
// }

// // =============================================================
// // MOCK USER
// // =============================================================

// //Mock getCurrentUser function
// export async function getCurrentUser() : Promise<User> {
// 	await delay(300);

// 	// Simulate checking the JWT token
// 	const token = localStorage.getItem("token");

// 	if (!token) {
// 		createApiError("UNAUTHORIZED", "Missing token");
// 	}

// 	// Return mock user data
// 	return getCurrentUserRecord();
// }


// Mock removeMember function
// export async function removeMember(
// 	org_id: string,
// 	member_id: string
// ): Promise<{ success: boolean }> {
// 	await delay(500);
// 	const currentUser = getCurrentUserRecord();

// 	// Step 1: Check if current user is an admin
// 	if (currentUser.org_role !== "admin") {
// 		createApiError("FORBIDDEN", "Only admins can remove members");
// 	}

// 	// Step 2: Check if current user belongs to this organization
// 	if (currentUser.organization_id !== org_id) {
// 		createApiError("FORBIDDEN", "You are not a member of this organization");
// 	}

// 	// Step 3: Find the member to remove
// 	const memberToRemove = mockUsers.find(
// 		(u) => u.id === member_id && u.organization_id === org_id
// 	);
// 	if (!memberToRemove) {
// 		createApiError("NOT_FOUND", "Member not found in this organization");
// 	}

// 	// Step 4: Prevent removing admin users
// 	if (memberToRemove.org_role === "admin") {
// 		createApiError("FORBIDDEN", "Cannot remove admin members");
// 	}

// 	// Step 5: Remove the member (set their org fields to null)
// 	memberToRemove.organization_id = null;
// 	memberToRemove.org_role = null;
// 	memberToRemove.scrum_role = null;

// 	return { success: true };
// }

// // =============================================================
// // STANDUPS
// // =============================================================

// // Interfaces
// interface CreateStandupRequest {
// 	today: string;
// }

// interface CreateStandupResponse {
// 	id: string;
// 	created_at: string;
// 	today: string;
// 	yesterday: string | null;
// 	blocker_ids: string[];
// 	created_by: {
// 		name: string;
// 		id: string;
// 		avatar_url: string | null;
// 	}
// };

// export interface StandupListItem {
// 	id: string;
// 	created_at: string;
// 	today: string;
// 	yesterday: string | null;
// 	blockers: {
// 		id: string;
// 		title: string;
// 		ticket: {
// 			id: string;
// 			title: string;
// 		}
// 	} [];
// 	created_by: {
// 		id: string;
// 		name: string;
// 		avatar_url: string | null;
// 	}
// }

// interface EditStandupRequest {
// 	today?: string;
// }

// interface EditStandupResponse {
// 	id: string;
// 	today: string;
// }


// // Create Standup
// export async function createStandup(
// 	org_id: string,
// 	data: CreateStandupRequest
// ) : Promise<CreateStandupResponse> {
// 	await delay(500);
// 	const currentUser = getCurrentUserRecord();

// 	if (currentUser.organization_id !== org_id) {
// 		createApiError("FORBIDDEN", "You are not a member of this organization");
// 	}

// 	if (!data.today.trim()) {
// 		createApiError("INVALID_INPUT", "Entry is required");
// 	}

// 	// ---DATE SETUP---
// 	// Get today's date in YYYY-MM-DD format (e.g., "2024-02-15")
// 	const now = new Date();
// 	const today = now.toISOString().split('T')[0];

// 	//Calculate yesterday
// 	const yesterdayDate = new Date();
// 	yesterdayDate.setDate(now.getDate() - 1);
// 	const yesterday = yesterdayDate.toISOString().split('T')[0];

// 	// Check if this user already has a standup starting with that date string
// 	const alreadySubmitted = mockStandups.some(s =>
// 		s.created_by.id ===currentUser.id &&
// 		s.created_at.startsWith(today)
// 	);
// 	if (alreadySubmitted) {
// 		createApiError("STANDUP_ALREADY_EXISTS", "You have already created a standup for today");
// 	}

// 	// ---FILTERED BLOCKERS---
// 	// Get active blockers
// 	const openBlockerIds = mockBlockers
// 	.filter(blockers => {
// 		const isOpen = blockers.status === "open";
// 		const creator = mockUsers.find(u => u.id === blockers.created_by.id);
// 		return isOpen && creator?.organization_id == org_id;
// 	})
// 	.map(blocker => blocker.id);

// 	// Get the standup created on the prebious calender date
// 	const YesterdayStandup = mockStandups.find(s =>
// 		s.created_by.id == currentUser.id &&
// 		s.created_at.startsWith(yesterday)
// 	);

// 	// Create new standup
// 	const newStandup = {
// 		id: `standup-${Date.now()}`,
// 		created_at: now.toISOString(),
// 		today: data.today,
// 		yesterday: YesterdayStandup?.today || null,
// 		blocker_ids: openBlockerIds,
// 		created_by: {
// 			id: currentUser.id,
// 			name: currentUser.name,
// 			avatar_url: currentUser.avatar_url,
// 		}
// 	};

// 	mockStandups.push(newStandup);
// 	return (newStandup);
// }

// //List Standups
// export async function listStandups(
// 	org_id: string,
// ): Promise<StandupListItem[]> {
// 	await delay(300);
// 	const currentUser = getCurrentUserRecord();

// 	// Validate user belongs to organization
// 	if (currentUser.organization_id !== org_id) {
// 		createApiError("FORBIDDEN", "You are not a member of this organization");
// 	}

// 	const filteredStandups = mockStandups.filter((standups) => {
// 		const creator = mockUsers.find((u) => u.id === standups.created_by.id);

// 		return creator?.organization_id === org_id;
// 	});

// 	return filteredStandups.map((s) => ({
// 		id: s.id,
// 		created_at: s.created_at,
// 		today: s.today,
// 		yesterday: s.yesterday,
// 		blockers: s.blocker_ids
// 		.map((ids) => mockBlockers.find((b) => b.id === ids)) // get from blockers the info from the blocker_ids in this standup
// 		.filter((b): b is NonNullable<typeof b> => Boolean(b)) // filter undefined and toss them to avoid crash
// 		.map((b) => ({ // map the data how we need it
// 			id: b.id,
// 			title: b.description,
// 			ticket: {
// 				id: b.ticket.id,
// 				title: b.ticket.title,
// 			},
// 		})),
// 		created_by: s.created_by,
// 	}));
// }

// // Edit Standup
// export async function editStandup(
// 	standup_id: string,
// 	data: EditStandupRequest
// ): Promise<EditStandupResponse> {
// 	await delay(500);

// 	const currentUser = getCurrentUserRecord();
// 	const orgMembers = getOrganizationMembers(currentUser.organization_id!);

// 	// Find standup
// 	const standup = mockStandups.find((b) => b.id === standup_id);
// 	if (!standup) {
// 		createApiError("NOT_FOUND", "Standup not found");
// 	}

// 	// Get today's date in YYYY-MM-DD format (e.g., "2024-02-15")
// 	const todayDate = new Date().toISOString().split('T')[0];
// 	const createDate = standup.created_at.split('T')[0];

// 	// Check if this user already has a standup starting with that date string
// 	if (todayDate !== createDate) {
// 		createApiError("EDIT_WINDOW_EXPIRED", "Standups can only be edited on the day they are created");
// 	}

// 	// Check permissions
// 	const isOwner = standup.created_by.id === currentUser.id;
// 	const admin = (await orgMembers).find((u) => u.org_role === "admin");
// 	const isAdmin = admin?.id === currentUser.id;

// 	if (!isOwner && !isAdmin) {
// 		createApiError("FORBIDDEN", "You do not have permission to perform this action");
// 	}

// 	// Edit Standup field
// 	if (data.today !== undefined) {
// 		if (!data.today.trim()) {
// 			createApiError("INVALID_INPUT", "Entry cannot be empty");
// 		}
// 		standup.today = data.today;
// 	}

// 	return {
// 		id: standup.id,
// 		today: standup.today,
// 	};
// }

// // Delete Standup
// export async function deleteStandup(
// 	standup_id: string
// ): Promise<void> {
// 	await delay(500);

// 	const currentUser = getCurrentUserRecord();
// 	const orgMembers = getOrganizationMembers(currentUser.organization_id!);

// 	// Find index of the standup in mock array
// 	const standupIndex = mockStandups.findIndex((u) => u.id === standup_id);
// 	if (standupIndex === -1) {
// 		createApiError("NOT_FOUND", "Standup not found");
// 	}

// 	// Find standup to delete
// 	const standupToDelete = mockStandups[standupIndex];

// 	// Check permissions
// 	const isOwner = standupToDelete.created_by.id === currentUser.id;
// 	const admin = (await orgMembers).find((u) => u.org_role === "admin");
// 	const isAdmin = admin?.id === currentUser.id;

// 	if (!isOwner && !isAdmin) {
// 		createApiError("FORBIDDEN", "You dont own permission to delete this standup");
// 	}

// 	// Remove Standup from the array
// 	mockStandups.splice(standupIndex, 1);
// }


// =============================================================
// TICKETS
// =============================================================

// Interfaces
export interface TicketListItem {
	id: string;
	title: string;
	status: "todo" | "in_progress" | "completed";
	priority: "low" | "medium" | "high";
	assignee: {
		id: string;
		name: string;
		avatar_url: string | null;
	} | null;
	created_at: string;
	updated_at: string;
}

export async function listTickets(org_id: string): Promise<TicketListItem[]> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	// Validate user belongs to organization
	if (currentUser.organization_id !== org_id) {
		createApiError("FORBIDDEN", "You are not a member of this organization");
	}

	// Mock tickets data
	const mockTickets: TicketListItem[] = [
		{
			id: "21",
			title: "Implement user authentication",
			status: "in_progress",
			priority: "high",
			assignee: {
				id: "1",
				name: "Alice Johnson",
				avatar_url: null,
			},
			created_at: "2024-01-10T10:00:00Z",
			updated_at: "2024-01-15T14:30:00Z",
		},
		{
			id: "22",
			title: "Design landing page",
			status: "todo",
			priority: "medium",
			assignee: null,
			created_at: "2024-01-11T09:00:00Z",
			updated_at: "2024-01-11T09:00:00Z",
		},
		{
			id: "23",
			title: "Fix payment gateway bug",
			status: "completed",
			priority: "high",
			assignee: {
				id: "2",
				name: "Bob Smith",
				avatar_url: null,
			},
			created_at: "2024-01-08T08:00:00Z",
			updated_at: "2024-01-14T16:00:00Z",
		},
	];

	return mockTickets;
}

// =============================================================
// BLOCKERS
// =============================================================

//Interfaces
interface CreateBlockerRequest {
	description: string;
	ticket_id: string | null;
	assignee_id: string | null;
}

interface CreateBlockerResponse {
	id: string;
	description: string;
	status: "open";
	created_by: string;
	assignee_id: string | null;
	ticket_id: string | null;
	created_at: string;
	resolved_at: null;
}

export interface BlockerListItem {
	id: string;
	description: string;
	status: "open" | "resolved";
	created_by: {
		id: string;
		name: string;
		avatar_url: string | null;
	};
	assignee: {
		id: string;
		name: string;
	} | null;
	ticket: {
		id: string;
		title: string;
	};
	created_at: string;
	resolved_at: string | null;
}

interface UpdateBlockerRequest {
	description?: string;
	ticket_id?: string | null;
	assignee_id?: string | null;
}

interface UpdateBlockerResponse {
	id: string;
	description: string;
	status: "open" | "resolved";
	created_by: string;
	assignee_id: string | null;
	ticket_id: string | null;
	created_at: string;
	resolved_at: string | null;
}

// Create Blocker
export async function createBlocker(
	org_id: string,
	data: CreateBlockerRequest
): Promise<CreateBlockerResponse> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	// Validate user belongs to organization
	if (currentUser.organization_id !== org_id) {
		createApiError("FORBIDDEN", "You are not a member of this organization");
	}

	// Validate description
	if (!data.description.trim()) {
		createApiError("INVALID_INPUT", "Description is required");
	}

	// Validate assignee is a developer if provided
	if (data.assignee_id) {
		const assignee = mockUsers.find((u) => u.id === data.assignee_id);
		if (!assignee) {
			createApiError("INVALID_INPUT", "Assignee not found");
		}
		if (assignee.scrum_role !== "developer") {
			createApiError(
				"INVALID_ASSIGNEE",
				"Only users with Developer role can be assigned to blockers"
			);
		}
	}

	// Create new blocker
	const newBlocker = {
		id: `blocker-${Date.now()}`,
		description: data.description,
		status: "open" as const,
		created_by: {
			id: currentUser.id,
			name: currentUser.name,
			avatar_url: currentUser.avatar_url,
		},
		assignee: data.assignee_id
			? {
					id: data.assignee_id,
					name: mockUsers.find((u) => u.id === data.assignee_id)!.name,
					avatar_url: mockUsers.find((u) => u.id === data.assignee_id)!.avatar_url,
				}
			: null,
		ticket: {
			id: data.ticket_id || "0",
			title: "Mock Ticket Title", // In real implementation, fetch from tasks/tickets
		},
		created_at: new Date().toISOString(),
		resolved_at: null,
	};

	// Add to mock database
	mockBlockers.push(newBlocker);
	const parentTicket = mockTicketStore.find((t) => t.id === data.ticket_id);
	if (parentTicket) {
		parentTicket.blockers.push({
			id: newBlocker.id,
			description: newBlocker.description,
			status: newBlocker.status,
			created_by: newBlocker.created_by,
		});
	}

	// Return minimal response (contract 7.1)
	return {
		id: newBlocker.id,
		description: newBlocker.description,
		status: newBlocker.status,
		created_by: currentUser.id,
		assignee_id: data.assignee_id,
		ticket_id: data.ticket_id,
		created_at: newBlocker.created_at,
		resolved_at: null,
	};
}

// List Blockers
export async function listBlockers(
	org_id: string,
	status?: "open" | "resolved"
): Promise<BlockerListItem[]> {
	await delay(300);
	const currentUser = getCurrentUserRecord();

	// Validate user belongs to organization
	if (currentUser.organization_id !== org_id) {
		createApiError("FORBIDDEN", "You are not a member of this organization");
	}

	// Filter blockers by organization (all blockers for this org)
	let blockers = mockBlockers;

	// Apply status filter if provided
	if (status) {
		blockers = blockers.filter((b) => b.status === status);
	}

	// Transform to BlockerListItem format (string ids to numbers)
	return blockers.map((b) => ({
		id: b.id,
		description: b.description,
		status: b.status,
		created_by: {
			id: b.created_by.id,
			name: b.created_by.name,
			avatar_url: b.created_by.avatar_url,
		},
		assignee: b.assignee
			? {
					id: b.assignee.id,
					name: b.assignee.name,
				}
			: null,
		ticket: {
			id: b.ticket.id,
			title: b.ticket.title,
		},
		created_at: b.created_at,
		resolved_at: b.resolved_at,
	}));
}

// Update Blocker
export async function updateBlocker(
	blocker_id: string,
	data: UpdateBlockerRequest
): Promise<UpdateBlockerResponse> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	// Find blocker
	const blocker = mockBlockers.find((b) => b.id === blocker_id);
	if (!blocker) {
		createApiError("NOT_FOUND", "Blocker not found");
	}

	// Check permissions
	const isOwner = blocker.created_by.id === currentUser.id;
	const isAssignee = blocker.assignee?.id === currentUser.id;
	const isScrumMaster = currentUser.scrum_role === "scrum_master";
	const isProductOwner = currentUser.scrum_role === "product_owner";

	if (!isOwner && !isAssignee && !isScrumMaster && !isProductOwner) {
		createApiError("FORBIDDEN", "You do not have permission to perform this action");
	}

	// Validate assignee if provided
	if (data.assignee_id !== undefined && data.assignee_id !== null) {
		const assignee = mockUsers.find((u) => u.id === data.assignee_id);
		if (!assignee) {
			createApiError("INVALID_INPUT", "Assignee not found");
		}
		if (assignee.scrum_role !== "developer") {
			createApiError(
				"INVALID_ASSIGNEE",
				"Only users with Developer role can be assigned to blockers"
			);
		}
	}

	// Update blocker fields
	if (data.description !== undefined) {
		if (!data.description.trim()) {
			createApiError("INVALID_INPUT", "Description cannot be empty");
		}
		blocker.description = data.description;
	}

	if (data.ticket_id !== undefined) {
		blocker.ticket.id = data.ticket_id || "0";
	}

	if (data.assignee_id !== undefined) {
		if (data.assignee_id === null) {
			blocker.assignee = null;
		} else {
			const assignee = mockUsers.find((u) => u.id === data.assignee_id)!;
			blocker.assignee = {
				id: assignee.id,
				name: assignee.name,
				avatar_url: assignee.avatar_url,
			};
		}
	}

	// Return minimal response (contract 7.3)
	return {
		id: blocker.id,
		description: blocker.description,
		status: blocker.status,
		created_by: blocker.created_by.id,
		assignee_id: blocker.assignee?.id || null,
		ticket_id: blocker.ticket.id,
		created_at: blocker.created_at,
		resolved_at: blocker.resolved_at,
	};
}

// Resolve Blocker
export async function resolveBlocker(blocker_id: string): Promise<void> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	// Find blocker
	const blocker = mockBlockers.find((b) => b.id === blocker_id);
	if (!blocker) {
		createApiError("NOT_FOUND", "Blocker not found");
	}

	// Check if already resolved
	if (blocker.status === "resolved") {
		createApiError("BLOCKER_ALREADY_RESOLVED", "Blocker already resolved");
	}

	// Check permissions
	const isOwner = blocker.created_by.id === currentUser.id;
	const isAssignee = blocker.assignee?.id === currentUser.id;
	const isScrumMaster = currentUser.scrum_role === "scrum_master";
	const isProductOwner = currentUser.scrum_role === "product_owner";

	if (!isOwner && !isAssignee && !isScrumMaster && !isProductOwner) {
		createApiError("FORBIDDEN", "You do not have permission to perform this action");
	}

	// Resolve blocker
	blocker.status = "resolved";
	blocker.resolved_at = new Date().toISOString();

	// Return 204 No Content (void)
}

// =============================================================
// MOCK TICKETS
// =============================================================

const mockTicketStore: TicketResponse[] = [
	{
		id: "t1",
		title: "Fix login bug on mobile",
		description: "Users on iOS cannot log in after the last update.",
		status: "todo",
		priority: "high",
		created_by: { id: "1", name: "Miguel Andrade", avatar_url: null },
		assignee_id: "3",
		organization_id: "2",
		created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
		updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
		tasks: [
			{ id: "task1", title: "Reproduce the bug on iOS 17", status: "in_progress" },
		],
		blockers: [],
	},
	{
		id: "t2",
		title: "Implement dark mode",
		description: "Add dark mode support across all pages.",
		status: "in_progress",
		priority: "medium",
		created_by: { id: "2", name: "Pedro Perez", avatar_url: null },
		assignee_id: "3",
		organization_id: "2",
		created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
		updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		tasks: [
			{ id: "task2", title: "Design dark mode color tokens", status: "in_progress" },
			{ id: "task3", title: "Implement dark mode in Tailwind config", status: "completed" },
		],
		blockers: [],
	},
	{
		id: "t3",
		title: "Write onboarding docs",
		description: null,
		status: "completed",
		priority: "low",
		created_by: { id: "1", name: "Miguel Andrade", avatar_url: null },
		assignee_id: null,
		organization_id: "2",
		created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
		updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
		tasks: [],
		blockers: [],
	},
];

export async function createTicket(
	org_id: string,
	data: CreateTicketRequest
): Promise<TicketResponse> {
	await delay(300);
	void org_id;
	const currentUser = getCurrentUserRecord();
	const ticket: TicketResponse = {
		id: `t${Date.now()}`,
		title: data.title,
		description: data.description,
		status: "todo",
		priority: data.priority,
		created_by: { id: currentUser.id, name: currentUser.name, avatar_url: currentUser.avatar_url },
		assignee_id: data.assignee_id,
		organization_id: org_id,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		tasks: [],
		blockers: [],
	};
	mockTicketStore.push(ticket);
	return ticket;
}

export async function listTicketsBoard(
	org_id: string,
	status?: "todo" | "in_progress" | "completed",
	priority?: "low" | "medium" | "high",
): Promise<ListTicketsBoardResponse[]> {
	await delay(300);
	void org_id;
	return mockTicketStore
		.filter((t) => (!status || t.status === status) && (!priority || t.priority === priority))
		.map((t) => {
			const assigneeUser = mockUsers.find((u) => u.id === t.assignee_id) ?? null;
			return {
				id: t.id,
				title: t.title,
				status: t.status,
				priority: t.priority,
				assignee: assigneeUser
					? { id: assigneeUser.id, name: assigneeUser.name, avatar_url: assigneeUser.avatar_url ?? "" }
					: null,
				created_at: t.created_at,
				updated_at: t.updated_at,
			};
		});
}

export async function getTicketDetails(ticket_id: string): Promise<TicketResponse> {
	await delay(200);
	const ticket = mockTicketStore.find((t) => t.id === ticket_id);
	if (!ticket) throw { error: { code: "NOT_FOUND", message: "Ticket not found" } };
	return ticket;
}

export async function updateTicket(
	ticket_id: string,
	data: UpdateTicketRequest
): Promise<TicketResponse> {
	await delay(300);
	const ticket = mockTicketStore.find((t) => t.id === ticket_id);
	if (!ticket) throw { error: { code: "NOT_FOUND", message: "Ticket not found" } };
	if (data.title !== undefined) ticket.title = data.title;
	if (data.description !== undefined) ticket.description = data.description;
	if (data.priority !== undefined) ticket.priority = data.priority;
	if (data.status !== undefined) ticket.status = data.status;
	if (data.assignee_id !== undefined) ticket.assignee_id = data.assignee_id;
	ticket.updated_at = new Date().toISOString();
	return { ...ticket };
}

export async function moveTicket(
	ticket_id: string,
	data: MoveTicketRequest
): Promise<MoveTicketResponse> {
	await delay(200);
	const ticket = mockTicketStore.find((t) => t.id === ticket_id);
	if (!ticket) throw { error: { code: "NOT_FOUND", message: "Ticket not found" } };
	ticket.status = data.status;
	ticket.updated_at = new Date().toISOString();
	return { id: ticket.id, status: ticket.status, updated_at: ticket.updated_at };
}

export async function deleteTicket(ticket_id: string): Promise<void> {
	await delay(200);
	const index = mockTicketStore.findIndex((t) => t.id === ticket_id);
	if (index === -1) throw { error: { code: "NOT_FOUND", message: "Ticket not found" } };
	mockTicketStore.splice(index, 1);
}

// =============================================================
// MOCK TASKS
// =============================================================

const mockTaskStore: TaskResponse[] = [
	{
		id: "task1",
		title: "Reproduce the bug on iOS 17",
		description: "Test on simulator and real device.",
		status: "in_progress",
		created_by: "1",
		assignee_id: "3",
		ticket_id: "t1",
	},
	{
		id: "task2",
		title: "Design dark mode color tokens",
		description: null,
		status: "in_progress",
		created_by: "2",
		assignee_id: "3",
		ticket_id: "t2",
	},
	{
		id: "task3",
		title: "Implement dark mode in Tailwind config",
		description: "Use the `dark:` variant.",
		status: "completed",
		created_by: "2",
		assignee_id: "3",
		ticket_id: "t2",
	},
];

export async function createTask(
	ticket_id: string,
	data: CreateTaskRequest
): Promise<TaskResponse> {
	await delay(300);
	const task: TaskResponse = {
		id: `task${Date.now()}`,
		title: data.title,
		description: data.description,
		status: "in_progress",
		created_by: "1",
		assignee_id: data.assignee_id,
		ticket_id,
	};
	mockTaskStore.push(task);
	const ticket = mockTicketStore.find((t) => t.id === ticket_id);
	if (ticket) {
		ticket.tasks.push({ id: task.id, title: task.title, status: task.status });
	}
	return task;
}

export async function listTasks(
	ticket_id: string,
	status?: "in_progress" | "completed",
): Promise<ListTaskResponse[]> {
	await delay(200);
	return mockTaskStore
		.filter((t) => t.ticket_id === ticket_id && (!status || t.status === status))
		.map((t) => ({ id: t.id, title: t.title, status: t.status }));
}

export async function getTaskDetails(task_id: string): Promise<TaskResponse> {
	await delay(200);
	const task = mockTaskStore.find((t) => t.id === task_id);
	if (!task) throw { error: { code: "NOT_FOUND", message: "Task not found" } };
	return task;
}

export async function updateTask(
	task_id: string,
	data: UpdateTaskRequest
): Promise<TaskResponse> {
	await delay(300);
	const task = mockTaskStore.find((t) => t.id === task_id);
	if (!task) throw { error: { code: "NOT_FOUND", message: "Task not found" } };
	if (data.title !== undefined) task.title = data.title;
	if (data.description !== undefined) task.description = data.description;
	if (data.status !== undefined) task.status = data.status;
	if (data.assignee_id !== undefined) task.assignee_id = data.assignee_id;
	// Sync status back to the ticket's tasks summary
	if (data.status !== undefined) {
		const ticket = mockTicketStore.find((t) => t.id === task.ticket_id);
		if (ticket) {
			const summary = ticket.tasks.find((ts) => ts.id === task_id);
			if (summary) summary.status = data.status;
		}
	}
	return { ...task };
}

export async function deleteTask(task_id: string): Promise<void> {
	await delay(200);
	const index = mockTaskStore.findIndex((t) => t.id === task_id);
	if (index === -1) throw { error: { code: "NOT_FOUND", message: "Task not found" } };
	mockTaskStore.splice(index, 1);
}

// =============================================================
// MOCK DASHBOARD
// =============================================================
/*
export async function getDashboardData(org_id: string): Promise<DashboardData> {
	await delay(400);

	const token = localStorage.getItem("token");
	if (!token) createApiError("UNAUTHORIZED", "Missing token");

	void org_id;

	return {
		summary: {
			tasks_in_progress: 5,
			tickets_completed: 12,
			active_blockers: 2,
		},
		recent_updates: [
			{
				user: { id: "u1", name: "Alex Kim", avatar_url: "" },
				type: "ticket",
				event: "completed",
				title: "Fix login bug on mobile",
				timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
			},
			{
				user: { id: "u2", name: "Maria Lopez", avatar_url: "" },
				type: "task",
				event: "created",
				title: "Update chart labels on analytics dashboard",
				timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
			},
			{
				user: { id: "u3", name: "Jordan Lee", avatar_url: "" },
				type: "ticket",
				event: "created",
				title: "Resolve payment processing timeout",
				timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
			},
		],
	};
}
*/
///////////////////////////////////////////////////////////////
// =============================================================
// REAL FETCH VERSIONS - Replace mock functions with these
// =============================================================
////////////////////////////////////////////////////////////////


// 1.1 REGISTER NEW USER
export async function signup(data:
	SignUpRequest
): Promise<SignUpResponse> {

	const response = await fetch(`${API_URL}/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData; // Contains { error: { code, message } }
	}

	return response.json();
}

// 1.2 LOGIN
export async function login(credentials:
	LoginRequest
): Promise<LoginResponse> {

	const response = await fetch(`${API_URL}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData; // Contains { error: { code, message } }
	}

	const data = await response.json();

	// Store token in localStorage
	localStorage.setItem("token", data.access_token);

	return data;
}


// 2.1 GET CURRENT USER
export async function getCurrentUser(): Promise<User>
{
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/users/me`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 2.2 UPDATE USER
export async function updateUser(
	data: UpdateUserRequest
) : Promise<User> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/users/me`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData; // Contains { error: { code, message } }
	}

	return response.json();
}

// 2.3 UPLOAD AVATAR
export async function uploadAvatar(
	data: AvatarRequest
) : Promise<AvatarResponse> {
	const token = localStorage.getItem("token");

	const formData = new FormData();
	formData.append("file", data.file);

	const response = await fetch(`${API_URL}/users/me/avatar`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${token}`
		},
		body: formData
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData; // Contains { error: { code, message } }
	}

	return response.json();
}


// 3.1 CREATE ORGANIZATION
export async function createOrganization(data:
	CreateOrgRequest
): Promise<CreateOrgResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData; // Contains { error: { code, message } }
	}

	return response.json();
}

// 3.2 SELECT ROLE
export async function setUserRole(data: {
	org_id: string,
	scrum_role: "scrum_master" | "product_owner" | "developer"
}): Promise<SelectRoleResponse>{
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${data.org_id}`, {
		method: 'PATCH',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ scrum_role: data.scrum_role })
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();//{ success: true };
}

// 3.3 GET ORGANIZATION MEMBERS
export async function getOrganizationMembers(
	org_id: string
): Promise<OrganizationMember[]> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/members`, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}
/*
// 3.4 INVITE MEMBERS TO ORGANIZATION
export async function inviteMember(
	org_id: string,
	data: InviteMemberRequest
) : Promise<InviteMemberResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/members`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData; // Contains { error: { code, message } }
	}

	return response.json();
}
*/
// 3.5 REMOVE MEMBER FROM ORGANIZATION
export async function removeMember(
	org_id: string,
	user_id: string
): Promise<{ success: boolean}> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/members/${user_id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return { success: true };
}

// 3.6 JOIN ORGANIZATION BY CODE
export async function joinOrganization(data:
	JoinOrgRequest
): Promise<JoinOrgResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/join`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

/*
// 4.1 CREATE TICKETS
export async function createTicket(
	org_id: string,
	data: CreateTicketRequest
) : Promise<TicketResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/tickets`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 4.2 LIST TICKETS (SPRINTBOARD)
export async function listTicketsBoard(
	org_id: string,
	status?: "todo" | "in_progress" | "completed",
	priority?: "low" | "medium" | "high",
): Promise<ListTicketsBoardResponse[]> {
	const token = localStorage.getItem("token");

	const params = new URLSearchParams();
	if (status) params.append("status", status);
	if (priority) params.append("priority", priority);
	const query = params.size > 0 ? `?${params.toString()}` : "";
	const url = `${API_URL}/organizations/${org_id}/tickets${query}`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 4.3 GET TICKET DETAILS
export async function getTicketDetails(
	ticket_id: string,
) : Promise<TicketResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/tickets/${ticket_id}`, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 4.4 UPDATE TICKETS
export async function updateTicket(
	ticket_id: string,
	data: UpdateTicketRequest
) : Promise<TicketResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/tickets/${ticket_id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 4.5 MOVE TICKET (DRAG & DROP)
export async function moveTicket(
	ticket_id: string,
	data: MoveTicketRequest
) : Promise<MoveTicketResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/tickets/${ticket_id}/move`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 4.6 DELETE TICKET
export async function deleteTicket(
	ticket_id: string
) : Promise <void> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/tickets/${ticket_id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}
}


// 5.1 CREATE TASK
export async function createTask(
	ticket_id: string,
	data: CreateTaskRequest
) : Promise<CreateTaskResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/tickets/${ticket_id}/tasks`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 5.2 LIST TASKS
export async function listTasks(
	ticket_id: string,
	status?: "in_progress" | "completed",
): Promise<ListTaskResponse[]> {
	const token = localStorage.getItem("token");

	const url = status
		?  `${API_URL}/tickets/${ticket_id}/tasks?status=${status}`
		: `${API_URL}/tickets/${ticket_id}/tasks`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 5.3 GET TASK DETAILS
export async function getTaskDetails(
	task_id: string,
) : Promise<TaskResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/tasks/${task_id}`, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 5.4 UPDATE TASK
export async function updateTask(
	task_id: string,
	data: UpdateTaskRequest
) : Promise<TaskResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/tasks/${task_id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 5.6 DELETE TASK
export async function deleteTask(
	task_id: string
) : Promise <void> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/tasks/${task_id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}
}
*/

// 6.1 CREATE STANDUP
export async function createStandup(
	org_id: string,
	data: CreateStandupRequest
) : Promise<CreateStandupResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/standups`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 6.2 LIST ORGANIZATION STANDUPS
export async function listStandups(
	org_id: string,
): Promise<StandupListItem[]> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/standups`, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 6.3 UPDATE STANDUP
export async function editStandup(
	standup_id: string,
	data: EditStandupRequest
): Promise<EditStandupResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/standups/${standup_id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 6.4 DELETE STANDUP
export async function deleteStandup(
	standup_id: string
): Promise<void> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/standups/${standup_id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}
}

/*
// 7.1 CREATE BLOCKER
export async function createBlocker(
	org_id: string,
	data: CreateBlockerRequest
): Promise<CreateBlockerResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/blockers`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 7.2 LIST ORGANIZATION BLOCKERS
export async function listBlockers(
	org_id: string,
	status?: "open" | "resolved"
): Promise<BlockerListItem[]> {
	const token = localStorage.getItem("token");
	const url = status
		? `${API_URL}/organizations/${org_id}/blockers?status=${status}`
		: `${API_URL}/organizations/${org_id}/blockers`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

// 7.3 UPDATE BLOCKER
export async function updateBlocker(
	blocker_id: string,
	data: UpdateBlockerRequest
): Promise<UpdateBlockerResponse> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/blockers/${blocker_id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData; // Contains { error: { code, message } }
	}

	return response.json();
}

// 7.4 RESOLVE BLOCKER
export async function resolveBlocker(
	blocker_id: string
): Promise<void> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/blockers/${blocker_id}/resolve`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}
}
*/

// 8.1 GET LEGAL DOCUMENT
export async function getLegalDocument(
	key: "privacy" | "terms"
) : Promise<LegalDocuments> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/legal/documents/${key}`, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}


// 9.1 ANALYITCS
export async function getAnalitycsData(
	org_id: string
) : Promise<AnalitycsData> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/analytics`, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}


// 10.1 GET ORGANIZATION DASHBOARD
export async function getDashboardData(
	org_id: string
) : Promise<DashboardData> {
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/dashboard`, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw errorData;
	}

	return response.json();
}

