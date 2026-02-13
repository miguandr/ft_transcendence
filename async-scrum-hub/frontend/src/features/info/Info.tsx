import { useState, useEffect } from "react";
import { getCurrentUser, getCurrentUserInfo, removeMember } from "../../services/api";
import { formatOrgRole, formatScrumRole } from "../../utils/formatters";
import { PageHeader, Avatar, Badge, StatCard, Modal, Button } from "../../components/custom";
import {
	AlertCircle,
	CheckSquare,
	FileText,
	ShieldAlert,
	Trash2,
	ChevronDown,
	ChevronUp,
} from "lucide-react";

interface Member {
	id: string;
	name: string;
	avatarUrl?: string | null; // Optional: URL to uploaded profile picture
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

	useEffect(() => {
		// Used to fetch API data (outside the normal React render's flow)
		const fetchMembers = async () => {
			try {
				// Step 1: Get current user's org_id
				const user = await getCurrentUser();
				setCurrentUser(formatOrgRole(user.org_role!));
				setOrgId(user.organization_id);

				// Step 2: Fetch members using org_id
				if (user.organization_id) {
					const membersData = await getCurrentUserInfo(user.organization_id);

					// Transform API data → UI data using your formatter functions
					const transformedMembers: Member[] = membersData.map((memberData) => ({
						id: memberData.id,
						name: memberData.name,
						avatarUrl: memberData.avatar_url,
						orgRole: formatOrgRole(memberData.org_role),
						scrumRole: formatScrumRole(memberData.scrum_role),
						tickets: memberData.tickets || [],
						tasks: memberData.tasks || [],
						blockers:
							memberData.blockers.map((b) => ({
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
				setMembers(members.filter((m) => m.id !== confirmDelete));

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
			<PageHeader title="Info" subtitle="Team members and current work context" />
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
											<Avatar
												avatarUrl={member.avatarUrl}
												name={member.name}
												userId={member.id}
												size="md"
											/>
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
																		<Badge
																			variant="default"
																			size="sm"
																		>
																			{ticket.status}
																		</Badge>
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
					<StatCard
						icon={<FileText className="w-5 h-5 text-cyan-600" />}
						label="Active Tickets"
						value={members.reduce((sum, m) => sum + m.tickets.length, 0)}
						subtitle="Across team"
						bgColor="bg-cyan-50"
					/>

					<StatCard
						icon={<CheckSquare className="w-5 h-5 text-emerald-600" />}
						label="Active Tasks"
						value={members.reduce((sum, m) => sum + m.tasks.length, 0)}
						subtitle="Across team"
						bgColor="bg-emerald-50"
					/>

					<StatCard
						icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
						label="Open Blockers"
						value={members.reduce((sum, m) => sum + m.blockers.length, 0)}
						subtitle="Across team"
						bgColor="bg-rose-50"
					/>
				</div>
			</div>

			{/* Remove Member Confirmation Modal */}
			<Modal
				isOpen={!!confirmDelete}
				onClose={() => setConfirmDelete(null)}
				title="Remove Member?"
				size="sm"
			>
				<div className="text-center">
					<div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
						<AlertCircle className="w-6 h-6 text-rose-600" />
					</div>
					<p className="text-sm text-gray-500 mb-6">
						This member will be removed from the team and lose access to all data. This
						action cannot be undone.
					</p>

					<div className="flex items-center gap-3">
						<Button variant="secondary" onClick={() => setConfirmDelete(null)}>
							Cancel
						</Button>
						<Button
							variant="primary"
							onClick={handleRemoveMember}
							className="bg-rose-600 hover:bg-rose-700"
						>
							Remove
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
