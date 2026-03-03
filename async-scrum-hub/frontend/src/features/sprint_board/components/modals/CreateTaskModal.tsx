import { Button, Modal, Avatar, Label, Input, Select, } from "../../../../components/custom"
import { Trash2 } from "lucide-react"
import type { Task, OrgMember } from "../../types/sprint.types"
type TaskFormData = { title: string; description: string; assignee: string }

interface Props {
	onClose: () => void;
	onCancel: () => void;
	onSubmit: () => void;
	form: TaskFormData
	setForm: (from: TaskFormData) => void;
	teamMember: OrgMember[];
}

export function CreateTaskModal({
	onClose,
	onCancel,
	onSubmit,
	form,
	setForm,
	teamMember,
}: Props ) {

	return (
		<>
			<div
				className="fixed inset-0 bg-black/20 z-40"
				onClick={onClose}
			/>
			<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
						<h3 className="text-lg text-gray-900">Create Task</h3>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
						>
							<X className="w-5 h-5 text-gray-400" />
						</button>
					</div>				<div className="px-6 py-5 space-y-4">
						<div>
							<label className="block text-sm text-gray-700 mb-1.5">
								Title <span className="text-rose-500">*</span>
							</label>
							<input
								type="text"
								value={form.title}
								onChange={(e) =>
									setForm({ ...form, title: e.target.value })
								}
								placeholder="Enter task title"
								className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
							/>
						</div>					<div>
							<label className="block text-sm text-gray-700 mb-1.5">
								Description
							</label>
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
						</div>					<div>
							<label className="block text-sm text-gray-700 mb-1.5">
								Assignee <span className="text-rose-500">*</span>
							</label>
							<select
								value={form.assignee}
								onChange={(e) =>
									setForm({ ...form, assignee: e.target.value })
								}
								className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
							>
								<option value="">Select developer</option>
								{teamMember
									.filter((m) => m.scrum_role === "developer")
									.map((member) => (
										<option key={member.id} value={member.id}>
											{member.name}
										</option>
									))}
							</select>
						</div>
					</div>				<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
						<button
							onClick={onCancel}
							className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={onSubmit}
							disabled={!form.title.trim() || !form.assignee}
							className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Create task
						</button>
					</div>
				</div>
			</div>
	</>
)}




