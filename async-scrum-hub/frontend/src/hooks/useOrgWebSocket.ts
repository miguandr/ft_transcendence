import { useEffect, useRef } from "react";

type WSMessage = { event: string; data: unknown };

export function useOrgWebSocket(
	orgId: string | null,
	onMessage: (msg: WSMessage) => void
) {
	const onMessageRef = useRef(onMessage);

	useEffect(() => {
		onMessageRef.current = onMessage;
	});

	useEffect(() => {
		if (!orgId) return;

		const token = localStorage.getItem("token");
		if (!token) return;

		const ws = new WebSocket(
			`ws://localhost:8000/ws/${orgId}?token=${token}`
		);

		ws.onmessage = (event) => {
			try {
				const msg: WSMessage = JSON.parse(event.data);
				onMessageRef.current(msg);
			} catch {
				console.error("WS parse error", event.data);
			}
		};

		ws.onclose = (event) => {
			if (event.code === 4001) console.error("WS: invalid token");
			if (event.code === 4003) console.error("WS: not an org member");
		};

		return () => ws.close();
	}, [orgId]); // only reconnect if orgId changes
}
