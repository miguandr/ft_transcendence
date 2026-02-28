import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, updateUser, uploadAvatar, inviteMember } from "../../../services/api";
import { formatScrumRole } from "../../../utils/formatters";
import type { User } from "../../../services/api";
type APIError = {
	error?: { code?: string; message?: string };
	detail?: Array<{ msg: string }>;
};

export function useTopBar() {
	//View/UI states
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [expandedSection, setExpandedSection] = useState<string | null>(null);
	const [inviteSent, setInviteSent] = useState(false);
	//Auth states
	const [orgId, setOrgId] = useState<string | null>(null);
	const [errors, setErrors] = useState<{ invite?: string; avatar?: string; user?: string }>({});
	//Data states
	const [currentUser, setCurrentUser] = useState<User | null>(null);
	//Form states
	const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
	const [isEditingProfile, setIsEditingProfile] = useState(false);
	const [editFormData, setEditFormData] = useState<{ name: string; email: string } | null>(null);
	const [inviteFormData, setInviteFormData] = useState({
		name: "",
		email: "",
	});
	//Communication states
	const [isSaving, setIsSaving] = useState(false);
	const [isInviting, setIsInviting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	//Routing state
	const navigate = useNavigate();
	//Derived states
	const isAdmin = currentUser?.org_role === "admin";
	//Derived data
	const showImageAvatar = previewAvatar || currentUser?.avatar_url || "";
	const formattedScrumRole = currentUser?.scrum_role
		? formatScrumRole(currentUser.scrum_role)
		: "";
	//Derived UI logic
	const showDefaultAvatar = Boolean(previewAvatar || currentUser?.avatar_url);
	const canSaveProfile = Boolean(editFormData?.name.trim() && editFormData.email.trim());
	const canSendInvite = Boolean(inviteFormData.name.trim() && inviteFormData.email.trim());

	const fetchUser = async () => {
		setErrors({});

		try {
			const user = await getCurrentUser();
			setCurrentUser(user);
			setOrgId(user.organization_id);
		} catch (error: unknown) {
			console.error("API call failed:", error);

			const apiError = error as APIError;
			if (apiError.detail) {
				setErrors({ user: apiError.detail[0]?.msg ?? "Validation error" });
			} else if (apiError.error?.code === "UNAUTHORIZED") {
				setErrors({ user: "Authentication required" });
			} else {
				setErrors({ user: "Something went wrong" });
			}
		}
	};

	useEffect(() => {
		fetchUser();
	}, []);

	//Figma mock
	const toggleSection = (section: string) => {
		if (expandedSection === section) {
			setExpandedSection(null);
			setIsEditingProfile(false);
		} else {
			setExpandedSection(section);
			setIsEditingProfile(false);
		}
	};

	//Double check
	const startEditingProfile = () => {
		if (currentUser) {
			// "Snapshot" the truth into the draft ONLY when the user clicks Edit
			setEditFormData({
				name: currentUser.name,
				email: currentUser.email,
			});
		}
	};

	const handleSaveProfile = async () => {
		if (!editFormData) return;
		setIsSaving(true);
		try {
			const updatedFields = await updateUser({
				name: editFormData.name,
				email: editFormData.email,
			});

			//Replaces the user profile with the new information
			setCurrentUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
			setIsEditingProfile(false);
			setExpandedSection(null);
		} catch (error) {
			console.error("Failed to save profile", error);

			const apiError = error as APIError;
			if (apiError.error?.code === "INVALID_INPUT") {
				setErrors({ user: "Email is incorrect" });
			} else if (apiError.error?.code === "UNAUTHORIZED") {
				setErrors({ user: "Authentication required" });
			} else {
				setErrors({ user: "Something went wrong" });
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		//Step 1: instant local preview
		const reader = new FileReader();
		reader.onload = (event) => {
			setPreviewAvatar(event.target?.result as string);
		};
		reader.readAsDataURL(file);

		//Step 2: send to API
		setIsUploading(true);
		try {
			const response = await uploadAvatar({ file });

			//Upadate the SSOT (currentUser)
			setCurrentUser((prev) => (prev ? { ...prev, avatar_url: response.avatar_url } : prev));
			//Clear temporary preview
			setPreviewAvatar(null);
		} catch (error) {
			console.error("Failed to upload avatar:", error);

			// Type assertion for API error format
			const apiError = error as APIError;
			if (apiError.error?.code === "INVALID_TYPE_FILE") {
				setErrors({ avatar: "Only JPEG, PNG, GIF, and WebP images are allowed" });
			} else if (apiError.error?.code === "FILE_TOO_LARGE") {
				setErrors({ avatar: "File size exceeds the maximum limit of 5MB" });
			} else if (apiError.error?.code === "UNAUTHORIZED") {
				setErrors({ avatar: "Authentication required" });
			} else {
				setErrors({ avatar: "Something went wrong" });
			}
			setPreviewAvatar(null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleSendInvite = async () => {
		if (!orgId) return;

		setIsInviting(true);
		setErrors({});

		try {
			await inviteMember(orgId, {
				name: inviteFormData.name,
				email: inviteFormData.email,
			});
			setInviteSent(true);
			setTimeout(() => {
				setInviteSent(false);
				setInviteFormData({ name: "", email: "" });
				setExpandedSection(null);
			}, 2000);
		} catch (error: unknown) {
			console.error("Failed to send invite:", error);

			// Type assertion for API error format
			const apiError = error as APIError;
			if (apiError.error?.code === "INVALID_INPUT") {
				setErrors({ invite: "Email is incorrect" });
			} else if (apiError.error?.code === "UNAUTHORIZED") {
				setErrors({ invite: "Authentication required" });
			} else if (apiError.error?.code === "FORBIDDEN") {
				setErrors({ invite: "Only admin can perform this action" });
			} else if (apiError.error?.code === "NOT_FOUND") {
				setErrors({ invite: "Organization not found" });
			} else if (apiError.error?.code === "ALREADY_MEMBER") {
				setErrors({ invite: "User is already a member of the team" });
			} else {
				setErrors({ invite: "Something went wrong" });
			}
		} finally {
			setIsInviting(false);
		}
	};

	//Figma mock
	const handleLogout = () => {
		setIsDropdownOpen(false);
		navigate("/welcome");
	};

	return {
		// state
		isDropdownOpen,
		expandedSection,
		isEditingProfile,
		editFormData,
		inviteFormData,
		inviteSent,
		showImageAvatar,
		showDefaultAvatar,
		isAdmin,
		currentUser,
		errors,
		isSaving,
		isInviting,
		isUploading,
		formattedScrumRole,
		canSaveProfile,
		canSendInvite,

		// setters
		setIsDropdownOpen,
		setExpandedSection,
		setIsEditingProfile,
		setEditFormData,
		setInviteFormData,

		// handlers
		toggleSection,
		startEditingProfile,
		handleSaveProfile,
		handleAvatarUpload,
		handleSendInvite,
		handleLogout,
	};
}
