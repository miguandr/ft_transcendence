import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function Dashboard()
{
	const updates = [
		{
		user: "Alex Kim",
		avatar: "AK",
		time: "2h ago",
		text: "Completed API integration for user auth",
		color: "from-emerald-200 to-green-300",
		},
		{
		user: "Maria Lopez",
		avatar: "ML",
		time: "4h ago",
		text: "Updated design mockups based on feedback",
		color: "from-pink-200 to-rose-300",
		},
		{
		user: "Jordan Lee",
		avatar: "JL",
		time: "6h ago",
		text: "Fixed critical bug in payment flow",
		color: "from-amber-200 to-yellow-300",
		},
	];

	return (
		<div className="p-8 space-y-6">
		<div>
			<h2 className="text-3xl text-gray-900 mb-1">
			Good morning, Sarah
			</h2>
			<p className="text-sm text-gray-500">
			Here's what's happening with your team today
			</p>
		</div>

		<div className="grid grid-cols-3 gap-6">
			<div className="bg-white rounded-2xl p-6 border border-gray-100">
			<div className="flex items-center gap-3 mb-4">
				<div className="p-2 bg-cyan-100 rounded-xl">
				<Clock className="w-5 h-5 text-cyan-600" />
				</div>
				<span className="text-sm text-gray-500">
				In Progress
				</span>
			</div>
			<p className="text-3xl text-gray-900">8</p>
			<p className="text-xs text-gray-400 mt-1">tasks</p>
			</div>

			<div className="bg-white rounded-2xl p-6 border border-gray-100">
			<div className="flex items-center gap-3 mb-4">
				<div className="p-2 bg-emerald-100 rounded-xl">
				<CheckCircle2 className="w-5 h-5 text-emerald-600" />
				</div>
				<span className="text-sm text-gray-500">
				Completed
				</span>
			</div>
			<p className="text-3xl text-gray-900">24</p>
			<p className="text-xs text-gray-400 mt-1">
				this sprint
			</p>
			</div>

			<div className="bg-white rounded-2xl p-6 border border-gray-100">
			<div className="flex items-center gap-3 mb-4">
				<div className="p-2 bg-rose-100 rounded-xl">
				<AlertCircle className="w-5 h-5 text-rose-600" />
				</div>
				<span className="text-sm text-gray-500">
				Blockers
				</span>
			</div>
			<p className="text-3xl text-gray-900">2</p>
			<p className="text-xs text-gray-400 mt-1">
				need attention
			</p>
			</div>
		</div>

		<div className="bg-white rounded-2xl p-6 border border-gray-100">
			<h3 className="text-base text-gray-900 mb-4">
			Recent Updates
			</h3>
			<div className="space-y-4">
			{updates.map((update, index) => (
				<div
				key={index}
				className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
				>
				<div
					className={`w-10 h-10 rounded-full bg-gradient-to-br ${update.color} flex items-center justify-center flex-shrink-0`}
				>
					<span className="text-sm text-gray-800">
					{update.avatar}
					</span>
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-baseline gap-2 mb-1">
					<span className="text-sm text-gray-900">
						{update.user}
					</span>
					<span className="text-xs text-gray-400">
						{update.time}
					</span>
					</div>
					<p className="text-sm text-gray-500">
					{update.text}
					</p>
				</div>
				</div>
			))}
			</div>
		</div>

		<div className="bg-white rounded-2xl p-6 border border-gray-100">
			<h3 className="text-base text-gray-900 mb-1">
			Sprint Progress
			</h3>
			<p className="text-sm text-gray-500 mb-4">
			Week 2 of 2
			</p>
			<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
			<div
				className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"
				style={{ width: "65%" }}
			></div>
			</div>
			<p className="text-xs text-gray-500 mt-2">
			24 of 37 tasks completed
			</p>
		</div>
		</div>
	);
}
