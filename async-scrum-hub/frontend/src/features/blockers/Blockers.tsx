import { AlertCircle, Clock, CheckCircle2, Plus, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Label, Modal, PageHeader, Avatar } from "../../components/custom";
import {
	createBlocker,
	listBlockers,
	updateBlocker,
	resolveBlocker,
	listTickets,
	getOrganizationMembers,
	getCurrentUser,
} from "../../services/api";
import type { TicketListItem, OrganizationMember, User } from "../../services/api";

interface Blocker {
	id: string;
	created_by: {
		id: string;
		name: string;
		avatar_url: string | null;
	};
	description: string;
	status: "open" | "resolved";
	assignee?: {
		id: string;
		name: string;
	} | null;
	ticket: {
		id: string;
		title: string;
	};
	created_at: string;
	resolved_at?: string | null;
}

export function Blockers() {
	// Modal states
	const [isCreateBlockerOpen, setIsCreateBlockerOpen] = useState(false);
	const [isEditBlockerOpen, setIsEditBlockerOpen] = useState(false);
	const [selectedBlocker, setSelectedBlocker] = useState<Blocker | null>(null);
	const [confirmResolved, setConfirmResolved] = useState<string | null>(null);
	// Form states
	const [blockerForm, setBlockerForm] = useState({
		description: "",
		ticket_id: "",
		assignee_id: "",
	});
	// Auth states
	const [orgId, setOrgId] = useState<string | null>(null);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	// Data states
	const [blockers, setBlockers] = useState<Blocker[]>([]);
	const [ticketList, setTicketList] = useState<TicketListItem[]>([]);
	const [teamMembers, setTeamMembers] = useState<OrganizationMember[]>([]);
	//Routing states
	const location = useLocation();
	const highlightBlockerId = (location.state as { blockerId?: string })?.blockerId;
	//Loading states
	const [isLoading, setIsLoading] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isResolving, setIsResolving] = useState(false);

	// Fetch blockers and user at the same time.
	const fetchBlockers = async () => {
		setIsLoading(true);
		try {
			// Step 1: Get user's org_id
			const user = await getCurrentUser();
			setCurrentUser(user);
			setOrgId(user.organization_id); // we dont use currentUser state cuz as useState is async and doesnt update inmidiatly (race condition)

			// Step 2: Fetch blockers and team members
			if (user.organization_id) {
				const blockersData = await listBlockers(user.organization_id);
				const ticketsData = await listTickets(user.organization_id);
				const membersData = await getOrganizationMembers(user.organization_id);
				setBlockers(blockersData);
				setTicketList(ticketsData);
				setTeamMembers(membersData);
			}
		} catch (error) {
			if (!currentUser) {
				console.error("API call failed:", error);
			} else {
				console.error("Failed to fetch blockers:", error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBlockers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Empty array = run once on mount. setState functions are stable and don't need to be dependencies

	const handleCreateBlocker = async () => {
		setIsCreating(true);
		try {
			// Call API to create blocker
			await createBlocker(orgId!, {
				description: blockerForm.description,
				ticket_id: blockerForm.ticket_id || null,
				assignee_id: blockerForm.assignee_id || null,
			});

			// Refresh the list and close modal
			await fetchBlockers();
			setIsCreateBlockerOpen(false);
			setBlockerForm({ description: "", ticket_id: "", assignee_id: "" }); // Reset form values
		} catch (error) {
			console.error("Failed to create blocker:", error);
		} finally {
			setIsCreating(false);
		}
	};

	// Permission helpers

	const canEditBlocker = (blocker: Blocker) =>
		blocker.created_by.id === currentUser?.id ||
		blocker.assignee?.id === currentUser?.id ||
		currentUser?.scrum_role === "scrum_master" ||
		currentUser?.scrum_role === "product_owner";

	const canResolveBlocker = (blocker: Blocker) =>
		blocker.created_by.id === currentUser?.id ||
		blocker.assignee?.id === currentUser?.id ||
		currentUser?.scrum_role === "scrum_master" ||
		currentUser?.scrum_role === "product_owner";

	// Handle functions
	const handleEditBlocker = async () => {
		setIsSaving(true);
		try {
			// Call API to edit blocker
			await updateBlocker(selectedBlocker!.id, {
				description: blockerForm.description,
				ticket_id: blockerForm.ticket_id,
				assignee_id: blockerForm.assignee_id || null,
			});

			// Refresh the list and close modal
			await fetchBlockers();
			setIsEditBlockerOpen(false);
			setSelectedBlocker(null);
			setBlockerForm({ description: "", ticket_id: "", assignee_id: "" }); // Reset form values
		} catch (error) {
			console.error("Failed to edit blocker:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleResolveBlocker = async () => {
		if (!confirmResolved) return;
		setIsResolving(true);
		try {
			// Call API to resolve blocker
			await resolveBlocker(confirmResolved);
			// Refresh the list and close modal
			await fetchBlockers();
			setConfirmResolved(null);
			setSelectedBlocker(null);
		} catch (error) {
			console.error("Failed to resolve blocker:", error);
		} finally {
			setIsResolving(false);
		}
	};

	const openCreateModal = () => {
		setBlockerForm({ description: "", ticket_id: "", assignee_id: "" });
		setIsCreateBlockerOpen(true);
	};

	const openEditModal = (blocker: Blocker) => {
		setSelectedBlocker(blocker);
		setBlockerForm({
			description: blocker.description,
			ticket_id: blocker.ticket.id.toString(),
			assignee_id: blocker.assignee?.id || "",
		});
		setIsEditBlockerOpen(true);
	};

	// Get the open and resolved blockers, and sort them from newest to oldest
	const openBlockers = blockers.filter((b) => b.status === "open").sort((a, b) => b.created_at.localeCompare(a.created_at));
	const resolvedBlockers = blockers.filter((b) => b.status === "resolved").sort((a, b) => b.created_at.localeCompare(a.created_at));

	return (
		<div className="p-8">
			<PageHeader
				title="Blockers"
				subtitle="Issues that need attention"
				action={
					<Button
						variant="outlined"
						icon={<Plus className="w-4 h-4" />}
						onClick={openCreateModal}
					>
						Create Blocker
					</Button>
				}
			/>

			<div className="max-w-3xl space-y-6">
				{isLoading && (
					<div className="flex items-center justify-center py-16 text-gray-400 text-sm">
						Loading blockers...
					</div>
				)}

				{/* Open Blockers */}
				{!isLoading && (
					<div>
						<h3 className="text-sm text-gray-700 mb-3">Active ({openBlockers.length})</h3>
						{openBlockers.length === 0 ? (
							<div className="bg-emerald-50/50 rounded-2xl p-8 border border-emerald-100">
								<div className="flex flex-col items-center text-center">
									<div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
										<CheckCircle2 className="w-8 h-8 text-emerald-600" />
									</div>
									<h3 className="text-base text-gray-900 mb-2">No active blockers</h3>
									<p className="text-sm text-gray-600">
										Your team is currently unblocked and moving smoothly.
									</p>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								{openBlockers.map((blocker) => {
									const isHighlighted = blocker.id === highlightBlockerId;
									return (
										<div
											key={blocker.id}
											id={`blocker-${blocker.id}`}
											className={`bg-rose-50/30 rounded-2xl p-6 border-l-4 border-l-rose-400 border border-rose-100 transition-all ${
												isHighlighted
													? "ring-2 ring-rose-400 ring-offset-2"
													: ""
											}`}
										>
											<div className="flex items-start gap-4">
												<div className="p-3 bg-rose-100 rounded-xl mt-1 border border-rose-200">
													<AlertCircle className="w-6 h-6 text-rose-600" />
												</div>

												<div className="flex-1">
													<div className="flex items-start justify-between gap-4 mb-3">
														<p className="text-sm text-gray-900">
															{blocker.description}
														</p>
														<span className="text-xs px-2 py-1 rounded-lg bg-rose-100 text-rose-700">
															Open
														</span>
													</div>

																										<div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
														<div className="flex items-center gap-2">
															<Avatar
																avatarUrl={blocker.created_by.avatar_url}
																name={blocker.created_by.name}
																userId={blocker.created_by.id}
																size="sm"
															/>
															<span>
																Created by {blocker.created_by.name}
															</span>
														</div>

														<div className="flex items-center gap-2">
															<Clock className="w-3 h-3" />
															<span>{new Date(blocker.created_at).toLocaleDateString("en-GB")}</span>
														</div>
													</div>

													<div className="flex items-center gap-3 text-xs">
														<span className="text-gray-500">
															Ticket:{" "}
															<span className="text-gray-700">
																{blocker.ticket.title}
															</span>
														</span>
														{blocker.assignee && ( // check if object "assignee" exists. Optional chaining also ok "blocker.assignee?.id"
															<span className="text-gray-500">
																Related to:{" "}
																<span className="text-gray-700">
																	{blocker.assignee.name}
																</span>
															</span>
														)}
													</div>
												</div>
											</div>

											{(canEditBlocker(blocker) || canResolveBlocker(blocker)) && (
											<div className="mt-4 pt-4 border-t border-rose-100 flex items-center gap-3">
												{canResolveBlocker(blocker) && (
													<Button
														variant="text"
														onClick={() => setConfirmResolved(blocker.id)}
														className="text-emerald-600 hover:text-emerald-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
													>
														Resolve Blocker
													</Button>
												)}
												{canEditBlocker(blocker) && (
													<Button
														variant="text"
														onClick={() => openEditModal(blocker)}
														icon={<Edit2 className="w-3 h-3" />}
													>
														Edit
													</Button>
												)}
											</div>
											)}

									{/*		<div className="mt-4 pt-4 border-t border-rose-100 flex items-center gap-3">
												{canResolveBlocker(blocker) && (
													<Button
														variant="text"
														onClick={() => setConfirmResolved(blocker.id)}
														className="text-emerald-600 hover:text-emerald-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
													>
														Resolve Blocker
													</Button>
												)}
												{canEditBlocker(blocker) && (
													<Button
														variant="text"
														onClick={() => openEditModal(blocker)}
														icon={<Edit2 className="w-3 h-3" />}
													>
														Edit
													</Button>
												)}
												{!canEditBlocker(blocker) &&
													!canResolveBlocker(blocker) && (
														<span className="text-xs text-gray-400">
															Read-only
														</span>
													)}
											</div>  */}
										</div>
									);
								})}
							</div>
						)}
					</div>
				)}

				{/* Resolved Blockers */}
				{!isLoading && resolvedBlockers.length > 0 && (
					<div>
						<h3 className="text-sm text-gray-700 mb-3">
							Resolved ({resolvedBlockers.length})
						</h3>
						<div className="space-y-3">
							{resolvedBlockers.map((blocker) => {
								return (
									<div
										key={blocker.id}
										className="bg-gray-50 rounded-2xl p-6 border border-gray-200 opacity-75"
									>
										<div className="flex items-start gap-4">
											<div className="p-3 bg-gray-200 rounded-xl mt-1">
												<CheckCircle2 className="w-6 h-6 text-gray-500" />
											</div>

											<div className="flex-1">
												<div className="flex items-start justify-between gap-4 mb-3">
													<p className="text-sm text-gray-700 line-through">
														{blocker.description}
													</p>
													<span className="text-xs px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">
														Resolved
													</span>
												</div>

												<div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
													<div className="flex items-center gap-2">
														<Avatar
															avatarUrl={
																blocker.created_by.avatar_url
															}
															name={blocker.created_by.name}
															userId={blocker.created_by.id}
															size="sm"
														/>
														<span>
															Created by {blocker.created_by.name}
														</span>
													</div>

													<div className="flex items-center gap-2">
														<CheckCircle2 className="w-3 h-3" />
														<span>
															Resolved{" "}
															{blocker.resolved_at
																? new Date(blocker.resolved_at).toLocaleDateString("en-GB")
																: ""}
														</span>
													</div>
												</div>

												<div className="flex items-center gap-3 text-xs text-gray-500">
													<span>
														Ticket:{" "}
														<span className="text-gray-600">
															{blocker.ticket.title}
														</span>
													</span>
													{blocker.assignee && (
														<span>
															Related to:{" "}
															<span className="text-gray-600">
																{blocker.assignee.name}
															</span>
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>

			{/* Resolve Blocker Confirmation Modal */}
			{confirmResolved && (
				<>
					<div
						className="fixed inset-0 bg-black/40 z-50"
						onClick={() => setConfirmResolved(null)}
					/>
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
							<div className="px-6 py-5">
								<div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
									<CheckCircle2 className="w-6 h-6 text-emerald-600" />
								</div>
								<h3 className="text-lg text-gray-900 text-center mb-2">
									Mark blocker as resolved?
								</h3>
								<p className="text-sm text-gray-500 text-center">
									This will mark the blocker as resolved for your team.
								</p>
							</div>
							<div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
								<button
									onClick={() => setConfirmResolved(null)}
									className="flex-1 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleResolveBlocker}
									disabled={isResolving}
									className="flex-1 px-4 py-2 text-sm text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isResolving ? "Resolving..." : "Confirm"}
								</button>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Create Blocker Modal */}
			<Modal
				isOpen={isCreateBlockerOpen}
				onClose={() => setIsCreateBlockerOpen(false)}
				title="Create Blocker"
			>
				{/* Form Fields */}
				<div className="space-y-4">
					<div>
						<Label htmlFor="description">
							Description <span className="text-rose-500">*</span>
						</Label>
						<textarea
							id="description"
							value={blockerForm.description}
							onChange={(e) =>
								setBlockerForm({
									...blockerForm,
									description: e.target.value,
								})
							}
							placeholder="Describe what's blocking progress"
							rows={4}
							className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
						/>
					</div>

					<div>
						<Label htmlFor="ticket">
							Associated Ticket <span className="text-rose-500">*</span>
						</Label>
						<select
							id="ticket"
							value={blockerForm.ticket_id}
							onChange={(e) =>
								setBlockerForm({
									...blockerForm, // we use spread to keep the information as the user fills in the form
									ticket_id: e.target.value,
								})
							}
							className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
						>
							<option value="">Select a ticket</option>
							{ticketList.map((ticket) => (
								<option key={ticket.id} value={ticket.id}>
									{ticket.title}
								</option>
							))}
						</select>
					</div>

					<div>
						<Label htmlFor="assignee">Related to (optional)</Label>
						<select
							id="assignee"
							value={blockerForm.assignee_id}
							onChange={(e) =>
								setBlockerForm({
									...blockerForm,
									assignee_id: e.target.value,
								})
							}
							className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
						>
							<option value="">Select related team member</option>
							{teamMembers.map((member: OrganizationMember) => (
								<option key={member.id} value={member.id}>
									{member.name}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
					<Button variant="secondary" onClick={() => setIsCreateBlockerOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleCreateBlocker}
						disabled={isCreating || !blockerForm.description.trim() || !blockerForm.ticket_id}
					>
						{isCreating ? "Creating..." : "Create blocker"}
					</Button>
				</div>
			</Modal>

			{/* Edit Blocker Modal */}
			<Modal
				isOpen={isEditBlockerOpen && selectedBlocker !== null}
				onClose={() => setIsEditBlockerOpen(false)}
				title="Edit Blocker"
			>
				{/* Form Fields */}
				<div className="space-y-4">
					<div>
						<Label htmlFor="edit-description">
							Description <span className="text-rose-500">*</span>
						</Label>
						<textarea
							id="edit-description"
							value={blockerForm.description}
							onChange={(e) =>
								setBlockerForm({
									...blockerForm,
									description: e.target.value,
								})
							}
							placeholder="Describe what's blocking progress"
							rows={4}
							className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
						/>
					</div>

					<div>
						<Label htmlFor="edit-ticket">
							Associated Ticket <span className="text-rose-500">*</span>
						</Label>
						<select
							id="edit-ticket"
							value={blockerForm.ticket_id}
							onChange={(e) =>
								setBlockerForm({
									...blockerForm,
									ticket_id: e.target.value,
								})
							}
							className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
						>
							<option value="">Select a ticket</option>
							{ticketList.map((ticket) => (
								<option key={ticket.id} value={ticket.id}>
									{ticket.title}
								</option>
							))}
						</select>
					</div>

					{(currentUser?.scrum_role === "scrum_master" ||
						selectedBlocker?.created_by.id === currentUser?.id) && (
						<div>
							<Label htmlFor="edit-assignee">Assignee (optional)</Label>
							<select
								id="edit-assignee"
								value={blockerForm.assignee_id}
								onChange={(e) =>
									setBlockerForm({
										...blockerForm,
										assignee_id: e.target.value,
									})
								}
								className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
							>
								<option value="">Assign to team member</option>
								{teamMembers.map((member) => (
									<option key={member.id} value={member.id}>
										{member.name}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
					<Button variant="secondary" onClick={() => setIsEditBlockerOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleEditBlocker}
						disabled={isSaving || !blockerForm.description.trim() || !blockerForm.ticket_id}
					>
						{isSaving ? "Saving..." : "Save changes"}
					</Button>
				</div>
			</Modal>
		</div>
	);
}
