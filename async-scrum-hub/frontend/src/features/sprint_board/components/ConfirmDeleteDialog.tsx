import { useSprintBoard } from "../hooks/useSprintBoard";
import { AlertCircle } from "lucide-react";
import { Button } from "../../../components/custom/"


interface Props {
	confirmDelete: { type: "ticket" | "task"; id: string } | null;
	onCancel: () => void;
	onDeleteTicket: () => void;
	onDeleteTask: () => void;
}

export function ConfirmDeleteDialgue({confirmDelete, onCancel, onDeleteTicket, onDeleteTask}: Props) {
	// const {
		// confirmDelete,
		// setConfirmDelete,
		// handleDeleteTicket,
		// handleDeleteTask,

	// } = useSprintBoard();

	return (
		{confirmDelete && (
			<>
				<div
					className="fixed inset-0 bg-black/40 z-50"
					onClick={() => setConfirmDelete(null)}
				/>
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
								onClick={
									confirmDelete.type === "ticket"
										? handleDeleteTicket
										: handleDeleteTask
								}
								className="flex-1 px-4 py-2 text-sm text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			</>
		)}
	);
}
