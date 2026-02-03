import { Bell, Search, LogOut, User, Image, UserPlus, ChevronRight, ChevronDown, Upload, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
	name: "Sarah Chen",
	email: "sarah@productteam.com",
	role: "Product Owner",
	team: "Product Squad",
  });
  const [editFormData, setEditFormData] = useState({
	name: profileData.name,
	email: profileData.email,
  });
  const [inviteFormData, setInviteFormData] = useState({
	name: "",
	email: "",
  });
  const [inviteSent, setInviteSent] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);

  // Mock: check if user is admin/team creator
  const isAdmin = true;

  const navigate = useNavigate();

  const handleLogout = () => {
	setIsDropdownOpen(false);
	navigate("/welcome");
  };

  const toggleSection = (section: string) => {
	if (expandedSection === section) {
	  setExpandedSection(null);
	  setIsEditingProfile(false);
	} else {
	  setExpandedSection(section);
	  setIsEditingProfile(false);
	}
  };

  const handleSaveProfile = () => {
	setProfileData({
	  ...profileData,
	  name: editFormData.name,
	  email: editFormData.email,
	});
	setIsEditingProfile(false);
	setExpandedSection(null);
  };

  const handleSendInvite = () => {
	// Mock: send invitation
	setInviteSent(true);
	setTimeout(() => {
	  setInviteSent(false);
	  setInviteFormData({ name: "", email: "" });
	  setExpandedSection(null);
	}, 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
	const file = e.target.files?.[0];
	if (file) {
	  const reader = new FileReader();
	  reader.onload = (event) => {
		setUploadedAvatar(event.target?.result as string);
	  };
	  reader.readAsDataURL(file);
	}
  };

  return (
	<header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6">
	  <div className="flex items-center flex-1 max-w-xl">
		<div className="relative w-full">
		  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
		  <input
			type="text"
			placeholder="Search tasks, updates..."
			className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-cyan-100"
		  />
		</div>
	  </div>

	  <div className="flex items-center gap-4">
		<button className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors">
		  <Bell className="w-5 h-5 text-gray-600" />
		  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full"></span>
		</button>

		<div className="relative pl-4 border-l border-gray-100">
		  <button
			onClick={() => setIsDropdownOpen(!isDropdownOpen)}
			className="flex items-center gap-3 hover:opacity-80 transition-opacity"
		  >
			<div className="text-right">
			  <p className="text-sm text-gray-900">{profileData.name}</p>
			  <p className="text-xs text-gray-500">Product Manager</p>
			</div>
			{uploadedAvatar ? (
			  <img
				src={uploadedAvatar}
				alt={profileData.name}
				className="w-10 h-10 rounded-full object-cover"
			  />
			) : (
			  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-200 to-blue-300 flex items-center justify-center">
				<span className="text-sm text-cyan-900">
				  {profileData.name.split(" ").map(n => n[0]).join("")}
				</span>
			  </div>
			)}
		  </button>

		  {isDropdownOpen && (
			<>
			  <div
				className="fixed inset-0 z-10"
				onClick={() => {
				  setIsDropdownOpen(false);
				  setExpandedSection(null);
				  setIsEditingProfile(false);
				}}
			  />
			  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden">
				{/* Profile */}
				<div className="border-b border-gray-100">
				  <button
					onClick={() => toggleSection("profile")}
					className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
				  >
					<div className="flex items-center gap-3">
					  <User className="w-4 h-4" />
					  <span>Profile</span>
					</div>
					{expandedSection === "profile" ? (
					  <ChevronDown className="w-4 h-4 text-gray-400" />
					) : (
					  <ChevronRight className="w-4 h-4 text-gray-400" />
					)}
				  </button>

				  {expandedSection === "profile" && (
					<div className="px-4 pb-4 bg-gray-50 space-y-3">
					  {!isEditingProfile ? (
						<>
						  <div>
							<p className="text-xs text-gray-500">Name</p>
							<p className="text-sm text-gray-900">{profileData.name}</p>
						  </div>
						  <div>
							<p className="text-xs text-gray-500">Email</p>
							<p className="text-sm text-gray-900">{profileData.email}</p>
						  </div>
						  <div>
							<p className="text-xs text-gray-500">Role</p>
							<p className="text-sm text-gray-900">{profileData.role}</p>
						  </div>
						  <div>
							<p className="text-xs text-gray-500">Team</p>
							<p className="text-sm text-gray-900">{profileData.team}</p>
						  </div>
						  <button
							onClick={() => {
							  setIsEditingProfile(true);
							  setEditFormData({
								name: profileData.name,
								email: profileData.email,
							  });
							}}
							className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						  >
							Edit profile
						  </button>
						</>
					  ) : (
						<>
						  <div>
							<label className="block text-xs text-gray-600 mb-1">Name</label>
							<input
							  type="text"
							  value={editFormData.name}
							  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
							  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
							/>
						  </div>
						  <div>
							<label className="block text-xs text-gray-600 mb-1">Email</label>
							<input
							  type="email"
							  value={editFormData.email}
							  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
							  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
							/>
						  </div>
						  <div className="flex gap-2">
							<button
							  onClick={handleSaveProfile}
							  className="flex-1 px-3 py-2 text-xs bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
							>
							  Save
							</button>
							<button
							  onClick={() => setIsEditingProfile(false)}
							  className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
							>
							  Cancel
							</button>
						  </div>
						</>
					  )}
					</div>
				  )}
				</div>

				{/* Avatar */}
				<div className="border-b border-gray-100">
				  <button
					onClick={() => toggleSection("avatar")}
					className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
				  >
					<div className="flex items-center gap-3">
					  <Image className="w-4 h-4" />
					  <span>Avatar</span>
					</div>
					{expandedSection === "avatar" ? (
					  <ChevronDown className="w-4 h-4 text-gray-400" />
					) : (
					  <ChevronRight className="w-4 h-4 text-gray-400" />
					)}
				  </button>

				  {expandedSection === "avatar" && (
					<div className="px-4 pb-4 bg-gray-50 space-y-3">
					  <div className="flex justify-center">
						{uploadedAvatar ? (
						  <img
							src={uploadedAvatar}
							alt={profileData.name}
							className="w-20 h-20 rounded-full object-cover"
						  />
						) : (
						  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200 to-blue-300 flex items-center justify-center">
							<span className="text-xl text-cyan-900">
							  {profileData.name.split(" ").map(n => n[0]).join("")}
							</span>
						  </div>
						)}
					  </div>
					  <label className="block">
						<input
						  type="file"
						  accept="image/png,image/jpeg"
						  onChange={handleAvatarUpload}
						  className="hidden"
						/>
						<div className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center cursor-pointer flex items-center justify-center gap-2">
						  <Upload className="w-3 h-3" />
						  <span>Upload image</span>
						</div>
					  </label>
					  <p className="text-xs text-gray-500 text-center">PNG/JPG up to 5 MB</p>
					</div>
				  )}
				</div>

				{/* Invite Users (admin only) */}
				{isAdmin && (
				  <div className="border-b border-gray-100">
					<button
					  onClick={() => toggleSection("invite")}
					  className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
					>
					  <div className="flex items-center gap-3">
						<UserPlus className="w-4 h-4" />
						<span>Invite Users</span>
					  </div>
					  {expandedSection === "invite" ? (
						<ChevronDown className="w-4 h-4 text-gray-400" />
					  ) : (
						<ChevronRight className="w-4 h-4 text-gray-400" />
					  )}
					</button>

					{expandedSection === "invite" && (
					  <div className="px-4 pb-4 bg-gray-50 space-y-3">
						{!inviteSent ? (
						  <>
							<div>
							  <label className="block text-xs text-gray-600 mb-1">Full name</label>
							  <input
								type="text"
								value={inviteFormData.name}
								onChange={(e) => setInviteFormData({ ...inviteFormData, name: e.target.value })}
								className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
								placeholder="Enter name"
							  />
							</div>
							<div>
							  <label className="block text-xs text-gray-600 mb-1">Email</label>
							  <input
								type="email"
								value={inviteFormData.email}
								onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
								className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
								placeholder="Enter email"
							  />
							</div>
							<p className="text-xs text-gray-500">Invitation link will be emailed.</p>
							<button
							  onClick={handleSendInvite}
							  disabled={!inviteFormData.name || !inviteFormData.email}
							  className={`w-full px-3 py-2 text-xs rounded-lg transition-colors ${
								inviteFormData.name && inviteFormData.email
								  ? "bg-cyan-600 text-white hover:bg-cyan-700"
								  : "bg-gray-200 text-gray-400 cursor-not-allowed"
							  }`}
							>
							  Send invitation
							</button>
						  </>
						) : (
						  <div className="py-2 text-center">
							<p className="text-sm text-emerald-600">✓ Invitation sent</p>
						  </div>
						)}
					  </div>
					)}
				  </div>
				)}

				{/* Logout */}
				<button
				  onClick={handleLogout}
				  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
				>
				  <LogOut className="w-4 h-4" />
				  <span>Log out</span>
				</button>
			  </div>
			</>
		  )}
		</div>
	  </div>
	</header>
  );
}
