import { Avatar } from "./Avatar";

interface UpdateItemProps {
	user: string;
	avatar: string;
	time: string;
	text: string;
	color: string;
	className?: string;
}

export function UpdateItem({ user, avatar, time, text, color, className = "" }: UpdateItemProps) {
	return (
		<div
			className={`flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0 ${className}`}
		>
			<Avatar initials={avatar} color={color} />
			<div className="flex-1">
				<div className="flex items-center gap-2 mb-1">
					<span className="text-sm text-gray-900 font-medium">{user}</span>
					<span className="text-xs text-gray-400">{time}</span>
				</div>
				<p className="text-sm text-gray-600">{text}</p>
			</div>
		</div>
	);
}
