import { Annotation, END, StateGraph } from "@langchain/langgraph";
import {
	ensureConversationNode,
	parseCorpusOverride,
	parsePromptTipoOverride,
	persistTurnNode,
	resolveSimulatedSession,
	routeAgentNode,
	runAgentNode,
} from "./nodes.js";
import { getCorpusForTipo } from "../db/promptsRepo.js";
import { corpusForAgent } from "../agents/config.js";
import type { PatyPromptTipo } from "../prompts/types.js";
import type { ConversationPostBody, ConversationRecord } from "./types.js";
import type { SimulatedPatySession } from "../session/simulate.js";

export const ConversationGraphState = Annotation.Root({
	body: Annotation<ConversationPostBody>(),
	session: Annotation<SimulatedPatySession>(),
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
	promptTipo: Annotation<PatyPromptTipo>({
		reducer: (_l, r) => r,
		default: () => "REQUIERE_CONTEXTO",
	}),
	corpus: Annotation<string[]>({
		reducer: (_l, r) => r,
		default: () => [],
	}),
	ragContext: Annotation<string>({
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

async function routeNode(state: typeof ConversationGraphState.State) {
	const override = parsePromptTipoOverride(state.body);
	const promptTipo = await routeAgentNode(state.record!.prompt, state.jailbreak, override);
	const corpusOverride = parseCorpusOverride(state.body);
	let corpus = corpusOverride?.length ? corpusOverride : await getCorpusForTipo(promptTipo);
	if (!corpus.length) corpus = corpusForAgent(promptTipo);
	return { promptTipo, corpus };
}

async function agentNode(state: typeof ConversationGraphState.State) {
	const t0 = Date.now();
	const agent = await runAgentNode(
		state.record!,
		state.promptTipo,
		state.jailbreak,
		state.corpus,
	);
	const { answer, ragContext, corpus } = agent;
	return {
		answer,
		ragContext,
		corpus,
		latencyMs: Date.now() - t0,
		chatProvider: agent.provider ?? "",
		chatKeyLabel: agent.keyLabel ?? "",
		chatLeaseId: agent.leaseId ?? "",
		chatModel: agent.model ?? "",
	};
}

async function persistNode(state: typeof ConversationGraphState.State) {
	const record = await persistTurnNode(state.record!, state.answer, {
		promptTipo: state.promptTipo,
		corpus: state.corpus,
		jailbreak: state.jailbreak,
		latencyMs: state.latencyMs,
		provider: state.chatProvider || undefined,
		keyLabel: state.chatKeyLabel || undefined,
		leaseId: state.chatLeaseId || undefined,
		model: state.chatModel || undefined,
	});
	return { record };
}

export function buildConversationGraph() {
	const g = new StateGraph(ConversationGraphState)
		.addNode("ensureConversation", ensureNode)
		.addNode("routeAgent", routeNode)
		.addNode("runAgent", agentNode)
		.addNode("persistTurn", persistNode)
		.addEdge("__start__", "ensureConversation")
		.addEdge("ensureConversation", "routeAgent")
		.addEdge("routeAgent", "runAgent")
		.addEdge("runAgent", "persistTurn")
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
