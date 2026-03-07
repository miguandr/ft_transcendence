import { Button, Modal, Label, Input, Select } from "../../../../components/custom"
import type {Ticket, UserRef } from "../../types/sprint.types"
type BlockerFormData = { description: string; assignee: string }

interface Props {
	onClose: () => void;
	ticket: Ticket;
	form: BlockerFormData;
	teamMembers: UserRef[];
	setForm: (form: BlockerFormData) => void;
	onSubmit: () => void;
}

export function CreateBlockerModal({
	onClose,
	ticket,
	form,
	teamMembers,
	setForm,
	onSubmit

}: Props) {

	return (
	<Modal
		isOpen={true}
		onClose={onClose}
		title="Create Blocker"
		size="md"
	>
		<div className="space-y-4">
			<div>
				<Label>
					Description <span className="text-rose-500">*</span>
				</Label>
				<textarea
					value={form.description}
					onChange={(e) =>
						setForm({
							...form,
							description: e.target.value,
						})
					}
					placeholder="Describe what's blocking progress"
					rows={4}
					className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
				/>
			</div>

			<div>
				<Label>
					Associated Ticket <span className="text-rose-500">*</span>
				</Label>
				<Input
					type="text"
					value={ticket.title}
					disabled
					className="px-3 py-2 bg-gray-100 border text-gray-600"
				/>
			</div>
			<div>
				<Select
					label="Related to (optional"
					className="mb-1.5"
					value={form.assignee}
					onChange={(e) =>
						setForm({
							...form,
							assignee: e.target.value,
						})
					}
					options={[
						{ value: "", label: "Select related team member" },
						...teamMembers.map((member) => ({
							value: member.id,
							label: member.name,
						})),
					]}
				/>
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
				className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				onClick={onSubmit}
				disabled={!form.description.trim()}
			>
				Create blocker
			</Button>
		</div>
	</Modal>
	)
}
