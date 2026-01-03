import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check } from "lucide-react";

export function TeamCreation()
{
	const navigate = useNavigate();
	const [teamName, setTeamName] = useState("");
	const [teamCode, setTeamCode] = useState("");
	const [copied, setCopied] = useState(false);
	const [joinTeamCode, setJoinTeamCode] = useState("");

	// Generate a random team code on mount
	useEffect(() => {
		const randomNum = Math.floor(100 + Math.random() * 900);
		setTeamCode(`SCR-${randomNum}`);
	}, []);

	const handleCopyCode = () => {
		navigator.clipboard.writeText(teamCode);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleCreateTeam = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app, this would create the team
		navigate("/");
	};

	const handleJoinTeam = () => {
		// In a real app, this would validate and join the team
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-white flex items-center justify-center p-8">
		<div className="max-w-md w-full">
			<div className="text-center mb-8">
			<h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>
			<p className="text-sm text-gray-500">Create your team</p>
			</div>

			<form onSubmit={handleCreateTeam} className="space-y-5">
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
				required
				/>
			</div>

			<div className="bg-cyan-50 rounded-xl p-5 border border-cyan-100">
				<label className="block text-sm text-gray-700 mb-2">
				Team Code
				</label>
				<div className="flex items-center gap-3 mb-3">
				<div className="flex-1 px-4 py-3 bg-white rounded-xl border border-cyan-200">
					<span className="text-lg text-gray-900 tracking-wider">{teamCode}</span>
				</div>
				<button
					type="button"
					onClick={handleCopyCode}
					className="p-3 bg-white border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-colors"
				>
					{copied ? (
					<Check className="w-5 h-5 text-emerald-600" />
					) : (
					<Copy className="w-5 h-5 text-cyan-600" />
					)}
				</button>
				</div>
				<p className="text-xs text-cyan-700">
				Share this code with your team so they can join.
				</p>
			</div>

			<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
				<p className="text-xs text-gray-600">
				This is required only once. Team members will be linked automatically on login.
				</p>
			</div>

			<button
				type="submit"
				disabled={!teamName.trim()}
				className={`w-full px-6 py-3 text-sm text-white rounded-xl transition-colors ${
				teamName.trim()
					? "bg-cyan-600 hover:bg-cyan-700"
					: "bg-gray-300 cursor-not-allowed"
				}`}
			>
				Create team
			</button>
			</form>

			{/* Divider */}
			<div className="relative my-8">
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-gray-200"></div>
			</div>
			<div className="relative flex justify-center text-xs">
				<span className="px-3 bg-white text-gray-400">or</span>
			</div>
			</div>

			{/* Join Existing Team Section */}
			<div className="space-y-4">
			<h3 className="text-sm text-gray-700">Already have a team?</h3>

			<div>
				<label htmlFor="joinTeamCode" className="block text-sm text-gray-700 mb-2">
				Team code
				</label>
				<input
				type="text"
				id="joinTeamCode"
				value={joinTeamCode}
				onChange={(e) => setJoinTeamCode(e.target.value.toUpperCase())}
				className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center tracking-wider"
				placeholder="e.g. SCR-493"
				/>
				<p className="text-xs text-gray-500 mt-2">
				Enter a team code to join an existing team.
				</p>
			</div>

			<button
				type="button"
				onClick={handleJoinTeam}
				disabled={!joinTeamCode.trim()}
				className={`w-full px-6 py-3 text-sm rounded-xl border-2 transition-colors ${
				joinTeamCode.trim()
					? "border-cyan-600 text-cyan-600 hover:bg-cyan-50"
					: "border-gray-200 text-gray-400 cursor-not-allowed"
				}`}
			>
				Join team
			</button>

			<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
				<p className="text-xs text-gray-600">
				This step is required only once. Once joined, your team will be linked automatically on future logins.
				</p>
			</div>
			</div>
		</div>
		</div>
	);
}
