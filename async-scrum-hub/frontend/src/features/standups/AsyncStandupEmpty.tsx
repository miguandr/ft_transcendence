import { MessageSquare } from "lucide-react";

export function AsyncStandupEmpty() {
  return (
	<div className="p-8">
	  <div className="mb-6">
		<h2 className="text-3xl text-gray-900 mb-1">Async Standup</h2>
		<p className="text-sm text-gray-500">Team updates • Updated today</p>
	  </div>

	  <div className="max-w-2xl mx-auto mt-24 text-center">
		<div className="inline-flex p-6 bg-gray-50 rounded-3xl mb-6">
		  <MessageSquare className="w-12 h-12 text-gray-400" />
		</div>
		
		<h3 className="text-xl text-gray-900 mb-2">No updates yet today.</h3>
		<p className="text-sm text-gray-500 mb-8">Post your standup to keep the team aligned.</p>

		<button className="px-6 py-3 text-sm text-white bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-colors">
		  Post standup
		</button>
	  </div>
	</div>
  );
}
