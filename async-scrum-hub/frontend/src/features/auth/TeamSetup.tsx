import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Users, Target, Code } from "lucide-react";
import {
	createOrganization,
	setUserRole,
	joinOrganization,
	checkJoinCode,
	getOrganizationMembers,
} from "../../services/api";
import { Button, Input, Label, ErrorText } from "../../components/custom";
type TeamMode = "join" | "create";
type Role = "scrum_master" | "product_owner" | "developer" | null;

export function TeamSetup() {
	const navigate = useNavigate();

	// ===== STATE DECLARATIONS =====
	const [teamMode, setTeamMode] = useState<TeamMode>("join");
	const [teamCode, setTeamCode] = useState("");
	const [teamName, setTeamName] = useState("");
	const [teamConfirmed, setTeamConfirmed] = useState(false);
	const [confirmedTeam, setConfirmedTeam] = useState<{
		name: string;
		code?: string;
		members?: number;
	} | null>(null);
	const [orgId, setOrgId] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [errors, setErrors] = useState<{
		join?: string;
		create?: string;
		continue?: string;
	}>({});
	const [isLoading, setIsLoading] = useState(false);
	const [takenRoles, setTakenRoles] = useState<string[]>([]);
	const [selectedRole, setSelectedRole] = useState<Role>(null);
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);

	// ===== FUNCTION DEFINITIONS =====
	//When user enters a team code and clicks "Check code"
	const handleCheckCode = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevents page refresh when form submits
		setErrors({}); // Clear previous errors

		// Validation: checks if team-code is empty
		if (!teamCode.trim()) {
			setErrors({ join: "Team code is required" });
			return;
		}

		// Call API
		setIsLoading(true); // Show loading spinner

		type APIError = { error?: { code?: string; message?: string } };

		try {
			// Step 1: Validate code and get org info
			const response = await checkJoinCode(teamCode);

			//Step 2: Get members to see what roles are free/taken
			const members = await getOrganizationMembers(response.id);

			//Step 3: Extract taken roles
			const taken = members
				.filter((m) => m.scrum_role === "scrum_master" || m.scrum_role === "product_owner") // m(each member of the array) =>(return). Keep members with roles assigned
				.map((m) => m.scrum_role) as string[]; // tells TypeScript "trust me, these arent null".

			//Step 4: Update state
			setOrgId(response.id); // Save org ID for later (when joining)
			setTakenRoles(taken);
			setConfirmedTeam({
				name: response.name,
				members: response.members_count,
			});
			setTeamConfirmed(true);
		} catch (error: unknown) {
			// Handle API errors with type guard
			const apiError = error as APIError;
			if (apiError?.error?.code === "INVALID_CODE") {
				setErrors({ join: "Invalid team code" });
			} else if (apiError?.error?.code === "ALREADY_MEMBER") {
				setErrors({ join: "You're already a member of this organization" });
				setShowLoginPrompt(true);
			} else if (apiError?.error?.message) {
				setErrors({ join: apiError.error.message });
			} else {
				setErrors({ join: "Something went wrong" });
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateTeam = async (
		e: React.FormEvent // Accept form event parameter
	) => {
		e.preventDefault(); // Prevent page refresh
		setErrors({}); // Clear previous errors

		if (!teamName.trim()) {
			setErrors({ create: "Team name is required" });
			return;
		}
		if (teamName.trim().length < 3) {
			setErrors({ create: "Team name must be at least 3 characters" });
			return;
		}
		if (teamName.trim().length > 50) {
			setErrors({ create: "Team name must have less than 50  characters" });
			return;
		}

		setIsLoading(true); // Show loading spinner

		type APIError = { error?: { code?: string; message?: string } };

		try {
			// Step 1: Get org info
			const response = await createOrganization({ name: teamName });

			//Step 2: Update state
			setOrgId(response.id);
			setConfirmedTeam({
				name: teamName,
				code: response.join_code,
				members: 1,
			});
			setTeamConfirmed(true);
		} catch (error: unknown) {
			// Handle API errors with type guard
			const apiError = error as APIError;
			if (apiError?.error?.code === "INVALID_INPUT") {
				setErrors({ create: "Team name is required." });
			} else if (apiError?.error?.code === "UNAUTHORIZED") {
				setErrors({ create: "Authentication required" });
			} else if (apiError?.error?.code === "ORG_EXISTS") {
				setErrors({ create: "An organization with this name already exists." });
			} else if (apiError?.error?.message) {
				setErrors({ create: apiError.error.message });
			} else {
				setErrors({ create: "Something went wrong." });
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyCode = () => {
		if (confirmedTeam?.code) {
			navigator.clipboard.writeText(confirmedTeam.code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleContinue = async () => {
		setErrors({}); // Clear previous errors
		// Step 1: Validation
		if (!teamConfirmed || !selectedRole || !orgId) {
			return;
		}

		// Step 2: Loading state
		setIsLoading(true);

		type APIError = { error?: { code?: string; message?: string } };

		try {
			// Step 3: Check which mode (create or join)
			if (teamMode === "create") {
				await setUserRole({
					organization_id: orgId as string,
					scrum_role: selectedRole as "scrum_master" | "product_owner",
				});
			} else {
				await joinOrganization({
					join_code: teamCode,
					scrum_role: selectedRole as "scrum_master" | "product_owner" | "developer",
				});
			}

			// Step 4: Success! Navigate to dashboard
			navigate("/dashboard");
		} catch (error: unknown) {
			// Step 5: Handle errors with type guard
			const apiError = error as APIError;
			if (apiError?.error?.message) {
				setErrors({ continue: apiError.error.message });
			} else {
				setErrors({ continue: "Something went wrong" });
			}
		} finally {
			// Step 6: Clear loading state
			setIsLoading(false);
		}
	};

	// ===== DATA DEFINITIONS =====
	const roles = [
		{
			id: "scrum_master",
			title: "Scrum Master",
			icon: Target,
			description: "Facilitate tickets and remove blockers",
		},
		{
			id: "product_owner",
			title: "Product Owner",
			icon: Users,
			description: "Prioritize backlog and define vision",
		},
		{
			id: "developer",
			title: "Developer",
			icon: Code,
			description: "Build features and ship code",
		},
	];

	// ===== RETURN = THE UI =====
	return (
		<div className="min-h-screen bg-white flex items-center justify-center p-8">
			<div className="max-w-2xl w-full">
				{/* Header */}
				<div className="text-center mb-10">
					<h1 className="text-3xl text-gray-900 mb-2">Team Setup</h1>
					<p className="text-sm text-gray-500">
						Join your team and choose how you'll contribute.
					</p>
				</div>

				<div className="space-y-10">
					{/* Section 1 - Team */}
					<div>
						<div className="flex items-center gap-2 mb-5">
							<span className="text-xs uppercase tracking-wide text-gray-400">
								Step 1
							</span>
							<span className="text-xs text-gray-300">·</span>
							<span className="text-sm text-gray-700">Team</span>
						</div>

						{!teamConfirmed ? (
							<div className="space-y-5">
								{/* Toggle */}
								<div className="flex gap-3">
									<Button
										variant="outlined"
										isActive={teamMode === "join"}
										onClick={() => {
											setTeamMode("join");
											setErrors({ create: undefined }); // Clear create errors when switching to join
											setShowLoginPrompt(false);
										}}
										className={`flex-1 px-4 ${
											teamMode === "join" ? "border-cyan-500!" : ""
										}`}
									>
										I have a team code
									</Button>
									<Button
										variant="outlined"
										isActive={teamMode === "create"}
										onClick={() => {
											setTeamMode("create");
											setErrors({ join: undefined }); // Clear join errors when switching to create
										}}
										className={`flex-1 px-4 ${
											teamMode === "create" ? "border-cyan-500!" : ""
										}`}
									>
										Create a new team
									</Button>
								</div>

								{/* Join Team */}
								{teamMode === "join" && (
									<div className="space-y-3">
										<div>
											<Label htmlFor="teamCode">Team code</Label>
											<Input
												type="text"
												id="teamCode"
												value={teamCode}
												onChange={(e) =>
													setTeamCode(e.target.value.toUpperCase())
												}
												hasError={!!errors.join}
												className="text-center tracking-wider"
												placeholder="Enter your code"
											/>
										</div>
										<Button
											onClick={handleCheckCode}
											disabled={!teamCode.trim() || isLoading}
											variant="primary"
											className="w-full"
										>
											{isLoading ? "Checking..." : "Check code"}
										</Button>
										{errors.join && <ErrorText>{errors.join}</ErrorText>}
										{showLoginPrompt && (
											<Button
												onClick={() => navigate("/login")}
												variant="outlined"
												className="w-full mt-2"
											>
												Go to Login
											</Button>
										)}
									</div>
								)}

								{/* Create Team */}
								{teamMode === "create" && (
									<div className="space-y-3">
										<div>
											<Label htmlFor="teamName">Team name</Label>
											<Input
												type="text"
												id="teamName"
												value={teamName}
												onChange={(e) => setTeamName(e.target.value)}
												hasError={!!errors.create}
												placeholder="e.g. Product Development"
											/>
										</div>
										<Button
											variant="primary"
											onClick={handleCreateTeam}
											disabled={!teamName.trim() || isLoading}
											className="w-full"
										>
											{isLoading ? "Creating..." : "Create team"}
										</Button>
										{errors.create && <ErrorText>{errors.create}</ErrorText>}
									</div>
								)}
							</div>
						) : (
							/* Team Confirmed */
							<div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200">
								<div className="flex items-start justify-between mb-2">
									<div>
										<h3 className="text-base text-gray-900">
											{confirmedTeam?.name}
										</h3>
										<p className="text-xs text-gray-500 mt-1">
											{confirmedTeam?.members}{" "}
											{confirmedTeam?.members === 1 ? "member" : "members"}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Check className="w-5 h-5 text-emerald-600" />
									</div>
								</div>

								{confirmedTeam?.code && (
									<div className="mt-4 pt-4 border-t border-emerald-200">
										<div className="flex items-center gap-3">
											<div className="flex-1 px-3 py-2 bg-white rounded-lg border border-emerald-200">
												<span className="text-sm text-gray-900 tracking-wider">
													{confirmedTeam.code}
												</span>
											</div>
											<Button
												onClick={handleCopyCode}
												variant="secondary"
												size="sm"
												className="p-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
											>
												{copied ? (
													<Check className="w-4 h-4 text-emerald-600" />
												) : (
													<Copy className="w-4 h-4 text-emerald-600" />
												)}
											</Button>
										</div>
										<p className="text-xs text-emerald-700 mt-2">
											Share this code with your team members
										</p>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Section 2 - Role */}
					<div>
						<div className="flex items-center gap-2 mb-5">
							<span className="text-xs uppercase tracking-wide text-gray-400">
								Step 2
							</span>
							<span className="text-xs text-gray-300">·</span>
							<span
								className={`text-sm ${
									teamConfirmed ? "text-gray-700" : "text-gray-400"
								}`}
							>
								Role
							</span>
						</div>

						{!teamConfirmed ? (
							<div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-200">
								<p className="text-sm text-gray-400 text-center">
									Choose a team first to see available roles
								</p>
							</div>
						) : (
							<div className="grid grid-cols-3 gap-4">
								{roles.map((role) => {
									const isTaken = takenRoles.includes(role.id);
									const isSelected = selectedRole === role.id;
									const Icon = role.icon;
									const isDisabled =
										isTaken ||
										(teamMode === "create" && role.id === "developer");

									return (
										<button
											key={role.id}
											type="button"
											onClick={() =>
												!isDisabled && setSelectedRole(role.id as Role)
											}
											disabled={isDisabled}
											className={`p-5 rounded-xl border-2 text-left transition-all ${
												isDisabled
													? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
													: isSelected
														? "border-cyan-500 bg-cyan-50"
														: "border-gray-200 hover:border-cyan-300 hover:bg-gray-50"
											}`}
										>
											<div
												className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
													isTaken
														? "bg-gray-200"
														: isSelected
															? "bg-cyan-100"
															: "bg-gray-100"
												}`}
											>
												<Icon
													className={`w-5 h-5 ${
														isTaken
															? "text-gray-400"
															: isSelected
																? "text-cyan-600"
																: "text-gray-600"
													}`}
												/>
											</div>
											<h3
												className={`text-sm mb-1 ${
													isTaken
														? "text-gray-400"
														: isSelected
															? "text-cyan-900"
															: "text-gray-900"
												}`}
											>
												{role.title}
											</h3>
											<p className="text-xs text-gray-500">
												{role.description}
											</p>
											{isTaken && (
												<p className="text-xs text-gray-400 mt-2">
													Already assigned
												</p>
											)}
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{/* Continue to Dashboard */}
				<div className="mt-10">
					<Button
						onClick={handleContinue}
						variant="primary"
						disabled={!teamConfirmed || !selectedRole || isLoading}
						className="w-full"
					>
						{isLoading ? "Loading..." : "Continue to dashboard"}
					</Button>
					{errors.continue && <ErrorText>{errors.continue}</ErrorText>}
				</div>
			</div>
		</div>
	);
}
