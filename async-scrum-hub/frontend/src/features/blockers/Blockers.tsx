import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export function Blockers()
{
	const blockers = [
		{
		id: 1,
		title: "Waiting for design approval on settings page",
		reporter: "Maria Lopez",
		avatar: "ML",
		color: "from-pink-200 to-rose-300",
		priority: "medium",
		duration: "2 days",
		description: "Need final sign-off from design team before implementing responsive layouts.",
		},
		{
		id: 2,
		title: "API rate limiting affecting development",
		reporter: "Alex Kim",
		avatar: "AK",
		color: "from-cyan-200 to-blue-300",
		priority: "high",
		duration: "1 day",
		description: "Third-party API has lower rate limits on dev environment. Need to request increased quota.",
		},
	];

	const priorityColors = {
		high: "bg-rose-100 text-rose-700 border-rose-200",
		medium: "bg-amber-100 text-amber-700 border-amber-200",
	};

	return (
		<div className="p-8">
		<div className="mb-6">
			<h2 className="text-3xl text-gray-900 mb-1">Blockers</h2>
			<p className="text-sm text-gray-500">Issues that need attention</p>
		</div>

		<div className="max-w-3xl space-y-4">
			{blockers.length === 0 ? (
			<div className="bg-emerald-50/50 rounded-2xl p-8 border border-emerald-100">
				<div className="flex flex-col items-center text-center">
				<div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
					<CheckCircle2 className="w-8 h-8 text-emerald-600" />
				</div>
				<h3 className="text-base text-gray-900 mb-2">No active blockers</h3>
				<p className="text-sm text-gray-600">
					Your team is currently unblocked and moving smoothly.
				</p>
				</div>
			</div>
			) : (
			blockers.map((blocker) => (
				<div key={blocker.id} className="bg-rose-50/30 rounded-2xl p-6 border-l-4 border-l-rose-400 border border-rose-100">
				<div className="flex items-start gap-4">
					<div className="p-3 bg-rose-100 rounded-xl mt-1 border border-rose-200">
					<AlertCircle className="w-6 h-6 text-rose-600" />
					</div>

					<div className="flex-1">
					<div className="flex items-start justify-between gap-4 mb-3">
						<h3 className="text-base text-gray-900">{blocker.title}</h3>
						<span className={`text-xs px-3 py-1 rounded-lg border ${priorityColors[blocker.priority as keyof typeof priorityColors]}`}>
						{blocker.priority}
						</span>
					</div>

					<p className="text-sm text-gray-600 mb-4">{blocker.description}</p>

					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
						<div className={`w-8 h-8 rounded-full bg-gradient-to-br ${blocker.color} flex items-center justify-center`}>
							<span className="text-xs text-gray-800">{blocker.avatar}</span>
						</div>
						<span className="text-sm text-gray-600">{blocker.reporter}</span>
						</div>

						<div className="flex items-center gap-2 text-gray-500">
						<Clock className="w-4 h-4" />
						<span className="text-xs">{blocker.duration}</span>
						</div>
					</div>
					</div>
				</div>

				<div className="mt-4 pt-4 border-t border-rose-100">
					<button className="text-sm text-cyan-600 hover:text-cyan-700">Mark as resolved</button>
				</div>
				</div>
			))
			)}
		</div>
		</div>
	);
}
