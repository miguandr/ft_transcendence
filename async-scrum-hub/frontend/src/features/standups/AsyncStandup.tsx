import { useNavigate } from "react-router-dom";

export function AsyncStandup() {
  const navigate = useNavigate();

  const standups = [
	{
	  user: "Alex Kim",
	  avatar: "AK",
	  time: "9:30 AM",
	  color: "from-cyan-200 to-blue-300",
	  yesterday: "Completed user authentication flow, fixed session persistence bug",
	  today: "Working on OAuth integration with Google and GitHub",
	  blockers: "None",
	},
	{
	  user: "Maria Lopez",
	  avatar: "ML",
	  time: "8:45 AM",
	  color: "from-pink-200 to-rose-300",
	  yesterday: "Finalized dashboard redesign, updated component library",
	  today: "Creating responsive layouts for mobile view",
	  blockers: "Waiting for design approval on settings page",
	},
	{
	  user: "Jordan Lee",
	  avatar: "JL",
	  time: "10:15 AM",
	  color: "from-amber-200 to-yellow-300",
	  yesterday: "Fixed payment processing bug, deployed hotfix to production",
	  today: "Writing unit tests for payment module",
	  blockers: "None",
	},
  ];

  return (
	<div className="p-8">
	  <div className="mb-6">
		<h2 className="text-3xl text-gray-900 mb-1">Async Standup</h2>
		<p className="text-sm text-gray-500">Team updates • Updated today</p>
	  </div>

	  <div className="max-w-3xl space-y-5">
		{standups.map((standup, index) => (
		  <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100">
			<div className="flex items-center gap-4 mb-6">
			  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${standup.color} flex items-center justify-center`}>
				<span className="text-gray-800">{standup.avatar}</span>
			  </div>
			  <div>
				<h3 className="text-base text-gray-900">{standup.user}</h3>
				<p className="text-xs text-gray-400">{standup.time}</p>
			  </div>
			</div>

			<div className="space-y-4">
			  <div className="pb-4 border-b border-gray-100">
				<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Yesterday</h4>
				<p className="text-sm text-gray-600">{standup.yesterday}</p>
			  </div>

			  <div className="pb-4 border-b border-gray-100">
				<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Today</h4>
				<p className="text-sm text-gray-600">{standup.today}</p>
			  </div>

			  <div>
				<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">Blockers</h4>
				{standup.blockers === "None" ? (
				  <p className="text-sm text-gray-400">{standup.blockers}</p>
				) : (
				  <button
					onClick={() => navigate("/blockers")}
					className="text-sm text-rose-600 hover:text-rose-700 underline decoration-dotted underline-offset-2 transition-colors text-left"
				  >
					{standup.blockers}
				  </button>
				)}
			  </div>
			</div>
		  </div>
		))}

		<button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 hover:border-cyan-200 hover:text-cyan-600 transition-colors">
		  + Add your standup update
		</button>
	  </div>
	</div>
  );
}
