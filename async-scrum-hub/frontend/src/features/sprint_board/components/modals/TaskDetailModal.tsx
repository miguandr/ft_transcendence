import { Button, Modal, Avatar } from "../../../../components/custom"
import { Trash2 } from "lucide-react"
import type { Task, UserRef } from "../../types/sprint.types"

interface Props {
	onClose: () => void;
	onDelete: () => void;
	task: Task;
	teamMembers: UserRef[];
	canDelete: boolean;
}

export function TaskDetailModal({
	onClose,
	onDelete,
	task,
	teamMembers,
	canDelete,

}: Props) {
	const assignee = teamMembers.find(m => m.id === task.assignee_id)

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title={task.title}
			size="md"
		>
			<span
				className={`text-xs px-2 py-1 rounded-lg ${
					task.status === "completed"
						? "bg-emerald-100 text-emerald-700"
						: "bg-gray-100 text-gray-700"
				}`}
			>
				{task.status === "completed"
					? "Completed"
					: "In Progress"}
			</span>

			<div>
				<h4 className="text-sm text-gray-700 mb-2">Description</h4>
				<p className="text-sm text-gray-600">
					{task.description || "No description provided"}
				</p>
			</div>

			<div>
				<h4 className="text-sm text-gray-700 mb-2">Assignee</h4>
					<div className="flex items-center gap-2">
						{assignee && (
							<>
								<Avatar
									avatarUrl={assignee.avatar_url}
									name={assignee.name}
									userId={assignee.id}
									size="sm"
									className="text-sm"
								/>
								<span className="text-sm text-gray-700">{assignee.name}</span>
							</>
						)}
				</div>
			</div>
			
			<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
				{canDelete ? (
					<Button
						variant="secondary"
						size="sm"
						className="text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100"
						onClick={onDelete}
						icon={<Trash2 className="w-3 h-3" />}
					>
						Delete Task
					</Button>
				) : (
					<div className="relative group">
						<Button
							variant="secondary"
							size="sm"
							className="text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
							disabled
							icon={<Trash2 className="w-3 h-3" />}
						>
							Delete Task
						</Button>
						<div className="absolute left-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
							Only assignee, PO, or SM can delete this task
						</div>
					</div>
				)}
				<Button
					variant="secondary"
					size="sm"
					onClick={onClose}
				>
					Close
				</Button>
			</div>
		</Modal>
	)
}
