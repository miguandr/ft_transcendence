import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TeamJoin() {
  const navigate = useNavigate();
  const [teamCode, setTeamCode] = useState("");

  const handleJoin = (e: React.FormEvent) => {
	e.preventDefault();
	// In a real app, this would validate the code and join the team
	navigate("/");
  };

  return (
	<div className="min-h-screen bg-white flex items-center justify-center p-8">
	  <div className="max-w-md w-full">
		<div className="text-center mb-8">
		  <h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>
		  <p className="text-sm text-gray-500">Join your team</p>
		</div>

		<form onSubmit={handleJoin} className="space-y-5">
		  <div>
			<label htmlFor="teamCode" className="block text-sm text-gray-700 mb-2">
			  Team Code
			</label>
			<input
			  type="text"
			  id="teamCode"
			  value={teamCode}
			  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
			  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-center tracking-wider"
			  placeholder="SCR-123"
			  required
			/>
			<p className="text-xs text-gray-500 mt-2">
			  Enter the code provided by your Scrum Master or Product Owner.
			</p>
		  </div>

		  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
			<p className="text-xs text-gray-600">
			  This is required only once. You'll be linked to your team automatically on login.
			</p>
		  </div>

		  <button
			type="submit"
			disabled={!teamCode.trim()}
			className={`w-full px-6 py-3 text-sm text-white rounded-xl transition-colors ${
			  teamCode.trim()
				? "bg-cyan-600 hover:bg-cyan-700"
				: "bg-gray-300 cursor-not-allowed"
			}`}
		  >
			Join team
		  </button>
		</form>
	  </div>
	</div>
  );
}
