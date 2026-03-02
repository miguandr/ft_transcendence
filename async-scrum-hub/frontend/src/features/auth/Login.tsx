import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../../services/api";
import { Button, Input, Label, ErrorText, HintText, PageContainer } from "../../components/custom";
import { motion } from "framer-motion";

export function Login() {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState(""); // Stores password
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	const [isLoading, setIsLoading] = useState(false);
	const [isExiting, setIsExiting] = useState(false); // Track fade-out animation

	const validateForm = (): boolean => {
		const newErrors: { email?: string; password?: string } = {};

		// Validate email
		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
			return;
		}

		// Start loading
		setIsLoading(true);
		setErrors({});

		try {
			const response = await login({ email, password });

			// Save token to localStorage (browser storage persists until logout)
			console.log("Login successful!", response);
			localStorage.setItem("token", response.access_token);

			// Trigger fade-out animation (navigation happens in onAnimationComplete)
			setIsExiting(true);
		} catch (error: unknown) {
			console.error("Login failed:", error);

			// Type assertion for API error format
			type APIError = { error?: { code?: string; message?: string } };
			const apiError = error as APIError;

			if (apiError?.error?.code === "INVALID_CREDENTIALS") {
				setErrors({ email: "Email or password is incorrect" });
			} else if (apiError?.error?.code === "INVALID_INPUT") {
				setErrors({ email: "Email or password is missing" });
			} else if (apiError?.error?.message) {
				setErrors({ email: apiError.error.message });
			} else if (error instanceof Error) {
				setErrors({ email: error.message });
			} else {
				setErrors({ email: "An unexpected error occurred." });
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<PageContainer>
			<motion.div
				className="w-full max-w-md"
				initial={{ opacity: 0 }}
				animate={{ opacity: isExiting ? 0 : 1 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				onAnimationComplete={() => {
					if (isExiting) {
						navigate("/dashboard");
					}
				}}
			>
				<div className="text-center mb-8">
					<h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>
					<p className="text-sm text-gray-500">Log in to your account</p>
				</div>

				<form onSubmit={handleLogin} className="space-y-5">
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							type="text"
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

					<Button
						type="submit"
						variant="primary"
						isLoading={isLoading}
						className="w-full"
					>
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
							<Button
								type="button"
								variant="text"
								onClick={() => navigate("/signup")}
							>
								Sign up
							</Button>
						</p>
					</div>
				</form>
			</motion.div>
		</PageContainer>
	);
}
