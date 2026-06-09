import { Annotation, END, StateGraph } from "@langchain/langgraph";
import {
	ensureConversationNode,
	parseCorpusOverride,
	parsePromptTipoOverride,
	persistTurnNode,
	resolveSimulatedSession,
	runAgentNode,
} from "./nodes.js";
import { classifyPromptTipo } from "../prompts/router.js";
import { getCorpusForTipo } from "../db/promptsRepo.js";
import { corpusForAgent } from "../agents/config.js";
import { buildTurnMeta } from "./turnLog.js";
import type { ConsultaTipo } from "../prompts/types.js";
import type { ConversationPostBody, ConversationRecord } from "./types.js";
import type { SimulatedLabSession } from "../session/simulate.js";
import type { ConversationTurnMeta } from "./turnLog.js";

export const ConversationGraphState = Annotation.Root({
	body: Annotation<ConversationPostBody>(),
	session: Annotation<SimulatedLabSession>(),
	record: Annotation<ConversationRecord | null>({
		reducer: (_l, r) => r,
		default: () => null,
	}),
	jailbreak: Annotation<boolean>({
		reducer: (_l, r) => r,
		default: () => false,
	}),
	created: Annotation<boolean>({
		reducer: (_l, r) => r,
		default: () => false,
	}),
	promptTipo: Annotation<ConsultaTipo>({
		reducer: (_l, r) => r,
		default: () => "REQUIERE_CONTEXTO",
	}),
	classifierRaw: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	classifierLatencyMs: Annotation<number>({
		reducer: (_l, r) => r,
		default: () => 0,
	}),
	classifierModel: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	classifierProvider: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	classifierKeyLabel: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	classifierLeaseId: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	classifierOverride: Annotation<boolean>({
		reducer: (_l, r) => r,
		default: () => false,
	}),
	corpus: Annotation<string[]>({
		reducer: (_l, r) => r,
		default: () => [],
	}),
	ragContext: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	ragChunksCount: Annotation<number>({
		reducer: (_l, r) => r,
		default: () => 0,
	}),
	ragUsed: Annotation<boolean>({
		reducer: (_l, r) => r,
		default: () => false,
	}),
	ragSkipReason: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	answer: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	latencyMs: Annotation<number>({
		reducer: (_l, r) => r,
		default: () => 0,
	}),
	chatProvider: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	chatKeyLabel: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	chatLeaseId: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	chatModel: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	turnMeta: Annotation<ConversationTurnMeta | null>({
		reducer: (_l, r) => r,
		default: () => null,
	}),
	agentFile: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
});

async function ensureNode(state: typeof ConversationGraphState.State) {
	const { record, created } = await ensureConversationNode({
		body: state.body,
		record: state.record,
		jailbreak: state.jailbreak,
		session: state.session,
	});
	return { record, created };
}

/** Agente clasificador → tipo_consulta (13 códigos). */
async function classifyNode(state: typeof ConversationGraphState.State) {
	if (state.jailbreak) {
		return {
			promptTipo: "REQUIERE_CONTEXTO" as ConsultaTipo,
			classifierRaw: '{"tipo_consulta":"REQUIERE_CONTEXTO","jailbreak":true}',
			classifierLatencyMs: 0,
			classifierModel: "jailbreak",
			classifierProvider: "jailbreak",
			classifierKeyLabel: "",
			classifierLeaseId: "",
			classifierOverride: false,
		};
	}
	const override = parsePromptTipoOverride(state.body);
	const result = await classifyPromptTipo(state.record!.prompt, override);
	return {
		promptTipo: result.promptTipo,
		classifierRaw: result.raw,
		classifierLatencyMs: result.latencyMs,
		classifierModel: result.model,
		classifierProvider: result.provider,
		classifierKeyLabel: result.keyLabel,
		classifierLeaseId: result.leaseId,
		classifierOverride: result.override,
	};
}

/** Resuelve corpus RAG según tipo clasificado. */
async function resolveCorpusNode(state: typeof ConversationGraphState.State) {
	const corpusOverride = parseCorpusOverride(state.body);
	let corpus = corpusOverride?.length ? corpusOverride : await getCorpusForTipo(state.promptTipo);
	if (!corpus.length) corpus = corpusForAgent(state.promptTipo);
	return { corpus };
}

async function agentNode(state: typeof ConversationGraphState.State) {
	const t0 = Date.now();
	const agent = await runAgentNode(
		state.record!,
		state.promptTipo,
		state.jailbreak,
		state.corpus,
	);
	const agentLatencyMs = Date.now() - t0;
	return {
		answer: agent.answer,
		ragContext: agent.ragContext,
		corpus: agent.corpus,
		ragChunksCount: agent.chunksCount ?? 0,
		ragUsed: agent.ragUsed ?? false,
		ragSkipReason: agent.ragSkipReason ?? "",
		latencyMs: agentLatencyMs,
		chatProvider: agent.provider ?? "",
		chatKeyLabel: agent.keyLabel ?? "",
		chatLeaseId: agent.leaseId ?? "",
		chatModel: agent.model ?? "",
		agentFile: agent.agentFile ?? "",
	};
}

async function buildLogNode(state: typeof ConversationGraphState.State) {
	const turnMeta = buildTurnMeta({
		promptTipo: state.promptTipo,
		classifierRaw: state.classifierRaw,
		classifierOverride: state.classifierOverride,
		classifierLatencyMs: state.classifierLatencyMs,
		classifierModel: state.classifierModel || undefined,
		classifierProvider: state.classifierProvider || undefined,
		classifierKeyLabel: state.classifierKeyLabel || undefined,
		classifierLeaseId: state.classifierLeaseId || undefined,
		agentLatencyMs: state.latencyMs,
		provider: state.chatProvider || undefined,
		keyLabel: state.chatKeyLabel || undefined,
		leaseId: state.chatLeaseId || undefined,
		model: state.chatModel || undefined,
		corpus: state.corpus,
		ragContext: state.ragContext,
		ragChunks: state.ragChunksCount,
		ragUsed: state.ragUsed,
		ragSkipReason: state.ragSkipReason || undefined,
		agentFile: state.agentFile || `PROMPT_${state.promptTipo}.md`,
		jailbreak: state.jailbreak,
		userPrompt: state.record!.prompt,
		answer: state.answer,
	});
	return { turnMeta };
}

async function persistNode(state: typeof ConversationGraphState.State) {
	const record = await persistTurnNode(state.record!, state.answer, {
		promptTipo: state.promptTipo,
		corpus: state.corpus,
		jailbreak: state.jailbreak,
		latencyMs: state.latencyMs + state.classifierLatencyMs,
		provider: state.chatProvider || undefined,
		keyLabel: state.chatKeyLabel || undefined,
		leaseId: state.chatLeaseId || undefined,
		model: state.chatModel || undefined,
		meta: state.turnMeta ?? undefined,
	});
	return { record };
}

export function buildConversationGraph() {
	const g = new StateGraph(ConversationGraphState)
		.addNode("ensureConversation", ensureNode)
		.addNode("classifyMessage", classifyNode)
		.addNode("resolveCorpus", resolveCorpusNode)
		.addNode("runAgent", agentNode)
		.addNode("buildTurnLog", buildLogNode)
		.addNode("persistTurn", persistNode)
		.addEdge("__start__", "ensureConversation")
		.addEdge("ensureConversation", "classifyMessage")
		.addEdge("classifyMessage", "resolveCorpus")
		.addEdge("resolveCorpus", "runAgent")
		.addEdge("runAgent", "buildTurnLog")
		.addEdge("buildTurnLog", "persistTurn")
		.addEdge("persistTurn", END);

	return g.compile();
}

export const conversationGraph = buildConversationGraph();

export async function invokeConversationTurn(body: ConversationPostBody, existing: ConversationRecord | null) {
	const session = resolveSimulatedSession(body);
	return conversationGraph.invoke({
		body,
		session,
		record: existing,
		jailbreak: Boolean(body.jailbreak),
	});
}
