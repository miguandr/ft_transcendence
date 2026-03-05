import { Button, Modal, Label, Input, Select } from "../../../../components/custom";
import type { OrgMember } from "../../types/sprint.types";
type TaskFormData = { title: string; description: string; assignee: string };

interface Props {
	onClose: () => void;
	form: TaskFormData;
	setForm: (from: TaskFormData) => void;
	teamMembers: OrgMember[];
	onSubmit: () => void;
}

export function CreateTaskModal({
	onClose,
	form,
	setForm,
	teamMembers,
	onSubmit,
}: Props) {

	return (
		<>
			<Modal
				isOpen={true}
				onClose={onClose}
				title="Create Task"
				size="md">
				<div
					className="space-y-4">
					<div>
						<Label>
							Title <span className="text-rose-500">*</span>
						</Label>
						<Input
							type="text"
							value={form.title}
							onChange={(e) => setForm({ ...form, title: e.target.value })}
							placeholder="Enter task title"
							className="px-3 py-2 bg-gray-50 border border-gray-200 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
						/>
					</div>
					<div>
						<Label>
							Description
						</Label>
						<textarea
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
					</div>
					<div>
						<Select
							label="Assignee"
							value={form.assignee}
							onChange={(e) =>
								setForm({
									...form,
									assignee: e.target.value,
								})
							}
							options={[
								{ value: "", label: "Select developer" },
								...teamMembers
									.filter((m) => m.scrum_role === "developer")
									.map((member) => ({
										value: member.id,
										label: member.name,
									})),
							]}
							className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors mb-1.5"
						/>
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
							className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={onSubmit}
							disabled={!form.title.trim() || !form.assignee}
						>
							Create task
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
