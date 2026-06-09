import { CHAT_MODEL } from "../../core/config.js";
import type { ConsultaTipo } from "../prompts/types.js";

export const CONVERSATION_GRAPH_VERSION = "langlab-v2-classify-route-agent-log";

/** Estimación tokens (~4 chars/token) cuando el proveedor no devuelve usage. */
export function estimateTokens(text: string): number {
	return Math.ceil(String(text ?? "").length / 4);
}

/** Coste USD aproximado por 1M tokens (chat; orden de magnitud lab). */
const COST_PER_MTOK: Record<string, { in: number; out: number }> = {
	"llama-3.3-70b-versatile": { in: 0.59, out: 0.79 },
	"gpt-oss-120b": { in: 0.35, out: 0.75 },
	default: { in: 0.5, out: 0.8 },
};

export function estimateCostUsd(model: string, tokensIn: number, tokensOut: number): number {
	const rates = COST_PER_MTOK[model] ?? COST_PER_MTOK.default;
	return (tokensIn / 1_000_000) * rates.in + (tokensOut / 1_000_000) * rates.out;
}

export type ClassificationLog = {
	promptTipo: ConsultaTipo;
	raw?: string;
	override?: boolean;
	latencyMs?: number;
	model?: string;
	provider?: string;
	keyLabel?: string;
	leaseId?: string;
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
	used?: boolean;
	skipReason?: string;
};

export type ProcessStepLog = {
	id: string;
	label: string;
	latencyMs?: number;
	detail?: Record<string, unknown>;
};

export type ProcessLog = {
	pipeline: string[];
	steps: ProcessStepLog[];
};

export type ConversationTurnMeta = {
	graphVersion: string;
	classification: ClassificationLog;
	agent: AgentRunLog;
	rag?: RagLog;
	process?: ProcessLog;
	jailbreak?: boolean;
	totalLatencyMs?: number;
	totalEstimatedCostUsd?: number;
};

const PIPELINE_NODES = [
	"ensureConversation",
	"classifyMessage",
	"resolveCorpus",
	"runAgent",
	"buildTurnLog",
	"persistTurn",
] as const;

function parseClassifierJson(raw?: string): Record<string, unknown> | null {
	if (!raw?.trim()) return null;
	try {
		return JSON.parse(raw.replace(/```json|```/g, "").trim()) as Record<string, unknown>;
	} catch {
		return { _unparsed: raw.slice(0, 500) };
	}
}

export function buildTurnMeta(parts: {
	promptTipo: ConsultaTipo;
	classifierRaw?: string;
	classifierOverride?: boolean;
	classifierLatencyMs?: number;
	classifierModel?: string;
	classifierProvider?: string;
	classifierKeyLabel?: string;
	classifierLeaseId?: string;
	agentLatencyMs?: number;
	provider?: string;
	keyLabel?: string;
	leaseId?: string;
	model?: string;
	corpus?: string[];
	ragContext?: string;
	ragChunks?: number;
	ragUsed?: boolean;
	ragSkipReason?: string;
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
	const clsModel = parts.classifierModel ?? CHAT_MODEL;
	const clsProvider = parts.classifierProvider ?? "groq";
	const agentModel = parts.model ?? CHAT_MODEL;
	const clsCost = estimateCostUsd(clsModel, clsIn, clsOut);
	const agentCost = estimateCostUsd(agentModel, agentIn, agentOut);
	const parsedCls = parseClassifierJson(parts.classifierRaw);
	const ragCorpus = parts.corpus ?? [];
	const ragLog: RagLog | undefined =
		ragCorpus.length || parts.ragSkipReason
			? {
					corpus: ragCorpus,
					chunksCount: parts.ragChunks ?? 0,
					contextChars: parts.ragContext?.length ?? 0,
					used: parts.ragUsed ?? false,
					skipReason: parts.ragSkipReason,
				}
			: undefined;

	const process: ProcessLog = {
		pipeline: [...PIPELINE_NODES],
		steps: [
			{
				id: "classifyMessage",
				label: "Clasificación (tipo_consulta)",
				latencyMs: parts.classifierLatencyMs,
				detail: {
					identificado: parts.promptTipo,
					parsed: parsedCls,
					raw: parts.classifierRaw,
					model: clsModel,
					provider: clsProvider,
					keyLabel: parts.classifierKeyLabel,
					leaseId: parts.classifierLeaseId,
					override: Boolean(parts.classifierOverride),
					jailbreak: Boolean(parts.jailbreak),
					tokensIn: clsIn,
					tokensOut: clsOut,
					estimatedCostUsd: clsCost,
				},
			},
			{
				id: "resolveCorpus",
				label: "Corpus RAG asignado",
				detail: {
					corpus: ragCorpus,
					promptTipo: parts.promptTipo,
				},
			},
			{
				id: "retrieveRag",
				label: "Recuperación vectorial",
				detail: {
					used: parts.ragUsed ?? false,
					skipReason: parts.ragSkipReason ?? (parts.ragUsed ? undefined : "not_run"),
					chunksCount: parts.ragChunks ?? 0,
					contextChars: parts.ragContext?.length ?? 0,
				},
			},
			{
				id: "runAgent",
				label: "Agente LangLab",
				latencyMs: parts.agentLatencyMs,
				detail: {
					agentFile: parts.agentFile,
					provider: parts.provider,
					model: agentModel,
					keyLabel: parts.keyLabel,
					leaseId: parts.leaseId,
					tokensIn: agentIn,
					tokensOut: agentOut,
					estimatedCostUsd: agentCost,
					conContextoRag: Boolean(parts.ragContext?.trim()),
				},
			},
			{
				id: "persistTurn",
				label: "Persistencia",
				detail: {
					graphVersion: CONVERSATION_GRAPH_VERSION,
					userPrompt: parts.userPrompt,
					answerChars: parts.answer?.length ?? 0,
				},
			},
		],
	};

	return {
		graphVersion: CONVERSATION_GRAPH_VERSION,
		classification: {
			promptTipo: parts.promptTipo,
			raw: parts.classifierRaw,
			override: parts.classifierOverride,
			latencyMs: parts.classifierLatencyMs,
			model: clsModel,
			provider: clsProvider,
			keyLabel: parts.classifierKeyLabel,
			leaseId: parts.classifierLeaseId,
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
		rag: ragLog,
		process,
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
	promptTipo: ConsultaTipo;
	meta: ConversationTurnMeta;
};
