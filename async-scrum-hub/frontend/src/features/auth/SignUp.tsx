import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
	<div className="min-h-screen bg-white flex items-center justify-center p-8">
	  <div className="max-w-md w-full">
		<div className="text-center mb-8">
		  <h1 className="text-3xl text-gray-900 mb-2">ScrumHub</h1>
		  <p className="text-sm text-gray-500">Create your account</p>
		</div>

		<form onSubmit={handleSubmit} className="space-y-5">
		  <div>
			<label htmlFor="name" className="block text-sm text-gray-700 mb-2">
			  Name
			</label>
			<input
			  type="text"
			  id="name"
			  value={formData.name}
			  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
			  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
			  placeholder="Enter your name"
			  required
			/>
		  </div>

		  <div>
			<label htmlFor="email" className="block text-sm text-gray-700 mb-2">
			  Email
			</label>
			<input
			  type="email"
			  id="email"
			  value={formData.email}
			  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
			  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
			  placeholder="you@company.com"
			  required
			/>
		  </div>

		  <div>
			<label htmlFor="password" className="block text-sm text-gray-700 mb-2">
			  Password
			</label>
			<input
			  type="password"
			  id="password"
			  value={formData.password}
			  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
			  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
			  placeholder="Create a password"
			  required
			/>
			<p className="text-xs text-gray-400 mt-1.5">At least 8 characters</p>
		  </div>

		  <div>
			<label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-2">
			  Confirm password
			</label>
			<input
			  type="password"
			  id="confirmPassword"
			  value={formData.confirmPassword}
			  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
			  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
			  placeholder="Confirm your password"
			  required
			/>
		  </div>

		  <button
			type="submit"
			className="w-full px-6 py-3 text-sm text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-colors"
		  >
			Create account
		  </button>

		  <p className="text-center text-sm text-gray-500">
			Already have an account?{" "}
			<button
			  type="button"
			  onClick={() => navigate("/login")}
			  className="text-cyan-600 hover:text-cyan-700"
			>
			  Log in
			</button>
		  </p>
		</form>
	  </div>
	</div>
  );
}
