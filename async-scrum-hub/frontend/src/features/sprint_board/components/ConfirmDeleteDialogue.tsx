import { AlertCircle } from "lucide-react";
import { Button, Modal } from "../../../components/custom"


interface Props {
	confirmDelete: { type: "ticket" | "task"; id: string } | null;
	onCancel: () => void;
	onDeleteTicket: () => void;
	onDeleteTask: () => void;
}

export function ConfirmDeleteDialogue({
	confirmDelete,
	onCancel,
	onDeleteTicket,
	onDeleteTask,
}: Props) {

	if (!confirmDelete) return null;

	return (
		<>
			<Modal
				isOpen={!!confirmDelete}
				onClose={onCancel}
				title={`Delete ${confirmDelete.type === "ticket" ? "Ticket" : "Task"}?`}
				size="md"
			>
				<div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
					<AlertCircle className="w-6 h-6 text-rose-600" />
				</div>
				<p className="text-sm text-gray-500 text-center">
					This action cannot be undone.
					{confirmDelete.type === "ticket" &&
						" All tasks and blockers associated with this ticket will also be deleted."}
				</p>
				<div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
						<Button
							variant="secondary"
							size="sm"
							className="flex-1 text-sm"
							onClick={onCancel}
						>
							Cancel
						</Button>
						<Button
							size="sm"
							className="flex-1 px-4 py-2 text-sm text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
							onClick={
								confirmDelete.type === "ticket"
									? onDeleteTicket
									: onDeleteTask
							}
						>
							Delete
						</Button>
					</div>
			</Modal>
		</>
	);
}
