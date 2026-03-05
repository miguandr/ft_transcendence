<>
					<div
						className="fixed inset-0 bg-black/20 z-40"
						onClick={() => setIsCreateTicketOpen(false)}
					/>
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
							<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
								<div>
									<h3 className="text-lg text-gray-900">Create Ticket</h3>
									<p className="text-xs text-gray-500 mt-0.5">
										New tickets will appear in To Do
									</p>
								</div>
								<button
									onClick={() => setIsCreateTicketOpen(false)}
									className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-400" />
								</button>
							</div>

							<div className="px-6 py-5 space-y-4">
								<div>
									<label className="block text-sm text-gray-700 mb-1.5">
										Title <span className="text-rose-500">*</span>
									</label>
									<input
										type="text"
										value={ticketForm.title}
										onChange={(e) =>
											setTicketForm({ ...ticketForm, title: e.target.value })
										}
										placeholder="Enter ticket title"
										className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
									/>
								</div>

								<div>
									<label className="block text-sm text-gray-700 mb-1.5">
										Description
									</label>
									<textarea
										value={ticketForm.description}
										onChange={(e) =>
											setTicketForm({
												...ticketForm,
												description: e.target.value,
											})
										}
										placeholder="Add details (optional)"
										rows={4}
										className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors resize-none"
									/>
								</div>

								<div>
									<label className="block text-sm text-gray-700 mb-1.5">
										Priority <span className="text-rose-500">*</span>
									</label>
									<div className="grid grid-cols-3 gap-3">
										{(["high", "medium", "low"] as Priority[]).map((p) => (
											<button
												key={p}
												onClick={() =>
													setTicketForm({ ...ticketForm, priority: p })
												}
												className={`px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
													ticketForm.priority === p
														? p === "high"
															? "border-rose-300 bg-rose-50 text-rose-700"
															: p === "medium"
																? "border-amber-300 bg-amber-50 text-amber-700"
																: "border-gray-300 bg-gray-50 text-gray-700"
														: "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
												}`}
											>
												{p.charAt(0).toUpperCase() + p.slice(1)}
											</button>
										))}
									</div>
								</div>

								<div>
									<label className="block text-sm text-gray-700 mb-1.5">
										Assignee
									</label>
									<select
										value={ticketForm.assignee}
										onChange={(e) =>
											setTicketForm({
												...ticketForm,
												assignee: e.target.value,
											})
										}
										className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors"
									>
										<option value="">Select team member (optional)</option>
										{teamMembers
											.filter((m) => m.role === "Developer")
											.map((member) => (
												<option key={member.id} value={member.avatar}>
													{member.name}
												</option>
											))}
									</select>
								</div>
							</div>

							<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
								<button
									onClick={() => setIsCreateTicketOpen(false)}
									className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleCreateTicket}
									disabled={!ticketForm.title.trim()}
									className="px-4 py-2 text-sm text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Create ticket
								</button>
							</div>
						</div>
					</div>
				</>
			)}
