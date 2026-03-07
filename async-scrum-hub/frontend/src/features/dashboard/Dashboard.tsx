import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Avatar, Card, PageHeader, StatCard } from "../../components/custom";
import { useDashboard } from "./useDashboard";
import { formatRelativeTime } from "../../utils/formatters";

export function Dashboard() {
	const {
		user,
		data,
		isLoading,
		errors
	} = useDashboard();

	if (isLoading) {
		return <div className="p-8 text-gray-400">Loading...</div>;
	}

	if (errors) {
		return <div className="p-8 text-rose-500">{errors}</div>;
	}

	return (
		<div className="p-8 space-y-6">
			<PageHeader
				title={`Hello ${user?.name?.split(" ")[0]},`}
				subtitle="Here's what's happening with your team today"
			/>

			<div className="grid grid-cols-3 gap-6">
				<StatCard
					icon={<Clock className="w-5 h-5 text-cyan-600" />}
					label="In Progress"
					value={data?.summary.tasks_in_progress ?? 0}
					subtitle="tasks"
					bgColor="bg-cyan-100"
				/>
				<StatCard
					icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
					label="Completed"
					value={data?.summary.tickets_completed ?? 0}
					subtitle="tickets"
					bgColor="bg-emerald-100"
				/>
				<StatCard
					icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
					label="Blockers"
					value={data?.summary.active_blockers ?? 0}
					subtitle="need attention"
					bgColor="bg-rose-100"
				/>
			</div>

			<Card>
				<h3 className="text-base font-semibold text-gray-900 mb-4">Recent Updates</h3>
				<div className="space-y-4">
					{data?.recent_updates.length === 0 && (
						<p className="text-sm text-gray-400">No recent updates.</p>
					)}
					{data?.recent_updates.map((update, index) => (
						<div
							key={index}
							className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
						>
							<Avatar
								name={update.user.name}
								userId={update.user.id}
								avatarUrl={update.user.avatar_url}
								size="md"
							/>
							<div className="flex-1 min-w-0">
								<div className="flex items-baseline gap-2 mb-1">
									<span className="text-sm text-gray-900">{update.user.name}</span>
									<span className="text-xs text-gray-400 ml-auto">
										{formatRelativeTime(update.timestamp)}
									</span>
								</div>
								<p className="text-sm text-gray-500 capitalize">
									{update.event} {update.type}: {update.title}
								</p>
							</div>
						</div>
					))}
				</div>
			</Card>
		</div>
	);
}
