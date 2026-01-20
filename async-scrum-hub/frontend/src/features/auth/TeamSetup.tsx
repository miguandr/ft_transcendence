import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Users, Target, Code } from "lucide-react";
import { createOrganization, joinOrganization, checkJoinCode, getOrganizationMembers } from "../../services/api";
import { Button, Input, Label, ErrorText, HintText, PageContainer } from "../../components/custom";
type TeamMode = "join" | "create";
type Role = "scrum_master" | "product_owner" | "developer" | null;

export function TeamSetup() {
	const navigate = useNavigate();

	// ===== STATE DECLARATIONS =====
	const [teamMode, setTeamMode] = useState<TeamMode>("join");
	const [teamCode, setTeamCode] = useState("");
	const [teamName, setTeamName] = useState("");
	const [teamConfirmed, setTeamConfirmed] = useState(false);
	const [confirmedTeam, setConfirmedTeam] = useState<{ name: string; code?: string; members?: number } | null>(null);
	const [orgId, setOrgId] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [errors, setErrors] = useState<{ team?: string; role?: string }>({});
	const [isLoading, setIsLoading] = useState(false);
	const [takenRoles, setTakenRoles] = useState<(string[])>([]);
	const [selectedRole, setSelectedRole] = useState<Role>(null);


	// ===== FUNCTION DEFINITIONS =====
	//When user enters a team code and clicks "Check code"
	const handleCheckCode = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevents page refresh when form submits

		//Validation: checks if team-code is empty
		if (!teamCode.trim()) {
			setErrors({ team: "Team code is required "});
			return;
		}

		//Call API
		setIsLoading(true); // Show loading spinner
		setErrors({}); // Clear previous errors

		try {
			// Step 1: Validate code and get org info
			const response = await checkJoinCode(teamCode);

			//Step 2: Get members to see what roles are free/taken
			const members = await getOrganizationMembers(response.id);

			//Step 3: Extract taken roles
			const taken = members
				.filter(m => m.scrum_role  === "scrum_master" || m.scrum_role === "product_owner") // m(each member of the array) =>(return). Keep members with roles assigned
				.map(m => m.scrum_role) as string[]; //tells TypeScript "trust me, these arent null".

			//Step 4: Update state
			setOrgId(response.id); // Save org ID for later (when joining)
			setTakenRoles(taken);
			setConfirmedTeam({
				name: response.name,
				members: response.members_count
			});
			setTeamConfirmed(true);

		} catch (error: any) {
			// Handle API errors
			if (error?.error?.code === "CODE_NOT_FOUND") {
				setErrors({ team: "Invalid team code" });
			} else if (error?.error?.message) {
				setErrors({ team: error.error.message });
			} else {
				setErrors({ team: "Something went wrong" });
			}
		} finally {
			setIsLoading(false);
		}
	};

	//TODO
	const handleCreateTeam = () => {
		// Mock team creation - in real app, this would call an API
		if (teamName.trim()) {
		const generatedCode = `SCR-${Math.floor(100 + Math.random() * 900)}`;
		setConfirmedTeam({
			name: teamName,
			code: generatedCode,
			members: 1,
		});
		setTeamConfirmed(true);
		}
	};

	//TODO
	const handleCopyCode = () => {
		if (confirmedTeam?.code) {
		navigator.clipboard.writeText(confirmedTeam.code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		}
	};

	//TODO
	const handleContinue = () => {
		if (teamConfirmed && selectedRole) {
		navigate("/");
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
			<p className="text-sm text-gray-500">Join your team and choose how you'll contribute.</p>
			</div>

			<div className="space-y-10">
			{/* Section 1 - Team */}
			<div>
				<div className="flex items-center gap-2 mb-5">
				<span className="text-xs uppercase tracking-wide text-gray-400">Step 1</span>
				<span className="text-xs text-gray-300">·</span>
				<span className="text-sm text-gray-700">Team</span>
				</div>

				{!teamConfirmed ? (
				<div className="space-y-5">
					{/* Toggle */}
					<div className="flex gap-3">
					<button
						type="button"
						onClick={() => setTeamMode("join")}
						className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm transition-colors ${
						teamMode === "join"
							? "border-cyan-500 bg-cyan-50 text-cyan-700"
							: "border-gray-200 text-gray-600 hover:border-gray-300"
						}`}
					>
						I have a team code
					</button>
					<button
						type="button"
						onClick={() => setTeamMode("create")}
						className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm transition-colors ${
						teamMode === "create"
							? "border-cyan-500 bg-cyan-50 text-cyan-700"
							: "border-gray-200 text-gray-600 hover:border-gray-300"
						}`}
					>
						Create a new team
					</button>
					</div>

					{/* Join Team */}
					{teamMode === "join" && (
					<div className="space-y-3">
						<div>
						<label htmlFor="teamCode" className="block text-sm text-gray-700 mb-2">
							Team code
						</label>
						<input
							type="text"
							id="teamCode"
							value={teamCode}
							onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
							className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center tracking-wider"
							placeholder="Enter your code"
						/>
						</div>
						<button
						type="button"
						onClick={handleCheckCode}
						disabled={!teamCode.trim()}
						className={`w-full px-6 py-3 text-sm rounded-xl transition-colors ${
							teamCode.trim()
							? "bg-cyan-600 text-white hover:bg-cyan-700"
							: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
						>
						Check code
						</button>
					</div>
					)}

					{/* Create Team */}
					{teamMode === "create" && (
					<div className="space-y-3">
						<div>
						<label htmlFor="teamName" className="block text-sm text-gray-700 mb-2">
							Team name
						</label>
						<input
							type="text"
							id="teamName"
							value={teamName}
							onChange={(e) => setTeamName(e.target.value)}
							className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
							placeholder="e.g. Product Development"
						/>
						</div>
						<button
						type="button"
						onClick={handleCreateTeam}
						disabled={!teamName.trim()}
						className={`w-full px-6 py-3 text-sm rounded-xl transition-colors ${
							teamName.trim()
							? "bg-cyan-600 text-white hover:bg-cyan-700"
							: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
						>
						Create team
						</button>
					</div>
					)}
				</div>
				) : (
				/* Team Confirmed */
				<div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200">
					<div className="flex items-start justify-between mb-2">
					<div>
						<h3 className="text-base text-gray-900">{confirmedTeam?.name}</h3>
						<p className="text-xs text-gray-500 mt-1">
						{confirmedTeam?.members} {confirmedTeam?.members === 1 ? "member" : "members"}
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
							<span className="text-sm text-gray-900 tracking-wider">{confirmedTeam.code}</span>
						</div>
						<button
							type="button"
							onClick={handleCopyCode}
							className="p-2 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
						>
							{copied ? (
							<Check className="w-4 h-4 text-emerald-600" />
							) : (
							<Copy className="w-4 h-4 text-emerald-600" />
							)}
						</button>
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
				<span className="text-xs uppercase tracking-wide text-gray-400">Step 2</span>
				<span className="text-xs text-gray-300">·</span>
				<span className={`text-sm ${teamConfirmed ? "text-gray-700" : "text-gray-400"}`}>
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

					return (
						<button
						key={role.id}
						type="button"
						onClick={() => !isTaken && setSelectedRole(role.id as Role)}
						disabled={isTaken}
						className={`p-5 rounded-xl border-2 text-left transition-all ${
							isTaken
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
							isTaken ? "text-gray-400" : isSelected ? "text-cyan-900" : "text-gray-900"
							}`}
						>
							{role.title}
						</h3>
						<p className="text-xs text-gray-500">{role.description}</p>
						{isTaken && (
							<p className="text-xs text-gray-400 mt-2">Already assigned</p>
						)}
						</button>
					);
					})}
				</div>
				)}
			</div>
			</div>

			{/* Primary Action */}
			<div className="mt-10">
			<button
				type="button"
				onClick={handleContinue}
				disabled={!teamConfirmed || !selectedRole}
				className={`w-full px-6 py-3 text-sm rounded-xl transition-colors ${
				teamConfirmed && selectedRole
					? "bg-cyan-600 text-white hover:bg-cyan-700"
					: "bg-gray-200 text-gray-400 cursor-not-allowed"
				}`}
			>
				Continue to dashboard
			</button>
			</div>
		</div>
		</div>
	);
}
