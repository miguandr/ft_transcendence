// Mock API - simulates backend
// Later, replace with real fetch calls to http://localhost:8000/api/v1

const API_URL = "http://localhost:8000/api/v1";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database (in real backend, this is PostgreSQL)
const mockUsers = [
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

// API Response types (matches your API_CONTRACTS.md)
interface LoginRequest {
	email: string;
	password: string;
}

interface LoginResponse {
	access_token: string;
	token_type: string;
}

interface User {
	id: string;
	email: string;
	name: string;
	current_organization_id: string | null;
	scrum_role: "scrum_master" | "product_owner" | "developer" | null;
	org_role: "admin" | "member" | null;
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

// Replace mock login with real fetch when backend ready!!!:
// export async function login(credentials: LoginRequest): Promise<LoginResponse> {
// 	const response = await fetch(`${API_URL}/auth/login`, {
// 		method: 'POST',
// 		headers: { 'Content-Type': 'application/json' },
// 		body: JSON.stringify(credentials)
// 	});

// 	if (!response.ok) {
// 		throw new Error('INVALID_CREDENTIALS');
// 	}

// 	return response.json();
// }

// Mock login function
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
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
