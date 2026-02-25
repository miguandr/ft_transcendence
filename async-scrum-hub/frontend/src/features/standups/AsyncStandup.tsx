import { useNavigate } from "react-router-dom";
import { AlertCircle, Edit2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Modal, PageHeader, Avatar} from "../../components/custom"
import type { User, StandupListItem } from "../../services/api";
import {
	createStandup,
	listStandups,
	editStandup,
	deleteStandup,
	getCurrentUser
} from "../../services/api";


interface Standup {
	id: string;
	created_at: string;
	today: string;
	yesterday: string | null;
	blockers: {
		id: string;
		title: string;
		ticket: {
			id: string;
			title: string;
		}
	} [];
	created_by: {
		id: string;
		name: string;
		avatar_url: string | null;
	}
}

export function AsyncStandup() {
	//View/UI states
	const [isCreateStandupOpen, setIsCreateStandupOpen] = useState(false);
	const [isEditStandupOpen, setIsEditStandupOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
	const [hoveredStandup, setHoveredStandup] = useState<string | null>(null);
	//Form states
	const [standupForm, setStandupForm] = useState({
		today: "",
	});
	//Auth states
	const [orgId, setOrgId] = useState<string | null>(null);
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	//Data states
	const [standups, setStandups] = useState<Standup[]>([]);
	//const [standupsList, setStandupsList] = useState<StandupListItem[]>([]);
	const [editingStandup, setEditingStandup] = useState<Standup | null>(null);
	// Routing states
	const navigate = useNavigate();
	//Communication states
	const [isLoading, setIsLoading] = useState(false);
	const [isPosting, setIsPosting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchStandups = async () => {
		setIsLoading(true);
		try {
			//Step 1: Get user's org_id
			const user = await getCurrentUser();
			setCurrentUser(user);
			setOrgId(user.organization_id);

			//Step 2: Fetch standups
			if (user.organization_id) {
				const standupsData = await listStandups(user.organization_id);
				setStandups(standupsData);
			}
		} catch (error) {
			if (!currentUser) {
				console.error("API call failed:", error);
			} else {
				console.error("Failed to fetch standups:", error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchStandups();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleCreateStandup = async () => {
		if (!orgId) return;
		setIsPosting(true);
		try {
			// Call API to create Standup
			await createStandup(orgId!, {
				today: standupForm.today,
			});

			// Resfreh standup list and cose modal
			await fetchStandups();
			setIsCreateStandupOpen(false);
			setStandupForm({ today: "" }); // reset form
		} catch (error) {
			console.error("Failed top create standup", error);
		} finally {
			setIsPosting(false);
		}
	};

	const now = new Date();
	const today = now.toISOString().split('T')[0];
	const yesterdayDate = new Date();
	yesterdayDate.setDate(now.getDate() - 1);
	//const yesterday = yesterdayDate.toISOString().split('T')[0];

	// Check if logged-in user submitted standup today
	const hasCreatedStandupToday = standups.some(
		(currentStandup) => currentStandup.created_by.id === currentUser?.id
					&& currentStandup.created_at.startsWith(today)
	);

	// Gets the latest standup of the current user
	const latestPerUser = standups.reduce((acc, s) => {
		const existing = acc.find(x => x.created_by.id === s.created_by.id);
		if (!existing || s.created_at > existing.created_at) {
			return [...acc.filter(x => x.created_by.id !== s.created_by.id), s]; //We keep all other standups and replace only the one from the current user
		}
		return acc;

	}, [] as Standup[]).sort((a, b) => b.created_at.localeCompare(a.created_at));


	const canEditStandup = (standup: Standup) => {
		return standup.created_by.id === currentUser?.id && standup.created_at.startsWith(today);
	};

	const handleEditStandup = async () => {
		setIsSaving(true);
		try {
			if (editingStandup) {
				await editStandup(editingStandup.id, {
					today: standupForm.today,
				});
			}
			await fetchStandups();
			setIsEditStandupOpen(false);
			setEditingStandup(null);
			setStandupForm({ today: "" });
		} catch (error) {
			console.error("Failed to edit standup:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDeleteStandup = async () => {
		if (confirmDelete) {
			setIsDeleting(true);
			try {
				// Call API
				await deleteStandup(confirmDelete);

				// Refresh
				await fetchStandups();
				setConfirmDelete(null);
			} catch (error) {
				console.error("Failed to delete standup:", error);
			} finally {
				setIsDeleting(false);
			}
		}
	};

	const openEditModal = (standup: Standup) => {
		setEditingStandup(standup);
		setStandupForm({ today: standup.today });
		setIsEditStandupOpen(true);
	};


	return (
		<div className="p-8">
			<PageHeader
				title="Async Standup"
				subtitle="Team updates - Updated today"
			/>

			<div className="max-w-3xl space-y-5 mb-6">
				{/* Add Standup Button */}
				{hasCreatedStandupToday ? (
					<div className="relative group">
						<button
							disabled
							className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 cursor-not-allowed"
						>
							+ Add your standup update
						</button>
						<div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
							You've already created a standup today
						</div>
					</div>
				) : (
					<button
						onClick={() => setIsCreateStandupOpen(true)}
						className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 hover:border-cyan-200 hover:text-cyan-600 transition-colors"
					>
						+ Add your standup update
					</button>
				)}

					{isLoading && (
					<div className="flex items-center justify-center py-16 text-gray-400 text-sm">
						Loading standups...
					</div>
				)}

				{!isLoading && latestPerUser.map((s) => {

					if (!s.today) return null;
					const canEdit = canEditStandup(s);

					return (
						<div
							key={s.id}
							className="bg-white rounded-2xl p-6 border border-gray-100"
						>
							<div className="flex items-center gap-4 mb-6">
								<Avatar
									avatarUrl={s.created_by.avatar_url}
									name={s.created_by.name}
									userId={s.created_by.id}
									size="md"
								/>
								<div>
									<h3 className="text-base text-gray-900">{s.created_by.name}</h3>
									<p className="text-xs text-gray-400">
										{new Date(s.created_at).toLocaleDateString("en-GB")}
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{/* Yesterday Section */}
								{s.yesterday && (
									<div className="pb-4 border-b border-gray-100">
										<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
											Yesterday
										</h4>
										<p className="text-sm text-gray-600">
											{s.yesterday}
										</p>
									</div>
								)}

								{/* Today Section */}
								<div
									className="pb-4 border-b border-gray-100 relative"
									onMouseEnter={() => setHoveredStandup(s.id)}
									onMouseLeave={() => setHoveredStandup(null)}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1">
											<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
												Today
											</h4>
											<p className="text-sm text-gray-600">
												{s.today}
											</p>
										</div>

										{canEdit && hoveredStandup === s.id && (
											<div className="flex items-center gap-2">
												<button
													onClick={() => openEditModal(s)}
													className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
													title="Edit standup"
												>
													<Edit2 className="w-3.5 h-3.5 text-gray-500" />
												</button>
												<button
													onClick={() =>
														setConfirmDelete(s.id)
													}
													className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
													title="Delete standup"
												>
													<Trash2 className="w-3.5 h-3.5 text-rose-500" />
												</button>
											</div>
										)}
									</div>
								</div>

								{/* Blockers Section */}
								{s.blockers.length > 0 && (
									<div>
										<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
											Blockers
										</h4>
										<div className="space-y-2">
											<div className="flex items-center gap-2 mb-2">
												<AlertCircle className="w-4 h-4 text-rose-500" />
												<span className="text-sm text-rose-600 font-medium">
													{s.blockers.length} active blocker
													{s.blockers.length > 1 ? "s" : ""}
												</span>
											</div>
											{s.blockers.map((blocker) => (
												<div
													key={blocker.id}
													className="bg-rose-50 rounded-lg p-3 border border-rose-100"
												>
													<p className="text-sm text-gray-700 mb-1">
														{blocker.title}
													</p>
													<div className="flex items-center justify-between">
														<span className="text-xs text-gray-500">
															Ticket: {blocker.ticket.title}
														</span>
														<button
															onClick={() =>
																navigate("/blockers", {
																	state: {
																		blockerId: blocker.id,
																	},
																})
															}
															className="text-xs text-cyan-600 hover:text-cyan-700 transition-colors flex items-center gap-1"
														>
															View details →
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Create Standup Modal */}
			{isCreateStandupOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/20 z-40"
						onClick={() => setIsCreateStandupOpen(false)}
					/>
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
							<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
								<div>
									<h3 className="text-lg text-gray-900">Add Standup Update</h3>
									<p className="text-xs text-gray-500 mt-0.5">
										Share what you're working on today
									</p>
								</div>
								<button
									onClick={() => setIsCreateStandupOpen(false)}
									className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-400" />
								</button>
							</div>

							<div className="px-6 py-5">
								<div>
									<label className="block text-sm text-gray-700 mb-1.5">
										Today <span className="text-rose-500">*</span>
									</label>
									<textarea
										value={standupForm.today}
										onChange={(e) =>
											setStandupForm({
												...standupForm,
												today: e.target.value,
											})
										}
										placeholder="What are you working on today?"
										rows={4}
										className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
									/>
								</div>
							</div>

							<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
								<button
									onClick={() => setIsCreateStandupOpen(false)}
									className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleCreateStandup}
									disabled={isPosting || !standupForm.today.trim()}
									className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isPosting ? "Posting..." : "Post update"}
								</button>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Edit Standup Modal */}
			{isEditStandupOpen && editingStandup && (
				<>
					<div
						className="fixed inset-0 bg-black/20 z-40"
						onClick={() => setIsEditStandupOpen(false)}
					/>
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
							<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
								<div>
									<h3 className="text-lg text-gray-900">Edit Standup Update</h3>
									<p className="text-xs text-gray-500 mt-0.5">
										Update what you're working on today
									</p>
								</div>
								<button
									onClick={() => setIsEditStandupOpen(false)}
									className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-400" />
								</button>
							</div>

							<div className="px-6 py-5">
								<div>
									<label className="block text-sm text-gray-700 mb-1.5">
										Today <span className="text-rose-500">*</span>
									</label>
									<textarea
										value={standupForm.today}
										onChange={(e) =>
											setStandupForm({
												...standupForm,
												today: e.target.value,
											})
										}
										placeholder="What are you working on today?"
										rows={4}
										className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
									/>
								</div>
							</div>

							<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
								<button
									onClick={() => setIsEditStandupOpen(false)}
									className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleEditStandup}
									disabled={isSaving || !standupForm.today.trim()}
									className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSaving ? "Saving..." : "Save changes"}
								</button>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Delete Confirmation Modal */}
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
									Delete Standup?
								</h3>
								<p className="text-sm text-gray-500 text-center">
									This action cannot be undone. Your standup update will be
									permanently deleted.
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
									onClick={handleDeleteStandup}
									disabled={isDeleting}
									className="flex-1 px-4 py-2 text-sm text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isDeleting ? "Deleting..." : "Delete"}
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
