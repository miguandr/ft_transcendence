import { AlertTriangle, TrendingDown, Clock, Users, CheckCircle2 } from "lucide-react";

export function TeamHealth() {
  const signals = [
	{
	  icon: AlertTriangle,
	  type: "warning",
	  title: "2 blockers unresolved for 48h",
	  description: "Long-standing blockers may impact sprint delivery",
	  color: "amber",
	},
	{
	  icon: TrendingDown,
	  type: "risk",
	  title: "Velocity down 12% vs last sprint",
	  description: "Team completed fewer points than recent average",
	  color: "rose",
	},
  ];

  const recommendations = [
	{
	  icon: Clock,
	  title: "Schedule a quick unblock sync",
	  description: "15-min focused session to address persistent blockers",
	},
	{
	  icon: Users,
	  title: "Reassign blocker owner",
	  description: "Consider distributing blocked tasks to available team members",
	},
	{
	  icon: CheckCircle2,
	  title: "Review WIP limits",
	  description: "Check if too many items are in progress simultaneously",
	},
  ];

  return (
	<div className="p-8">
	  <div className="mb-6">
		<h2 className="text-3xl text-gray-900 mb-1">Team Health</h2>
		<p className="text-sm text-gray-500">Monitor team signals and get actionable insights</p>
	  </div>

	  <div className="max-w-4xl space-y-6">
		{/* Signals Section */}
		<div>
		  <h3 className="text-base text-gray-900 mb-4">Signals</h3>
		  <div className="space-y-4">
			{signals.map((signal, index) => {
			  const Icon = signal.icon;
			  const bgColor = signal.color === "amber" ? "bg-amber-50/50" : "bg-rose-50/50";
			  const borderColor = signal.color === "amber" ? "border-amber-200" : "border-rose-200";
			  const iconBg = signal.color === "amber" ? "bg-amber-100" : "bg-rose-100";
			  const iconColor = signal.color === "amber" ? "text-amber-600" : "text-rose-600";

			  return (
				<div
				  key={index}
				  className={`${bgColor} rounded-2xl p-6 border ${borderColor} flex items-start gap-4`}
				>
				  <div className={`p-3 ${iconBg} rounded-xl`}>
					<Icon className={`w-5 h-5 ${iconColor}`} />
				  </div>
				  <div className="flex-1">
					<h4 className="text-base text-gray-900 mb-1">{signal.title}</h4>
					<p className="text-sm text-gray-600">{signal.description}</p>
				  </div>
				</div>
			  );
			})}
		  </div>
		</div>

		{/* Recommended Actions Section */}
		<div>
		  <h3 className="text-base text-gray-900 mb-4">Recommended Actions</h3>
		  <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
			{recommendations.map((rec, index) => {
			  const Icon = rec.icon;
			  return (
				<div key={index} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
				  <div className="p-2 bg-gray-100 rounded-lg">
					<Icon className="w-5 h-5 text-gray-600" />
				  </div>
				  <div className="flex-1">
					<h4 className="text-sm text-gray-900 mb-1">{rec.title}</h4>
					<p className="text-sm text-gray-500">{rec.description}</p>
				  </div>
				  <button className="text-sm text-cyan-600 hover:text-cyan-700">
					Take action
				  </button>
				</div>
			  );
			})}
		  </div>
		</div>
	  </div>
	</div>
  );
}
