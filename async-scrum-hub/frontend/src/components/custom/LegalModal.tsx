import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface LegalModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	content: string;
}

export function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
	if (!isOpen) return null;

	return (
		<>
			<div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
			<div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
				<div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto">
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
						<h2 className="text-2xl text-gray-900">{title}</h2>
						<button className="p-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={onClose}>
							<X className="w-5 h-5 text-gray-400" />
						</button>
					</div>
					<div className="overflow-y-auto flex-1 px-6 py-5">
						<div className="prose prose-sm prose-headings:text-base">
							<ReactMarkdown>{content}</ReactMarkdown>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
