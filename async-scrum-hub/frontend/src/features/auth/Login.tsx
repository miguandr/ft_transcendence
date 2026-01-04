import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../../services/api";
import { Button, Input, Label, ErrorText, HintText, PageContainer } from "../../components/custom";

export function Login() {
	const navigate = useNavigate();

	const [email, setEmail] = useState(""); // Stores email
	const [password, setPassword] = useState(""); // Stores password
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = (): boolean => {
		const newErrors: { email?: string; password?: string } = {};

		// Validate email
		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			// checks for basic email format (text@text.text)
			newErrors.email = "Email is invalid";
		}

		// Validate password
		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		setErrors(newErrors);
		// Return true if no errors
		return Object.keys(newErrors).length === 0;
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (!validateForm()) {
			return; //Stops here if validation fails
		}

		// Start loading
		setIsLoading(true);
		setErrors({}); // clear any previous errors

		try {
			// Call API
			const response = await login({ email, password }); // await is non-blocking waiting

			console.log("Login successful!", response);
			// Save token to localStorage (browser storage persists until logout)
			localStorage.setItem("token", response.access_token);

			// Navigate to dashboard
			navigate("/");
		} catch (error: any) {
			// Handle API Errors
			console.error("Login failed:", error);

			// Check for our API error format { error: { code, message } } using optional chaining
			if (error?.error?.code === "INVALID_CREDENTIALS") {
				// Only runs if error.error.code exists AND equals "INVALID_CREDENTIALS"
				setErrors({ email: "Invalid email or password" });
			} else if (error?.error?.code === "UNAUTHORIZED") {
				// Only runs if error.error.code exists AND equals "UNAUTHORIZED"
				setErrors({ email: "Session expired. Please login again." });
			} else if (error?.error?.message) {
				// Only runs if error.error.message exists (Use the API's error message)
				setErrors({ email: error.error.message });
			} else if (error instanceof Error) {
				// Handles standard JavaScript Error objects
				setErrors({ email: error.message });
			} else {
				// Handles completely unknown errors
				setErrors({ email: "An unexpected error occurred." });
			}
		} finally {
			// Stop loading (runs weather success or failure)
			setIsLoading(false);
		}
	};

	return (
		<PageContainer>
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>
					<p className="text-sm text-gray-500">Log in to your account</p>
				</div>

				<form onSubmit={handleLogin} className="space-y-5">
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							type="email"
							id="email"
							placeholder="you@company.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							hasError={!!errors.email}
						/>
						{errors.email && <ErrorText>{errors.email}</ErrorText>}
					</div>

					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							type="password"
							id="password"
							placeholder="Enter your password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							hasError={!!errors.password}
						/>
						{!errors.password && <HintText>At least 8 characters</HintText>}
						{errors.password && <ErrorText>{errors.password}</ErrorText>}
					</div>

					<Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
						Log in
					</Button>

					<div className="text-center space-y-2">
					<Button
						type="button"
						variant="text"
						onClick={() => navigate("/welcome")}
						className="w-full text-gray-500 hover:text-gray-700"
					>
						Forgot password?
					</Button>
						<p className="text-sm text-gray-500">
							Don't have an account?{" "}
							<Button type="button" variant="text" onClick={() => navigate("/signup")}>
								Sign up
							</Button>
						</p>
					</div>
				</form>
			</div>
		</PageContainer>
	);
}
