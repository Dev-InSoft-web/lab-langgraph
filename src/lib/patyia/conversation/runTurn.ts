import { invokeConversationTurn } from "./graph.js";
import { loadConversation } from "./store.js";
import { buildPatyiaSseStream } from "./sse.js";
import type { ConversationPostBody } from "./types.js";
import {
	acquireConversationTurnLock,
	enforceTurnGap,
	expireStaleLabState,
	releaseConversationTurnLock,
} from "../db/turnControl.js";
import { syncOrchestratorSlots } from "../../orchestrator/store.js";

export async function runConversationTurn(body: ConversationPostBody): Promise<{
	stream: ReadableStream<Uint8Array>;
	iconversacion: number;
	promptTipo: string;
}> {
	const jailbreak = Boolean(body.jailbreak);
	const id = Number(body.iconversacion);
	const existing = Number.isFinite(id) && id > 0 ? await loadConversation(id) : null;

	await expireStaleLabState();
	await syncOrchestratorSlots("chat");

	if (existing?.iconversacion) {
		const lock = await acquireConversationTurnLock(existing.iconversacion);
		if (!lock.ok) {
			await new Promise((r) => setTimeout(r, lock.waitMs));
			const retry = await acquireConversationTurnLock(existing.iconversacion);
			if (!retry.ok) {
				throw new Error(`Conversación ocupada (${retry.reason}); reintenta en ${retry.waitMs}ms`);
			}
		}
		await enforceTurnGap(existing.iconversacion, "chat");
	}

	let result;
	try {
		result = await invokeConversationTurn(body, existing);
	} finally {
		if (existing?.iconversacion) {
			await releaseConversationTurnLock(existing.iconversacion);
		}
	}

	const record = result.record!;
	const stream = buildPatyiaSseStream(record, result.answer);
	return {
		stream,
		iconversacion: record.iconversacion,
		promptTipo: result.promptTipo,
	};
}
