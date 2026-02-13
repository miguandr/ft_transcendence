import type { ReactNode } from "react";

interface EmptyStateProps {
	icon: ReactNode;
	title: string;
	description?: string;
	action?: ReactNode; // Optional button or action
	variant?: "success" | "info" | "warning";
	className?: string;
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	variant = "info",
	className = "",
}: EmptyStateProps) {
	const variantStyles = {
		success: {
			bg: "bg-emerald-50/50",
			border: "border-emerald-100",
			iconBg: "bg-emerald-100",
		},
		info: {
			bg: "bg-cyan-50/50",
			border: "border-cyan-100",
			iconBg: "bg-cyan-100",
		},
		warning: {
			bg: "bg-amber-50/50",
			border: "border-amber-100",
			iconBg: "bg-amber-100",
		},
	};

	const styles = variantStyles[variant];

	return (
		<div className={`${styles.bg} rounded-2xl p-8 border ${styles.border} ${className}`}>
			<div className="flex flex-col items-center text-center">
				<div
					className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mb-4`}
				>
					{icon}
				</div>
				<h3 className="text-base text-gray-900 mb-2">{title}</h3>
				{description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
				{action && <div className="mt-2">{action}</div>}
			</div>
		</div>
	);
}
