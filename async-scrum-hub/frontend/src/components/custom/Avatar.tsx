interface AvatarProps {
	initials: string;
	color?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function Avatar({ initials, color = "from-emerald-200 to-green-300", size = "md", className = "" }: AvatarProps) {
	const sizeStyles = {
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-12 h-12 text-base",
	};

	return (
		<div
			className={`rounded-full bg-linear-to-br ${color} flex items-center justify-center shrink-0 ${sizeStyles[size]} ${className}`}
		>
			<span className="text-gray-800 font-medium">{initials}</span>
		</div>
	);
}
