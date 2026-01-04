import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Label, HintText, PageContainer } from "../../components/custom";

export function SignUp() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// In a real app, this would create the account
		navigate("/role-selection");
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
					required
				/>
			</div>

			<div>
				<Label htmlFor="email">Email</Label>
				<Input
					type="text"
					id="email"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					placeholder="you@company.com"
					required
				/>
			</div>

			<div>
				<Label htmlFor="password">Email</Label>
				<Input
					type="password"
					id="password"
					value={formData.password}
					onChange={(e) => setFormData({ ...formData, password: e.target.value })}
					placeholder="Create a password"
					required
				/>
				<HintText>At least 8 characters</HintText>
			</div>

			<div>
				<Label htmlFor="confirmPassword">Confirm password</Label>
				<Input
					type="password"
					id="confirmPassword"
					value={formData.confirmPassword}
					onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
					placeholder="Confirm your password"
					required
				/>
			</div>

			<Button type="submit" variant="primary" className="w-full">
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
