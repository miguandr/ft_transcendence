interface MetricCardProps {
	label: string;
	value: string | number;
	trend?: string; // e.g., "↓ 12% from last sprint"
	trendType?: "positive" | "negative" | "neutral"; // Color of trend
	helperText?: string; // Small text at bottom
	className?: string;
}

export function MetricCard({
	label,
	value,
	trend,
	trendType = "neutral",
	helperText,
	className = "",
}: MetricCardProps) {
	const trendColors = {
		positive: "text-emerald-600",
		negative: "text-rose-600",
		neutral: "text-gray-500",
	};

	return (
		<div className={`bg-white rounded-2xl p-6 border border-gray-100 ${className}`}>
			<p className="text-sm text-gray-500 mb-2">{label}</p>
			<p className="text-3xl text-gray-900">{value}</p>
			{trend && <p className={`text-sm mt-1 ${trendColors[trendType]}`}>{trend}</p>}
			{helperText && <p className="text-xs text-gray-400 mt-2">{helperText}</p>}
		</div>
	);
}
