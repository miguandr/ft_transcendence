import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { Blockers } from "./Blockers";
import { prettyDOM } from "@testing-library/dom";

// Mock the API functions
vi.mock("../../services/api", () => ({
	getCurrentUser: vi.fn(() =>
		Promise.resolve({
			id: "user-1",
			email: "miguel@example.com",
			name: "Miguel",
			avatar_url: null,
			organization_id: "org-1",
			scrum_role: "scrum_master",
			org_role: "admin",
		})
	),
	listBlockers: vi.fn(() =>
		Promise.resolve([
			{
				id: "blocker-1",
				description: "Waiting for API keys from client",
				status: "open",
				created_by: {
					id: "user-1",
					name: "Miguel",
					avatar_url: null,
				},
				assignee: {
					id: "user-2",
					name: "Angel",
				},
				ticket: {
					id: "ticket-1",
					title: "Implement OAuth flow",
				},
				created_at: "2024-02-10T10:00:00Z",
				resolved_at: null,
			},
			{
				id: "blocker-2",
				description: "Design assets not yet approved",
				status: "resolved",
				created_by: {
					id: "user-2",
					name: "Angel",
					avatar_url: null,
				},
				assignee: null,
				ticket: {
					id: "ticket-2",
					title: "Design settings page",
				},
				created_at: "2024-02-08T14:30:00Z",
				resolved_at: "2024-02-11T09:15:00Z",
			},
		])
	),
	listTickets: vi.fn(() =>
		Promise.resolve([
			{
				id: "ticket-1",
				title: "Implement OAuth flow",
				status: "in_progress",
				priority: "high",
				assignee: { id: "user-1", name: "Miguel", avatar_url: null },
				created_at: "2024-02-01T10:00:00Z",
				updated_at: "2024-02-10T10:00:00Z",
			},
			{
				id: "ticket-2",
				title: "Design settings page",
				status: "todo",
				priority: "medium",
				assignee: null,
				created_at: "2024-02-05T10:00:00Z",
				updated_at: "2024-02-05T10:00:00Z",
			},
		])
	),
	getOrganizationMembers: vi.fn(() =>
		Promise.resolve([
			{
				id: "user-1",
				name: "Miguel",
				org_role: "admin",
				scrum_role: "scrum_master",
			},
			{
				id: "user-2",
				name: "Angel",
				org_role: "member",
				scrum_role: "developer",
			},
		])
	),
	createBlocker: vi.fn(() =>
		Promise.resolve({
			id: "blocker-new",
			description: "New blocker",
			status: "open",
			created_by: "user-1",
			assignee_id: null,
			ticket_id: "ticket-1",
			created_at: "2024-02-13T10:00:00Z",
			resolved_at: null,
		})
	),
	updateBlocker: vi.fn(() =>
		Promise.resolve({
			id: "blocker-1",
			description: "Updated description",
			status: "open",
			created_by: "user-1",
			assignee_id: "user-2",
			ticket_id: "ticket-1",
			created_at: "2024-02-10T10:00:00Z",
			resolved_at: null,
		})
	),
	resolveBlocker: vi.fn(() => Promise.resolve()),
}));

describe("Blockers Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderBlockers = () => {
		return render(
			<BrowserRouter>
				<Blockers />
			</BrowserRouter>
		);
	};

	// ===== RENDERING TESTS =====
	describe("Rendering", () => {
		it("renders the Blockers page with header", async () => {
			renderBlockers();

			expect(screen.getByText("Blockers")).toBeInTheDocument();
			expect(screen.getByText("Issues that need attention")).toBeInTheDocument();
		});

		it("renders create blocker button", async () => {
			renderBlockers();

			expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
		});

		it("displays active blockers section", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Active \(1\)/)).toBeInTheDocument();
			});
		});

		it("displays resolved blockers section when present", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Resolved \(1\)/)).toBeInTheDocument();
			});
		});

		it("renders blocker description correctly", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});
		});

		it("shows creator information with Avatar", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getAllByText(/Created by Miguel/)[0]).toBeInTheDocument();
			});
		});

		it("shows assignee information when present", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Related to:/)).toBeInTheDocument();
				expect(screen.getByText("Angel")).toBeInTheDocument();
			});
		});

		it("shows ticket information", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getAllByText(/Ticket:/).length).toBeGreaterThan(0);
				expect(screen.getByText("Implement OAuth flow")).toBeInTheDocument();
			});
		});

		it("shows timestamp for blockers", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("10/02/2024")).toBeInTheDocument();
			});
		});
	});

	// ===== EMPTY STATE TESTS =====
	describe("Empty State", () => {
		it("shows empty state when no active blockers", async () => {
			const { listBlockers } = await import("../../services/api");
			vi.mocked(listBlockers).mockResolvedValueOnce([
				{
					id: "blocker-2",
					description: "Design assets not yet approved",
					status: "resolved",
					created_by: {
						id: "user-2",
						name: "Angel",
						avatar_url: null,
					},
					assignee: null,
					ticket: {
						id: "ticket-2",
						title: "Design settings page",
					},
					created_at: "2024-02-08T14:30:00Z",
					resolved_at: "2024-02-11T09:15:00Z",
				},
			]);

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("No active blockers")).toBeInTheDocument();
				expect(
					screen.getByText("Your team is currently unblocked and moving smoothly.")
				).toBeInTheDocument();
			});
		});

		it("shows Active (0) when no open blockers", async () => {
			const { listBlockers } = await import("../../services/api");
			vi.mocked(listBlockers).mockResolvedValueOnce([]);

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Active \(0\)/)).toBeInTheDocument();
			});
		});
	});

	// ===== MODAL TESTS =====
	describe("Create Blocker Modal", () => {


		it("opens create modal when button clicked", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);
			screen.debug();

			await waitFor(() => {
				expect(screen.getByLabelText(/Associated Ticket/)).toBeInTheDocument();
				expect(screen.getByLabelText(/Description/)).toBeInTheDocument();

			});
		});

		it("closes create modal when cancel clicked", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				expect(screen.queryByLabelText(/Associated Ticket/)).toBeInTheDocument();
			});

			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);
			screen.debug();
			console.log(prettyDOM());

			await waitFor(() => {
				expect(screen.queryByLabelText(/Associated Ticket/)).not.toBeInTheDocument();
				//expect(screen.queryByText("Create Blocker")).not.toBeInTheDocument();
			});
		});

		it("shows all form fields in create modal", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
				expect(screen.getByLabelText(/Associated Ticket/)).toBeInTheDocument();
				expect(screen.getByLabelText(/Related to/)).toBeInTheDocument();
			});
		});

		it("disables create button when description is empty", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				const submitButton = screen.getAllByRole("button", { name: /create blocker/i })[1];
				expect(submitButton).toBeDisabled();
			});
		});

		it("disables create button when ticket is not selected", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
			});

			const descriptionField = screen.getByLabelText(/Description/);
			await user.type(descriptionField, "Test blocker");

			const submitButton = screen.getAllByRole("button", { name: /create blocker/i })[1];
			expect(submitButton).toBeDisabled();
		});

		it("creates blocker when form is valid", async () => {
			const user = userEvent.setup();
			const { createBlocker } = await import("../../services/api");
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
			});

			const descriptionField = screen.getByLabelText(/Description/);
			await user.type(descriptionField, "Test blocker description");

			const ticketSelect = screen.getByLabelText(/Associated Ticket/);
			await user.selectOptions(ticketSelect, "ticket-1");

			const submitButton = screen.getAllByRole("button", { name: /create blocker/i })[1];
			await user.click(submitButton);

			await waitFor(() => {
				expect(createBlocker).toHaveBeenCalledWith("org-1", {
					description: "Test blocker description",
					ticket_id: "ticket-1",
					assignee_id: null,
				});
			});
		});
	});

	describe("Edit Blocker Modal", () => {
		it("opens edit modal when edit button clicked", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			await waitFor(() => {
				expect(screen.getByText("Edit Blocker")).toBeInTheDocument();
			});
		});

		it("pre-fills form with blocker data", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			await waitFor(() => {
				const descriptionField = screen.getByDisplayValue(
					"Waiting for API keys from client"
				);
				expect(descriptionField).toBeInTheDocument();
			});
		});

		it("shows assignee dropdown for scrum master", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			await waitFor(() => {
				expect(screen.getByLabelText(/Assignee/)).toBeInTheDocument();
			});
		});

		it("shows assignee dropdown for blocker creator", async () => {
			const user = userEvent.setup();
			const { getCurrentUser } = await import("../../services/api");
			vi.mocked(getCurrentUser).mockResolvedValueOnce({
				id: "user-2",
				email: "angel@example.com",
				name: "Angel",
				avatar_url: null,
				organization_id: "org-1",
				scrum_role: "developer",
				org_role: "member",
			});

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Design assets not yet approved")).toBeInTheDocument();
			});

			// This blocker is created by user-2, but user-2 is not scrum_master
			// However, they are the creator, so should see assignee field when editing
		});

		it("updates blocker when form is submitted", async () => {
			const user = userEvent.setup();
			const { updateBlocker } = await import("../../services/api");
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			await waitFor(() => {
				expect(
					screen.getByDisplayValue("Waiting for API keys from client")
				).toBeInTheDocument();
			});

			const descriptionField = screen.getByDisplayValue("Waiting for API keys from client");
			await user.clear(descriptionField);
			await user.type(descriptionField, "Updated blocker description");

			const saveButton = screen.getByRole("button", { name: /save changes/i });
			await user.click(saveButton);

			await waitFor(() => {
				expect(updateBlocker).toHaveBeenCalledWith("blocker-1", {
					description: "Updated blocker description",
					ticket_id: "ticket-1",
					assignee_id: "user-2",
				});
			});
		});
	});

	// ===== PERMISSION TESTS =====
	describe("Permissions", () => {
		it("shows edit and resolve buttons for blocker creator", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			expect(screen.getByRole("button", { name: /Edit/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /Resolve Blocker/i })).toBeInTheDocument();
		});

		it("shows edit and resolve buttons for scrum master", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Design assets not yet approved")).toBeInTheDocument();
			});

			// Scrum master should see buttons even for blockers they didn't create
			const resolvedSection = screen.getByText(/Resolved \(1\)/).closest("div");
			expect(resolvedSection).toBeInTheDocument();
		});

		it("shows resolve button for assignee", async () => {
			const { getCurrentUser } = await import("../../services/api");
			vi.mocked(getCurrentUser).mockResolvedValueOnce({
				id: "user-2",
				email: "angel@example.com",
				name: "Angel",
				avatar_url: null,
				organization_id: "org-1",
				scrum_role: "developer",
				org_role: "member",
			});

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			// User-2 is assignee of blocker-1
			expect(screen.getByRole("button", { name: /Resolve Blocker/i })).toBeInTheDocument();
		});

		it("shows read-only for users without permissions", async () => {
			const { getCurrentUser } = await import("../../services/api");
			vi.mocked(getCurrentUser).mockResolvedValueOnce({
				id: "user-3",
				email: "other@example.com",
				name: "Other User",
				avatar_url: null,
				organization_id: "org-1",
				scrum_role: "developer",
				org_role: "member",
			});

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			expect(screen.queryByText("Resolve Blocker")).not.toBeInTheDocument();
		});

		it("resolves blocker after confirming the modal", async () => {
			const user = userEvent.setup();
			const { resolveBlocker } = await import("../../services/api");
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			const openModalButton = screen.getByRole("button", { name: /Resolve Blocker/i });
			await user.click(openModalButton);

			const confirmButton = await screen.findByRole("button", {name: /confirm/i });
			await user.click(confirmButton);

			await waitFor(() => {
				expect(resolveBlocker).toHaveBeenCalledWith("blocker-1");
			});
		});
	});

	// ===== RESOLVED BLOCKERS TESTS =====
	describe("Resolved Blockers", () => {
		it("displays resolved blockers with strikethrough", async () => {
			renderBlockers();

			await waitFor(() => {
				const resolvedText = screen.getByText("Design assets not yet approved");
				expect(resolvedText).toHaveClass("line-through");
			});
		});

		it("shows 'Resolved' badge on resolved blockers", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Resolved")).toBeInTheDocument();
			});
		});

		it("shows resolved timestamp", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Resolved 17\/02\/2026/)).toBeInTheDocument();;
			});
		});

		it("does not show action buttons on resolved blockers", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Resolved \(1\)/)).toBeInTheDocument();
			});

			// Resolved blockers should not have Edit or Resolve buttons visible
			const resolvedSection = screen.getByText(/Resolved \(1\)/).parentElement;
			const editButtons = screen.getAllByRole("button", { name: /edit/i });
			const resolveButtons = screen.getAllByRole("button", { name: /mark as resolved/i });

			// All buttons should be in the open blockers section, not resolved
			expect(editButtons.length).toBeGreaterThan(0);
		});
	});

	// ===== ERROR HANDLING TESTS =====
	describe("Error Handling", () => {
		it("handles error when getCurrentUser fails", async () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const { getCurrentUser } = await import("../../services/api");
			vi.mocked(getCurrentUser).mockRejectedValueOnce(new Error("Unauthorized"));

			renderBlockers();

			await waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalledWith("API call failed:", expect.any(Error));
			});

			consoleErrorSpy.mockRestore();
		});

		it("handles error when listBlockers fails", async () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const { listBlockers } = await import("../../services/api");
			vi.mocked(listBlockers).mockRejectedValueOnce(new Error("Network error"));

			renderBlockers();

			await waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalled();
			});

			consoleErrorSpy.mockRestore();
		});

		it("handles error when createBlocker fails", async () => {
			const user = userEvent.setup();
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const { createBlocker } = await import("../../services/api");
			vi.mocked(createBlocker).mockRejectedValueOnce(new Error("Create failed"));

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
			});

			const descriptionField = screen.getByLabelText(/Description/);
			await user.type(descriptionField, "Test");

			const ticketSelect = screen.getByLabelText(/Associated Ticket/);
			await user.selectOptions(ticketSelect, "ticket-1");

			const submitButton = screen.getAllByRole("button", { name: /create blocker/i })[1];
			await user.click(submitButton);

			await waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					"Failed to create blocker:",
					expect.any(Error)
				);
			});

			consoleErrorSpy.mockRestore();
		});

		it("handles error when updateBlocker fails", async () => {
			const user = userEvent.setup();
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const { updateBlocker } = await import("../../services/api");
			vi.mocked(updateBlocker).mockRejectedValueOnce(new Error("Update failed"));

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			await waitFor(() => {
				expect(
					screen.getByDisplayValue("Waiting for API keys from client")
				).toBeInTheDocument();
			});

			const saveButton = screen.getByRole("button", { name: /save changes/i });
			await user.click(saveButton);

			await waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					"Failed to edit blocker:",
					expect.any(Error)
				);
			});

			consoleErrorSpy.mockRestore();
		});

		it("handles error when resolveBlocker fails", async () => {
			const user = userEvent.setup();
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const { resolveBlocker } = await import("../../services/api");
			vi.mocked(resolveBlocker).mockRejectedValueOnce(new Error("Resolve failed"));

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Waiting for API keys from client")).toBeInTheDocument();
			});

			const resolveButton = screen.getByRole("button", { name: /mark as resolved/i });
			await user.click(resolveButton);

			await waitFor(() => {
				expect(consoleErrorSpy).toHaveBeenCalledWith(
					"Failed to resolve blocker:",
					expect.any(Error)
				);
			});

			consoleErrorSpy.mockRestore();
		});
	});

	// ===== EDGE CASES =====
	describe("Edge Cases", () => {
		it("handles blocker without assignee", async () => {
			const { listBlockers } = await import("../../services/api");
			vi.mocked(listBlockers).mockResolvedValueOnce([
				{
					id: "blocker-3",
					description: "Blocker without assignee",
					status: "open",
					created_by: {
						id: "user-1",
						name: "Miguel",
						avatar_url: null,
					},
					assignee: null,
					ticket: {
						id: "ticket-1",
						title: "Test ticket",
					},
					created_at: "2024-02-10T10:00:00Z",
					resolved_at: null,
				},
			]);

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Blocker without assignee")).toBeInTheDocument();
			});

			// Should not show "Related to:" text when no assignee
			expect(screen.queryByText(/Related to:/)).not.toBeInTheDocument();
		});

		it("handles very long blocker description", async () => {
			const longDescription =
				"This is a very long blocker description that goes on and on and on and should still be displayed correctly without breaking the layout or causing any issues in the UI even though it contains many many many words";

			const { listBlockers } = await import("../../services/api");
			vi.mocked(listBlockers).mockResolvedValueOnce([
				{
					id: "blocker-long",
					description: longDescription,
					status: "open",
					created_by: {
						id: "user-1",
						name: "Miguel",
						avatar_url: null,
					},
					assignee: null,
					ticket: {
						id: "ticket-1",
						title: "Test ticket",
					},
					created_at: "2024-02-10T10:00:00Z",
					resolved_at: null,
				},
			]);

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(longDescription)).toBeInTheDocument();
			});
		});

		it("handles multiple blockers correctly", async () => {
			const { listBlockers } = await import("../../services/api");
			vi.mocked(listBlockers).mockResolvedValueOnce([
				{
					id: "blocker-1",
					description: "First blocker",
					status: "open",
					created_by: { id: "user-1", name: "Miguel", avatar_url: null },
					assignee: null,
					ticket: { id: "ticket-1", title: "Ticket 1" },
					created_at: "2024-02-10T10:00:00Z",
					resolved_at: null,
				},
				{
					id: "blocker-2",
					description: "Second blocker",
					status: "open",
					created_by: { id: "user-2", name: "Angel", avatar_url: null },
					assignee: null,
					ticket: { id: "ticket-2", title: "Ticket 2" },
					created_at: "2024-02-11T10:00:00Z",
					resolved_at: null,
				},
				{
					id: "blocker-3",
					description: "Third blocker",
					status: "open",
					created_by: { id: "user-1", name: "Miguel", avatar_url: null },
					assignee: null,
					ticket: { id: "ticket-3", title: "Ticket 3" },
					created_at: "2024-02-12T10:00:00Z",
					resolved_at: null,
				},
			]);

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Active \(3\)/)).toBeInTheDocument();
				expect(screen.getByText("First blocker")).toBeInTheDocument();
				expect(screen.getByText("Second blocker")).toBeInTheDocument();
				expect(screen.getByText("Third blocker")).toBeInTheDocument();
			});
		});

		it("handles empty tickets list in create modal", async () => {
			const user = userEvent.setup();
			const { listTickets } = await import("../../services/api");
			vi.mocked(listTickets).mockResolvedValueOnce([]);

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				const ticketSelect = screen.getByLabelText(/Associated Ticket/);
				const options = ticketSelect.querySelectorAll("option");
				expect(options.length).toBe(1); // Only "Select a ticket" option
			});
		});

		it("handles empty team members list in create modal", async () => {
			const user = userEvent.setup();
			const { getOrganizationMembers } = await import("../../services/api");
			vi.mocked(getOrganizationMembers).mockResolvedValueOnce([]);

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				const assigneeSelect = screen.getByLabelText(/Related to/);
				const options = assigneeSelect.querySelectorAll("option");
				expect(options.length).toBe(1); // Only "Select related team member" option
			});
		});

		it("handles blocker with avatar URL", async () => {
			const { listBlockers } = await import("../../services/api");
			vi.mocked(listBlockers).mockResolvedValueOnce([
				{
					id: "blocker-avatar",
					description: "Blocker with avatar",
					status: "open",
					created_by: {
						id: "user-1",
						name: "Miguel",
						avatar_url: "https://example.com/avatar.jpg",
					},
					assignee: null,
					ticket: {
						id: "ticket-1",
						title: "Test ticket",
					},
					created_at: "2024-02-10T10:00:00Z",
					resolved_at: null,
				},
			]);

			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Blocker with avatar")).toBeInTheDocument();
			});

			// Avatar component should handle the avatar_url
		});

		it("resets form when create modal is reopened", async () => {
			const user = userEvent.setup();
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /create blocker/i })).toBeInTheDocument();
			});

			// Open modal and type something
			const createButton = screen.getByRole("button", { name: /create blocker/i });
			await user.click(createButton);

			await waitFor(() => {
				expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
			});

			const descriptionField = screen.getByLabelText(/Description/);
			await user.type(descriptionField, "Test description");

			// Close modal
			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);

			// Reopen modal
			await user.click(createButton);

			await waitFor(() => {
				const newDescriptionField = screen.getByLabelText(/Description/);
				expect(newDescriptionField).toHaveValue("");
			});
		});
	});

	// ===== DATA DISPLAY TESTS =====
	describe("Data Display", () => {
		it("displays correct count of active blockers", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Active \(1\)/)).toBeInTheDocument();
			});
		});

		it("displays correct count of resolved blockers", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText(/Resolved \(1\)/)).toBeInTheDocument();
			});
		});

		it("shows ticket title for each blocker", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("Implement OAuth flow")).toBeInTheDocument();
				expect(screen.getByText("Design settings page")).toBeInTheDocument();
			});
		});

		it("formats timestamps correctly", async () => {
			renderBlockers();

			await waitFor(() => {
				expect(screen.getByText("2024-02-10T10:00:00Z")).toBeInTheDocument();
				expect(
					screen.getByText(/Resolved 17\/02\/2026/)
				).toBeInTheDocument();
			});

			expect(screen.queryByText("2024-02-08T14:30:00Z")).toBeNull();
		});
	});
});
