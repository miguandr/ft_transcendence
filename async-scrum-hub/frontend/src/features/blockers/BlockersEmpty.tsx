import { CheckCircle2 } from "lucide-react";

export function BlockersEmpty() {
  return (
	<div className="p-8">
	  <div className="mb-6">
		<h2 className="text-3xl text-gray-900 mb-1">Blockers</h2>
		<p className="text-sm text-gray-500">Issues that need attention</p>
	  </div>

	  <div className="max-w-2xl mx-auto mt-24 text-center">
		<div className="inline-flex p-6 bg-emerald-50 rounded-3xl mb-6">
		  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
		</div>

		<h3 className="text-xl text-gray-900 mb-2">🎉 No active blockers</h3>
		<p className="text-sm text-gray-500 mb-8">Your team is unblocked and moving forward.</p>

		<button className="px-6 py-3 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
		  Create blocker
		</button>
	  </div>
	</div>
  );
}
