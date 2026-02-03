import { AlertCircle, Clock, CheckCircle2, Plus, X, Edit2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

type UserRole = "Product Owner" | "Scrum Master" | "Developer";

interface Blocker {
  id: number;
  description: string;
  creator: string;
  creatorName: string;
  assignee?: string;
  assigneeName?: string;
  status: "open" | "resolved";
  ticketId: number;
  ticketTitle: string;
  createdAt: string;
  resolvedAt?: string;
}

export function Blockers() {
  const location = useLocation();
  const highlightBlockerId = (location.state as { blockerId?: number })?.blockerId;

  // Mock current user
  const currentUser = {
	id: "sc",
	name: "Sarah Chen",
	avatar: "SC",
	role: "Scrum Master" as UserRole, // Change to test different roles
  };

  const teamMembers = [
	{ id: "ak", name: "Alex Kim", avatar: "AK", color: "from-cyan-200 to-blue-300", role: "Developer" },
	{ id: "ml", name: "Maria Lopez", avatar: "ML", color: "from-pink-200 to-rose-300", role: "Developer" },
	{ id: "jl", name: "Jordan Lee", avatar: "JL", color: "from-amber-200 to-yellow-300", role: "Developer" },
	{ id: "sc", name: "Sarah Chen", avatar: "SC", color: "from-emerald-200 to-green-300", role: "Scrum Master" },
  ];

  // Mock tickets for dropdown
  const tickets = [
	{ id: 1, title: "Design settings page", status: "todo" },
	{ id: 2, title: "Write API documentation", status: "todo" },
	{ id: 3, title: "Implement OAuth flow", status: "doing" },
	{ id: 4, title: "Update dashboard charts", status: "doing" },
	{ id: 6, title: "Fix login bug", status: "done" },
  ];

  const [blockers, setBlockers] = useState<Blocker[]>([
	{
	  id: 1,
	  description: "Waiting for API keys from client",
	  creator: "AK",
	  creatorName: "Alex Kim",
	  assignee: "SC",
	  assigneeName: "Sarah Chen",
	  status: "open",
	  ticketId: 3,
	  ticketTitle: "Implement OAuth flow",
	  createdAt: "2 days ago",
	},
	{
	  id: 2,
	  description: "Design assets not yet approved",
	  creator: "ML",
	  creatorName: "Maria Lopez",
	  status: "resolved",
	  ticketId: 1,
	  ticketTitle: "Design settings page",
	  createdAt: "3 days ago",
	  resolvedAt: "1 day ago",
	},
	{
	  id: 3,
	  description: "Third-party API rate limiting in dev environment",
	  creator: "AK",
	  creatorName: "Alex Kim",
	  assignee: "SC",
	  assigneeName: "Sarah Chen",
	  status: "open",
	  ticketId: 3,
	  ticketTitle: "Implement OAuth flow",
	  createdAt: "1 day ago",
	},
  ]);

  // Modal states
  const [isCreateBlockerOpen, setIsCreateBlockerOpen] = useState(false);
  const [isEditBlockerOpen, setIsEditBlockerOpen] = useState(false);
  const [selectedBlocker, setSelectedBlocker] = useState<Blocker | null>(null);

  // Form state
  const [blockerForm, setBlockerForm] = useState({
	description: "",
	ticketId: "",
	assignee: "",
  });

  // Permission helpers
  const canCreateBlocker = true; // All users can create blockers
  const canEditBlocker = (blocker: Blocker) =>
	blocker.creator === currentUser.avatar ||
	currentUser.role === "Scrum Master" ||
	currentUser.role === "Product Owner";
  const canResolveBlocker = (blocker: Blocker) =>
	blocker.creator === currentUser.avatar ||
	currentUser.role === "Scrum Master" ||
	currentUser.role === "Product Owner";

  const handleCreateBlocker = () => {
	const ticket = tickets.find((t) => t.id === Number(blockerForm.ticketId));
	const assigneeMember = teamMembers.find((m) => m.avatar === blockerForm.assignee);

	const newBlocker: Blocker = {
	  id: Date.now(),
	  description: blockerForm.description,
	  creator: currentUser.avatar,
	  creatorName: currentUser.name,
	  assignee: blockerForm.assignee || undefined,
	  assigneeName: assigneeMember?.name,
	  status: "open",
	  ticketId: Number(blockerForm.ticketId),
	  ticketTitle: ticket?.title || "",
	  createdAt: "Just now",
	};

	setBlockers([newBlocker, ...blockers]);
	setIsCreateBlockerOpen(false);
	setBlockerForm({ description: "", ticketId: "", assignee: "" });
  };

  const handleEditBlocker = () => {
	if (selectedBlocker) {
	  const assigneeMember = teamMembers.find((m) => m.avatar === blockerForm.assignee);
	  const ticket = tickets.find((t) => t.id === Number(blockerForm.ticketId));

	  setBlockers(
		blockers.map((b) =>
		  b.id === selectedBlocker.id
			? {
				...b,
				description: blockerForm.description,
				ticketId: Number(blockerForm.ticketId),
				ticketTitle: ticket?.title || b.ticketTitle,
				assignee: blockerForm.assignee || undefined,
				assigneeName: assigneeMember?.name,
			  }
			: b
		)
	  );
	  setIsEditBlockerOpen(false);
	  setSelectedBlocker(null);
	}
  };

  const handleResolveBlocker = (blockerId: number) => {
	setBlockers(
	  blockers.map((b) =>
		b.id === blockerId
		  ? { ...b, status: "resolved" as const, resolvedAt: "Just now" }
		  : b
	  )
	);
  };

  const openCreateModal = () => {
	setBlockerForm({ description: "", ticketId: "", assignee: "" });
	setIsCreateBlockerOpen(true);
  };

  const openEditModal = (blocker: Blocker) => {
	setSelectedBlocker(blocker);
	setBlockerForm({
	  description: blocker.description,
	  ticketId: blocker.ticketId.toString(),
	  assignee: blocker.assignee || "",
	});
	setIsEditBlockerOpen(true);
  };

  const openBlockers = blockers.filter((b) => b.status === "open");
  const resolvedBlockers = blockers.filter((b) => b.status === "resolved");

  return (
	<div className="p-8">
	  <div className="mb-6 flex items-start justify-between">
		<div>
		  <h2 className="text-3xl text-gray-900 mb-1">Blockers</h2>
		  <p className="text-sm text-gray-500">Issues that need attention</p>
		</div>
		<button
		  onClick={openCreateModal}
		  className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-700 bg-white border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-colors"
		>
		  <Plus className="w-4 h-4" />
		  Create Blocker
		</button>
	  </div>

	  <div className="max-w-3xl space-y-6">
		{/* Open Blockers */}
		<div>
		  <h3 className="text-sm text-gray-700 mb-3">Active ({openBlockers.length})</h3>
		  {openBlockers.length === 0 ? (
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
			<div className="space-y-3">
			  {openBlockers.map((blocker) => {
				const creator = teamMembers.find((m) => m.avatar === blocker.creator);
				const assignee = teamMembers.find((m) => m.avatar === blocker.assignee);
				const isHighlighted = blocker.id === highlightBlockerId;

				return (
				  <div
					key={blocker.id}
					id={`blocker-${blocker.id}`}
					className={`bg-rose-50/30 rounded-2xl p-6 border-l-4 border-l-rose-400 border border-rose-100 transition-all ${
					  isHighlighted ? "ring-2 ring-rose-400 ring-offset-2" : ""
					}`}
				  >
					<div className="flex items-start gap-4">
					  <div className="p-3 bg-rose-100 rounded-xl mt-1 border border-rose-200">
						<AlertCircle className="w-6 h-6 text-rose-600" />
					  </div>

					  <div className="flex-1">
						<div className="flex items-start justify-between gap-4 mb-3">
						  <p className="text-sm text-gray-900">{blocker.description}</p>
						</div>

						<div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
						  <div className="flex items-center gap-2">
							{creator && (
							  <>
								<div
								  className={`w-6 h-6 rounded-full bg-gradient-to-br ${creator.color} flex items-center justify-center`}
								>
								  <span className="text-xs text-gray-900">{creator.avatar}</span>
								</div>
								<span>Created by {creator.name}</span>
							  </>
							)}
						  </div>
						  <div className="flex items-center gap-2">
							<Clock className="w-3 h-3" />
							<span>{blocker.createdAt}</span>
						  </div>
						</div>

						<div className="flex items-center gap-3 text-xs">
						  <span className="text-gray-500">
							Ticket:{" "}
							<span className="text-gray-700">{blocker.ticketTitle}</span>
						  </span>
						  {assignee && (
							<span className="text-gray-500">
							  Assigned to:{" "}
							  <span className="text-gray-700">{assignee.name}</span>
							</span>
						  )}
						</div>
					  </div>
					</div>

					<div className="mt-4 pt-4 border-t border-rose-100 flex items-center gap-3">
					  {canResolveBlocker(blocker) && (
						<button
						  onClick={() => handleResolveBlocker(blocker.id)}
						  className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
						>
						  Mark as resolved
						</button>
					  )}
					  {canEditBlocker(blocker) && (
						<button
						  onClick={() => openEditModal(blocker)}
						  className="text-sm text-gray-600 hover:text-gray-700 transition-colors flex items-center gap-1"
						>
						  <Edit2 className="w-3 h-3" />
						  Edit
						</button>
					  )}
					  {!canEditBlocker(blocker) && !canResolveBlocker(blocker) && (
						<span className="text-xs text-gray-400">Read-only</span>
					  )}
					</div>
				  </div>
				);
			  })}
			</div>
		  )}
		</div>

		{/* Resolved Blockers */}
		{resolvedBlockers.length > 0 && (
		  <div>
			<h3 className="text-sm text-gray-700 mb-3">Resolved ({resolvedBlockers.length})</h3>
			<div className="space-y-3">
			  {resolvedBlockers.map((blocker) => {
				const creator = teamMembers.find((m) => m.avatar === blocker.creator);
				const assignee = teamMembers.find((m) => m.avatar === blocker.assignee);

				return (
				  <div
					key={blocker.id}
					className="bg-gray-50 rounded-2xl p-6 border border-gray-200 opacity-75"
				  >
					<div className="flex items-start gap-4">
					  <div className="p-3 bg-gray-200 rounded-xl mt-1">
						<CheckCircle2 className="w-6 h-6 text-gray-500" />
					  </div>

					  <div className="flex-1">
						<div className="flex items-start justify-between gap-4 mb-3">
						  <p className="text-sm text-gray-700 line-through">{blocker.description}</p>
						  <span className="text-xs px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">
							Resolved
						  </span>
						</div>

						<div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
						  <div className="flex items-center gap-2">
							{creator && (
							  <>
								<div
								  className={`w-6 h-6 rounded-full bg-gradient-to-br ${creator.color} flex items-center justify-center`}
								>
								  <span className="text-xs text-gray-900">{creator.avatar}</span>
								</div>
								<span>Created by {creator.name}</span>
							  </>
							)}
						  </div>
						  <div className="flex items-center gap-2">
							<CheckCircle2 className="w-3 h-3" />
							<span>Resolved {blocker.resolvedAt}</span>
						  </div>
						</div>

						<div className="flex items-center gap-3 text-xs text-gray-500">
						  <span>
							Ticket: <span className="text-gray-600">{blocker.ticketTitle}</span>
						  </span>
						  {assignee && (
							<span>
							  Assigned to: <span className="text-gray-600">{assignee.name}</span>
							</span>
						  )}
						</div>
					  </div>
					</div>
				  </div>
				);
			  })}
			</div>
		  </div>
		)}
	  </div>

	  {/* Create Blocker Modal */}
	  {isCreateBlockerOpen && (
		<>
		  <div
			className="fixed inset-0 bg-black/20 z-40"
			onClick={() => setIsCreateBlockerOpen(false)}
		  />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
			  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<h3 className="text-lg text-gray-900">Create Blocker</h3>
				<button
				  onClick={() => setIsCreateBlockerOpen(false)}
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
					onChange={(e) =>
					  setBlockerForm({ ...blockerForm, description: e.target.value })
					}
					placeholder="Describe what's blocking progress"
					rows={4}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
				  />
				</div>

				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Associated Ticket <span className="text-rose-500">*</span>
				  </label>
				  <select
					value={blockerForm.ticketId}
					onChange={(e) =>
					  setBlockerForm({ ...blockerForm, ticketId: e.target.value })
					}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
				  >
					<option value="">Select a ticket</option>
					{tickets.map((ticket) => (
					  <option key={ticket.id} value={ticket.id}>
						{ticket.title}
					  </option>
					))}
				  </select>
				</div>

				{currentUser.role === "Scrum Master" && (
				  <div>
					<label className="block text-sm text-gray-700 mb-1.5">
					  Assignee (optional)
					</label>
					<select
					  value={blockerForm.assignee}
					  onChange={(e) =>
						setBlockerForm({ ...blockerForm, assignee: e.target.value })
					  }
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
				  onClick={() => setIsCreateBlockerOpen(false)}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Cancel
				</button>
				<button
				  onClick={handleCreateBlocker}
				  disabled={!blockerForm.description.trim() || !blockerForm.ticketId}
				  className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
				  Create blocker
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}

	  {/* Edit Blocker Modal */}
	  {isEditBlockerOpen && selectedBlocker && (
		<>
		  <div
			className="fixed inset-0 bg-black/20 z-40"
			onClick={() => setIsEditBlockerOpen(false)}
		  />
		  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
			  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
				<h3 className="text-lg text-gray-900">Edit Blocker</h3>
				<button
				  onClick={() => setIsEditBlockerOpen(false)}
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
					onChange={(e) =>
					  setBlockerForm({ ...blockerForm, description: e.target.value })
					}
					placeholder="Describe what's blocking progress"
					rows={4}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
				  />
				</div>

				<div>
				  <label className="block text-sm text-gray-700 mb-1.5">
					Associated Ticket <span className="text-rose-500">*</span>
				  </label>
				  <select
					value={blockerForm.ticketId}
					onChange={(e) =>
					  setBlockerForm({ ...blockerForm, ticketId: e.target.value })
					}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
				  >
					<option value="">Select a ticket</option>
					{tickets.map((ticket) => (
					  <option key={ticket.id} value={ticket.id}>
						{ticket.title}
					  </option>
					))}
				  </select>
				</div>

				{currentUser.role === "Scrum Master" && (
				  <div>
					<label className="block text-sm text-gray-700 mb-1.5">
					  Assignee (optional)
					</label>
					<select
					  value={blockerForm.assignee}
					  onChange={(e) =>
						setBlockerForm({ ...blockerForm, assignee: e.target.value })
					  }
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
				  onClick={() => setIsEditBlockerOpen(false)}
				  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
				>
				  Cancel
				</button>
				<button
				  onClick={handleEditBlocker}
				  disabled={!blockerForm.description.trim() || !blockerForm.ticketId}
				  className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
				  Save changes
				</button>
			  </div>
			</div>
		  </div>
		</>
	  )}
	</div>
  );
}

