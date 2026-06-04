import Cerebras from "@cerebras/cerebras_cloud_sdk";
import type { BaseMessage } from "@langchain/core/messages";
import { cerebrasNeedsNoReasoning } from "./cerebras-config.js";
import {
	enrichRateLimitErrorMessage,
	headersFromSdkError,
	recordRateLimitHints,
	type RateLimitHintTracker,
} from "../../core/retry-wait.js";

export type CerebrasChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function lcMessagesToCerebras(messages: BaseMessage[]): CerebrasChatMessage[] {
	return messages.map((m) => {
		const type = m._getType();
		const role: CerebrasChatMessage["role"] =
			type === "human" ? "user" : type === "ai" ? "assistant" : "system";
		const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
		return { role, content };
	});
}

export function createCerebrasClient(apiKey: string): Cerebras {
	return new Cerebras({ apiKey, maxRetries: 0 });
}

export type CerebrasChatOpts = {
	apiKey: string;
	model: string;
	messages: CerebrasChatMessage[];
	stream?: boolean;
	max_completion_tokens?: number;
	temperature?: number;
	top_p?: number;
	reasoning_effort?: "none" | "low" | "medium" | "high";
	rateLimitHint?: RateLimitHintTracker;
};

function buildCreateParams(opts: CerebrasChatOpts, stream: boolean): Record<string, unknown> {
	let reasoning_effort = opts.reasoning_effort;
	if (!reasoning_effort) {
		if (cerebrasNeedsNoReasoning(opts.model)) reasoning_effort = "none";
		else if (/gpt-oss/i.test(opts.model)) reasoning_effort = "low";
	}
	return {
		model: opts.model,
		messages: opts.messages,
		stream,
		max_completion_tokens: opts.max_completion_tokens ?? 4096,
		temperature: opts.temperature ?? 0.1,
		top_p: opts.top_p ?? 1,
		...(reasoning_effort ? { reasoning_effort } : {}),
	};
}

function recordCerebrasRateLimit(err: unknown, hint?: RateLimitHintTracker): void {
	if (!hint) return;
	const msg = enrichRateLimitErrorMessage(err, "");
	recordRateLimitHints(hint, msg, headersFromSdkError(err));
}

export async function cerebrasChatComplete(opts: CerebrasChatOpts): Promise<{
	content: string;
	usage: { input: number; output: number; total: number };
}> {
	const client = createCerebrasClient(opts.apiKey);
	const stream = opts.stream ?? false;
	const params = buildCreateParams(opts, stream);

	try {
		if (stream) {
			const s = await client.chat.completions.create(
				params as unknown as Parameters<Cerebras["chat"]["completions"]["create"]>[0],
			);
			let content = "";
			for await (const chunk of s as AsyncIterable<{
				choices?: Array<{ delta?: { content?: string } }>;
			}>) {
				content += chunk.choices?.[0]?.delta?.content ?? "";
			}
			return { content, usage: { input: 0, output: 0, total: 0 } };
		}

		const res = await client.chat.completions.create(
			params as unknown as Parameters<Cerebras["chat"]["completions"]["create"]>[0],
		);
		const choice = (res as { choices?: Array<{ message?: { content?: string; reasoning?: string } }> })
			.choices?.[0];
		const msg = choice?.message;
		const content = (msg?.content ?? msg?.reasoning ?? "").trim();
		const u = (res as { usage?: { prompt_tokens?: number; completion_tokens?: number } }).usage;
		const input = u?.prompt_tokens ?? 0;
		const output = u?.completion_tokens ?? 0;
		return { content, usage: { input, output, total: input + output } };
	} catch (e) {
		recordCerebrasRateLimit(e, opts.rateLimitHint);
		throw new Error(enrichRateLimitErrorMessage(e, "Cerebras chat error"));
	}
}

export async function listCerebrasModels(apiKey: string): Promise<string[]> {
	const client = createCerebrasClient(apiKey);
	const res = await client.models.list();
	const data = (res as { data?: Array<{ id?: string }> }).data ?? [];
	return data.map((m) => m.id ?? "").filter(Boolean);
}
