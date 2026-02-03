// Mock API - simulates backend
// Later, replace with real fetch calls to http://localhost:8000/api/v1

const API_URL = "http://localhost:8000/api/v1";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database (in real backend, this is PostgreSQL)
const mockUsers: Array<{
	id: string,
	email: string;
	password: string;  // In real backend, this would be hashed!
	name: string;
	current_organization_id: string | null,
	scrum_role:  "scrum_master" | "product_owner" | "developer" | null,
	org_role: "admin" | "member" | null,
}> = [
	{
		id: "1",
		email: "miguel@example.com",
		password: "password123",  // In real backend, this would be hashed!
		name: "Miguel",
		current_organization_id: "2",
		scrum_role: null,
		org_role: null
	}
];

// Mock organization
const mockOrganizations = [
	{
		id: "2",
		name: "TeamX",
		join_code: "SRC-444",
		created_by: "user_0",
	}
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
		assignee_id: "1"
	}
]

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
		assignee_id: "0"
	}
]

const mockBlocker: Array<{
	id: string;
	description: string;
	status: "open" | "resolved",
	created_at: string;
	created_by: string;
}> = [
	{
		id: "32",
		description: "Waiting for API keys from client",
		status: "open",
		created_at: "1 day ago",
		created_by: "1"
	}
]

// API Response types (matches your API_CONTRACTS.md)
interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	access_token: string;
	token_type: string;
}

interface SignUpRequest {
	name: string;
	email: string;
	password: string;
}

interface SignUpResponse {
	id: string;
	name: string;
	email: string;
}

interface User {
	id: string;
	email: string;
	name: string;
	current_organization_id: string | null;
	scrum_role: "scrum_master" | "product_owner" | "developer" | null;
	org_role: "admin" | "member" | null;
}

interface CreateOrgRequest {
	name: string;
}

interface CreateOrgResponse {
	id: string;
	name: string;
	join_code: string;
	created_by: string;
}

interface JoinOrgRequest {
	join_code: string;
	scrum_role: "scrum_master" | "product_owner" | "developer";
}

interface JoinOrgResponse {
	organization_id: string;
	org_role: "admin" | "member";
}

interface OrganizationInfo {
	id: string;
	name: string;
	join_code: string;
	members_count: number;
}

interface OrganizationMember {
	id: string;
	name: string;
	org_role: "admin" | "member";
	scrum_role: "scrum_master" | "product_owner" | "developer" | null;
}

interface OrganizationMemberWithActivity {
	id: string;
	name: string;
	org_role: "admin" | "member";
	scrum_role: "scrum_master" | "product_owner" | "developer" | null;

	tickets: Array<{
		id: string;
		title: string;
		status: "todo" | "in_progress" | "completed";
		priority: "low" | "medium" | "high";
		assignee_id: string;
	}>

	tasks: Array<{
		id: string;
		title: string,
		status: "in_progress" | "completed";
		ticket_id: string;
		assignee_id: string;
	}>

	blockers: Array<{
		id: string;
		description: string;
		status: "open" | "resolved",
		created_at: string;
		created_by: string;
	}>
}

interface ApiError {
	error: {
		code: string;
		message: string;
	};
}

// Helper to create API errors matching contract format
function createApiError(code: string, message: string): never {
	throw {
		error: { code, message }
	};
}

// Replace mock createOrganization with real fetch when backend ready!!!:
// export async function createOrganization(data: CreateOrgRequest): Promise<CreateOrgResponse>
// {
// 	const token = localStorage.getItem("token");

// 	const response = await fetch(`${API_URL}/organizations`, {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Authorization': `Bearer ${token}`
// 		},
// 		body: JSON.stringify(data)
// 	});

// 	if (!response.ok) {
// 		const errorData = await response.json();
// 		throw errorData; // Contains { error: { code, message } }
// 	}

// 	return response.json();
// }

//Phase 1
export async function createOrganization(data: CreateOrgRequest): Promise<CreateOrgResponse>
{
	await delay(500);

	//Check if user sent empty name
	if (!data.name.trim()) {
		createApiError("INVALID_INPUT", "Organization name is required");
	}

	//Check if organization already exists
	//find() assigns to org the values in mockOrganizations to compare
	const existingOrg = mockOrganizations.find(org => org.name === data.name);
	if (existingOrg) {
		createApiError("ORG_EXISTS", "An organization with this name already exists");
	}

	//Create new organization
	const newOrg = {
		id: `id-${Date.now()}`,
		name: data.name,
		join_code: `SCR-${Math.floor(100 + Math.random() * 900)}`,
		created_by: mockUsers[0].id
	}

	//Update user data
	mockUsers[0].current_organization_id = newOrg.id;
	mockUsers[0].org_role = "admin";

	//Add to mock database
	mockOrganizations.push(newOrg);

	//Return response
	return {
		id: newOrg.id,
		name: newOrg.name,
		join_code: newOrg.join_code,
		created_by: newOrg.created_by
	}
}

export async function setUserRole(data: {
	organization_id: string;
	scrum_role: "scrum_master" | "product_owner"
}): Promise<{ success: boolean }>
{
	await delay(300);

	//Update user's role in the organization
	mockUsers[0].scrum_role = data.scrum_role;

	return { success: true };
}


export async function joinOrganization(data: JoinOrgRequest): Promise<JoinOrgResponse>
{
	await delay(500);

	if (!data.join_code.trim()) {
		createApiError("INVALID_CODE", "Team code is required");
	}

	const matchingOrg = mockOrganizations.find(org => org.join_code === data.join_code);
	if (!matchingOrg) {
		createApiError("CODE_NOT_FOUND", "Team code not found");
	}


	mockUsers[0].current_organization_id = matchingOrg.id;
	mockUsers[0].org_role = "member";
	mockUsers[0].scrum_role = data.scrum_role;


	return {
		organization_id: matchingOrg.id,
		org_role: "member"
	}
}

export async function checkJoinCode(join_code: string): Promise<OrganizationInfo>
{
	await delay(300);

	if (!join_code.trim()) {
		createApiError("INVALID_CODE", "invalid cod");
	}


	const org = mockOrganizations.find(o => o.join_code === join_code);
	if (!org) {
		createApiError("CODE_NOT_FOUND", "Team code not found");
	}

	if (mockUsers[0].current_organization_id === org.id) {
		createApiError("ALREADY_MEMBER", "You're already a member of this organization");
	}

	return {
		id: org.id,
		name: org.name,
		join_code: org.join_code,
		members_count: 1 // mock value for now
	};
}

export async function getOrganizationMembers(org_id: string): Promise<OrganizationMember[]>
{
	await delay(300);

	return [
		{
			id: "user_0",
			name: "creator",
			org_role: "admin",
			scrum_role: "scrum_master"  // ← SM is taken!
		}
	];
}


// Mock login function
export async function login(credentials: LoginRequest): Promise<LoginResponse>
{
	// Simulate network delay (500ms)
	await delay(500);

	// Find user by email
	const user = mockUsers.find(u => u.email === credentials.email);

	// Check if user exists and password matches
	if (!user || user.password !== credentials.password) {
		createApiError("INVALID_CREDENTIALS", "Email or password is incorrect");
		}

	// Generate fake JWT token
	const response: LoginResponse = {
		access_token: `mock-jwt-token-${Date.now()}`,
		token_type: "bearer"
	};

	// Store token in localStorage
	localStorage.setItem("token", response.access_token);

	return response;
}


// Mock signup function
export async function signup(data: SignUpRequest): Promise<SignUpResponse> {
	// Simulate network delay
	await delay(800);

	// Check if user already exists
	const existingUser = mockUsers.find(u => u.email === data.email);
	if (existingUser) {
		createApiError("USER_EXISTS", "An account with this email already exists");
	}

	// Validate email format
	if (!/\S+@\S+\.\S+/.test(data.email)) {
		createApiError("INVALID_INPUT", "Email format is invalid");
	}

	// Create new user
	const newUser = {
		id: `user-${Date.now()}`,
		email: data.email,
		password: data.password,
		name: data.name,
		current_organization_id: null,
		scrum_role: null,
		org_role: null
	};

	// Add to mock database
	mockUsers.push(newUser);

	// Return response (excluding password)
	return {
		id: newUser.id,
		name: newUser.name,
		email: newUser.email
	};
}


// Mock getCurrentUser function
export async function getCurrentUser(): Promise<User> {
	await delay(300);

	// Simulate checking the JWT token
	const token = localStorage.getItem("token");

	if (!token) {
		throw new Error("UNAUTHORIZED");
	}

	// Return mock user data
	return mockUsers[0]; // Return first user
}

// Mock getCurrentUserInfo function
export async function getCurrentUserInfo(org_id: string): Promise<OrganizationMemberWithActivity[]>
{
	await delay(300);

	// Step 1: Which users belong to this org?
	const orgMembers = mockUsers.filter(user => user.current_organization_id === org_id);
	if (orgMembers.length === 0) {
		createApiError("NOT_FOUND", "No members found in this organization")
	}

	// Step 2: For EACH user, build their data
	const membersWithActivity = orgMembers.map(user => {
		// Find THIS user's tickets
		const userTickets = mockTickets.filter(ticket => ticket.assignee_id === user.id);

		// Find THIS user's tasks
		const userTasks = mockTasks.filter(task => task.assignee_id === user.id);

		// Find THIS user's blockers
		const userBlockers = mockBlocker.filter(blocker => blocker.created_by === user.id);

	return {
			id: user.id,
			name: user.name,
			org_role: user.org_role!,
			scrum_role: user.scrum_role!,
			tickets: userTickets,
			tasks: userTasks,
			blockers: userBlockers,
		};
	});

	return membersWithActivity;
}

// =============================================================
// REAL FETCH VERSIONS - Replace mock functions with these
// =============================================================

/*
// 1. LOGIN
export async function login(credentials: LoginRequest): Promise<LoginResponse>
{
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

// 2. SIGNUP
export async function signup(data: SignUpRequest): Promise<SignUpResponse>
{
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

// 3. GET CURRENT USER
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

// 4. CREATE ORGANIZATION
export async function createOrganization(data: CreateOrgRequest): Promise<CreateOrgResponse>
{
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

// 5. SET USER ROLE
export async function setUserRole(data: {
	organization_id: string;
	scrum_role: "scrum_master" | "product_owner"
}): Promise<{ success: boolean }>
{
// This endpoint updates the current user's scrum role
	const response = await fetch(`${API_URL}/users/me`, {
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

	return { success: true };
}

// 6. JOIN ORGANIZATION
export async function joinOrganization(data: JoinOrgRequest): Promise<JoinOrgResponse>
{
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
		throw errorData; // Contains { error: { code, message } }
	}

	return response.json();
}

// 7. CHECK JOIN CODE
export async function checkJoinCode(join_code: string): Promise<OrganizationInfo>
{
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/check-code?join_code=${join_code}`, {
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

// 8. GET ORGANIZATION MEMBERS
export async function getOrganizationMembers(org_id: string): Promise<OrganizationMember[]>
{
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
*/
