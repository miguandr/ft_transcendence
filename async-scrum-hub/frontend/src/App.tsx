import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
//import { WelcomeAnimation } from "./features/auth/WelcomeAnimation";
import { Welcome } from "./features/auth/Welcome";
import { Login } from "./features/auth/Login";
import { SignUp } from "./features/auth/SignUp";
import { TeamSetup } from "./features/auth/TeamSetup";
import { Dashboard } from "./features/dashboard/Dashboard";
import { SprintBoard } from "./features/sprint_board/SprintBoard";
import { AsyncStandup } from "./features/standups/AsyncStandup";
import { AsyncStandupEmpty } from "./features/standups/AsyncStandupEmpty";
import { Blockers } from "./features/blockers/Blockers";
import { Analytics } from "./features/analytics/Analytics";
import { Info } from "./features/info/Info";

function AppLayout() {
	const location = useLocation();
	const preAuthPaths = ["/welcome", "/login", "/signup", "/team-setup"];
	const isPreAuth = preAuthPaths.includes(location.pathname);

	// User is on auth pages (not logged in)
	if (isPreAuth) {
		return (
			<Routes>
				<Route path="/welcome" element={<Welcome />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/team-setup" element={<TeamSetup />} />
			</Routes>
		);
	}

	// User is logged in - show dashboard with sidebar/topbar
	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<TopBar />
				<main className="flex-1 overflow-y-auto">
					<Routes>
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/board" element={<SprintBoard />} />
						<Route path="/standup" element={<AsyncStandup />} />
						<Route path="/standup-empty" element={<AsyncStandupEmpty />} />
						<Route path="/blockers" element={<Blockers />} />
						<Route path="/analytics" element={<Analytics />} />
						<Route path="/info" element={<Info />} />
					</Routes>
				</main>
			</div>
		</div>
	);
}

export default function App() {
	return (
		<BrowserRouter>
			<AppLayout />
		</BrowserRouter>
	);
}
