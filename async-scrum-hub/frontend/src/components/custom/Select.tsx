import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
	label?: string;
	error?: string;
	helperText?: string;
	options: Array<{ value: string | null; label: string }>;
	value?: string;
	onChange?: (e: { target: { value: string } }) => void;
	className?: string;
	id?: string;
	disabled?: boolean;
}

export function Select({
	label,
	error,
	helperText,
	options,
	value = "",
	onChange,
	className = "",
	id,
	disabled = false,
}: SelectProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const placeholder = options.find((o) => !o.value);
	const listOptions = options.filter((o) => !!o.value);
	const selected = listOptions.find((o) => o.value === value);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function handleSelect(val: string) {
		onChange?.({ target: { value: val } });
		setOpen(false);
	}

	return (
		<div className="w-full" ref={ref}>
			{label && (
				<label htmlFor={id} className="block text-sm text-gray-700 mb-2">
					{label}
				</label>
			)}
			<div className="relative">
				<button
					type="button"
					disabled={disabled}
					onClick={() => setOpen((prev) => !prev)}
					className={`w-full flex items-center justify-between px-3 py-2 bg-gray-50 border ${
						error ? "border-red-500" : "border-gray-200"
					} rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-100 focus:border-cyan-300 transition-colors text-sm text-left ${
						disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
					} ${className}`}
				>
					<span className={`truncate ${selected?.value ? "text-gray-900" : "text-gray-400"}`}>
						{selected?.label ?? placeholder?.label ?? "Select..."}
					</span>
					<ChevronDown
						className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
					/>
				</button>

				{open && (
					<ul className="absolute z-50 mt-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
						{listOptions.map((option) => (
							<li
								key={option.value ?? ""}
								onClick={() => handleSelect(option.value ?? "")}
								className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
									option.value === value ? "bg-cyan-50 text-cyan-600" : "text-gray-700"
								}`}
							>
								{option.label}
							</li>
						))}
					</ul>
				)}
			</div>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
			{!error && helperText && <p className="text-xs text-gray-400 mt-1.5">{helperText}</p>}
		</div>
	);
}
