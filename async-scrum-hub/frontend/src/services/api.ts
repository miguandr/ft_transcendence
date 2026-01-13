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
		current_organization_id: null,
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
	scrum_role: "scrum_master" | "product_owner" | "developer" | null;
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


export async function createOrganization(data: CreateOrgRequest): Promise<CreateOrgResponse>
{
	await delay(500);

	//Check if user sent empty name
	if (!data.name.trim()) {
		createApiError("INVALID_NAME", "Organization name is required");
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
	mockUsers[0].scrum_role = data.scrum_role;

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

// Replace mock login with real fetch when backend ready!!!:
// export async function login(credentials: LoginRequest): Promise<LoginResponse> {
// 	const response = await fetch(`${API_URL}/auth/login`, {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: JSON.stringify(credentials)
// 	});

// 	if (!response.ok) {
// 		const errorData = await response.json();
// 		throw errorData; // Contains { error: { code, message } }
// 	}

// 	return response.json();
// }

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


// Replace mock login with real fetch when backend ready!!!:
// export async function signup(data: SignUpRequest): Promise<SignUpResponse>
// {
// 	const response = await fetch(`${API_URL}/auth/register`, {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: JSON.stringify(data)
// 	});

// 	if (!response.ok) {
// 		const errorData = await response.json();
// 		throw errorData; // Contains { error: { code, message } }
// 	}

// 	return response.json();
// }

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
		createApiError("INVALID_EMAIL", "Email format is invalid");
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
