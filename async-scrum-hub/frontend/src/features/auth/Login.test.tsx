import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Login } from "./Login";
import { login } from "../../services/api";

// Mock the login API
vi.mock("../../services/api", () => ({
	login: vi.fn(),
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

// Get the mocked login function
const mockLogin = vi.mocked(login);

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		clear: () => {
			store = {};
		},
	};
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Login Component", () => {
	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks();
		localStorageMock.clear();

		// Reset mock implementation to successful login
		mockLogin.mockResolvedValue({
			access_token: "mock-token-123",
			token_type: "bearer",
		});
	});
	it("renders login form with all fields", () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		expect(screen.getByText("ScrumHub")).toBeInTheDocument();
		expect(screen.getByText("Log in to your account")).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
		expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
	});

	it("displays hint text for password field", () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
	});

	// Email Validation Tests
	it("shows error when email is empty", async () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const submitButton = screen.getByRole("button", { name: /log in/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is required")).toBeInTheDocument();
		});
	});

	it("shows error when email is invalid (no @)", async () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const submitButton = screen.getByRole("button", { name: /log in/i });

		fireEvent.change(emailInput, { target: { value: "invalidemail.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is invalid")).toBeInTheDocument();
		});
	});

	it("shows error when email has multiple @ symbols", async () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const submitButton = screen.getByRole("button", { name: /log in/i });

		fireEvent.change(emailInput, { target: { value: "john@@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is invalid")).toBeInTheDocument();
		});
	});

	// Password Validation Tests
	it("shows error when password is empty", async () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const emailInput = screen.getByLabelText(/email/i);
		const submitButton = screen.getByRole("button", { name: /log in/i });

		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Password is required")).toBeInTheDocument();
		});
	});

	it("shows error when password is too short", async () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const submitButton = screen.getByRole("button", { name: /log in/i });

		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "short" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
		});
	});

	// Successful Login Test
	it("calls login API and navigates to dashboard on success", async () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const submitButton = screen.getByRole("button", { name: /log in/i });

		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledWith({
				email: "john@example.com",
				password: "password123",
			});
			expect(localStorageMock.getItem("token")).toBe("mock-token-123");
			expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
		});
	});

	// Error Handling Tests
	it("shows error for invalid credentials", async () => {
		mockLogin.mockRejectedValueOnce({
			error: {
				code: "INVALID_CREDENTIALS",
				message: "Email or password is incorrect",
			},
		});

		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const submitButton = screen.getByRole("button", { name: /log in/i });

		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email or password is incorrect")).toBeInTheDocument();
		});
	});

	it("shows generic error for unexpected errors", async () => {
		mockLogin.mockRejectedValueOnce(new Error("Network error"));

		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/password/i);
		const submitButton = screen.getByRole("button", { name: /log in/i });

		fireEvent.change(emailInput, { target: { value: "john@example.com" } });
		fireEvent.change(passwordInput, { target: { value: "password123" } });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Network error")).toBeInTheDocument();
		});
	});

	// Navigation Tests
	it("navigates to signup when 'Sign up' is clicked", () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const signUpButton = screen.getByRole("button", { name: /sign up/i });
		fireEvent.click(signUpButton);

		expect(mockNavigate).toHaveBeenCalledWith("/signup");
	});

	it("navigates to welcome when 'Forgot password?' is clicked", () => {
		render(
			<BrowserRouter>
				<Login />
			</BrowserRouter>
		);

		const forgotPasswordButton = screen.getByRole("button", { name: /forgot password/i });
		fireEvent.click(forgotPasswordButton);

		expect(mockNavigate).toHaveBeenCalledWith("/welcome");
	});
});
