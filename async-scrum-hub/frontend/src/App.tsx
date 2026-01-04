import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { Welcome } from "./features/auth/Welcome";
import { Login } from "./features/auth/Login";
import { SignUp } from "./features/auth/SignUp";
import { RoleSelection } from "./features/auth/RoleSelection";
import { TeamCreation } from "./features/auth/TeamCreation";
import { TeamJoin } from "./features/auth/TeamJoin";
import { Dashboard } from "./features/dashboard/Dashboard";
import { SprintBoard } from "./features/sprint_board/SprintBoard";
import { AsyncStandup } from "./features/standups/AsyncStandup";
import { AsyncStandupEmpty } from "./features/standups/AsyncStandupEmpty";
import { Blockers } from "./features/blockers/Blockers";
import { BlockersEmpty } from "./features/blockers/BlockersEmpty";
import { Analytics } from "./features/analytics/Analytics";
import { TeamHealth } from "./features/team_health/TeamHealth";

function AppLayout()
{
	const location = useLocation();
	const preAuthPaths = ["/welcome", "/login", "/signup", "/role-selection", "/team-creation", "/team-join"];
	const isPreAuth = preAuthPaths.includes(location.pathname);

	// User is on /login
	if (isPreAuth)
	{
		return (
		<Routes>
			<Route path="/welcome" element={<Welcome />} />
			<Route path="/login" element={<Login />} />
			<Route path="/signup" element={<SignUp />} />
			<Route path="/role-selection" element={<RoleSelection />} />
			<Route path="/team-creation" element={<TeamCreation />} />
			<Route path="/team-join" element={<TeamJoin />} />
		</Routes>
		);
	}

	// User is on /dashboard
	return (
		<div className="flex h-screen bg-gray-50">
		<Sidebar />
		<div className="flex-1 flex flex-col overflow-hidden">
			<TopBar />
			<main className="flex-1 overflow-y-auto">
			<Routes>
				<Route path="/" element={<Dashboard />} />
				<Route path="/board" element={<SprintBoard />} />
				<Route path="/standup" element={<AsyncStandup />} />
				<Route path="/standup-empty" element={<AsyncStandupEmpty />} />
				<Route path="/blockers" element={<Blockers />} />
				<Route path="/blockers-empty" element={<BlockersEmpty />} />
				<Route path="/analytics" element={<Analytics />} />
				<Route path="/team-health" element={<TeamHealth />} />
			</Routes>
			</main>
		</div>
		</div>
	);
}

export default function App() {
  return (
	<BrowserRouter>
	  <Routes>
		<Route path="/welcome" element={<Welcome />} />
		<Route path="/login" element={<Login />} />
		<Route path="/signup" element={<SignUp />} />
		<Route path="/role-selection" element={<RoleSelection />} />
		<Route path="/team-creation" element={<TeamCreation />} />
		<Route path="/team-join" element={<TeamJoin />} />
		<Route path="/*" element={<AppLayout />} />
	  </Routes>
	</BrowserRouter>
  );
}
