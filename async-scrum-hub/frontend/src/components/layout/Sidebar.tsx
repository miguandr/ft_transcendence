import {
	LayoutDashboard,
	KanbanSquare,
	MessageSquare,
	AlertCircle,
	BarChart3,
	Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const navItems = [
	{ path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
	{ path: "/board", icon: KanbanSquare, label: "Sprint Board" },
	{ path: "/standup", icon: MessageSquare, label: "Async Standup" },
	{ path: "/blockers", icon: AlertCircle, label: "Blockers" },
	{ path: "/analytics", icon: BarChart3, label: "Analytics" },
	{ path: "/info", icon: Users, label: "Info" },
];

export function Sidebar() {
	const location = useLocation();
	const [showPrivacyModal, setShowPrivacyModal] = useState(false);
	const [showTermsModal, setShowTermsModal] = useState(false);

	return (
		<>
			<aside className="w-64 border-r border-gray-100 bg-white h-screen flex flex-col">
				<div className="p-6 border-b border-gray-100">
					<h1 className="text-xl tracking-tight text-gray-900">ScrumHub</h1>
					<p className="text-sm text-gray-500 mt-1">Async collaboration</p>
				</div>

				<nav className="flex-1 p-4 space-y-1">
					{navItems.map((item) => {
						const isActive = location.pathname === item.path;
						const Icon = item.icon;

						return (
							<Link
								key={item.path}
								to={item.path}
								className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 ${
									isActive
										? "bg-cyan-50 text-cyan-700"
										: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
								}`}
							>
								<Icon className="w-5 h-5" />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>

				<div className="p-4 border-t border-gray-100">
					<div className="px-4 flex flex-col gap-2">
						<button
							onClick={() => setShowPrivacyModal(true)}
							className="text-xs text-gray-500 hover:text-gray-700 text-left transition-colors"
						>
							Privacy Policy
						</button>
						<button
							onClick={() => setShowTermsModal(true)}
							className="text-xs text-gray-500 hover:text-gray-700 text-left transition-colors"
						>
							Terms of Service
						</button>
					</div>
				</div>
			</aside>

			{/* Privacy Policy Modal */}
			{showPrivacyModal && (
				<>
					<div
						className="fixed inset-0 bg-black/20 z-40"
						onClick={() => setShowPrivacyModal(false)}
					/>
					<div className="fixed inset-0 z-50 flex items-center justify-center p-8">
						<div className="bg-white rounded-2xl border border-gray-100 shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
							<div className="p-6 border-b border-gray-100 flex items-center justify-between">
								<h2 className="text-xl text-gray-900">Privacy Policy</h2>
								<button
									onClick={() => setShowPrivacyModal(false)}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<span className="text-gray-400 text-xl leading-none">×</span>
								</button>
							</div>
							<div className="p-6 overflow-y-auto flex-1">
								<div className="space-y-4 text-sm text-gray-600">
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											1. Information We Collect
										</h3>
										<p>
											We collect information you provide directly to us when
											you create an account, use our services, or communicate
											with us. This includes your name, email address, team
											information, and any content you create within the
											platform.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											2. How We Use Your Information
										</h3>
										<p>
											We use the information we collect to provide, maintain,
											and improve our services, communicate with you, and
											ensure the security of our platform. We do not sell your
											personal information to third parties.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											3. Data Security
										</h3>
										<p>
											We implement appropriate technical and organizational
											measures to protect your personal information against
											unauthorized access, alteration, disclosure, or
											destruction. However, no method of transmission over the
											Internet is 100% secure.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											4. Data Retention
										</h3>
										<p>
											We retain your information for as long as your account
											is active or as needed to provide you services. You may
											request deletion of your account and associated data at
											any time.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											5. Your Rights
										</h3>
										<p>
											You have the right to access, update, or delete your
											personal information. You can do this through your
											account settings or by contacting our support team.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											6. Changes to This Policy
										</h3>
										<p>
											We may update this Privacy Policy from time to time. We
											will notify you of any changes by posting the new policy
											on this page and updating the "Last Updated" date.
										</p>
									</div>
									<p className="text-xs text-gray-400 mt-6">
										Last updated: February 2, 2026
									</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Terms of Service Modal */}
			{showTermsModal && (
				<>
					<div
						className="fixed inset-0 bg-black/20 z-40"
						onClick={() => setShowTermsModal(false)}
					/>
					<div className="fixed inset-0 z-50 flex items-center justify-center p-8">
						<div className="bg-white rounded-2xl border border-gray-100 shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
							<div className="p-6 border-b border-gray-100 flex items-center justify-between">
								<h2 className="text-xl text-gray-900">Terms of Service</h2>
								<button
									onClick={() => setShowTermsModal(false)}
									className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									<span className="text-gray-400 text-xl leading-none">×</span>
								</button>
							</div>
							<div className="p-6 overflow-y-auto flex-1">
								<div className="space-y-4 text-sm text-gray-600">
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											1. Acceptance of Terms
										</h3>
										<p>
											By accessing and using ScrumHub, you accept and agree to
											be bound by the terms and provisions of this agreement.
											If you do not agree to these terms, please do not use
											our service.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											2. Use of Service
										</h3>
										<p>
											You agree to use ScrumHub only for lawful purposes and
											in accordance with these Terms. You are responsible for
											maintaining the confidentiality of your account
											credentials and for all activities that occur under your
											account.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											3. User Content
										</h3>
										<p>
											You retain all rights to any content you submit, post,
											or display on or through the service. By submitting
											content, you grant us a license to use, modify, and
											display that content as necessary to provide the
											service.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											4. Prohibited Activities
										</h3>
										<p>
											You may not use the service to transmit viruses, engage
											in any activity that interferes with the service, or
											violate any applicable laws or regulations. We reserve
											the right to suspend or terminate accounts that violate
											these terms.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											5. Service Availability
										</h3>
										<p>
											We strive to provide continuous service availability,
											but we do not guarantee that the service will be
											uninterrupted or error-free. We may modify or
											discontinue the service at any time.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											6. Limitation of Liability
										</h3>
										<p>
											ScrumHub shall not be liable for any indirect,
											incidental, special, consequential, or punitive damages
											resulting from your use of or inability to use the
											service.
										</p>
									</div>
									<div>
										<h3 className="text-base text-gray-900 mb-2">
											7. Changes to Terms
										</h3>
										<p>
											We reserve the right to modify these terms at any time.
											We will notify users of any material changes via email
											or through the service.
										</p>
									</div>
									<p className="text-xs text-gray-400 mt-6">
										Last updated: February 2, 2026
									</p>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
