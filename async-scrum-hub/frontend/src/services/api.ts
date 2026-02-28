// Mock API - simulates backend
// Later, replace with real fetch calls to http://localhost:8000/api/v1

const API_URL = "http://localhost:8000/api/v1";
const CURRENT_USER_ID_KEY = "current_user_id";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


// =============================================================
// MOCK DATA
// =============================================================

// Mock User database (in real backend, this is PostgreSQL)
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

// Mock organization
const mockOrganizations = [
	{
		id: "2",
		name: "TeamX",
		join_code: "SRC-444",
		created_by: "user_0",
	},
];

// Mock Tickets
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

// Mock Blockers
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

// Mock Standups
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

export interface User {
	id: string;
	email: string;
	name: string;
	avatar_url: string | null;
	organization_id: string | null;
	org_name: string | null;
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

export interface OrganizationMember {
	id: string;
	name: string;
	org_role: "admin" | "member";
	scrum_role: "scrum_master" | "product_owner" | "developer";
}

interface OrganizationMemberWithActivity {
	id: string;
	name: string;
	avatar_url: string | null;
	org_role: "admin" | "member";
	scrum_role: "scrum_master" | "product_owner" | "developer";

	tickets: Array<{
		id: string;
		title: string;
		status: "todo" | "in_progress" | "completed";
		priority: "low" | "medium" | "high";
		assignee_id: string;
	}>;

	tasks: Array<{
		id: string;
		title: string;
		status: "in_progress" | "completed";
		ticket_id: string;
		assignee_id: string;
	}>;

	blockers: Array<{
		id: string;
		description: string;
		status: "open" | "resolved";
		created_at: string;
		created_by: string;
	}>;
}

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

interface BlockerListItem {
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

interface ApiError {
	error: {
		code: string;
		message: string;
	};
}

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

// =============================================================
// TERMS & POLICY
// =============================================================

export interface LegalDocuments {
	key: string;
	title: string;
	content: string;
	updated_at: string;
}

export async function getLegalDocument(
	key: "privacy" | "terms"
) : Promise<LegalDocuments> {
	await delay(200);

	const document = mockLegalDocuments[key];

	if (!document) {
		createApiError("NOT_FOUND", "Legal document not found");
	}

	return (document);
}


// =============================================================
// MOCK TOPBAR
// =============================================================

//Interfaces
interface UpdateUserRequest {
	name: string;
	email: string;
}

interface AvatarRequest {
	file: File;
}

interface AvatarResponse {
	avatar_url: string;
}

interface InviteMemberRequest {
	name: string;
	email: string;
}

interface InviteMemberResponse {
	email: string;
}


// Update user information
export async function updateUser(
	data: UpdateUserRequest
) : Promise<User> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	//1. VALIDATION
	//Check if name isnt empty
	if (!data.name.trim()) {
		createApiError("INVALID_INPUT", "Name cant be empty");
	}
	//Check if email is valid
	if (!/\S+@\S+\.\S+/.test(data.email)) {
		createApiError("INVALID_INPUT", "Email format is invalid");
	}
	//Check if email already exists
	const existingEmail = mockUsers.find((e) => e.email === data.email && e.id != currentUser.id);
	if (existingEmail) {
		createApiError("INVALID_INPUT", "This email is already in use");
	}

	//2. UPDATE DATA
	currentUser.name = data.name;
	currentUser.email = data.email;

	//3. RETURN RESPONSE SHAPE
	return (currentUser);
}

// Upload Avatar
export async function uploadAvatar(
	data: AvatarRequest
) : Promise<AvatarResponse> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	//1. VALIDATION
	//Check if user provided a file
	if (!data.file) {
		createApiError("INVALID_INPUT", "No file provided");
	}

	//2. UPLOAD FILE
	const mockUrl = `mock-avatar-${Date.now()}.jpg`;
	currentUser.avatar_url = mockUrl;

	//3. RETURN RESPONSE SHAPE
	return { avatar_url: mockUrl };
}

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

// =============================================================
// MOCK TEAM SETUP
// =============================================================

// Create Organization
export async function createOrganization(data: CreateOrgRequest): Promise<CreateOrgResponse> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	//Check if user sent empty name
	if (!data.name.trim()) {
		createApiError("INVALID_INPUT", "Organization name is required");
	}

	//Check if organization already exists
	//find() assigns to org the values in mockOrganizations to compare
	const existingOrg = mockOrganizations.find((org) => org.name === data.name);
	if (existingOrg) {
		createApiError("ORG_EXISTS", "An organization with this name already exists");
	}

	//Create new organization
	const newOrg = {
		id: `id-${Date.now()}`,
		name: data.name,
		join_code: `SCR-${Math.floor(100 + Math.random() * 900)}`,
		created_by: currentUser.id,
	};

	//Update user data
	currentUser.organization_id = newOrg.id;
	currentUser.org_role = "admin";

	//Add to mock database
	mockOrganizations.push(newOrg);

	//Return response
	return {
		id: newOrg.id,
		name: newOrg.name,
		join_code: newOrg.join_code,
		created_by: newOrg.created_by,
	};
}


// Join Organization
export async function joinOrganization(data: JoinOrgRequest): Promise<JoinOrgResponse> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	if (!data.join_code.trim()) {
		createApiError("INVALID_CODE", "Team code is required");
	}

	const matchingOrg = mockOrganizations.find((org) => org.join_code === data.join_code);
	if (!matchingOrg) {
		createApiError("CODE_NOT_FOUND", "Team code not found");
	}

	currentUser.organization_id = matchingOrg.id;
	currentUser.org_role = "member";
	currentUser.scrum_role = data.scrum_role;

	return {
		organization_id: matchingOrg.id,
		org_role: "member",
	};
}

// Check Join-Code
export async function checkJoinCode(join_code: string): Promise<OrganizationInfo> {
	await delay(300);
	const currentUser = getCurrentUserRecord();

	if (!join_code.trim()) {
		createApiError("INVALID_CODE", "invalid cod");
	}

	const org = mockOrganizations.find((o) => o.join_code === join_code);
	if (!org) {
		createApiError("CODE_NOT_FOUND", "Team code not found");
	}

	if (currentUser.organization_id === org.id) {
		createApiError("ALREADY_MEMBER", "You're already a member of this organization");
	}

	return {
		id: org.id,
		name: org.name,
		join_code: org.join_code,
		members_count: 1, // mock value for now
	};
}

// Set User Role
export async function setUserRole(data: {
	organization_id: string;
	scrum_role: "scrum_master" | "product_owner";
}): Promise<{ success: boolean }> {
	await delay(300);
	const currentUser = getCurrentUserRecord();

	//Update user's role in the organization
	currentUser.scrum_role = data.scrum_role;

	return { success: true };
}

export async function getOrganizationMembers(org_id: string): Promise<OrganizationMember[]> {
	await delay(300);

	if (!org_id) {
		createApiError("NOT_FOUND", "No members found in this organization");
	}

	const orgMembers = mockUsers
		.filter((user) => user.organization_id === org_id && user.org_role !== null && user.scrum_role !== null)
		.map((user) => ({
			...user,
			org_role: user.org_role as "admin" | "member",
			scrum_role: user.scrum_role as "product_owner" | "developer" | "scrum_master",
		}));

	return orgMembers;
}


// =============================================================
// MOCK LOGIN
// =============================================================

// Login
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
	// Simulate network delay (500ms)
	await delay(500);

	// Find user by email
	const user = mockUsers.find((u) => u.email === credentials.email);

	// Check if user exists and password matches
	if (!user || user.password !== credentials.password) {
		createApiError("INVALID_CREDENTIALS", "Email or password is incorrect");
	}

	// Generate fake JWT token
	const response: LoginResponse = {
		access_token: `mock-jwt-token-${Date.now()}`,
		token_type: "bearer",
	};

	// Store token in localStorage
	localStorage.setItem("token", response.access_token);
	localStorage.setItem(CURRENT_USER_ID_KEY, user.id);

	return response;
}

// =============================================================
// MOCK SIGNUP
// =============================================================

// Mock signup function
export async function signup(data: SignUpRequest): Promise<SignUpResponse> {
	// Simulate network delay
	await delay(800);

	// Check if user already exists
	const existingUser = mockUsers.find((u) => u.email === data.email);
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
		org_name: null,
		organization_id: null,
		scrum_role: null,
		org_role: null,
		avatar_url: null,
	};

	// Add to mock database
	mockUsers.push(newUser);

	// Simulate auto-login after signup
	localStorage.setItem("token", `mock-jwt-token-${Date.now()}`);
	localStorage.setItem(CURRENT_USER_ID_KEY, newUser.id);

	// Return response (excluding password)
	return {
		id: newUser.id,
		name: newUser.name,
		email: newUser.email,
	};
}

// =============================================================
// MOCK USER
// =============================================================

// Mock getCurrentUser function
export async function getCurrentUser() : Promise<User> {
	await delay(300);

	// Simulate checking the JWT token
	const token = localStorage.getItem("token");

	if (!token) {
		createApiError("UNAUTHORIZED", "Missing token");
	}

	// Return mock user data
	return getCurrentUserRecord();
}

// Mock getCurrentUserInfo function
export async function getCurrentUserInfo(
	org_id: string
): Promise<OrganizationMemberWithActivity[]> {
	await delay(300);

	// Step 1: Which users belong to this org?
	const orgMembers = mockUsers.filter((user) => user.organization_id === org_id);
	if (orgMembers.length === 0) {
		createApiError("NOT_FOUND", "No members found in this organization");
	}

	// Step 2: For EACH user, build their data
	const membersWithActivity = orgMembers.map((user) => {
		// Find THIS user's tickets
		const userTickets = mockTickets.filter((ticket) => ticket.assignee_id === user.id);

		// Find THIS user's tasks
		const userTasks = mockTasks.filter((task) => task.assignee_id === user.id);

		// Find THIS user's blockers
		const userBlockers = mockBlockers
			.filter((blocker) => blocker.created_by.id === user.id)
			.map((blocker) => ({
				id: blocker.id,
				description: blocker.description,
				status: blocker.status,
				created_at: blocker.created_at,
				created_by: blocker.created_by.id, // Extract just the ID to match interface
			}));

		return {
			id: user.id,
			name: user.name,
			avatar_url: user.avatar_url,
			org_role: user.org_role!,
			scrum_role: user.scrum_role!,
			tickets: userTickets,
			tasks: userTasks,
			blockers: userBlockers,
		};
	});

	return membersWithActivity;
}

// Mock removeMember function
export async function removeMember(
	org_id: string,
	member_id: string
): Promise<{ success: boolean }> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	// Step 1: Check if current user is an admin
	if (currentUser.org_role !== "admin") {
		createApiError("FORBIDDEN", "Only admins can remove members");
	}

	// Step 2: Check if current user belongs to this organization
	if (currentUser.organization_id !== org_id) {
		createApiError("FORBIDDEN", "You are not a member of this organization");
	}

	// Step 3: Find the member to remove
	const memberToRemove = mockUsers.find(
		(u) => u.id === member_id && u.organization_id === org_id
	);
	if (!memberToRemove) {
		createApiError("NOT_FOUND", "Member not found in this organization");
	}

	// Step 4: Prevent removing admin users
	if (memberToRemove.org_role === "admin") {
		createApiError("FORBIDDEN", "Cannot remove admin members");
	}

	// Step 5: Remove the member (set their org fields to null)
	memberToRemove.organization_id = null;
	memberToRemove.org_role = null;
	memberToRemove.scrum_role = null;

	return { success: true };
}

// =============================================================
// STANDUPS
// =============================================================

// Interfaces
interface CreateStandupRequest {
	today: string;
}

interface CreateStandupResponse {
	id: string;
	created_at: string;
	today: string;
	yesterday: string | null;
	blocker_ids: string[];
	created_by: {
		name: string;
		id: string;
		avatar_url: string | null;
	}
};

export interface StandupListItem {
	id: string;
	created_at: string;
	today: string;
	yesterday: string | null;
	blockers: {
		id: string;
		title: string;
		ticket: {
			id: string;
			title: string;
		}
	} [];
	created_by: {
		id: string;
		name: string;
		avatar_url: string | null;
	}
}

interface EditStandupRequest {
	today?: string;
}

interface EditStandupResponse {
	id: string;
	today: string;
}


// Create Standup
export async function createStandup(
	org_id: string,
	data: CreateStandupRequest
) : Promise<CreateStandupResponse> {
	await delay(500);
	const currentUser = getCurrentUserRecord();

	if (currentUser.organization_id !== org_id) {
		createApiError("FORBIDDEN", "You are not a member of this organization");
	}

	if (!data.today.trim()) {
		createApiError("INVALID_INPUT", "Entry is required");
	}

	// ---DATE SETUP---
	// Get today's date in YYYY-MM-DD format (e.g., "2024-02-15")
	const now = new Date();
	const today = now.toISOString().split('T')[0];

	//Calculate yesterday
	const yesterdayDate = new Date();
	yesterdayDate.setDate(now.getDate() - 1);
	const yesterday = yesterdayDate.toISOString().split('T')[0];

	// Check if this user already has a standup starting with that date string
	const alreadySubmitted = mockStandups.some(s =>
		s.created_by.id ===currentUser.id &&
		s.created_at.startsWith(today)
	);
	if (alreadySubmitted) {
		createApiError("STANDUP_ALREADY_EXISTS", "You have already created a standup for today");
	}

	// ---FILTERED BLOCKERS---
	// Get active blockers
	const openBlockerIds = mockBlockers
	.filter(blockers => {
		const isOpen = blockers.status === "open";
		const creator = mockUsers.find(u => u.id === blockers.created_by.id);
		return isOpen && creator?.organization_id == org_id;
	})
	.map(blocker => blocker.id);

	// Get the standup created on the prebious calender date
	const YesterdayStandup = mockStandups.find(s =>
		s.created_by.id == currentUser.id &&
		s.created_at.startsWith(yesterday)
	);

	// Create new standup
	const newStandup = {
		id: `standup-${Date.now()}`,
		created_at: now.toISOString(),
		today: data.today,
		yesterday: YesterdayStandup?.today || null,
		blocker_ids: openBlockerIds,
		created_by: {
			id: currentUser.id,
			name: currentUser.name,
			avatar_url: currentUser.avatar_url,
		}
	};

	mockStandups.push(newStandup);
	return (newStandup);
}

//List Standups
export async function listStandups(
	org_id: string,
): Promise<StandupListItem[]> {
	await delay(300);
	const currentUser = getCurrentUserRecord();

	// Validate user belongs to organization
	if (currentUser.organization_id !== org_id) {
		createApiError("FORBIDDEN", "You are not a member of this organization");
	}

	const filteredStandups = mockStandups.filter((standups) => {
		const creator = mockUsers.find((u) => u.id === standups.created_by.id);

		return creator?.organization_id === org_id;
	});

	return filteredStandups.map((s) => ({
		id: s.id,
		created_at: s.created_at,
		today: s.today,
		yesterday: s.yesterday,
		blockers: s.blocker_ids
		.map((ids) => mockBlockers.find((b) => b.id === ids)) // get from blockers the info from the blocker_ids in this standup
		.filter((b): b is NonNullable<typeof b> => Boolean(b)) // filter undefined and toss them to avoid crash
		.map((b) => ({ // map the data how we need it
			id: b.id,
			title: b.description,
			ticket: {
				id: b.ticket.id,
				title: b.ticket.title,
			},
		})),
		created_by: s.created_by,
	}));
}

// Edit Standup
export async function editStandup(
	standup_id: string,
	data: EditStandupRequest
): Promise<EditStandupResponse> {
	await delay(500);

	const currentUser = getCurrentUserRecord();
	const orgMembers = getOrganizationMembers(currentUser.organization_id!);

	// Find standup
	const standup = mockStandups.find((b) => b.id === standup_id);
	if (!standup) {
		createApiError("NOT_FOUND", "Standup not found");
	}

	// Get today's date in YYYY-MM-DD format (e.g., "2024-02-15")
	const todayDate = new Date().toISOString().split('T')[0];
	const createDate = standup.created_at.split('T')[0];

	// Check if this user already has a standup starting with that date string
	if (todayDate !== createDate) {
		createApiError("EDIT_WINDOW_EXPIRED", "Standups can only be edited on the day they are created");
	}

	// Check permissions
	const isOwner = standup.created_by.id === currentUser.id;
	const admin = (await orgMembers).find((u) => u.org_role === "admin");
	const isAdmin = admin?.id === currentUser.id;

	if (!isOwner && !isAdmin) {
		createApiError("FORBIDDEN", "You do not have permission to perform this action");
	}

	// Edit Standup field
	if (data.today !== undefined) {
		if (!data.today.trim()) {
			createApiError("INVALID_INPUT", "Entry cannot be empty");
		}
		standup.today = data.today;
	}

	return {
		id: standup.id,
		today: standup.today,
	};
}

// Delete Standup
export async function deleteStandup(
	standup_id: string
): Promise<void> {
	await delay(500);

	const currentUser = getCurrentUserRecord();
	const orgMembers = getOrganizationMembers(currentUser.organization_id!);

	// Find index of the standup in mock array
	const standupIndex = mockStandups.findIndex((u) => u.id === standup_id);
	if (standupIndex === -1) {
		createApiError("NOT_FOUND", "Standup not found");
	}

	// Find standup to delete
	const standupToDelete = mockStandups[standupIndex];

	// Check permissions
	const isOwner = standupToDelete.created_by.id === currentUser.id;
	const admin = (await orgMembers).find((u) => u.org_role === "admin");
	const isAdmin = admin?.id === currentUser.id;

	if (!isOwner && !isAdmin) {
		createApiError("FORBIDDEN", "You dont own permission to delete this standup");
	}

	// Remove Standup from the array
	mockStandups.splice(standupIndex, 1);
}


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


// 9. GET ORGANIZATION MEMBERS FULL INFO
export async function getCurrentUserInfo(org_id: string): Promise<OrganizationMemberWithActivity[]>
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

10. DELETE ORGANIZATION MEMBERS
export async function removeMember(org_id: string, member_id: string): Promise<{ success: boolean}>
{
	const token = localStorage.getItem("token");

	const response = await fetch(`${API_URL}/organizations/${org_id}/members/${member_id}`, {
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

	return response.json();
}

11. STANDUP FUNCTION (PENDING)
12. TICKETS FUNCTIONS (PENDING)
13. BLOCKERS FUNCTIONS (PENDING)
14. TOPBAR FUNTIONS (PENDING)

*/
