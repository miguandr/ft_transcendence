import { useEffect, useState } from "react";
import { getAnalitycsData, getCurrentUser} from "../../services/api";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	Legend,
} from "recharts";
import type { AnalitycsData } from "../../services/api"
type APIError = {
	error?: { code?: string; message?: string };
};


export function Analytics() {
	//Data states
	const [analytics, setAnalytics] = useState<AnalitycsData | null>(null);
	//Auth states
	const [errors, setErrors] = useState<{ analytics?: string }>({});
	//Communication states
	const [isLoading, setIsLoading] = useState(false);



	const fetchAnalitycs = async () => {
		setIsLoading(true);
		setErrors({});

		try {
			const user = await getCurrentUser();

			if (user.organization_id) {
				const data = await getAnalitycsData(user.organization_id);
				setAnalytics(data);
			}

		} catch (error:unknown) {
			console.error("API call failed:", error);

			const apiError = error as APIError;
			if (apiError.error?.code === "UNAUTHORIZED") {
				setErrors({ analytics: "Authentication required" });
			} else if (apiError.error?.code === "FORBIDDEN") {
				setErrors({ analytics: "You do not have permission to perform this action" });
			} else if (apiError.error?.code === "NOT_FOUND") {
				setErrors({ analytics: "Organization not found" });
			} else {
				setErrors({ analytics: "Something went wrong" });
			}

		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		fetchAnalitycs();
	}, []);


	return (
		<div className="p-8">
			<div className="mb-6">
				<h2 className="text-3xl text-gray-900 mb-1">Analytics</h2>
				<p className="text-sm text-gray-500">Track your team's performance</p>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center py-16 text-gray-400 text-sm">
					Loading analytics...
				</div>
			)}

			{errors.analytics && (
				<div className="flex items-center justify-center py-16 text-red-500 text-sm">
					{errors.analytics}
				</div>
			)}

			{!isLoading && !errors.analytics && (
				<div>
					<div className="grid grid-cols-2 gap-6 mb-6">
						<div className="bg-white rounded-2xl p-6 border border-gray-100">
							<h3 className="text-base text-gray-900 mb-1">Team Velocity</h3>
							<p className="text-xs text-gray-400 mb-5">
								Based on completed story points per ticket
							</p>
							<ResponsiveContainer width="100%" height={250}>
								<BarChart data={analytics?.tickets}>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} />
									<YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
									<Tooltip
										contentStyle={{
											backgroundColor: "white",
											border: "1px solid #e5e7eb",
											borderRadius: "12px",
											padding: "8px 12px",
										}}
									/>
									<Bar dataKey="completed" name="Completed" fill="#06b6d4" radius={[8, 8, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>

						<div className="bg-white rounded-2xl p-6 border border-gray-100">
							<h3 className="text-base text-gray-900 mb-1">Sprint Burndown</h3>
							<p className="text-xs text-gray-400 mb-5">
								Updated daily from task state changes
							</p>
							<ResponsiveContainer width="100%" height={250}>
								<LineChart data={analytics?.tasks}>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<Legend></Legend>
									<XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} />
									<YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
									<Tooltip
										contentStyle={{
											backgroundColor: "white",
											border: "1px solid #e5e7eb",
											borderRadius: "12px",
											padding: "8px 12px",
										}}
									/>
									<Line
										type="monotone"
										dataKey="in_progress"
										name="In Progress"
										stroke="#06B6D4"
										strokeWidth={2}
										dot={{ fill: "#06B6D4", r: 4 }}
									/>
									<Line
										type="monotone"
										dataKey="completed"
										name="Completed"
										stroke="#10b981"
										strokeWidth={2}
										dot={{ fill: "#10b981", r: 4 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="grid grid-cols-3 w-full h-full">
						<div className="flex justify-center items center">
							<div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
								<p className="text-sm text-gray-500 mb-2">Average Blocker Cycle Time</p>
								<p className="text-3xl text-gray-900">{analytics?.blockers_avg_cycle_time} days</p>
							</div>
						</div>

						<div className="flex justify-center items center">
							<div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
								<p className="text-sm text-gray-500 mb-2">Daily Standups</p>
								<p className="text-3xl text-gray-900">{analytics?.standups.posted}</p>
							</div>
						</div>

						<div className="flex justify-center items center">
							<div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
								<p className="text-sm text-gray-500 mb-2">Total Standups this week</p>
								<p className="text-3xl text-gray-900">{analytics?.standups.total}</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
