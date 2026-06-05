import type { PatyPromptTipo } from "../prompts/types.js";

export const CONVERSATION_GRAPH_VERSION = "patyia-v2-classify-route-agent-log";

/** Estimación tokens (~4 chars/token) cuando el proveedor no devuelve usage. */
export function estimateTokens(text: string): number {
	return Math.ceil(String(text ?? "").length / 4);
}

/** Coste USD aproximado por 1M tokens (chat; orden de magnitud lab). */
const COST_PER_MTOK: Record<string, { in: number; out: number }> = {
	"llama-3.3-70b-versatile": { in: 0.59, out: 0.79 },
	"gpt-4.1-nano": { in: 0.1, out: 0.4 },
	default: { in: 0.5, out: 0.8 },
};

export function estimateCostUsd(model: string, tokensIn: number, tokensOut: number): number {
	const rates = COST_PER_MTOK[model] ?? COST_PER_MTOK.default;
	return (tokensIn / 1_000_000) * rates.in + (tokensOut / 1_000_000) * rates.out;
}

export type ClassificationLog = {
	promptTipo: PatyPromptTipo;
	raw?: string;
	override?: boolean;
	latencyMs?: number;
	model?: string;
	provider?: string;
	tokensIn?: number;
	tokensOut?: number;
	estimatedCostUsd?: number;
};

export type AgentRunLog = {
	model?: string;
	provider?: string;
	keyLabel?: string;
	leaseId?: string;
	latencyMs?: number;
	tokensIn?: number;
	tokensOut?: number;
	estimatedCostUsd?: number;
	agentFile?: string;
};

export type RagLog = {
	corpus: string[];
	chunksCount?: number;
	contextChars?: number;
};

export type ConversationTurnMeta = {
	graphVersion: string;
	classification: ClassificationLog;
	agent: AgentRunLog;
	rag?: RagLog;
	jailbreak?: boolean;
	totalLatencyMs?: number;
	totalEstimatedCostUsd?: number;
};

export function buildTurnMeta(parts: {
	promptTipo: PatyPromptTipo;
	classifierRaw?: string;
	classifierOverride?: boolean;
	classifierLatencyMs?: number;
	classifierModel?: string;
	agentLatencyMs?: number;
	provider?: string;
	keyLabel?: string;
	leaseId?: string;
	model?: string;
	corpus?: string[];
	ragContext?: string;
	ragChunks?: number;
	agentFile?: string;
	jailbreak?: boolean;
	systemPrompt?: string;
	userPrompt?: string;
	answer?: string;
}): ConversationTurnMeta {
	const clsIn = estimateTokens(parts.userPrompt ?? "");
	const clsOut = estimateTokens(parts.classifierRaw ?? "");
	const agentIn = estimateTokens((parts.systemPrompt ?? "") + (parts.ragContext ?? "") + (parts.userPrompt ?? ""));
	const agentOut = estimateTokens(parts.answer ?? "");
	const clsModel = parts.classifierModel ?? "gpt-4.1-nano";
	const agentModel = parts.model ?? "llama-3.3-70b-versatile";
	const clsCost = estimateCostUsd(clsModel, clsIn, clsOut);
	const agentCost = estimateCostUsd(agentModel, agentIn, agentOut);

	return {
		graphVersion: CONVERSATION_GRAPH_VERSION,
		classification: {
			promptTipo: parts.promptTipo,
			raw: parts.classifierRaw,
			override: parts.classifierOverride,
			latencyMs: parts.classifierLatencyMs,
			model: clsModel,
			provider: "groq",
			tokensIn: clsIn,
			tokensOut: clsOut,
			estimatedCostUsd: clsCost,
		},
		agent: {
			model: agentModel,
			provider: parts.provider,
			keyLabel: parts.keyLabel,
			leaseId: parts.leaseId,
			latencyMs: parts.agentLatencyMs,
			tokensIn: agentIn,
			tokensOut: agentOut,
			estimatedCostUsd: agentCost,
			agentFile: parts.agentFile,
		},
		rag: parts.corpus?.length
			? {
					corpus: parts.corpus,
					chunksCount: parts.ragChunks,
					contextChars: parts.ragContext?.length ?? 0,
				}
			: undefined,
		jailbreak: parts.jailbreak,
		totalLatencyMs: (parts.classifierLatencyMs ?? 0) + (parts.agentLatencyMs ?? 0),
		totalEstimatedCostUsd: clsCost + agentCost,
	};
}

export type ConversationTurnLogEntry = {
	turnIndex: number;
	ts: string;
	promptText: string;
	responseText: string;
	promptTipo: PatyPromptTipo;
	meta: ConversationTurnMeta;
};
