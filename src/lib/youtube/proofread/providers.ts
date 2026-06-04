import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { CHAT_MODEL, proofreadUsesCerebras } from "../../core/config.js";
import {
	isCerebrasRateLimitError,
	loadCerebrasConfigFromEnv,
	type CerebrasConfig,
} from "../../providers/cerebras/cerebras-config.js";
import { cerebrasChatComplete, lcMessagesToCerebras } from "../../providers/cerebras/cerebras-sdk.js";
import { isGroqRateLimitError } from "../../providers/groq/groq-api-keys.js";
import { runCapabilityCascade } from "../../orchestrator/cascade.js";
import {
	createRateLimitHintTracker,
	formatRateLimitHintSummary,
	recordRateLimitHints,
	sleepProviderRateLimitMs,
	waitMsForRateLimit,
	type RateLimitHintTracker,
} from "../../core/retry-wait.js";
import { loadMinimaxConfigFromEnv } from "../../providers/minimax/minimax-config.js";
import { runWithProviderLease } from "../../orchestrator/cascade.js";
import { extractBrandsFromContext, type VideoTextContext } from "./brands.js";
import { isPlausibleProofreadFix, sanitizeProofreadSegmentText } from "./validate-fix.js";
import type { BatchItem } from "./prompts.js";
import { buildSystemPrompt } from "./prompts.js";
import type { CostUsd, ProofreadApi, TokenUsage } from "./pricing.js";
import { estimateCostUsd } from "./pricing.js";

export type ProviderInvokeResult = {
	items: BatchItem[];
	usage: TokenUsage;
	costUsd: CostUsd;
	api: ProofreadApi;
	model: string;
	rawAssistant: string;
};

export class AllProofreadProvidersFailedError extends Error {
	readonly retryAfterMinutes: number;
	readonly attempts: Array<{ api: ProofreadApi; error: string }>;

	constructor(attempts: Array<{ api: ProofreadApi; error: string }>, retryAfterMinutes: number) {
		const msg = attempts.map((a) => `${a.api}: ${a.error}`).join("; ");
		super(
			`Groq y MiniMax no están disponibles (${msg}). Reintenta en ${retryAfterMinutes} minutos.`,
		);
		this.name = "AllProofreadProvidersFailedError";
		this.attempts = attempts;
		this.retryAfterMinutes = retryAfterMinutes;
	}
}

function parseSegmentsJson(
	raw: string,
	batch: BatchItem[],
	activeBrands: string[],
): { items: BatchItem[]; missing: number; rejected: number } {
	const trimmed = raw.trim();
	const jsonStart = trimmed.indexOf("{");
	const jsonText = jsonStart >= 0 ? trimmed.slice(jsonStart) : trimmed;
	const parsed = JSON.parse(jsonText) as { segments?: BatchItem[] };
	if (!Array.isArray(parsed.segments)) throw new Error("JSON sin array segments");

	const byIndex = new Map<number, string>();
	for (const row of parsed.segments) {
		if (typeof row.i !== "number" || typeof row.text !== "string") continue;
		byIndex.set(row.i, row.text.trim());
	}

	const out: BatchItem[] = [];
	let missing = 0;
	let rejected = 0;
	for (let j = 0; j < batch.length; j += 1) {
		const item = batch[j]!;
		const next = batch[j + 1];
		const rawText = byIndex.get(item.i);
		if (!rawText) {
			missing += 1;
			out.push({ i: item.i, text: item.text });
			continue;
		}
		const text = sanitizeProofreadSegmentText(rawText, item.text, next?.text, activeBrands);
		if (text.trim() === item.text.trim()) {
			out.push({ i: item.i, text: item.text });
			continue;
		}
		if (!isPlausibleProofreadFix(item.text, text, activeBrands, next?.text)) {
			rejected += 1;
			out.push({ i: item.i, text: item.text });
			continue;
		}
		out.push({ i: item.i, text });
	}
	if (rejected > 0) {
		console.warn(`  Proofread · ${rejected} reescritura(s) del LLM rechazada(s) · se conserva ASR`);
	}
	return { items: out, missing, rejected };
}

function usageFromLc(meta: Record<string, unknown> | undefined): TokenUsage {
	const tu = meta?.usage as
		| { input_tokens?: number; output_tokens?: number; prompt_tokens?: number; completion_tokens?: number }
		| undefined;
	const input = tu?.input_tokens ?? tu?.prompt_tokens ?? 0;
	const output = tu?.output_tokens ?? tu?.completion_tokens ?? 0;
	return { input, output, total: input + output };
}

function getOpenAiKey(): string | null {
	const key =
		process.env.paty_openai_api_key?.trim() ||
		process.env.OPENAI_API_KEY?.trim() ||
		process.env.OPENAI_PROOFREAD_API_KEY?.trim();
	return key || null;
}

function openAiProofreadModel(): string {
	return process.env.OPENAI_PROOFREAD_MODEL?.trim() || "gpt-4o-mini";
}

async function invokeGroqOnce(
	apiKey: string,
	messages: BaseMessage[],
	batch: BatchItem[],
	activeBrands: string[],
): Promise<ProviderInvokeResult> {
	const model = CHAT_MODEL;
	const llm = new ChatGroq({
		apiKey,
		model,
		temperature: 0.1,
	});
	const bound = llm.bind({
		response_format: { type: "json_object" },
	});
	const res = await bound.invoke(messages);
	const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
	const { items } = parseSegmentsJson(raw, batch, activeBrands);
	const usage = usageFromLc(res.response_metadata as Record<string, unknown> | undefined);
	const costUsd = estimateCostUsd("groq", model, usage);
	return { items, usage, costUsd, api: "groq", model, rawAssistant: raw };
}

/** Groq proofread: turno entre keys en PostgreSQL (orquestador). */
async function invokeGroq(
	messages: BaseMessage[],
	batch: BatchItem[],
	activeBrands: string[],
	rateLimitHint?: RateLimitHintTracker,
): Promise<ProviderInvokeResult> {
	try {
		return await runCapabilityCascade(
			"proofread",
			["groq"],
			async (ctx) => {
				console.log(`  Proofread · groq · ${ctx.keyLabel} · ${ctx.lease.keySuffix}`);
				return invokeGroqOnce(ctx.apiKey, messages, batch, activeBrands);
			},
			{ logLabel: "proofread-groq", maxCycles: 4 },
		);
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		if (rateLimitHint && isGroqRateLimitError(err)) recordRateLimitHints(rateLimitHint, err);
		throw e;
	}
}

async function sleepAfterRateLimit(
	hint: RateLimitHintTracker,
	err: string,
	label: string,
): Promise<void> {
	if (!isCascadeRecoverableError(err)) return;
	const wait = waitMsForRateLimit(hint, err);
	if (wait <= 0) return;
	const summary = formatRateLimitHintSummary(hint);
	console.log(
		`  Proofread · espera ${Math.round(wait / 1000)}s (${label}${summary ? ` · ${summary}` : ""})`,
	);
	await sleepProviderRateLimitMs(wait);
}

async function invokeCerebras(
	cfg: CerebrasConfig,
	messages: BaseMessage[],
	batch: BatchItem[],
	activeBrands: string[],
	rateLimitHint?: RateLimitHintTracker,
): Promise<ProviderInvokeResult> {
	const model = cfg.proofreadModel;
	try {
		return await runCapabilityCascade(
			"proofread",
			["cerebras"],
			async (ctx) => {
				console.log(`  Proofread · cerebras · ${ctx.keyLabel} · ${model}`);
				const { content, usage } = await cerebrasChatComplete({
					apiKey: ctx.apiKey,
					model,
					messages: lcMessagesToCerebras(messages),
					stream: false,
					temperature: 0.1,
					max_completion_tokens: 8192,
					reasoning_effort: "none",
					rateLimitHint,
				});
				const { items } = parseSegmentsJson(content, batch, activeBrands);
				const costUsd = estimateCostUsd("cerebras", model, usage);
				return { items, usage, costUsd, api: "cerebras", model, rawAssistant: content };
			},
			{ logLabel: "proofread-cerebras", maxCycles: 4 },
		);
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		if (rateLimitHint && isCerebrasRateLimitError(err)) recordRateLimitHints(rateLimitHint, err);
		throw e;
	}
}

async function invokeOpenAi(
	messages: BaseMessage[],
	batch: BatchItem[],
	activeBrands: string[],
): Promise<ProviderInvokeResult> {
	const key = getOpenAiKey();
	if (!key) throw new Error("OpenAI no configurado (paty_openai_api_key / OPENAI_API_KEY)");
	const model = openAiProofreadModel();
	const llm = new ChatOpenAI({
		apiKey: key,
		model,
		temperature: 0.1,
	});
	const bound = llm.bind({
		response_format: { type: "json_object" },
	});
	const res = await bound.invoke(messages);
	const raw = typeof res.content === "string" ? res.content : JSON.stringify(res.content);
	const { items } = parseSegmentsJson(raw, batch, activeBrands);
	const usage = usageFromLc(res.response_metadata as Record<string, unknown> | undefined);
	const costUsd = estimateCostUsd("openai", model, usage);
	return { items, usage, costUsd, api: "openai", model, rawAssistant: raw };
}

function isMinimaxRateOrBalanceError(msg: string): boolean {
	return /1002|1008|rate limit|insufficient balance|cuota/i.test(msg);
}

function withGroupId(url: string, groupId: string | null): string {
	if (!groupId) return url;
	const sep = url.includes("?") ? "&" : "?";
	return `${url}${sep}GroupId=${encodeURIComponent(groupId)}`;
}

function minimaxMessagesToApi(messages: BaseMessage[]): Array<Record<string, unknown>> {
	return messages.map((m) => {
		const type = m._getType();
		const role = type === "human" ? "user" : type === "ai" ? "assistant" : "system";
		const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
		return { role, name: role === "user" ? "user" : undefined, content };
	});
}

async function invokeMinimaxOnce(
	cfg: NonNullable<ReturnType<typeof loadMinimaxConfigFromEnv>>,
	messages: BaseMessage[],
	batch: BatchItem[],
	activeBrands: string[],
): Promise<ProviderInvokeResult> {
	const model = cfg.chatModel;
	const url = withGroupId(`${cfg.apiBase}/v1/text/chatcompletion_v2`, cfg.groupId);
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${cfg.apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model,
			messages: minimaxMessagesToApi(messages),
			temperature: 0.1,
		}),
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`MiniMax chat ${res.status}: ${text.slice(0, 400)}`);
	const json = JSON.parse(text) as {
		base_resp?: { status_code?: number; status_msg?: string };
		choices?: Array<{ message?: { content?: string } }>;
		usage?: { total_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
	};
	const code = json.base_resp?.status_code ?? 0;
	if (code === 1002) throw new Error(`MiniMax rate limit (1002): ${json.base_resp?.status_msg ?? ""}`);
	if (code === 1008) {
		throw new Error(`MiniMax saldo insuficiente (1008): ${json.base_resp?.status_msg ?? ""}`);
	}
	if (code !== 0 && code !== undefined) {
		throw new Error(`MiniMax error ${code}: ${json.base_resp?.status_msg ?? text.slice(0, 200)}`);
	}
	const raw = json.choices?.[0]?.message?.content ?? "";
	if (!raw) throw new Error("MiniMax devolvió contenido vacío");
	const { items } = parseSegmentsJson(raw, batch, activeBrands);
	const input = json.usage?.prompt_tokens ?? 0;
	const output = json.usage?.completion_tokens ?? 0;
	const usage: TokenUsage = {
		input,
		output,
		total: json.usage?.total_tokens ?? input + output,
	};
	const costUsd = estimateCostUsd("minimax", model, usage);
	return { items, usage, costUsd, api: "minimax", model, rawAssistant: raw };
}

function isCascadeRecoverableError(msg: string): boolean {
	return (
		isGroqRateLimitError(msg) ||
		isCerebrasRateLimitError(msg) ||
		isMinimaxRateOrBalanceError(msg) ||
		/no están disponibles|rate limit|cuota|1002|1008/i.test(msg)
	);
}

/**
 * Cascada por lote: Groq 1/N→2/N → MiniMax → (OpenAI) → reinicio (espera máx 1 min entre ciclos).
 */
export async function invokeProofreadWithFallback(
	messages: BaseMessage[],
	batch: BatchItem[],
	opts?: { allowOpenAi?: boolean; videoContext?: VideoTextContext },
): Promise<ProviderInvokeResult & { attempts: Array<{ api: ProofreadApi; error: string }> }> {
	const allowOpenAi = opts?.allowOpenAi === true;
	const activeBrands = extractBrandsFromContext(opts?.videoContext ?? {});
	const attempts: Array<{ api: ProofreadApi; error: string }> = [];
	const maxCycles = Number(process.env.PROOFREAD_CASCADE_MAX_CYCLES?.trim()) || 0;
	let cycle = 0;

	while (maxCycles === 0 || cycle < maxCycles) {
		cycle += 1;
		const rateLimitHint = createRateLimitHintTracker();
		const cb = proofreadUsesCerebras() ? loadCerebrasConfigFromEnv() : null;
		const mm = loadMinimaxConfigFromEnv();

		try {
			return { ...(await invokeGroq(messages, batch, activeBrands, rateLimitHint)), attempts };
		} catch (e) {
			const err = e instanceof Error ? e.message : String(e);
			attempts.push({ api: "groq", error: err });
			if (!isCascadeRecoverableError(err)) throw e;
			await sleepAfterRateLimit(rateLimitHint, err, "Groq");
		}

		if (cb) {
			try {
				return { ...(await invokeCerebras(cb, messages, batch, activeBrands, rateLimitHint)), attempts };
			} catch (e) {
				const err = e instanceof Error ? e.message : String(e);
				attempts.push({ api: "cerebras", error: err });
				console.log(`  Proofread · Cerebras falló → MiniMax o siguiente ciclo`);
				if (!isCascadeRecoverableError(err)) throw e;
				await sleepAfterRateLimit(rateLimitHint, err, "Cerebras");
			}
		}

		if (mm) {
			try {
				const r = await runWithProviderLease("proofread", "minimax", async (ctx) => {
					console.log(`  Proofread · minimax · ${ctx.keyLabel}`);
					return invokeMinimaxOnce({ ...mm, apiKey: ctx.apiKey }, messages, batch, activeBrands);
				});
				if (!r.ok) throw new Error(r.error);
				return { ...r.value, attempts };
			} catch (e) {
				const err = e instanceof Error ? e.message : String(e);
				attempts.push({ api: "minimax", error: err });
				if (rateLimitHint) recordRateLimitHints(rateLimitHint, err);
				console.log(`  Proofread · MiniMax falló → reinicio cascada`);
				if (!isCascadeRecoverableError(err)) throw e;
				await sleepAfterRateLimit(rateLimitHint, err, "MiniMax");
			}
		}

		if (allowOpenAi) {
			try {
				return { ...(await invokeOpenAi(messages, batch, activeBrands)), attempts };
			} catch (e) {
				const err = e instanceof Error ? e.message : String(e);
				attempts.push({ api: "openai", error: err });
				if (!isCascadeRecoverableError(err)) throw e;
			}
		}

		if (maxCycles > 0 && cycle >= maxCycles) break;
		const cycleErr = attempts.map((a) => a.error).join("; ");
		const wait = waitMsForRateLimit(rateLimitHint, cycleErr);
		const hintSummary = formatRateLimitHintSummary(rateLimitHint);
		console.log(
			`  Proofread · ciclo ${cycle} agotado · espera ${Math.round(wait / 1000)}s${hintSummary ? ` · ${hintSummary}` : ""} → orquestador PG`,
		);
		await sleepProviderRateLimitMs(wait);
	}

	throw new AllProofreadProvidersFailedError(attempts, 1);
}

export function buildInitialMessages(videoContextBlock?: string): BaseMessage[] {
	return [new SystemMessage(buildSystemPrompt(videoContextBlock))];
}

export function appendBatchMessages(
	messages: BaseMessage[],
	userContent: string,
	assistantJson: string,
): BaseMessage[] {
	return [
		...messages,
		new HumanMessage(userContent),
		new AIMessage(assistantJson.slice(0, 12_000)),
	];
}
