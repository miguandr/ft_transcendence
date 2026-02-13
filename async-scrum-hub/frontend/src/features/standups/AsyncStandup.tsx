import { useNavigate } from "react-router-dom";
import { AlertCircle, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Standup {
	id: number;
	userId: string;
	userName: string;
	userAvatar: string;
	userColor: string;
	today: string;
	createdAt: string;
	date: string; // Format: YYYY-MM-DD
}

interface Blocker {
	id: number;
	description: string;
	userId: string;
	ticketId: number;
	ticketTitle: string;
}

export function AsyncStandup() {
	const navigate = useNavigate();

	// Mock current user
	const currentUser = {
		id: "sc",
		name: "Sarah Chen",
		avatar: "SC",
		color: "from-emerald-200 to-green-300",
	};

	const today = "2026-02-02"; // Monday, February 2, 2026
	const yesterday = "2026-02-01"; // Sunday, February 1, 2026

	// Mock blocker data
	const [blockers] = useState<Blocker[]>([
		{
			id: 1,
			description: "Waiting for API keys from client",
			userId: "AK",
			ticketId: 3,
			ticketTitle: "Implement OAuth flow",
		},
		{
			id: 3,
			description: "Third-party API rate limiting in dev environment",
			userId: "AK",
			ticketId: 3,
			ticketTitle: "Implement OAuth flow",
		},
		{
			id: 4,
			description: "Waiting for design approval on settings page",
			userId: "ML",
			ticketId: 1,
			ticketTitle: "Design settings page",
		},
	]);

	const getUserBlockers = (userAvatar: string) => {
		return blockers.filter((b) => b.userId === userAvatar);
	};

	const [standups, setStandups] = useState<Standup[]>([
		// Yesterday's standups
		{
			id: 101,
			userId: "AK",
			userName: "Alex Kim",
			userAvatar: "AK",
			userColor: "from-cyan-200 to-blue-300",
			today: "Completed user authentication flow, fixed session persistence bug",
			createdAt: "9:15 AM",
			date: yesterday,
		},
		{
			id: 102,
			userId: "ML",
			userName: "Maria Lopez",
			userAvatar: "ML",
			userColor: "from-pink-200 to-rose-300",
			today: "Finalized dashboard redesign, updated component library",
			createdAt: "8:30 AM",
			date: yesterday,
		},
		{
			id: 103,
			userId: "JL",
			userName: "Jordan Lee",
			userAvatar: "JL",
			userColor: "from-amber-200 to-yellow-300",
			today: "Fixed payment processing bug, deployed hotfix to production",
			createdAt: "10:00 AM",
			date: yesterday,
		},
		// Today's standups
		{
			id: 1,
			userId: "AK",
			userName: "Alex Kim",
			userAvatar: "AK",
			userColor: "from-cyan-200 to-blue-300",
			today: "Working on OAuth integration with Google and GitHub",
			createdAt: "9:30 AM",
			date: today,
		},
		{
			id: 2,
			userId: "ML",
			userName: "Maria Lopez",
			userAvatar: "ML",
			userColor: "from-pink-200 to-rose-300",
			today: "Creating responsive layouts for mobile view",
			createdAt: "8:45 AM",
			date: today,
		},
		{
			id: 3,
			userId: "JL",
			userName: "Jordan Lee",
			userAvatar: "JL",
			userColor: "from-amber-200 to-yellow-300",
			today: "Writing unit tests for payment module",
			createdAt: "10:15 AM",
			date: today,
		},
	]);

	// Modal states
	const [isCreateStandupOpen, setIsCreateStandupOpen] = useState(false);
	const [isEditStandupOpen, setIsEditStandupOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
	const [hoveredStandup, setHoveredStandup] = useState<number | null>(null);

	// Form state
	const [standupForm, setStandupForm] = useState({
		today: "",
	});

	const [editingStandup, setEditingStandup] = useState<Standup | null>(null);

	// Get unique users from today's standups
	const todaysStandups = standups.filter((s) => s.date === today);
	const uniqueUsers = Array.from(new Map(todaysStandups.map((s) => [s.userId, s])).values());

	// Check if current user has already created standup today
	const hasCreatedStandupToday = standups.some(
		(s) => s.userId === currentUser.id && s.date === today
	);

	// Get standup for a specific user and date
	const getStandupForUserAndDate = (userId: string, date: string) => {
		return standups.find((s) => s.userId === userId && s.date === date);
	};

	const handleCreateStandup = () => {
		const newStandup: Standup = {
			id: Date.now(),
			userId: currentUser.id,
			userName: currentUser.name,
			userAvatar: currentUser.avatar,
			userColor: currentUser.color,
			today: standupForm.today,
			createdAt: new Date().toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
			}),
			date: today,
		};

		setStandups([...standups, newStandup]);
		setIsCreateStandupOpen(false);
		setStandupForm({ today: "" });
	};

	const handleEditStandup = () => {
		if (editingStandup) {
			setStandups(
				standups.map((s) =>
					s.id === editingStandup.id ? { ...s, today: standupForm.today } : s
				)
			);
			setIsEditStandupOpen(false);
			setEditingStandup(null);
			setStandupForm({ today: "" });
		}
	};

	const handleDeleteStandup = () => {
		if (confirmDelete) {
			setStandups(standups.filter((s) => s.id !== confirmDelete));
			setConfirmDelete(null);
		}
	};

	const openEditModal = (standup: Standup) => {
		setEditingStandup(standup);
		setStandupForm({ today: standup.today });
		setIsEditStandupOpen(true);
	};

	const canEditStandup = (standup: Standup) => {
		return standup.userId === currentUser.id && standup.date === today;
	};

	return (
		<div className="p-8">
			<div className="mb-6">
				<h2 className="text-3xl text-gray-900 mb-1">Async Standup</h2>
				<p className="text-sm text-gray-500">Team updates • Updated today</p>
			</div>

			<div className="max-w-3xl space-y-5 mb-6">
				{uniqueUsers.map((user) => {
					const todayStandup = getStandupForUserAndDate(user.userId, today);
					const yesterdayStandup = getStandupForUserAndDate(user.userId, yesterday);
					const userBlockers = getUserBlockers(user.userAvatar);

					if (!todayStandup) return null;

					const isCreator = todayStandup.userId === currentUser.id;
					const canEdit = canEditStandup(todayStandup);

					return (
						<div
							key={user.userId}
							className="bg-white rounded-2xl p-6 border border-gray-100"
						>
							<div className="flex items-center gap-4 mb-6">
								<div
									className={`w-12 h-12 rounded-full bg-gradient-to-br ${user.userColor} flex items-center justify-center`}
								>
									<span className="text-gray-800">{user.userAvatar}</span>
								</div>
								<div>
									<h3 className="text-base text-gray-900">{user.userName}</h3>
									<p className="text-xs text-gray-400">
										{todayStandup.createdAt}
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{/* Yesterday Section */}
								{yesterdayStandup && (
									<div className="pb-4 border-b border-gray-100">
										<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
											Yesterday
										</h4>
										<p className="text-sm text-gray-600">
											{yesterdayStandup.today}
										</p>
									</div>
								)}

								{/* Today Section */}
								<div
									className="pb-4 border-b border-gray-100 relative"
									onMouseEnter={() => setHoveredStandup(todayStandup.id)}
									onMouseLeave={() => setHoveredStandup(null)}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1">
											<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
												Today
											</h4>
											<p className="text-sm text-gray-600">
												{todayStandup.today}
											</p>
										</div>

										{canEdit && hoveredStandup === todayStandup.id && (
											<div className="flex items-center gap-2">
												<button
													onClick={() => openEditModal(todayStandup)}
													className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
													title="Edit standup"
												>
													<Edit2 className="w-3.5 h-3.5 text-gray-500" />
												</button>
												<button
													onClick={() =>
														setConfirmDelete(todayStandup.id)
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
								{userBlockers.length > 0 && (
									<div>
										<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-2">
											Blockers
										</h4>
										<div className="space-y-2">
											<div className="flex items-center gap-2 mb-2">
												<AlertCircle className="w-4 h-4 text-rose-500" />
												<span className="text-sm text-rose-600 font-medium">
													{userBlockers.length} active blocker
													{userBlockers.length > 1 ? "s" : ""}
												</span>
											</div>
											{userBlockers.map((blocker) => (
												<div
													key={blocker.id}
													className="bg-rose-50 rounded-lg p-3 border border-rose-100"
												>
													<p className="text-sm text-gray-700 mb-1">
														{blocker.description}
													</p>
													<div className="flex items-center justify-between">
														<span className="text-xs text-gray-500">
															Ticket: {blocker.ticketTitle}
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
									disabled={!standupForm.today.trim()}
									className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Post update
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
									disabled={!standupForm.today.trim()}
									className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Save changes
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
									className="flex-1 px-4 py-2 text-sm text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
