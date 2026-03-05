import { Plus, X, AlertCircle, GripVertical, Trash2, Edit2, CheckCircle } from "lucide-react";
import { PRIORITY_COLORS, BOARD_COLUMNS, PRIORITY_OPTIONS } from "./constants/sprint.constants";
import { useSprintBoard } from "./hooks/useSprintBoard";
import { ConfirmDeleteDialogue } from "./components/ConfirmDeleteDialogue";
import { CreateBlockerModal } from "./components/modals/CreateBlockerModal"
import { TaskDetailModal } from "./components/modals/TaskDetailModal";
import { CreateTaskModal } from "./components/modals/CreateTaskModal";
import { EditTicketModal } from "./components/modals/EditTicketModal"
import { TicketDetailModal } from "./components/modals/TicketDetailModal";

export function SprintBoard() {
	const {
		// States
		isCreateTicketOpen,
		ticketForm,
		isEditTicketOpen,
		isCreateTaskOpen,
		isCreateBlockerOpen,
		selectedTicket,
		currentUser,
		selectedTask,
		blockerForm,
		confirmDelete,
		taskForm,

		// Setters
		setIsCreateTicketOpen,
		setSelectedTicketId,
		setTicketForm,
		setIsCreateTaskOpen,
		setSelectedTask,
		setIsCreateBlockerOpen,
		setIsEditTicketOpen,
		setConfirmDelete,
		setTaskForm,
		setBlockerForm,

		// Getters
		getTicketsByStatus,
		getBlockersForTicket,

		// Handlers
		handleTicketDrop,
		handleTicketDragStart,
		handleCreateTicket,
		handleTaskDrop,
		handleEditTicket,
		handleCreateTask,
		handleCreateBlocker,
		handleDeleteTicket,
		handleDeleteTask,
		handleTaskDragStart,

		// Permissions
		canEditTask,
		canEditTicketPriority,
		canEditTicket,
		canDeleteTicket,
		canCreateTicket,
		canDragTicket,
		canDragTask,
	} = useSprintBoard();

	return (
		<div className="p-8">
			<div className="mb-6 flex items-start justify-between">
				<div>
					<h2 className="text-3xl text-gray-900 mb-1">Sprint Board</h2>
					<p className="text-sm text-gray-500">Visualize your team's workflow</p>
				</div>
				<div className="flex flex-col items-end gap-1">
					{canCreateTicket ? (
						<button
							onClick={() => setIsCreateTicketOpen(true)}
							className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-700 bg-white border border-cyan-200 rounded-xl hover:bg-cyan-50 transition-colors"
						>
							<Plus className="w-4 h-4" />
							Create Ticket
						</button>
					) : (
						<div className="relative group">
							<button
								disabled
								className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed"
							>
								<Plus className="w-4 h-4" />
								Create Ticket
							</button>
							<div className="absolute right-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
								Only Product Owner or Scrum Master can create tickets
							</div>
						</div>
					)}
					<span className="text-xs text-gray-400">
						Managed by Product Owner / Scrum Master
					</span>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-6">
				{BOARD_COLUMNS.map((column) => {
					const columnTickets = getTicketsByStatus(column.id);
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
								onDrop={() => handleTicketDrop(column.id)}
							>
								{columnTickets.map((ticket) => {
									const member = teamMembers.find(
										(m) => m.avatar === ticket.assignee
									);
									return (
										<div
											key={ticket.id}
											draggable={canDragTickets}
											onDragStart={() => handleTicketDragStart(ticket)}
											onClick={() => setSelectedTicketId(ticket.id)}
											className={`bg-white rounded-xl p-4 border border-gray-100 border-l-4 ${column.borderColor} hover:shadow-sm transition-shadow cursor-pointer ${
												canDragTickets
													? "cursor-grab active:cursor-grabbing"
													: ""
											}`}
										>
											<div className="flex items-start justify-between gap-2 mb-3">
												<span className="text-sm text-gray-900 flex-1">
													{ticket.title}
												</span>
												<span
													className={`text-xs px-2 py-1 rounded-lg ${
														PRIORITY_COLORS[ticket.priority]
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
															<span className="text-xs text-gray-900">
																{member.avatar}
															</span>
														</div>
														<span className="text-xs text-gray-400">
															{member.name}
														</span>
													</div>
												)}
												{ticket.tasks.length > 0 && (
													<span className="text-xs text-gray-400">
														{
															ticket.tasks.filter(
																(t) => t.status === "completed"
															).length
														}
														/{ticket.tasks.length} tasks
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

			{/* Create Ticket Modal */}
			{isCreateTicketOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/20 z-40"
						onClick={() => setIsCreateTicketOpen(false)}
					/>
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
							<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
								<div>
									<h3 className="text-lg text-gray-900">Create Ticket</h3>
									<p className="text-xs text-gray-500 mt-0.5">
										New tickets will appear in To Do
									</p>
								</div>
								<button
									onClick={() => setIsCreateTicketOpen(false)}
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
										onChange={(e) =>
											setTicketForm({ ...ticketForm, title: e.target.value })
										}
										placeholder="Enter ticket title"
										className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
									/>
								</div>

								<div>
									<label className="block text-sm text-gray-700 mb-1.5">
										Description
									</label>
									<textarea
										value={ticketForm.description}
										onChange={(e) =>
											setTicketForm({
												...ticketForm,
												description: e.target.value,
											})
										}
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
												onClick={() =>
													setTicketForm({ ...ticketForm, priority: p })
												}
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
									<label className="block text-sm text-gray-700 mb-1.5">
										Assignee
									</label>
									<select
										value={ticketForm.assignee}
										onChange={(e) =>
											setTicketForm({
												...ticketForm,
												assignee: e.target.value,
											})
										}
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
									onClick={() => setIsCreateTicketOpen(false)}
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
				{selectedTicket && !isEditTicketOpen && !isCreateTaskOpen && !isCreateBlockerOpen && (
				<TicketDetailModal
					ticket={selectedTicket}
					tasks={[]}
					blockers={getBlockersForTicket(selectedTicket.id)}

					onClose={() => setSelectedTicketId(null)}
					onOpenCreateTask={() => setIsCreateTaskOpen(true)}
					onOpenCreateBlocker={() => setIsCreateBlockerOpen(true)}
					onOpenEdit={() => {
						setTicketForm({
							...ticketForm,
							priority: selectedTicket.priority,
						});
						setIsEditTicketOpen(true);
					}}
					onDeleteTicket={() =>
						setConfirmDelete({
							type: "ticket",
							id: selectedTicket.id,
					})}

					onSelectTask={setSelectedTask}
					onTaskDragStart={(task) => handleTaskDragStart(task, selectedTicket.id)}
					onTaskDrop={handleTaskDrop}
					canDragTask={canEditTask}

					canEdit={canEditTicket}
					canDelete={canDeleteTicket}
				/>
			)}

			{/* Edit Ticket Priority Modal */}
			{isEditTicketOpen && selectedTicket && (
				<EditTicketModal
					onClose={() => setIsEditTicketOpen(false)}
					canEditPriority={canEditTicketPriority}
					canEditDescription={canEditTicket}
					form={ticketForm}
					setForm={setTicketForm}
					onSubmit={handleEditTicket}
				/>
			)}

			{/* Create Task Modal */}
			{isCreateTaskOpen && selectedTicket && (
				<CreateTaskModal
					onClose={() => setIsCreateTaskOpen(false)}
					form={taskForm}
					setForm={setTaskForm}
					teamMembers={[]}
					onSubmit={handleCreateTask}
				/>
			)}

			{/* Task Detail Modal */}
			{selectedTask && selectedTicket && (
				<TaskDetailModal
					onClose={() => setSelectedTask(null)}
					onDelete={() => setConfirmDelete({ type: "task", id: selectedTask.id })}
					task={selectedTask}
					teamMembers={[]}
					canDelete={canEditTask(selectedTask)}
				/>
			)}

			{/* Create Blocker Modal */}
			{isCreateBlockerOpen && selectedTicket && (
				<CreateBlockerModal
					onClose={() => setIsCreateBlockerOpen(false)}
					ticket={selectedTicket}
					form={blockerForm}
					teamMembers={[]}
					setForm={setBlockerForm}
					onSubmit={handleCreateBlocker}
				/>
			)}

			{/* Confirmation Dialog */}
			<ConfirmDeleteDialogue
				confirmDelete={confirmDelete}
				onCancel={() => setConfirmDelete(null)}
				onDeleteTicket={handleDeleteTicket}
				onDeleteTask={handleDeleteTask}
			/>
		</div>
	);
}
