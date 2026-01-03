import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Code, Target } from "lucide-react";

export function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const roles = [
	{
	  id: "product-owner",
	  title: "Product Owner",
	  icon: Target,
	},
	{
	  id: "scrum-master",
	  title: "Scrum Master",
	  icon: Users,
	},
	{
	  id: "developer",
	  title: "Developer",
	  icon: Code,
	},
  ];

  const handleContinue = () => {
	if (selectedRole) {
	  // Navigate to team creation for Scrum Master and Product Owner
	  if (selectedRole === "scrum-master" || selectedRole === "product-owner") {
		navigate("/team-creation");
	  } else if (selectedRole === "developer") {
		// Navigate to team join for Developer
		navigate("/team-join");
	  }
	}
  };

  return (
	<div className="min-h-screen bg-white flex items-center justify-center p-8">
	  <div className="max-w-lg w-full">
		<div className="text-center mb-8">
		  <h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>
		  <p className="text-base text-gray-900 mt-6 mb-2">What's your primary role on this team?</p>
		  <p className="text-xs text-gray-400">Roles affect default dashboards and permissions.</p>
		</div>

		<div className="space-y-3 mb-8">
		  {roles.map((role) => {
			const Icon = role.icon;
			const isSelected = selectedRole === role.id;

			return (
			  <button
				key={role.id}
				onClick={() => setSelectedRole(role.id)}
				className={`w-full p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${
				  isSelected
					? "border-cyan-500 bg-cyan-50"
					: "border-gray-200 hover:border-gray-300 bg-white"
				}`}
			  >
				<div
				  className={`p-3 rounded-xl ${
					isSelected ? "bg-cyan-100" : "bg-gray-100"
				  }`}
				>
				  <Icon
					className={`w-5 h-5 ${
					  isSelected ? "text-cyan-600" : "text-gray-600"
					}`}
				  />
				</div>
				<span className="text-base text-gray-900">{role.title}</span>

				{isSelected && (
				  <div className="ml-auto w-5 h-5 bg-cyan-600 rounded-full flex items-center justify-center">
					<svg
					  className="w-3 h-3 text-white"
					  fill="none"
					  viewBox="0 0 24 24"
					  stroke="currentColor"
					>
					  <path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={3}
						d="M5 13l4 4L19 7"
					  />
					</svg>
				  </div>
				)}
			  </button>
			);
		  })}
		</div>

		<div className="flex gap-3">
		  <button
			onClick={() => navigate("/signup")}
			className="flex-1 px-6 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
		  >
			Back
		  </button>
		  <button
			onClick={handleContinue}
			disabled={!selectedRole}
			className={`flex-1 px-6 py-3 text-sm text-white rounded-xl transition-colors ${
			  selectedRole
				? "bg-cyan-600 hover:bg-cyan-700"
				: "bg-gray-300 cursor-not-allowed"
			}`}
		  >
			Continue
		  </button>
		</div>
	  </div>
	</div>
  );
}
