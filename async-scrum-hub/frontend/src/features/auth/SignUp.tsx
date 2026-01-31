import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../services/api";
import { Button, Input, Label, HintText, ErrorText, PageContainer } from "../../components/custom";

export function SignUp() {
	const navigate = useNavigate(); // Hook to programmatically navigate between pages
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<{
		// error(getter/read) setErrors(setter/write)
		name?: string;
		email?: string;
		password?: string;
		confirmPassword?: string;
	}>({});
	const [isLoading, setIsLoading] = useState(false);

	const validateForm = (): boolean => {
		const newErrors: {
			name?: string;
			email?: string;
			password?: string;
			confirmPassword?: string;
		} = {};

		//Validate name
		if (!formData.name.trim()) {
			// trim() removes whitespaces
			newErrors.name = "Name is required";
		}

		//Validate email
		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Email is invalid";
		}

		//Validate password
		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		}

		//Validate password match
		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.confirmPassword !== formData.password) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		//Return true if no errors
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		//Validate form
		if (!validateForm()) {
			return;
		}

		//Start loading
		setIsLoading(true);
		setErrors({}); // clear any previous errors

		try {
			//Call API (only sends name, email and password (not confirmation password) to database via API.
			const response = await signup({
				name: formData.name,
				email: formData.email,
				password: formData.password,
			});

			console.log("Sign up successful!", response);

			//Navigate to role selection if sign up was successful
			navigate("/team-setup");
		} catch (error: any) {
			//Handle API errors
			console.error("Sign up failed:", error);

			//Check for our API error format using optional chaining
			if (error?.error?.code === "USER_EXISTS") {
				// Only runs if error.error.code exists AND equals "USER_EXISTS"
				setErrors({ email: "An account with this email already exists" });
			} else if (error?.error?.code === "INVALID_INPUT") {
				// Only runs if error.error.code exists AND equals "INVALID_EMAIL"
				setErrors({ email: "Email format is invalid" });
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
			// Stop loading (runs whether success or failure)
			setIsLoading(false);
		}
	};

	return (
		<PageContainer>
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>
					<p className="text-sm text-gray-500">Create your account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<Label htmlFor="name">Name</Label>
						<Input
							type="text"
							id="name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="Enter your name"
							hasError={!!errors.name}
						/>
						{errors.name && <ErrorText>{errors.name}</ErrorText>}
					</div>

					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							type="text"
							id="email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							placeholder="you@company.com"
							hasError={!!errors.email}
						/>
						{errors.email && <ErrorText>{errors.email}</ErrorText>}
					</div>

					<div>
						<Label htmlFor="password">Password</Label>
						<Input
							type="password"
							id="password"
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							placeholder="Create a password"
							hasError={!!errors.password}
						/>
						{!errors.password && <HintText>At least 8 characters</HintText>}
						{errors.password && <ErrorText>{errors.password}</ErrorText>}
					</div>

					<div>
						<Label htmlFor="confirmPassword">Confirm password</Label>
						<Input
							type="password"
							id="confirmPassword"
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData({ ...formData, confirmPassword: e.target.value })
							}
							placeholder="Confirm your password"
							hasError={!!errors.confirmPassword}
						/>
						{errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
					</div>

					<Button
						type="submit"
						variant="primary"
						isLoading={isLoading}
						className="w-full"
					>
						Create account
					</Button>

					<p className="text-center text-sm text-gray-500">
						Already have an account?{" "}
						<Button type="button" variant="text" onClick={() => navigate("/login")}>
							Log in
						</Button>
					</p>
				</form>
			</div>
		</PageContainer>
	);
}
