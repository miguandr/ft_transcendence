import { Link } from "react-router-dom"
import { Plus, Edit2, CheckCircle, Trash2 } from "lucide-react"
import { Button, Modal } from "../../../../components/custom";
import { PRIORITY_COLORS } from "../../constants/sprint.constants"
import type { TaskStatus, Ticket, Task, Blocker } from "../../types/sprint.types";

interface Props {
	ticket: Ticket;
	tasks: Task [];
	blockers: Blocker[];

	onClose: () => void;
	onOpenCreateTask: () => void;
	onOpenCreateBlocker: () => void;
	onOpenEdit: () => void;
	onDeleteTicket: () => void;

	onSelectTask: (task: Task) => void;
	onTaskDragStart: (task: Task) => void;
	onTaskDrop: (status: TaskStatus) => void;
	canDragTask: (task: Task) => boolean;

	canEdit: boolean;
	canDelete: boolean;
}


export function TicketDetailModal({
	ticket,
	tasks,
	blockers,

	onClose,
	onOpenCreateTask,
	onOpenCreateBlocker,
	onOpenEdit,
	onDeleteTicket,

	onSelectTask,
	onTaskDragStart,
	onTaskDrop,
	canDragTask,

	canEdit,
	canDelete,
}: Props) {

	return (
		<>
			<Modal
				isOpen={true}
				onClose={onClose}
				title={ticket.title}
				subtitle={
					<div className="flex items-center gap-2">
						<span
							className={`text-xs px-2 py-1 rounded-lg ${
								PRIORITY_COLORS[ticket.priority]
							}`}
						>
							{ticket.priority}
						</span>
						<span className="text-xs text-gray-500">
							{ticket.status === "todo"
								? "To Do"
								: ticket.status === "in_progress"
									? "In Progress"
									: "Completed"}
						</span>
					</div>
				}
				size="xl"
				className="flex-1 overflow-y-auto space-y-6"
			>

				{/* Description */}
				<div>
					<h4 className="text-sm text-gray-700 mb-2">Description</h4>
					<p className="text-sm text-gray-600">
						{ticket.description || "No description provided"}
					</p>
				</div>

				{/* Tasks */}
				<div>
					<div className="flex items-center justify-between mb-3">
						<h4 className="text-sm text-gray-700">Tasks</h4>
						<Button
							variant="ghost"
							size="sm"
							onClick={onOpenCreateTask}
							className="flex items-center gap-1"
							icon={<Plus className="w-3 h-3" />}
							iconPosition="left"
						>
							Create Task
						</Button>
					</div>
					{tasks.length === 0 ? (
						<div className="text-center py-8 bg-gray-50 rounded-xl">
							<p className="text-sm text-gray-400">
								No tasks yet — create the first task
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 gap-4">
							{/* In Progress */}
							<div>
								<h5 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
									In Progress
								</h5>
								<div
									className="space-y-2 min-h-[100px] bg-gray-50 rounded-xl p-3"
									onDragOver={(e) => e.preventDefault()}
									onDrop={() => onTaskDrop("in_progress")}
								>
									{tasks
										.filter((t) => t.status === "in_progress")
										.map((task) => {
											return (
												<div
													key={task.id}
													draggable={canDragTask(task)}
													onDragStart={() => onTaskDragStart(task)}
													onClick={() => onSelectTask(task)}
													className={`bg-white p-3 rounded-lg border border-gray-200 text-sm hover:shadow-sm transition-shadow ${
														canDragTask(task)
															? "cursor-grab active:cursor-grabbing"
															: "cursor-pointer"
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
								<h5 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
									Completed
								</h5>
								<div
									className="space-y-2 min-h-[100px] bg-emerald-50 rounded-xl p-3"
									onDragOver={(e) => e.preventDefault()}
									onDrop={() => onTaskDrop("completed")}
								>
									{tasks
										.filter((t) => t.status === "completed")
										.map((task) => {
											return (
												<div
													key={task.id}
													draggable={canDragTask(task)}
													onDragStart={() => onTaskDragStart(task)}
													onClick={() => onSelectTask(task)}
													className={`bg-white p-3 rounded-lg border border-emerald-200 text-sm hover:shadow-sm transition-shadow flex items-center gap-2 ${
														canDragTask(task)
															? "cursor-grab active:cursor-grabbing"
															: "cursor-pointer"
													}`}
												>
													<CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
													<span className="flex-1">
														{task.title}
													</span>
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
							onClick={onOpenCreateBlocker}
							className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
						>
							<Plus className="w-3 h-3" />
							Add Blocker
						</button>
					</div>
					{blockers.length === 0 ? (
						<div className="text-center py-8 bg-gray-50 rounded-xl">
							<p className="text-sm text-gray-400">
								No blockers reported 🎉
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{blockers.map((blocker) => (
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
											<p className="text-sm text-gray-900 mb-1">
												{blocker.description}
											</p>
											<p className="text-xs text-gray-500">
												Created by {blocker.created_by.name} ·{" "}
												{blocker.status}
											</p>
										</div>
										{blocker.status === "open" && (
											<Link
												to={`/blockers/${blocker.id}`}
												className="px-3 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
											>
												View Details
											</Link>
										)}
									</div>
								</div>
								)
							)}
						</div>
					)}
				</div>

				<div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
					<div className="flex items-center gap-2">
						{canEdit ? (
							<Button
								variant="secondary"
								onClick={onOpenEdit}
								size="sm"
								className="flex items-center gap-2"
								icon={<Edit2 className="w-3 h-3" />}
								iconPosition="left"
							>
								Edit Ticket
							</Button>
						) : (
							<div className="relative group">
								<Button
									variant="secondary"
									size="sm"
									disabled
									className="flex items-center gap-2 px-3 py-1.5  text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
								>
									<Edit2 className="w-3 h-3" />
									Edit Ticket
								</Button>
								<div className="absolute left-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
									Only Product Owner can edit tickets
								</div>
							</div>
						)}
						{canDelete ? (
							<Button
								variant="ghost"
								size="sm"
								onClick={onDeleteTicket}
								className="flex items-center gap-2 px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100"
								icon={<Trash2 className="w-3 h-3" />}
								iconPosition="left"
							>
								Delete Ticket
							</Button>
						) : (
							<div className="relative group">
								<Button
									disabled
									variant="secondary"
									size="sm"
									className="flex items-center gap-2 px-3 py-1.5 text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
									icon={<Trash2 className="w-3 h-3" />}
									iconPosition="left"
								>
									Delete Ticket
								</Button>
								<div className="absolute left-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
									Only Product Owner or Scrum Master can delete
									tickets
								</div>
							</div>
						)}
					</div>
					<Button
						variant="secondary"
						size="sm"
						onClick={onClose}
					>
						Close
					</Button>
				</div>
			</Modal>
		</>
	)
}
