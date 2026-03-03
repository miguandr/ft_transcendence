import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatScrumRole } from "../../../utils/formatters";

import {
	Priority,
	TicketStatus,
	TaskStatus,
	UserRole,
	BlockerStatus
} from "./types/sprint.types";
import type {
	User,
	Ticket,
	ListTicketsBoard,
	Task,
	TaskSummary,
	Blocker
} from "./types/sprint.types"


export function useSprintBoard() {

	// View/UI states
	const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
	const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [isEditTicketOpen, setIsEditTicketOpen] = useState(false);
	const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
	const [isAddBlockerOpen, setIsAddBlockerOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState<{
		type: "ticket" | "task";
		id: string;
	} | null>(null);
	// Data states
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [blockers, setBlockers] = useState<Blocker[]>([]);
	// Auth states
	const [orgId, setOrgId] = useState<string | null>(null);
	const [errors, setErrors] = useState<{ ticket?: string; task?: string; blocker?: string }>({});
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
	const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
	const [draggedTask, setDraggedTask] = useState<{ task: Task; ticketId: string } | null>(null);
	// Communication states
	const [isSaving, setIsSaving] = useState(false);
	const [isInviting, setIsInviting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	// Routing state
	const navigate = useNavigate();
	// Derived state
	const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;
	// Derived data
	const formattedScrumRole = currentUser?.scrum_role
		? formatScrumRole(currentUser.scrum_role)
		: "";
	// Derived UI logic (permissions)
	const canAddTicket =
		currentUser?.scrum_role === "product_owner" || currentUser?.scrum_role === "scrum_master";
	const canDragTickets =
		currentUser?.scrum_role === "product_owner" || currentUser?.scrum_role === "scrum_master";
	const canEditTicket =
		currentUser?.scrum_role === "product_owner";
	const canDeleteTicket =
		currentUser?.scrum_role === "product_owner" || currentUser?.scrum_role === "scrum_master";
	const canEditTask = (task: Task) =>
		currentUser?.scrum_role === "product_owner" ||
		currentUser?.scrum_role === "scrum_master" ||
		task.assignee === currentUser.avatar;
	const canResolveBlocker = (blocker: Blocker) =>
		blocker.creator === currentUser.avatar || currentUser?.scrum_role === "scrum_master";


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
			setSelectedTask(null);
			setSelectedTicketId(null);
		}
	};

	const handleCreateTask = () => {
		if (selectedTicket) {
			const newTask: Task = {
				id: Date.now(),
				title: taskForm.title,
				description: taskForm.description,
				assignee: taskForm.assignee,
				status: "in_progress",
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
						? {
								...t,
								tasks: t.tasks.map((task: Task) =>
									task.id === updatedTask.id ? updatedTask : task
								),
							}
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
						? { ...t, tasks: t.tasks.filter((task: Task) => task.id !== confirmDelete.id) }
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

	const handleResolveBlocker = (blockerId: string) => {
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
	const handleTaskDragStart = (task: Task, ticketId: string) => {
		const canDrag =
			currentUser?.scrum_role === "product_owner" ||
			currentUser?.scrum_role === "scrum_master" ||
			task.assignee === currentUser.avatar;
		if (canDrag) {
			setDraggedTask({ task, ticketId });
		}
	};

	const handleTaskDrop = (newStatus: TaskStatus) => {
		if (!draggedTask) return;
		setTickets((prev) =>
			prev.map((t) =>
				t.id === draggedTask.ticketId
					? {
							...t,
							tasks: t.tasks.map((task: Task) =>
								task.id === draggedTask.task.id
									? { ...task, status: newStatus }
									: task
							),
						}
					: t
			)
		);
		setDraggedTask(null);
	};


	//Getters
	const getTicketsByStatus = (status: TicketStatus) => tickets.filter((t) => t.status === status);
	const getBlockersForTicket = (ticketId: string) =>
		blockers.filter((b) => b.ticketId === ticketId);

	return {
		// States
		isAddTicketOpen,
		ticketForm,
		isEditTicketOpen,
		isCreateTaskOpen,
		isAddBlockerOpen,
		selectedTicket,
		currentUser,
		selectedTask,
		blockerForm,
		confirmDelete,

		// Setters
		setIsAddTicketOpen,
		setSelectedTicketId,
		setTicketForm,
		setIsCreateTaskOpen,
		setSelectedTask,
		setIsAddBlockerOpen,
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
		handleResolveBlocker,
		handleUpdateTicketPriority,
		handleCreateTask,
		handleAddBlocker,
		handleDeleteTicket,
		handleDeleteTask,

		// Permissions
		canResolveBlocker,
		canEditTask,
		canEditTicket,
		canDeleteTicket,
		canAddTicket,
		canDragTickets,
	}
}
