import { Plus, X, AlertCircle, GripVertical, Trash2, Edit2, CheckCircle } from "lucide-react";
import { useState } from "react";

// Types
type Priority = "high" | "medium" | "low";
type UserRole = "Product Owner" | "Scrum Master" | "Developer";
type TicketStatus = "todo" | "in_progress" | "completed";
type TaskStatus = "in-progress" | "completed";

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
}

interface Blocker {
  id: number;
  description: string;
  creator: string;
  status: "open" | "resolved";
  ticketId: number;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  assignee: string;
  priority: Priority;
  status: TicketStatus;
  tasks: Task[];
}

export function SprintBoard() {
  // Mock current user
  const currentUser = {
	id: "sc",
	name: "Sarah Chen",
	avatar: "SC",
	role: "Product Owner" as UserRole, // Change this to test different roles
  };

  const teamMembers = [
	{ id: "ak", name: "Alex Kim", avatar: "AK", color: "from-cyan-200 to-blue-300", role: "Developer" },
	{ id: "ml", name: "Maria Lopez", avatar: "ML", color: "from-pink-200 to-rose-300", role: "Developer" },
	{ id: "jl", name: "Jordan Lee", avatar: "JL", color: "from-amber-200 to-yellow-300", role: "Developer" },
	{ id: "sc", name: "Sarah Chen", avatar: "SC", color: "from-emerald-200 to-green-300", role: "Product Owner" },
  ];

  // State for tickets
  const [tickets, setTickets] = useState<Ticket[]>([
	{
	  id: 1,
	  title: "Design settings page",
	  description: "Create a new settings page with user preferences",
	  assignee: "ML",
	  priority: "medium",
	  status: "todo",
	  tasks: [],
	},
	{
	  id: 2,
	  title: "Write API documentation",
	  description: "Document all REST endpoints",
	  assignee: "JL",
	  priority: "low",
	  status: "todo",
	  tasks: [],
	},
	{
	  id: 3,
	  title: "Implement OAuth flow",
	  description: "Add OAuth authentication with Google and GitHub",
	  assignee: "AK",
	  priority: "high",
	  status: "in_progress",
	  tasks: [
		{ id: 1, title: "Set up OAuth providers", description: "Configure OAuth apps", assignee: "AK", status: "completed" },
		{ id: 2, title: "Build login UI", description: "Create OAuth login buttons", assignee: "AK", status: "in-progress" },
	  ],
	},
	{
	  id: 4,
	  title: "Update dashboard charts",
	  description: "Improve chart visuals and add filters",
	  assignee: "SC",
	  priority: "medium",
	  status: "in_progress",
	  tasks: [
		{ id: 3, title: "Add date range picker", description: "Allow filtering by date", assignee: "SC", status: "in-progress" },
	  ],
	},
	{
	  id: 6,
	  title: "Fix login bug",
	  description: "Resolve timeout issue on mobile",
	  assignee: "JL",
	  priority: "high",
	  status: "completed",
	  tasks: [
		{ id: 4, title: "Debug mobile timeout", description: "Find root cause", assignee: "JL", status: "completed" },
		{ id: 5, title: "Apply fix", description: "Update timeout logic", assignee: "JL", status: "completed" },
	  ],
	},
  ]);

  const [blockers, setBlockers] = useState<Blocker[]>([
	{ id: 1, description: "Waiting for API keys from client", creator: "AK", status: "open", ticketId: 3 },
	{ id: 2, description: "Design assets not yet approved", creator: "ML", status: "resolved", ticketId: 1 },
  ]);

  // Modal states
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditTicketOpen, setIsEditTicketOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAddBlockerOpen, setIsAddBlockerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "ticket" | "task"; id: number } | null>(null);

  // Form states
  const [ticketForm, setTicketForm] = useState({
	title: "",
	description: "",
	priority: "medium" as Priority,
	assignee: "",
  });

  const [taskForm, setTaskForm] = useState({
	title: "",
	description: "",
	assignee: "",
  });

  const [blockerForm, setBlockerForm] = useState({
	description: "",
	assignee: "",
  });

  // Drag state
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; ticketId: number } | null>(null);

  // Permission helpers
  const canAddTicket = currentUser.role === "Product Owner" || currentUser.role === "Scrum Master";
  const canDragTickets = currentUser.role === "Product Owner" || currentUser.role === "Scrum Master";
  const canEditTicket = currentUser.role === "Product Owner";
  const canDeleteTicket = currentUser.role === "Product Owner" || currentUser.role === "Scrum Master";
  const canEditTask = (task: Task) =>
	currentUser.role === "Product Owner" ||
	currentUser.role === "Scrum Master" ||
	task.assignee === currentUser.avatar;
  const canResolveBlocker = (blocker: Blocker) =>
	blocker.creator === currentUser.avatar || currentUser.role === "Scrum Master";

  const priorityColors = {
	high: "bg-rose-100/50 text-rose-700 border border-rose-200",
	medium: "bg-amber-100/50 text-amber-700 border border-amber-200",
	low: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  const columns = [
	{ id: "todo", title: "To Do", borderColor: "border-l-gray-300" },
	{ id: "in_progress", title: "In Progress", borderColor: "border-l-cyan-400" },
	{ id: "completed", title: "Completed", borderColor: "border-l-emerald-400" },
  ];

  // Handlers
  const handleCreateTicket = () => {
	const newTicket: Ticket = {
	  id: Date.now(),
	  title: ticketForm.title,
	  description: ticketForm.description,
	  priority: ticketForm.priority,
	  assignee: ticketForm.assignee,
	  status: "todo",
	  tasks: [],
	};
	setTickets([...tickets, newTicket]);
	setIsAddTicketOpen(false);
	setTicketForm({ title: "", description: "", priority: "medium", assignee: "" });
  };

  const handleUpdateTicketPriority = () => {
	if (selectedTicket) {
	  setTickets(
		tickets.map((t) =>
		  t.id === selectedTicket.id ? { ...t, priority: ticketForm.priority } : t
		)
	  );
	  setIsEditTicketOpen(false);
	}
  };

  const handleDeleteTicket = () => {
	if (confirmDelete?.type === "ticket") {
	  setTickets(tickets.filter((t) => t.id !== confirmDelete.id));
	  setBlockers(blockers.filter((b) => b.ticketId !== confirmDelete.id));
	  setConfirmDelete(null);
	  setSelectedTicket(null);
	}
  };

  const handleCreateTask = () => {
	if (selectedTicket) {
	  const newTask: Task = {
		id: Date.now(),
		title: taskForm.title,
		description: taskForm.description,
		assignee: taskForm.assignee,
		status: "in-progress",
	  };
	  setTickets(
		tickets.map((t) =>
		  t.id === selectedTicket.id ? { ...t, tasks: [...t.tasks, newTask] } : t
		)
	  );
	  setIsCreateTaskOpen(false);
	  setTaskForm({ title: "", description: "", assignee: "" });
	}
  };

  const handleUpdateTask = (updatedTask: Task) => {
	if (selectedTicket) {
	  setTickets(
		tickets.map((t) =>
		  t.id === selectedTicket.id
			? { ...t, tasks: t.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)) }
			: t
		)
	  );
	  setSelectedTask(null);
	}
  };

  const handleDeleteTask = () => {
	if (confirmDelete?.type === "task" && selectedTicket) {
	  setTickets(
		tickets.map((t) =>
		  t.id === selectedTicket.id
			? { ...t, tasks: t.tasks.filter((task) => task.id !== confirmDelete.id) }
			: t
		)
	  );
	  setConfirmDelete(null);
	  setSelectedTask(null);
	}
  };

  const handleAddBlocker = () => {
	if (selectedTicket) {
	  const newBlocker: Blocker = {
		id: Date.now(),
		description: blockerForm.description,
		creator: currentUser.avatar,
		status: "open",
		ticketId: selectedTicket.id,
	  };
	  setBlockers([...blockers, newBlocker]);
	  setIsAddBlockerOpen(false);
	  setBlockerForm({ description: "", assignee: "" });
	}
  };

  const handleResolveBlocker = (blockerId: number) => {
	setBlockers(blockers.map((b) => (b.id === blockerId ? { ...b, status: "resolved" } : b)));
  };

  // Drag handlers for tickets
  const handleTicketDragStart = (ticket: Ticket) => {
	if (canDragTickets) {
	  setDraggedTicket(ticket);
	}
  };

  const handleTicketDrop = (status: TicketStatus) => {
	if (draggedTicket && canDragTickets) {
	  setTickets(tickets.map((t) => (t.id === draggedTicket.id ? { ...t, status } : t)));
	  setDraggedTicket(null);
	}
  };

  // Drag handlers for tasks
  const handleTaskDragStart = (task: Task, ticketId: number) => {
	const canDrag =
	  currentUser.role === "Product Owner" ||
	  currentUser.role === "Scrum Master" ||
	  task.assignee === currentUser.avatar;
	if (canDrag) {
	  setDraggedTask({ task, ticketId });
	}
  };

  const handleTaskDrop = (newStatus: TaskStatus) => {
	if (draggedTask) {
	  setTickets(
		tickets.map((t) =>
		  t.id === draggedTask.ticketId
			? {
				...t,
				tasks: t.tasks.map((task) =>
				  task.id === draggedTask.task.id ? { ...task, status: newStatus } : task
				),
			  }
			: t
		)
	  );
	  setDraggedTask(null);
	}
  };

  const getTicketsByStatus = (status: TicketStatus) => tickets.filter((t) => t.status === status);
  const getBlockersForTicket = (ticketId: number) => blockers.filter((b) => b.ticketId === ticketId);

  return (
	<div className="p-8">
	  <div className="mb-6 flex items-start justify-between">
		<div>
		  <h2 className="text-3xl text-gray-900 mb-1">Sprint Board</h2>
		  <p className="text-sm text-gray-500">Visualize your team's workflow</p>
		</div>
		<div className="flex flex-col items-end gap-1">
		  {canAddTicket ? (
			<button
			  onClick={() => setIsAddTicketOpen(true)}
			  className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-700 bg-white border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-colors"
			>
			  <Plus className="w-4 h-4" />
			  Add Ticket
			</button>
		  ) : (
			<div className="relative group">
			  <button
				disabled
				className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed"
			  >
				<Plus className="w-4 h-4" />
				Add Ticket
			  </button>
			  <div className="absolute right-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
				Only Product Owner or Scrum Master can add tickets
			  </div>
			</div>
		  )}
		  <span className="text-xs text-gray-400">Managed by Product Owner / Scrum Master</span>
		</div>
	  </div>

	  <div className="grid grid-cols-3 gap-6">
		{columns.map((column) => {
		  const columnTickets = getTicketsByStatus(column.id as TicketStatus);
		  return (
			<div key={column.id} className="space-y-4">
			  <div className="flex items-center justify-between">
				<h3 className="text-base text-gray-900">{column.title}</h3>
				<span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
				  {columnTickets.length}
				</span>
			  </div>

			  <div
				className="bg-gray-50 rounded-2xl p-4 min-h-[600px] space-y-3"
				onDragOver={(e) => e.preventDefault()}
				onDrop={() => handleTicketDrop(column.id as TicketStatus)}
			  >
				{columnTickets.map((ticket) => {
				  const member = teamMembers.find((m) => m.avatar === ticket.assignee);
				  return (
					<div
					  key={ticket.id}
					  draggable={canDragTickets}
					  onDragStart={() => handleTicketDragStart(ticket)}
					  onClick={() => setSelectedTicket(ticket)}
					  className={`bg-white rounded-xl p-4 border border-gray-100 border-l-4 ${column.borderColor} hover:shadow-sm transition-shadow cursor-pointer ${
						canDragTickets ? "cursor-grab active:cursor-grabbing" : ""
					  }`}
					>
					  <div className="flex items-start justify-between gap-2 mb-3">
						<span className="text-sm text-gray-900 flex-1">{ticket.title}</span>
						<span
						  className={`text-xs px-2 py-1 rounded-lg ${
							priorityColors[ticket.priority]
						  }`}
						>
						  {ticket.priority}
						</span>
					  </div>
					  <div className="flex items-center justify-between">
						{member && (
						  <div className="flex items-center gap-2">
							<div
							  className={`w-6 h-6 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center`}
							>
							  <span className="text-xs text-gray-900">{member.avatar}</span>
							</div>
							<span className="text-xs text-gray-400">{member.name}</span>
						  </div>
						)}
						{ticket.tasks.length > 0 && (
						  <span className="text-xs text-gray-400">
							{ticket.tasks.filter((t) => t.status === "completed").length}/{ticket.tasks.length} tasks
						  </span>
						)}
					  </div>
					</div>
				  );
				})}
			  </div>
			</div>
		  );
		})}
	  </div>

	  {/* Add Ticket Modal */}
	  {isAddTicketOpen && (
		<>
		  <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsAddTicketOpen(false)} />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
			  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<div>
				  <h3 className="text-lg text-gray-900">Add Ticket</h3>
				  <p className="text-xs text-gray-500 mt-0.5">New tickets will appear in To Do</p>
				</div>
				<button
				  onClick={() => setIsAddTicketOpen(false)}
				  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
				>
				  <X className="w-5 h-5 text-gray-400" />
				</button>
			  </div>

			  <div className="px-6 py-5 space-y-4">
				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Title <span className="text-rose-500">*</span>
				  </label>
				  <input
					type="text"
					value={ticketForm.title}
					onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
					placeholder="Enter ticket title"
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
				  />
				</div>

				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">Description</label>
				  <textarea
					value={ticketForm.description}
					onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
					placeholder="Add details (optional)"
					rows={4}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
				  />
				</div>

				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Priority <span className="text-rose-500">*</span>
				  </label>
				  <div className="grid grid-cols-3 gap-3">
					{(["high", "medium", "low"] as Priority[]).map((p) => (
					  <button
						key={p}
						onClick={() => setTicketForm({ ...ticketForm, priority: p })}
						className={`px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
						  ticketForm.priority === p
							? p === "high"
							  ? "border-rose-300 bg-rose-50 text-rose-700"
							  : p === "medium"
							  ? "border-amber-300 bg-amber-50 text-amber-700"
							  : "border-gray-300 bg-gray-50 text-gray-700"
							: "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
						}`}
					  >
						{p.charAt(0).toUpperCase() + p.slice(1)}
					  </button>
					))}
				  </div>
				</div>

				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">Assignee</label>
				  <select
					value={ticketForm.assignee}
					onChange={(e) => setTicketForm({ ...ticketForm, assignee: e.target.value })}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
				  >
					<option value="">Select team member (optional)</option>
					{teamMembers
					  .filter((m) => m.role === "Developer")
					  .map((member) => (
						<option key={member.id} value={member.avatar}>
						  {member.name}
						</option>
					  ))}
				  </select>
				</div>
			  </div>

			  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
				<button
				  onClick={() => setIsAddTicketOpen(false)}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Cancel
				</button>
				<button
				  onClick={handleCreateTicket}
				  disabled={!ticketForm.title.trim()}
				  className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
				  Create ticket
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}

	  {/* Ticket Detail Modal */}
	  {selectedTicket && !isEditTicketOpen && !isCreateTaskOpen && !isAddBlockerOpen && (
		<>
		  <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedTicket(null)} />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
			  <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
				<div className="flex-1">
				  <h3 className="text-lg text-gray-900 mb-2">{selectedTicket.title}</h3>
				  <div className="flex items-center gap-2">
					<span
					  className={`text-xs px-2 py-1 rounded-lg ${
						priorityColors[selectedTicket.priority]
					  }`}
					>
					  {selectedTicket.priority}
					</span>
					<span className="text-xs text-gray-500">
					  {selectedTicket.status === "todo"
						? "To Do"
						: selectedTicket.status === "in_progress"
						? "In Progress"
						: "Completed"}
					</span>
				  </div>
				</div>
				<button
				  onClick={() => setSelectedTicket(null)}
				  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
				>
				  <X className="w-5 h-5 text-gray-400" />
				</button>
			  </div>

			  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
				{/* Description */}
				<div>
				  <h4 className="text-sm text-gray-700 mb-2">Description</h4>
				  <p className="text-sm text-gray-600">
					{selectedTicket.description || "No description provided"}
				  </p>
				</div>

				{/* Tasks */}
				<div>
				  <div className="flex items-center justify-between mb-3">
					<h4 className="text-sm text-gray-700">Tasks</h4>
					<button
					  onClick={() => setIsCreateTaskOpen(true)}
					  className="flex items-center gap-1 px-3 py-1.5 text-xs text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
					>
					  <Plus className="w-3 h-3" />
					  Create Task
					</button>
				  </div>

				  {selectedTicket.tasks.length === 0 ? (
					<div className="text-center py-8 bg-gray-50 rounded-xl">
					  <p className="text-sm text-gray-400">No tasks yet — create the first task</p>
					</div>
				  ) : (
					<div className="grid grid-cols-2 gap-4">
					  {/* In Progress */}
					  <div>
						<h5 className="text-xs text-gray-500 uppercase tracking-wide mb-2">In Progress</h5>
						<div
						  className="space-y-2 min-h-[100px] bg-gray-50 rounded-xl p-3"
						  onDragOver={(e) => e.preventDefault()}
						  onDrop={() => handleTaskDrop("in-progress")}
						>
						  {selectedTicket.tasks
							.filter((t) => t.status === "in-progress")
							.map((task) => {
							  const canDrag =
								currentUser.role === "Product Owner" ||
								currentUser.role === "Scrum Master" ||
								task.assignee === currentUser.avatar;
							  return (
								<div
								  key={task.id}
								  draggable={canDrag}
								  onDragStart={() => handleTaskDragStart(task, selectedTicket.id)}
								  onClick={() => setSelectedTask(task)}
								  className={`bg-white p-3 rounded-lg border border-gray-200 text-sm hover:shadow-sm transition-shadow ${
									canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
								  }`}
								>
								  {task.title}
								</div>
							  );
							})}
						</div>
					  </div>

					  {/* Completed */}
					  <div>
						<h5 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Completed</h5>
						<div
						  className="space-y-2 min-h-[100px] bg-emerald-50 rounded-xl p-3"
						  onDragOver={(e) => e.preventDefault()}
						  onDrop={() => handleTaskDrop("completed")}
						>
						  {selectedTicket.tasks
							.filter((t) => t.status === "completed")
							.map((task) => {
							  const canDrag =
								currentUser.role === "Product Owner" ||
								currentUser.role === "Scrum Master" ||
								task.assignee === currentUser.avatar;
							  return (
								<div
								  key={task.id}
								  draggable={canDrag}
								  onDragStart={() => handleTaskDragStart(task, selectedTicket.id)}
								  onClick={() => setSelectedTask(task)}
								  className={`bg-white p-3 rounded-lg border border-emerald-200 text-sm hover:shadow-sm transition-shadow flex items-center gap-2 ${
									canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
								  }`}
								>
								  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
								  <span className="flex-1">{task.title}</span>
								</div>
							  );
							})}
						</div>
					  </div>
					</div>
				  )}
				</div>

				{/* Blockers */}
				<div>
				  <div className="flex items-center justify-between mb-3">
					<h4 className="text-sm text-gray-700">Blockers</h4>
					<button
					  onClick={() => setIsAddBlockerOpen(true)}
					  className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
					>
					  <Plus className="w-3 h-3" />
					  Add Blocker
					</button>
				  </div>

				  {getBlockersForTicket(selectedTicket.id).length === 0 ? (
					<div className="text-center py-8 bg-gray-50 rounded-xl">
					  <p className="text-sm text-gray-400">No blockers reported 🎉</p>
					</div>
				  ) : (
					<div className="space-y-2">
					  {getBlockersForTicket(selectedTicket.id).map((blocker) => (
						<div
						  key={blocker.id}
						  className={`p-4 rounded-xl border ${
							blocker.status === "open"
							  ? "bg-rose-50 border-rose-200"
							  : "bg-gray-50 border-gray-200"
						  }`}
						>
						  <div className="flex items-start justify-between gap-3">
							<div className="flex-1">
							  <p className="text-sm text-gray-900 mb-1">{blocker.description}</p>
							  <p className="text-xs text-gray-500">
								Created by {blocker.creator} · {blocker.status}
							  </p>
							</div>
							{blocker.status === "open" && canResolveBlocker(blocker) && (
							  <button
								onClick={() => handleResolveBlocker(blocker.id)}
								className="px-3 py-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
							  >
								Resolve
							  </button>
							)}
						  </div>
						</div>
					  ))}
					</div>
				  )}
				</div>
			  </div>

			  <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
				<div className="flex items-center gap-2">
				  {canEditTicket ? (
					<button
					  onClick={() => {
						setTicketForm({
						  ...ticketForm,
						  priority: selectedTicket.priority,
						});
						setIsEditTicketOpen(true);
					  }}
					  className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
					>
					  <Edit2 className="w-3 h-3" />
					  Edit Ticket
					</button>
				  ) : (
					<div className="relative group">
					  <button
						disabled
						className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
					  >
						<Edit2 className="w-3 h-3" />
						Edit Ticket
					  </button>
					  <div className="absolute left-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
						Only Product Owner can edit tickets
					  </div>
					</div>
				  )}

				  {canDeleteTicket ? (
					<button
					  onClick={() => setConfirmDelete({ type: "ticket", id: selectedTicket.id })}
					  className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
					>
					  <Trash2 className="w-3 h-3" />
					  Delete Ticket
					</button>
				  ) : (
					<div className="relative group">
					  <button
						disabled
						className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
					  >
						<Trash2 className="w-3 h-3" />
						Delete Ticket
					  </button>
					  <div className="absolute left-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
						Only Product Owner or Scrum Master can delete tickets
					  </div>
					</div>
				  )}
				</div>

				<button
				  onClick={() => setSelectedTicket(null)}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Close
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}

	  {/* Edit Ticket Priority Modal */}
	  {isEditTicketOpen && selectedTicket && (
		<>
		  <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsEditTicketOpen(false)} />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
			  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<h3 className="text-lg text-gray-900">Edit Ticket Priority</h3>
				<button
				  onClick={() => setIsEditTicketOpen(false)}
				  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
				>
				  <X className="w-5 h-5 text-gray-400" />
				</button>
			  </div>

			  <div className="px-6 py-5">
				<label className="block text-sm text-gray-700 mb-3">Priority</label>
				<div className="grid grid-cols-3 gap-3">
				  {(["high", "medium", "low"] as Priority[]).map((p) => (
					<button
					  key={p}
					  onClick={() => setTicketForm({ ...ticketForm, priority: p })}
					  className={`px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
						ticketForm.priority === p
						  ? p === "high"
							? "border-rose-300 bg-rose-50 text-rose-700"
							: p === "medium"
							? "border-amber-300 bg-amber-50 text-amber-700"
							: "border-gray-300 bg-gray-50 text-gray-700"
						  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
					  }`}
					>
					  {p.charAt(0).toUpperCase() + p.slice(1)}
					</button>
				  ))}
				</div>
			  </div>

			  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
				<button
				  onClick={() => setIsEditTicketOpen(false)}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Cancel
				</button>
				<button
				  onClick={handleUpdateTicketPriority}
				  className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors"
				>
				  Save
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}

	  {/* Create Task Modal */}
	  {isCreateTaskOpen && selectedTicket && (
		<>
		  <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsCreateTaskOpen(false)} />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
			  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<h3 className="text-lg text-gray-900">Create Task</h3>
				<button
				  onClick={() => setIsCreateTaskOpen(false)}
				  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
				>
				  <X className="w-5 h-5 text-gray-400" />
				</button>
			  </div>

			  <div className="px-6 py-5 space-y-4">
				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Title <span className="text-rose-500">*</span>
				  </label>
				  <input
					type="text"
					value={taskForm.title}
					onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
					placeholder="Enter task title"
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
				  />
				</div>

				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">Description</label>
				  <textarea
					value={taskForm.description}
					onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
					placeholder="Add details (optional)"
					rows={3}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
				  />
				</div>

				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Assignee <span className="text-rose-500">*</span>
				  </label>
				  <select
					value={taskForm.assignee}
					onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
				  >
					<option value="">Select developer</option>
					{teamMembers
					  .filter((m) => m.role === "Developer")
					  .map((member) => (
						<option key={member.id} value={member.avatar}>
						  {member.name}
						</option>
					  ))}
				  </select>
				</div>
			  </div>

			  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
				<button
				  onClick={() => setIsCreateTaskOpen(false)}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Cancel
				</button>
				<button
				  onClick={handleCreateTask}
				  disabled={!taskForm.title.trim() || !taskForm.assignee}
				  className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
				  Create task
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}

	  {/* Task Detail Modal */}
	  {selectedTask && selectedTicket && (
		<>
		  <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedTask(null)} />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
			  <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
				<div>
				  <h3 className="text-lg text-gray-900 mb-2">{selectedTask.title}</h3>
				  <span
					className={`text-xs px-2 py-1 rounded-lg ${
					  selectedTask.status === "completed"
						? "bg-emerald-100 text-emerald-700"
						: "bg-gray-100 text-gray-700"
					}`}
				  >
					{selectedTask.status === "completed" ? "Completed" : "In Progress"}
				  </span>
				</div>
				<button
				  onClick={() => setSelectedTask(null)}
				  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
				>
				  <X className="w-5 h-5 text-gray-400" />
				</button>
			  </div>

			  <div className="px-6 py-5 space-y-4">
				<div>
				  <h4 className="text-sm text-gray-700 mb-2">Description</h4>
				  <p className="text-sm text-gray-600">
					{selectedTask.description || "No description provided"}
				  </p>
				</div>

				<div>
				  <h4 className="text-sm text-gray-700 mb-2">Assignee</h4>
				  <div className="flex items-center gap-2">
					{teamMembers.find((m) => m.avatar === selectedTask.assignee) && (
					  <>
						<div
						  className={`w-8 h-8 rounded-full bg-gradient-to-br ${
							teamMembers.find((m) => m.avatar === selectedTask.assignee)?.color
						  } flex items-center justify-center`}
						>
						  <span className="text-sm text-gray-900">{selectedTask.assignee}</span>
						</div>
						<span className="text-sm text-gray-700">
						  {teamMembers.find((m) => m.avatar === selectedTask.assignee)?.name}
						</span>
					  </>
					)}
				  </div>
				</div>
			  </div>

			  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
				{canEditTask(selectedTask) ? (
				  <button
					onClick={() =>
					  setConfirmDelete({ type: "task", id: selectedTask.id })
					}
					className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
				  >
					<Trash2 className="w-3 h-3" />
					Delete Task
				  </button>
				) : (
				  <div className="relative group">
					<button
					  disabled
					  className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
					>
					  <Trash2 className="w-3 h-3" />
					  Delete Task
					</button>
					<div className="absolute left-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
					  Only assignee, PO, or SM can delete this task
					</div>
				  </div>
				)}

				<button
				  onClick={() => setSelectedTask(null)}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Close
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}

	  {/* Add Blocker Modal */}
	  {isAddBlockerOpen && selectedTicket && (
		<>
		  <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsAddBlockerOpen(false)} />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
			  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<h3 className="text-lg text-gray-900">Add Blocker</h3>
				<button
				  onClick={() => setIsAddBlockerOpen(false)}
				  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
				>
				  <X className="w-5 h-5 text-gray-400" />
				</button>
			  </div>

			  <div className="px-6 py-5 space-y-4">
				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Description <span className="text-rose-500">*</span>
				  </label>
				  <textarea
					value={blockerForm.description}
					onChange={(e) => setBlockerForm({ ...blockerForm, description: e.target.value })}
					placeholder="Describe what's blocking progress"
					rows={4}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
				  />
				</div>

				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Associated Ticket
				  </label>
				  <input
					type="text"
					value={selectedTicket.title}
					disabled
					className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-600"
				  />
				</div>

				{currentUser.role === "Scrum Master" && (
				  <div>
					<label className="block text-sm text-gray-700 mb-1.5">
					  Assignee (optional)
					</label>
					<select
					  value={blockerForm.assignee}
					  onChange={(e) => setBlockerForm({ ...blockerForm, assignee: e.target.value })}
					  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
					>
					  <option value="">Assign to team member</option>
					  {teamMembers.map((member) => (
						<option key={member.id} value={member.avatar}>
						  {member.name}
						</option>
					  ))}
					</select>
				  </div>
				)}
			  </div>

			  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
				<button
				  onClick={() => setIsAddBlockerOpen(false)}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Cancel
				</button>
				<button
				  onClick={handleAddBlocker}
				  disabled={!blockerForm.description.trim()}
				  className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
				  Add blocker
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}

	  {/* Confirmation Dialog */}
	  {confirmDelete && (
		<>
		  <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setConfirmDelete(null)} />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
			  <div className="px-6 py-5">
				<div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
				  <AlertCircle className="w-6 h-6 text-rose-600" />
				</div>
				<h3 className="text-lg text-gray-900 text-center mb-2">
				  Delete {confirmDelete.type === "ticket" ? "Ticket" : "Task"}?
				</h3>
				<p className="text-sm text-gray-500 text-center">
				  This action cannot be undone.
				  {confirmDelete.type === "ticket" &&
					" All tasks and blockers associated with this ticket will also be deleted."}
				</p>
			  </div>

			  <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
				<button
				  onClick={() => setConfirmDelete(null)}
				  className="flex-1 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
				>
				  Cancel
				</button>
				<button
				  onClick={confirmDelete.type === "ticket" ? handleDeleteTicket : handleDeleteTask}
				  className="flex-1 px-4 py-2 text-sm text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
				>
				  Delete
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}
	</div>
  );
}
