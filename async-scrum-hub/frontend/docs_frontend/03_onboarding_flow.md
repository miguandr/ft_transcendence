## User Onboarding & Team Model

Concepts
	User has:
	•	scrum_role: scrum_master | product_owner | developer | null
	•	organization_id (team): uuid | null

	Organization (Team) has:
	•	id
	•	name
	•	join_code (shareable string)
	•	created_by

Onboarding completion

A user is fully onboarded when:
	•	scrum_role !== null
	•	organization_id !== null

⸻

Expected user flows

A) New user signup (first time)
	1.	/signup
	2.	/role-selection (choose SM / PO / DEV)
	3.	Team step (depends on role):

Developer
	•	must go to /team-join
	•	enters join_code
	•	gets assigned to that organization

Scrum Master / Product Owner
	•	goes to /team-creation (your current page already includes both options)
	•	can either:
	•	Create team → backend returns join_code + org id
	•	Join team → enter join_code and get assigned

	4.	Redirect to / (Dashboard)

B) Returning user (already onboarded)
	•	If logged in AND has scrum_role AND organization_id
	•	go straight to Dashboard (/)

C) Returning user but incomplete onboarding

Examples:
	•	logged in but scrum_role === null → force /role-selection
	•	logged in, has role, but organization_id === null:
	•	DEV → force /team-join
	•	SM/PO → force /team-creation (because it contains join + create)

⸻

Routing and access control

Route groups

Pre-auth / pre-layout routes
	•	/welcome
	•	/login
	•	/signup
	•	/role-selection
	•	/team-creation
	•	/team-join

App routes (layout: Sidebar + TopBar)
	•	/ dashboard
	•	/board
	•	/standup, /standup-empty
	•	/blockers, /blockers-empty
	•	/analytics
	•	/team-health

Guard rules (what the app must enforce)
	1.	If not authenticated → redirect to /login
	2.	If authenticated and scrum_role === null → redirect to /role-selection
	3.	If authenticated and scrum_role !== null and organization_id === null:
	•	if role is developer → redirect to /team-join
	•	if role is scrum_master or product_owner → redirect to /team-creation
	4.	Otherwise → allow app routes (dashboard + features)

That’s the whole “flow difference” between returning vs new users: returning users already satisfy (2) and (3), so they skip everything.

⸻

Important note about current App.tsx

Right now, layout decision is path-based (preAuthPaths.includes(location.pathname)), not state-based (auth/role/team).
So today it works visually, but it’s not a real guard yet.

•	“Current implementation: path-based layout split”
•	“Next step: add state-based guards once backend/auth state exists”
