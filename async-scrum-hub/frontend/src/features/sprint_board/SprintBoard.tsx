import { Plus, X } from "lucide-react";
import { useState } from "react";

export function SprintBoard() {
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [assignee, setAssignee] = useState("");

  const teamMembers = [
	{ id: "ak", name: "Alex Kim", avatar: "AK", color: "from-cyan-200 to-blue-300" },
	{ id: "ml", name: "Maria Lopez", avatar: "ML", color: "from-pink-200 to-rose-300" },
	{ id: "jl", name: "Jordan Lee", avatar: "JL", color: "from-amber-200 to-yellow-300" },
	{ id: "sc", name: "Sarah Chen", avatar: "SC", color: "from-emerald-200 to-green-300" },
  ];

  const columns = [
	{
	  id: "todo",
	  title: "To Do",
	  color: "bg-gray-50",
	  borderColor: "border-l-gray-300",
	  tasks: [
		{ id: 1, title: "Design settings page", assignee: "ML", priority: "medium" },
		{ id: 2, title: "Write API documentation", assignee: "JL", priority: "low" },
	  ],
	},
	{
	  id: "in_progress",
	  title: "In progress",
	  color: "bg-gray-50",
	  borderColor: "border-l-cyan-400",
	  tasks: [
		{ id: 3, title: "Implement OAuth flow", assignee: "AK", priority: "high" },
		{ id: 4, title: "Update dashboard charts", assignee: "SC", priority: "medium" },
		{ id: 5, title: "Review pull requests", assignee: "ML", priority: "medium" },
	  ],
	},
	{
	  id: "completed",
	  title: "Completed",
	  color: "bg-gray-50",
	  borderColor: "border-l-emerald-400",
	  tasks: [
		{ id: 6, title: "Fix login bug", assignee: "JL", priority: "high" },
		{ id: 7, title: "Update user profile UI", assignee: "ML", priority: "low" },
		{ id: 8, title: "Add loading states", assignee: "AK", priority: "medium" },
	  ],
	},
  ];

  const priorityColors = {
	high: "bg-rose-100/50 text-rose-700 border border-rose-200",
	medium: "bg-amber-100/50 text-amber-700 border border-amber-200",
	low: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  const handleCreateTicket = () => {
	// In a real app, this would create the ticket
	setIsAddTicketOpen(false);
	setTitle("");
	setDescription("");
	setPriority("medium");
	setAssignee("");
  };

  const handleCancel = () => {
	setIsAddTicketOpen(false);
	setTitle("");
	setDescription("");
	setPriority("medium");
	setAssignee("");
  };

  return (
	<div className="p-8">
	  <div className="mb-6 flex items-start justify-between">
		<div>
		  <h2 className="text-3xl text-gray-900 mb-1">Sprint Board</h2>
		  <p className="text-sm text-gray-500">Visualize your team's workflow</p>
		</div>
		<div className="flex flex-col items-end gap-1">
		  <button
			onClick={() => setIsAddTicketOpen(true)}
			className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-700 bg-white border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-colors"
		  >
			<Plus className="w-4 h-4" />
			Add Ticket
		  </button>
		  <span className="text-xs text-gray-400">Managed by Product Owner / Scrum Master</span>
		</div>
	  </div>

	  <div className="grid grid-cols-3 gap-6">
		{columns.map((column) => (
		  <div key={column.id} className="space-y-4">
			<div className="flex items-center justify-between">
			  <h3 className="text-base text-gray-900">{column.title}</h3>
			  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{column.tasks.length}</span>
			</div>

			<div className={`${column.color} rounded-2xl p-4 min-h-[600px] space-y-3`}>
			  {column.tasks.map((task) => (
				<div
				  key={task.id}
				  className={`bg-white rounded-xl p-4 border border-gray-100 border-l-4 ${column.borderColor} hover:shadow-sm transition-shadow cursor-pointer`}
				>
				  <div className="flex items-start justify-between gap-2 mb-3">
					<span className="text-sm text-gray-900">{task.title}</span>
					<span className={`text-xs px-2 py-1 rounded-lg ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
					  {task.priority}
					</span>
				  </div>
				  <div className="flex items-center gap-2">
					<div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-200 to-blue-300 flex items-center justify-center">
					  <span className="text-xs text-cyan-900">{task.assignee}</span>
					</div>
					<span className="text-xs text-gray-400">{task.assignee}</span>
				  </div>
				</div>
			  ))}
			</div>
		  </div>
		))}
	  </div>

	  {/* Add Ticket Modal */}
	  {isAddTicketOpen && (
		<>
		  <div
			className="fixed inset-0 bg-black/20 z-40"
			onClick={handleCancel}
		  />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
			  {/* Modal Header */}
			  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<div>
				  <h3 className="text-lg text-gray-900">Add Ticket</h3>
				  <p className="text-xs text-gray-500 mt-0.5">New tickets will appear in To Do</p>
				</div>
				<button
				  onClick={handleCancel}
				  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
				>
				  <X className="w-5 h-5 text-gray-400" />
				</button>
			  </div>

			  {/* Modal Content */}
			  <div className="px-6 py-5 space-y-4">
				{/* Title Field */}
				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Title <span className="text-rose-500">*</span>
				  </label>
				  <input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Enter ticket title"
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
				  />
				</div>

				{/* Description Field */}
				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Description
				  </label>
				  <textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Add details (optional)"
					rows={4}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
				  />
				</div>

				{/* Priority Field */}
				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Priority <span className="text-rose-500">*</span>
				  </label>
				  <div className="grid grid-cols-3 gap-3">
					<button
					  onClick={() => setPriority("high")}
					  className={`px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
						priority === "high"
						  ? "border-rose-300 bg-rose-50 text-rose-700"
						  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
					  }`}
					>
					  High
					</button>
					<button
					  onClick={() => setPriority("medium")}
					  className={`px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
						priority === "medium"
						  ? "border-amber-300 bg-amber-50 text-amber-700"
						  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
					  }`}
					>
					  Medium
					</button>
					<button
					  onClick={() => setPriority("low")}
					  className={`px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
						priority === "low"
						  ? "border-gray-300 bg-gray-50 text-gray-700"
						  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
					  }`}
					>
					  Low
					</button>
				  </div>
				</div>

				{/* Assignee Field */}
				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Assignee
				  </label>
				  <select
					value={assignee}
					onChange={(e) => setAssignee(e.target.value)}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
				  >
					<option value="">Select team member (optional)</option>
					{teamMembers.map((member) => (
					  <option key={member.id} value={member.avatar}>
						{member.name}
					  </option>
					))}
				  </select>
				</div>
			  </div>

			  {/* Modal Footer */}
			  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
				<button
				  onClick={handleCancel}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Cancel
				</button>
				<button
				  onClick={handleCreateTicket}
				  disabled={!title.trim()}
				  className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
				  Create ticket
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}
	</div>
  );
}
