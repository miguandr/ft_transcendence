import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SignUp } from "./SignUp";

// Mock the signup API
vi.mock("../../services/api", () => ({
	signup: vi.fn(() =>
		Promise.resolve({
			id: "1",
			name: "John",
			email: "john@example.com",
		})
	),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe("SignUp Component", () => {
	it("renders signup form with all fields", () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		expect(screen.getByText("ScrumHub")).toBeInTheDocument();
		expect(screen.getByText("Create your account")).toBeInTheDocument();
		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
	});

	it("shows error when name is empty", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const submitButton = screen.getByRole("button", { name: /create account/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Name is required")).toBeInTheDocument();
		});
	});

	// Email Validation Edge Cases
	it("shows error when email is missing", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is required")).toBeInTheDocument();
		});
	});

	it("shows error when email has no @ symbol", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "invalidemail.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			// Check if error message appears
			const errorElement = screen.queryByText("Email is invalid");
			if (!errorElement) {
				console.log("DOM content:", document.body.innerHTML);
			}
			expect(screen.getByText("Email is invalid")).toBeInTheDocument();
		});
	});

	it("shows error when email has no domain", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john@" } });
		fireEvent.click(submitButton);

		// Should show email error (and also password errors, but we're checking email)
		await waitFor(() => {
			expect(screen.getByText("Email is invalid")).toBeInTheDocument();
		});
	});

	it("shows error when email has no top-level domain", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john@domain" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is invalid")).toBeInTheDocument();
		});
	});

	it("shows error when email has spaces", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john doe@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is invalid")).toBeInTheDocument();
		});
	});

	it("shows error when email has multiple @ symbols", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john@@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is invalid")).toBeInTheDocument();
		});
	});

	it("accepts valid email with subdomain", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john@mail.example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		// Should not show email error (form proceeds to API call)
		await waitFor(() => {
			expect(screen.queryByText("Email is invalid")).not.toBeInTheDocument();
		});
	});

	it("accepts valid email with plus sign", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john+test@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		// Should not show email error (form proceeds to API call)
		await waitFor(() => {
			expect(screen.queryByText("Email is invalid")).not.toBeInTheDocument();
		});
	});

	it("shows error when password is too short", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "short" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "short" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
		});
	});

	it("shows error when passwords do not match", async () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		const nameInput = screen.getByLabelText(/name/i);
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/^password$/i);
		const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
		const submitButton = screen.getByRole("button", { name: /create account/i });

		fireEvent.change(nameInput, { target: { value: "John Doe" } });
		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.change(confirmPasswordInput, { target: { value: "password456" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
		});
	});

	it("displays hint text for password field", () => {
		render(
			<BrowserRouter>
				<SignUp />
			</BrowserRouter>
		);

		expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
	});
});
