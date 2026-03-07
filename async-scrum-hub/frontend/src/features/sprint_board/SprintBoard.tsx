import { BOARD_COLUMNS } from "./constants/sprint.constants";
import { useSprintBoard } from "./hooks/useSprintBoard";
import { BoardHeader } from "./components/BoardHeader"
import { KanbanColumn } from "./components/KanbanColumn"
import { ConfirmDeleteDialogue } from "./components/ConfirmDeleteDialogue";
import { CreateBlockerModal } from "./components/modals/CreateBlockerModal"
import { TaskDetailModal } from "./components/modals/TaskDetailModal";
import { CreateTaskModal } from "./components/modals/CreateTaskModal";
import { EditTicketModal } from "./components/modals/EditTicketModal"
import { TicketDetailModal } from "./components/modals/TicketDetailModal";
import { CreateTicketModal } from "./components/modals/CreateTicketModal";


export function SprintBoard() {
	const {
		// States
		isCreateTicketOpen,
		ticketForm,
		isEditTicketOpen,
		isCreateTaskOpen,
		isCreateBlockerOpen,
		selectedTicket,
		//currentUser,
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
		//canDragTask,
	} = useSprintBoard();

	return (
		<div className="p-8">

			{/* Board Header */}
			<BoardHeader
				onCreateTicket={() => setIsCreateTicketOpen(true)}
				canCreateTicket={canCreateTicket}
			/>

			{/* Kanban Clumn */}
			<div className="grid grid-cols-3 gap-6">
				{BOARD_COLUMNS.map((columns) => (
						<KanbanColumn
							key={columns.id}
							column={columns}
							tickets={getTicketsByStatus(columns.id)}
							teamMembers={[]}
							onSelectTicket={setSelectedTicketId}
							onTicketDragStart={handleTicketDragStart}
							onTicketDrop={handleTicketDrop}
							canDragTicket={canDragTicket}
						/>
					))}
			</div>

			{/* Create Ticket Modal */}
			{isCreateTicketOpen && (
				<CreateTicketModal
					onClose={() => setIsCreateTicketOpen(false)}
					form={ticketForm}
					setForm={setTicketForm}
					teamMembers={[]}
					onSubmit={handleCreateTicket}
				/>
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
