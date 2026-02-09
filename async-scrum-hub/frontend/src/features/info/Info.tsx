import { useState, useEffect } from "react";
import { AlertCircle, CheckSquare, FileText, ShieldAlert, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { getCurrentUser, getCurrentUserInfo, removeMember } from "../../services/api";
import { formatOrgRole, formatScrumRole, generateAvatar, assignColor } from "../../utils/formatters";

interface Member {
	id: string;
	name: string;
	avatar: string;
	color: string;
	orgRole: "Admin" | "Member";
	scrumRole: "Product Owner" | "Scrum Master" | "Developer";
	tickets: ActivityDetail[];
	tasks: ActivityDetail[];
	blockers: ActivityDetail[];
}

interface ActivityDetail {
	id: string;
	title: string;
	status?: "todo" | "in_progress" | "completed";
	priority?: "low" | "medium" | "high";
}

export function Info() {

	// Modal states
	const [members, setMembers] = useState<Member[]>([]); // Start with empty array of members
	const [currentUser, setCurrentUser] = useState<"Admin" | "Member" | null>(null);
	const [orgId, setOrgId] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
	const [expandedActivity, setExpandedActivity] = useState<{
		memberId: string;
		type: "tickets" | "tasks" | "blockers";
	} | null>(null);

	useEffect(() => { // Used to fetch API data (outside the normal React render's flow)
		const fetchMembers = async () => {
			try {
				// Step 1: Get current user's org_id
				const user = await getCurrentUser();
				setCurrentUser(formatOrgRole(user.org_role!));
				setOrgId(user.current_organization_id);

				// Step 2: Fetch members using org_id
				if (user.current_organization_id) {
					const membersData = await getCurrentUserInfo(user.current_organization_id);

					// Transform API data → UI data using your formatter functions
					const transformedMembers: Member[] = membersData.map((memberData, index) => ({
						id: memberData.id,
						name: memberData.name,
						avatar: generateAvatar(memberData.name),
						color: assignColor(index),
						orgRole: formatOrgRole(memberData.org_role),
						scrumRole: formatScrumRole(memberData.scrum_role),
						tickets: memberData.tickets || [],
						tasks: memberData.tasks || [],
						blockers: memberData.blockers.map(b => ({
							id: b.id,
							title: b.description,
						})) || [],
					}));
					setMembers(transformedMembers);
				}
			} catch (error) {
				console.error("Failed to fetch members:", error);
			}
		};
		fetchMembers();
	}, []); // Empty array = run once on mount

	const isAdmin = currentUser === "Admin";

	const handleRemoveMember = async () => {
		if (confirmDelete && orgId) {
			try {
				// Call API to remove member
				await removeMember(orgId, confirmDelete);

				// Ipdate UI by removing member from state
				setMembers(members.filter(m => m.id !== confirmDelete));

				// Close modal
				setConfirmDelete(null);
			} catch (error) {
				console.error("Failed to remove member:", error);
			}
		}
	};

	const canRemoveMember = (member: Member) => {
		if (!isAdmin) return false;
		if (member.orgRole === "Admin") return false;
		return true;
	};

	const toggleActivity = (memberId: string, type: "tickets" | "tasks" | "blockers") => {
		if (expandedActivity?.memberId === memberId && expandedActivity?.type === type) {
			setExpandedActivity(null);
		} else {
			setExpandedActivity({ memberId, type });
		}
	};

	return (
		<div className="p-8">
			<div className="mb-6">
				<h2 className="text-3xl text-gray-900 mb-1">Info</h2>
				<p className="text-sm text-gray-500">Team members and current work context</p>
			</div>

			<div className="w-full">
				<div className="bg-white rounded-2xl border border-gray-100">
					{/* Table Header */}
					<div className="grid grid-cols-12 gap-6 px-6 py-4 border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
						<div className="col-span-4">Member</div>
						<div className="col-span-2 text-center">Scrum Role</div>
						<div className="col-span-5 text-center">Activity</div>
						<div className="col-span-1"></div>
					</div>{" "}
					{/* Member Rows */}
					<div className="divide-y divide-gray-100">
						{members.map((member) => {
							const activities = {
								tickets: member.tickets || [],
								tasks: member.tasks || [],
								blockers: member.blockers || [],
							};

							return (
								<div key={member.id}>
									<div className="grid grid-cols-12 gap-6 px-6 py-5 items-center">
										{/* Member Info */}
										<div className="col-span-4 flex items-center gap-3">
											<div
												className={`w-10 h-10 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center flex-shrink-0`}
											>
												<span className="text-sm text-gray-900">
													{member.avatar}
												</span>
											</div>
											<div>
												<p className="text-sm text-gray-900">
													{member.name}
												</p>
											</div>
										</div>

										{/* Scrum Role */}
										<div className="col-span-2 flex justify-center">
											<span className="text-sm text-gray-700">
												{member.scrumRole}
											</span>
										</div>

										{/* Activity Summary */}
										<div className="col-span-5 flex items-center justify-center gap-2">
											{/* Active Tickets */}
											<button
												onClick={() => toggleActivity(member.id, "tickets")}
												className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
													member.tickets.length > 0
														? "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
														: "bg-gray-50 text-gray-500"
												}`}
												disabled={member.tickets.length === 0}
											>
												<FileText className="w-3.5 h-3.5" />
												<span>{member.tickets.length}</span>
												{member.tickets.length > 0 &&
													(expandedActivity?.memberId === member.id &&
													expandedActivity?.type === "tickets" ? (
														<ChevronUp className="w-3 h-3" />
													) : (
														<ChevronDown className="w-3 h-3" />
													))}
											</button>

											{/* Active Tasks */}
											<button
												onClick={() => toggleActivity(member.id, "tasks")}
												className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
													member.tasks.length > 0
														? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
														: "bg-gray-50 text-gray-500"
												}`}
												disabled={member.tasks.length === 0}
											>
												<CheckSquare className="w-3.5 h-3.5" />
												<span>{member.tasks.length}</span>
												{member.tasks.length > 0 &&
													(expandedActivity?.memberId === member.id &&
													expandedActivity?.type === "tasks" ? (
														<ChevronUp className="w-3 h-3" />
													) : (
														<ChevronDown className="w-3 h-3" />
													))}
											</button>

											{/* Open Blockers */}
											<button
												onClick={() =>
													toggleActivity(member.id, "blockers")
												}
												className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
													member.blockers.length > 0
														? "bg-rose-50 text-rose-700 hover:bg-rose-100"
														: "bg-gray-50 text-gray-500"
												}`}
												disabled={member.blockers.length === 0}
											>
												<ShieldAlert className="w-3.5 h-3.5" />
												<span>{member.blockers.length}</span>
												{member.blockers.length > 0 &&
													(expandedActivity?.memberId === member.id &&
													expandedActivity?.type === "blockers" ? (
														<ChevronUp className="w-3 h-3" />
													) : (
														<ChevronDown className="w-3 h-3" />
													))}
											</button>
										</div>

										{/* Actions */}
										<div className="col-span-1 flex justify-end">
											{isAdmin ? (
												canRemoveMember(member) ? (
													<button
														onClick={() => setConfirmDelete(member.id)}
														className="p-2 hover:bg-rose-50 rounded-lg transition-colors group"
														title="Remove member"
													>
														<Trash2 className="w-4 h-4 text-gray-400 group-hover:text-rose-600" />
													</button>
												) : (
													<div className="relative group">
														<button
															disabled
															className="p-2 rounded-lg cursor-not-allowed"
														>
															<Trash2 className="w-4 h-4 text-gray-300" />
														</button>
														<div className="absolute right-0 top-full mt-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
															Cannot remove admin
														</div>
													</div>
												)
											) : null}
										</div>
									</div>

									{/* Expanded Activity Details */}
									{expandedActivity?.memberId === member.id && (
										<div className="px-6 pb-5">
											<div className="bg-gray-50 rounded-xl p-4">
												<h4 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
													{expandedActivity.type === "tickets"
														? "Active Tickets"
														: expandedActivity.type === "tasks"
														? "Active Tasks"
														: "Open Blockers"}
												</h4>

												{expandedActivity.type === "tickets" && (
													<div className="space-y-2">
														{activities.tickets.length > 0 ? (
															activities.tickets.map((ticket) => (
																<div
																	key={ticket.id}
																	className="bg-white rounded-lg p-3 border border-gray-200"
																>
																	<div className="flex items-center justify-between">
																		<p className="text-sm text-gray-900">
																			{ticket.title}
																		</p>
																		<span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
																			{ticket.status}
																		</span>
																	</div>
																</div>
															))
														) : (
															<p className="text-sm text-gray-400 text-center py-2">
																No active tickets
															</p>
														)}
													</div>
												)}

												{expandedActivity.type === "tasks" && (
													<div className="space-y-2">
														{activities.tasks.length > 0 ? (
															activities.tasks.map((task) => (
																<div
																	key={task.id}
																	className="bg-white rounded-lg p-3 border border-gray-200"
																>
																	<p className="text-sm text-gray-900">
																		{task.title}
																	</p>
																</div>
															))
														) : (
															<p className="text-sm text-gray-400 text-center py-2">
																No active tasks
															</p>
														)}
													</div>
												)}

												{expandedActivity.type === "blockers" && (
													<div className="space-y-2">
														{activities.blockers.length > 0 ? (
															activities.blockers.map((blocker) => (
																<div
																	key={blocker.id}
																	className="bg-white rounded-lg p-3 border border-rose-200"
																>
																	<p className="text-sm text-gray-900">
																		{blocker.title}
																	</p>
																</div>
															))
														) : (
															<p className="text-sm text-gray-400 text-center py-2">
																No open blockers
															</p>
														)}
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Summary Stats */}
				<div className="mt-6 grid grid-cols-3 gap-4">
					<div className="bg-white rounded-xl border border-gray-100 p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
								<FileText className="w-5 h-5 text-cyan-600" />
							</div>
							<div>
								<p className="text-2xl text-gray-900">
									{members.reduce((sum, m) => sum + m.tickets.length, 0)}
								</p>
								<p className="text-xs text-gray-500">Active Tickets</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
								<CheckSquare className="w-5 h-5 text-emerald-600" />
							</div>
							<div>
								<p className="text-2xl text-gray-900">
									{members.reduce((sum, m) => sum + m.tasks.length, 0)}
								</p>
								<p className="text-xs text-gray-500">Active Tasks</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-100 p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
								<ShieldAlert className="w-5 h-5 text-rose-600" />
							</div>
							<div>
								<p className="text-2xl text-gray-900">
									{members.reduce((sum, m) => sum + m.blockers.length, 0)}
								</p>
								<p className="text-xs text-gray-500">Open Blockers</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Remove Member Confirmation Modal */}
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
									Remove Member?
								</h3>
								<p className="text-sm text-gray-500 text-center">
									This member will be removed from the team and lose
									access to all data. This action cannot be undone.
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
									onClick={handleRemoveMember}
									className="flex-1 px-4 py-2 text-sm text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
								>
									Remove
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
