import { Annotation, END, StateGraph } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";
import type { CaptionSegment } from "../types.js";
import type { BatchAttemptLog } from "./history.js";
import {
	AllProofreadProvidersFailedError,
	appendBatchMessages,
	buildInitialMessages,
	invokeProofreadWithFallback,
} from "./providers.js";
import { formatVideoContextForPrompt, type VideoTextContext } from "./brands.js";
import {
	PROOFREAD_BATCH_SIZE,
	batchUserPayload,
	type BatchItem,
} from "./prompts.js";
import { addCost, addUsage, type CostUsd, type ProofreadApi, type TokenUsage } from "./pricing.js";

export const ProofreadGraphState = Annotation.Root({
	videoId: Annotation<string>(),
	segments: Annotation<CaptionSegment[]>(),
	corrected: Annotation<CaptionSegment[]>({
		reducer: (_left, right) => right,
		default: () => [],
	}),
	batchStart: Annotation<number>({
		reducer: (_left, right) => right,
		default: () => 0,
	}),
	messages: Annotation<BaseMessage[]>({
		reducer: (_left, right) => right,
		default: () => [],
	}),
	attempts: Annotation<BatchAttemptLog[]>({
		reducer: (left, right) => left.concat(right),
		default: () => [],
	}),
	tokens: Annotation<TokenUsage>({
		reducer: (left, right) => addUsage(left, right),
		default: () => ({ input: 0, output: 0, total: 0 }),
	}),
	costUsd: Annotation<CostUsd>({
		reducer: (left, right) => addCost(left, right),
		default: () => ({ input: 0, output: 0, total: 0 }),
	}),
	primaryApi: Annotation<ProofreadApi | "">({
		reducer: (left, right) => (left ? left : right),
		default: () => "",
	}),
	primaryModel: Annotation<string>({
		reducer: (left, right) => (left ? left : right),
		default: () => "",
	}),
	failed: Annotation<boolean>({
		reducer: (_l, r) => r,
		default: () => false,
	}),
	failureMessage: Annotation<string>({
		reducer: (_l, r) => r,
		default: () => "",
	}),
	retryAfterMinutes: Annotation<number>({
		reducer: (_l, r) => r,
		default: () => 0,
	}),
	allowOpenAi: Annotation<boolean>({
		reducer: (_l, r) => r,
		default: () => false,
	}),
	videoContext: Annotation<VideoTextContext>({
		reducer: (_l, r) => r,
		default: () => ({}),
	}),
});

async function initNode(
	state: typeof ProofreadGraphState.State,
): Promise<Partial<typeof ProofreadGraphState.State>> {
	const corrected = state.segments.map((s) => ({ ...s }));
	return {
		corrected,
		batchStart: 0,
		messages: buildInitialMessages(formatVideoContextForPrompt(state.videoContext)),
		attempts: [],
		tokens: { input: 0, output: 0, total: 0 },
		costUsd: { input: 0, output: 0, total: 0 },
		failed: false,
		failureMessage: "",
	};
}

async function proofreadBatchNode(
	state: typeof ProofreadGraphState.State,
): Promise<Partial<typeof ProofreadGraphState.State>> {
	const total = state.segments.length;
	const start = state.batchStart;
	if (start >= total) return {};

	const end = Math.min(start + PROOFREAD_BATCH_SIZE, total);
	const batch: BatchItem[] = [];
	for (let i = start; i < end; i += 1) {
		batch.push({ i, text: state.segments[i].text });
	}
	const batchLabel = `${start + 1}-${end}/${total}`;
	const userContent = batchUserPayload(batch, batchLabel);
	const t0 = Date.now();

	try {
		const result = await invokeProofreadWithFallback(state.messages, batch, {
			allowOpenAi: state.allowOpenAi,
			videoContext: state.videoContext,
		});
		const corrected = [...state.corrected];
		for (const row of result.items) {
			corrected[row.i] = { ...corrected[row.i], text: row.text };
		}
		const newMessages = appendBatchMessages(state.messages, userContent, result.rawAssistant);
		const log: BatchAttemptLog = {
			batch: batchLabel,
			api: result.api,
			model: result.model,
			ok: true,
			tokens: result.usage,
			costUsd: result.costUsd,
			durationMs: Date.now() - t0,
		};
		return {
			corrected,
			batchStart: end,
			messages: newMessages,
			attempts: [log],
			tokens: result.usage,
			costUsd: result.costUsd,
			primaryApi: state.primaryApi || result.api,
			primaryModel: state.primaryModel || result.model,
		};
	} catch (e) {
		const err = e instanceof AllProofreadProvidersFailedError ? e : null;
		const msg = err?.message ?? (e instanceof Error ? e.message : String(e));
		const log: BatchAttemptLog = {
			batch: batchLabel,
			api: "groq",
			model: "",
			ok: false,
			error: msg,
			durationMs: Date.now() - t0,
		};
		return {
			failed: true,
			failureMessage: msg,
			retryAfterMinutes: err?.retryAfterMinutes ?? 5,
			attempts: [log],
		};
	}
}

function routeAfterBatch(state: typeof ProofreadGraphState.State): "proofreadBatch" | typeof END {
	if (state.failed) return END;
	if (state.batchStart >= state.segments.length) return END;
	return "proofreadBatch";
}

export function buildProofreadGraph() {
	const g = new StateGraph(ProofreadGraphState)
		.addNode("init", initNode)
		.addNode("proofreadBatch", proofreadBatchNode)
		.addEdge("__start__", "init")
		.addEdge("init", "proofreadBatch")
		.addConditionalEdges("proofreadBatch", routeAfterBatch);

	const compiled = g.compile();
	return compiled;
}

/** Instancia compilada para API y exportación de diagramas. */
export const proofreadGraph = buildProofreadGraph();
