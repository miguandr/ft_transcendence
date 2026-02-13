import { useState } from "react";
import { assignColorById, generateAvatar } from "../../utils/formatters";

interface AvatarProps {
	avatarUrl?: string | null; // Optional: URL to user's uploaded image
	name?: string; // Optional: auto-generate initials from full name
	initials?: string; // Optional: provide initials directly
	userId?: string; // Optional: auto-generate color from user ID
	color?: string; // Optional: override with explicit color
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function Avatar({
	avatarUrl,
	name,
	initials,
	userId,
	color,
	size = "md",
	className = "",
}: AvatarProps) {
	const [imageError, setImageError] = useState(false);

	// Priority: provided initials > generated from name > fallback
	const displayInitials = initials || (name ? generateAvatar(name) : "??");

	// Priority: explicit color > userId-based color > default
	const avatarColor =
		color || (userId ? assignColorById(userId) : "from-emerald-200 to-green-300");

	const sizeStyles = {
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-12 h-12 text-base",
	};

	// Show image if URL exists and hasn't errored
	const showImage = avatarUrl && !imageError;

	return (
		<div
			className={`rounded-full flex items-center justify-center shrink-0 overflow-hidden ${sizeStyles[size]} ${className} ${!showImage ? `bg-gradient-to-br ${avatarColor}` : ""}`}
		>
			{showImage ? (
				<img
					src={avatarUrl}
					alt={name || "User avatar"}
					className="w-full h-full object-cover"
					onError={() => setImageError(true)}
				/>
			) : (
				<span className="text-gray-800 font-medium">{displayInitials}</span>
			)}
		</div>
	);
}
