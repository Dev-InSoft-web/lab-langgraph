import { loadConversation } from "./store.js";
import { conversationToPayload } from "./sse.js";

export async function buildConversationDetailResponse(id: number) {
	const record = await loadConversation(id);
	if (!record) return null;
	return {
		ok: true,
		body: {
			...conversationToPayload(record),
			turnos: record.turnos,
		},
	};
}
