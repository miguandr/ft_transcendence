import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

interface TaskCardProps {
	title: string;
	priority: "high" | "medium" | "low";
	assignee: string;
	assigneeInitials: string;
	avatarColor?: string;
	borderColor?: string;
	onClick?: () => void;
	className?: string;
}

export function TaskCard({
	title,
	priority,
	assignee,
	assigneeInitials,
	avatarColor = "from-cyan-200 to-blue-300",
	borderColor = "border-l-cyan-400",
	onClick,
	className = "",
}: TaskCardProps) {
	const priorityVariants = {
		high: "danger" as const,
		medium: "warning" as const,
		low: "default" as const,
	};

	return (
		<div
			className={`bg-white rounded-xl p-4 border border-gray-100 border-l-4 ${borderColor} hover:shadow-sm transition-shadow cursor-pointer ${className}`}
			onClick={onClick}
		>
			<div className="flex items-start justify-between gap-2 mb-3">
				<span className="text-sm text-gray-900">{title}</span>
				<Badge variant={priorityVariants[priority]}>{priority}</Badge>
			</div>
			<div className="flex items-center gap-2">
				<Avatar initials={assigneeInitials} color={avatarColor} size="sm" />
				<span className="text-xs text-gray-400">{assignee}</span>
			</div>
		</div>
	);
}
