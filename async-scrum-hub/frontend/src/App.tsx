import { AuthProvider } from "./routes/AuthProvider";
import { RequireAuth } from "./routes/RequireAuth";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/layout/SideBar/Sidebar";
import { TopBar } from "./components/layout/TopBar/TopBar";
import { WelcomeAnimation } from "./features/auth/WelcomeAnimation";
import { Welcome } from "./features/auth/Welcome";
import { Login } from "./features/auth/Login";
import { SignUp } from "./features/auth/SignUp";
import { TeamSetup } from "./features/auth/TeamSetup";
import { Dashboard } from "./features/dashboard/Dashboard";
import { SprintBoard } from "./features/sprint_board/SprintBoard";
import { AsyncStandup } from "./features/standups/AsyncStandup";
//import { AsyncStandupEmpty } from "./features/standups/AsyncStandupEmpty";
import { Blockers } from "./features/blockers/Blockers";
import { Analytics } from "./features/analytics/Analytics";
import { Info } from "./features/info/Info";

function AuthenticatedLayout() {
	return (
		<RequireAuth>
			<div className="flex h-screen bg-gray-50">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-hidden">
					<TopBar />
					<main className="flex-1 overflow-y-auto">
						<Routes>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/board" element={<SprintBoard />} />
							<Route path="/standup" element={<AsyncStandup />} />
							<Route path="/blockers" element={<Blockers />} />
							<Route path="/analytics" element={<Analytics />} />
							<Route path="/info" element={<Info />} />
						</Routes>
					</main>
				</div>
			</div>
		</RequireAuth>
	);
}

function AppLayout() {
	return (
		<Routes>
			<Route path="/" element={<WelcomeAnimation />} />
			<Route path="/welcome" element={<Welcome />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<SignUp />} />
			<Route
				path="/team-setup"
				element={
					<RequireAuth>
						<TeamSetup />
					</RequireAuth>
				}
			/>
			<Route path="/*" element={<AuthenticatedLayout />} />
		</Routes>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AppLayout />
			</AuthProvider>
		</BrowserRouter>
	);
}
