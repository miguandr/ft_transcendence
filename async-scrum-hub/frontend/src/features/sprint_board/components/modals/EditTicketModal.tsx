import { Button, Modal, Label } from "../../../../components/custom";
import type { Priority } from "../../types/sprint.types";
type TicketFormData = { title: string; description: string; priority: Priority; assignee: string };

interface Props {
	onClose: () => void;
	canEditPriority: boolean;
	canEditDescription: boolean;
	form: TicketFormData;
	setForm: (form: TicketFormData) => void;
	onSubmit: () => void;
}

export function EditTicketModal({
	onClose,
	canEditPriority,
	canEditDescription,
	form,
	setForm,
	onSubmit,
}: Props) {

	return (
		<>
			<Modal
				isOpen={true}
				onClose={onClose}
				title="Edit Ticket"
				size="md"
			>
				<div className="space-y-4">
					<div>
						<Label htmlFor="edit-description">
							Description <span className="text-rose-500">*</span>
						</Label>
						{canEditDescription ? (
							<textarea
								id="edit-description"
								value={form.description}
								onChange={(e) =>
									setForm({
										...form,
										description: e.target.value,
									})
								}
								placeholder="Add details (optional)"
								rows={3}
								className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
							/>
						) : (
							<textarea
								id="edit-description"
								value={form.description}
								disabled
								placeholder="Add details (optional)"
								rows={3}
								className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed resize-none"
							/>
						)}
					</div>

					<div>
						<Label>
							Priority
						</Label>
						{!canEditPriority && (
							<p className="text-xs text-gray-400 mt-0.5">
								Managed by Product Owner
							</p>
						)}
						<div className="grid grid-cols-3 gap-3">
								{(["high", "medium", "low"] as Priority[]).map((p) => (
									<Button
										key={p}
										variant="outlined"
										size="sm"
										isActive={form.priority === p}
										disabled={!canEditPriority}
										onClick={() =>
											setForm({ ...form, priority: p })
										}
										className={
											form.priority === p
												? p === "high"
													? "border-rose-300 bg-rose-50 text-rose-700"
													: p === "medium"
														? "border-amber-300 bg-amber-50 text-amber-700"
														: "border-gray-300 bg-gray-50 text-gray-700"
												: ""
										}
									>
										{p.charAt(0).toUpperCase() + p.slice(1)}
									</Button>
								))}
						</div>
					</div>

					<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
						<Button
							variant="secondary"
							size="sm"
							className="text-sm"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="sm"
							className="bg-cyan-500 hover:bg-cyan-600"
							onClick={onSubmit}
						>
							Save
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
