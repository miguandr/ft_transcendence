import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export function Analytics() {
  const velocityData = [
	{ week: "Week 1", completed: 12 },
	{ week: "Week 2", completed: 18 },
	{ week: "Week 3", completed: 15 },
	{ week: "Week 4", completed: 22 },
	{ week: "Week 5", completed: 20 },
	{ week: "Week 6", completed: 24 },
  ];

  const burndownData = [
	{ day: "Mon", remaining: 37 },
	{ day: "Tue", remaining: 33 },
	{ day: "Wed", remaining: 28 },
	{ day: "Thu", remaining: 24 },
	{ day: "Fri", remaining: 19 },
	{ day: "Sat", remaining: 16 },
	{ day: "Sun", remaining: 13 },
  ];

  return (
	<div className="p-8">
	  <div className="mb-6">
		<h2 className="text-3xl text-gray-900 mb-1">Analytics</h2>
		<p className="text-sm text-gray-500">Track your team's performance</p>
	  </div>

	  <div className="grid grid-cols-2 gap-6 mb-6">
		<div className="bg-white rounded-2xl p-6 border border-gray-100">
		  <h3 className="text-base text-gray-900 mb-1">Team Velocity</h3>
		  <p className="text-xs text-gray-400 mb-5">Based on completed story points per sprint</p>
		  <ResponsiveContainer width="100%" height={250}>
			<BarChart data={velocityData}>
			  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
			  <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} />
			  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
			  <Tooltip
				contentStyle={{
				  backgroundColor: "white",
				  border: "1px solid #e5e7eb",
				  borderRadius: "12px",
				  padding: "8px 12px"
				}}
			  />
			  <Bar dataKey="completed" fill="#06b6d4" radius={[8, 8, 0, 0]} />
			</BarChart>
		  </ResponsiveContainer>
		</div>

		<div className="bg-white rounded-2xl p-6 border border-gray-100">
		  <h3 className="text-base text-gray-900 mb-1">Sprint Burndown</h3>
		  <p className="text-xs text-gray-400 mb-5">Updated daily from task state changes</p>
		  <ResponsiveContainer width="100%" height={250}>
			<LineChart data={burndownData}>
			  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
			  <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 12 }} />
			  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
			  <Tooltip
				contentStyle={{
				  backgroundColor: "white",
				  border: "1px solid #e5e7eb",
				  borderRadius: "12px",
				  padding: "8px 12px"
				}}
			  />
			  <Line type="monotone" dataKey="remaining" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
			</LineChart>
		  </ResponsiveContainer>
		</div>
	  </div>

	  <div className="grid grid-cols-3 gap-6">
		<div className="bg-white rounded-2xl p-6 border border-gray-100">
		  <p className="text-sm text-gray-500 mb-2">Average Cycle Time</p>
		  <p className="text-3xl text-gray-900">3.2 days</p>
		  <p className="text-sm text-emerald-600 mt-1">↓ 12% from last sprint</p>
		  <p className="text-xs text-gray-400 mt-2">Lower is better</p>
		</div>

		<div className="bg-white rounded-2xl p-6 border border-gray-100">
		  <p className="text-sm text-gray-500 mb-2">Completion Rate</p>
		  <p className="text-3xl text-gray-900">89%</p>
		  <p className="text-sm text-emerald-600 mt-1">↑ 5% from last sprint</p>
		  <p className="text-xs text-gray-400 mt-2">Above 80% is healthy</p>
		</div>

		<div className="bg-white rounded-2xl p-6 border border-gray-100">
		  <p className="text-sm text-gray-500 mb-2">Retro Sentiment</p>
		  <p className="text-3xl text-gray-900">8.4/10</p>
		  <p className="text-sm text-gray-500 mt-1">Based on retro feedback</p>
		  <p className="text-xs text-gray-400 mt-2">Based on anonymous retrospective feedback</p>
		</div>
	  </div>
	</div>
  );
}
