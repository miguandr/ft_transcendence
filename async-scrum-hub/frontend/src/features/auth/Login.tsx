import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../../services/api";

export function Login()
{
	const navigate = useNavigate();

	const [email, setEmail] = useState("");			// Stores email
	const [password, setPassword] = useState("");	// Stores password
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = (): boolean => {
		const newErrors: { email?: string; password?: string } = {};

		// Validate email
		if (!email) {
			newErrors.email = "Email is required";
		}
		else if (!/\S+@\S+\.\S+/.test(email)) { // checks for basic email format (text@text.text)
			newErrors.email = "Email is invalid";
		}

		// Validate password
		if (!password) {
			newErrors.password = "Password is required";
		}
		else if (password.length < 8) {
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

		try
		{
			// Call API
			const response = await login({email, password }); // await is non-blocking waiting

			console.log("Login successful!", response);
			// Save token to localStorage (browser storage persists until logout)
			localStorage.setItem("token", response.access_token)

			// Navigate to dashboard
			navigate("/");
		}
		catch (error: any)
		{
			// Handle API Errors
			console.error("Login failed:", error);

			// Check for our API error format { error: { code, message } } using optional chaining
			if (error?.error?.code === "INVALID_CREDENTIALS") {
				// Only runs if error.error.code exists AND equals "INVALID_CREDENTIALS"
				setErrors({ email: "Invalid email or password" });
			}
			else if (error?.error?.code === "UNAUTHORIZED") {
				// Only runs if error.error.code exists AND equals "UNAUTHORIZED"
				setErrors({ email: "Session expired. Please login again." });
			}
			else if (error?.error?.message) {
				// Only runs if error.error.message exists (Use the API's error message)
				setErrors({ email: error.error.message });
			}
			else if (error instanceof Error) {
				// Handles standard JavaScript Error objects
				setErrors({ email: error.message });
			}
			else {
				// Handles completely unknown errors
				setErrors({ email: "An unexpected error occurred." });
			}
		}

		finally {
			// Stop loading (runs weather success or failure)
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-white flex items-center justify-center p-8">
		<div className="w-full max-w-md">
			<div className="text-center mb-8">
			<h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>
			<p className="text-sm text-gray-500">Log in to your account</p>
			</div>

			<form onSubmit={handleLogin} className="space-y-5">
			<div>
				<label htmlFor="email" className="block text-sm text-gray-700 mb-2">
				Email
				</label>
				<input
					type="email"
					id="email"
					placeholder="you@company.com"
					value={email}								// connect to state
					onChange={(e) => setEmail(e.target.value)}	//Update state on change
					className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
						errors.email ? 'border-red-500' : 'border-grey-200'
					}`}
				/>
				{errors.email && (
					<p className="text-red-500 text-sm mt-1">{errors.email}</p>
				)}
			</div>

			<div>
					<label htmlFor="password" className="block text-sm text-gray-700 mb-2">
					Password
					</label>
					<input
					type="password"
					id="password"
					placeholder="Enter your password"
					value={password}								// connect to state
					onChange={(e) => setPassword(e.target.value)}	//Update state on change
					className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
						errors.password ? 'border-red-500' : 'border-gray-200'
					}`}
				/>
				{!errors.password && (
					<p className="text-xs text-gray-400 mt-1.5">At least 8 characters</p>
				)}
				{errors.password && (
					<p className="text-red-500 text-sm mt-1">{errors.password}</p>
				)}
			</div>

			<button
				type="submit"
				disabled={isLoading} // Disable while loading
				className={`w-full px-6 py-3 text-sm text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-colors ${
					isLoading
						? 'bg-gray-400 cursor-not-allowed'	// Gray when loading
						: 'bg-cyan-600 hover:bg-cyan-700' // Normal colors
				}`}
			>
				{isLoading ? "Logging in..." : "Log in"} {/* ← Change text */}
			</button>

			<div className="text-center space-y-2">
				<button
				type="button"
				onClick={() => navigate("/welcome")}
				className="w-full text-sm text-gray-500 hover:text-gray-700"
				>
				Forgot password?
				</button>
				<p className="text-sm text-gray-500">
				Don't have an account?{" "}
				<button
					type="button"
					onClick={() => navigate("/signup")}
					className="text-cyan-600 hover:text-cyan-700"
				>
					Sign up
				</button>
				</p>
			</div>
			</form>
		</div>
		</div>
	);
}
