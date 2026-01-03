import { useNavigate } from "react-router-dom";

export function Login()
{
	const navigate = useNavigate();

	const handleLogin = (e: React.FormEvent) => {
		e.preventDefault();
		navigate("/");
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
				className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label htmlFor="password" className="block text-sm text-gray-700 mb-2">
				Password
				</label>
				<input
				type="password"
				id="password"
				placeholder="Enter your password"
				className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
				/>
			</div>

			<button
				type="submit"
				className="w-full px-6 py-3 text-sm text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-colors"
			>
				Log in
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
