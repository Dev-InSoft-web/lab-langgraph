import { listConversationTurnLogsPg } from "../db/conversationsRepo.js";
import { CONVERSATION_GRAPH_VERSION } from "./turnLog.js";

export async function getConversationLogsResponse(iconversacion: number): Promise<{
	ok: true;
	iconversacion: number;
	graphVersion: string;
	totalTurns: number;
	logs: Awaited<ReturnType<typeof listConversationTurnLogsPg>>;
	summary: {
		totalEstimatedCostUsd: number;
		totalLatencyMs: number;
		byTipo: Record<string, number>;
	};
} | null> {
	const logs = await listConversationTurnLogsPg(iconversacion);
	if (!logs.length) {
		const exists = await import("../db/conversationsRepo.js").then((m) => m.loadConversationPg(iconversacion));
		if (!exists) return null;
	}
	let totalEstimatedCostUsd = 0;
	let totalLatencyMs = 0;
	const byTipo: Record<string, number> = {};
	for (const row of logs) {
		const m = row.meta;
		totalEstimatedCostUsd += m?.totalEstimatedCostUsd ?? 0;
		totalLatencyMs += m?.totalLatencyMs ?? 0;
		byTipo[row.promptTipo] = (byTipo[row.promptTipo] ?? 0) + 1;
	}
	return {
		ok: true,
		iconversacion,
		graphVersion: CONVERSATION_GRAPH_VERSION,
		totalTurns: logs.length,
		logs,
		summary: { totalEstimatedCostUsd, totalLatencyMs, byTipo },
	};
}
