import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { CHAT_MODEL } from "../core/config.js";
import { API_BASE, resolveDefaultModel } from "../core/lab-constants.js";
import {
	cerebrasChatComplete,
	lcMessagesToCerebras,
} from "../providers/cerebras/cerebras-sdk.js";
import { loadCerebrasConfigFromEnv } from "../providers/cerebras/cerebras-config.js";
import { deepSeekApiBase } from "../providers/deepseek/deepseek-config.js";
import { openRouterApiBase } from "../providers/openrouter/openrouter-config.js";
import { runCapabilityCascade } from "../orchestrator/cascade.js";
import type { LabProvider } from "../orchestrator/types.js";

export type OrchestratedChatResult = {
	answer: string;
	provider: LabProvider;
	keyLabel: string;
	leaseId: string;
	model: string;
};

/** Orden = permutación en PG (sort_order); gemini/minimax vía OpenAI-compat donde aplique. */
const CHAT_PROVIDERS: LabProvider[] = ["groq", "cerebras", "openrouter", "deepseek", "minimax"];

export async function invokeOrchestratedPatyChat(opts: {
	systemPrompt: string;
	human: string;
	temperature: number;
}): Promise<OrchestratedChatResult> {
	const picked: { meta: Omit<OrchestratedChatResult, "answer"> } = {
		meta: { provider: "groq", keyLabel: "", leaseId: "", model: "" },
	};

	const answer = await runCapabilityCascade(
		"chat",
		CHAT_PROVIDERS,
		async (ctx) => {
			const result = await invokeChatOnProvider(ctx.provider, ctx.apiKey, opts);
			picked.meta = {
				provider: ctx.provider,
				keyLabel: ctx.lease.keyLabel,
				leaseId: ctx.lease.leaseId,
				model: result.model,
			};
			return result.text;
		},
		{ logLabel: "paty-chat", maxCycles: 6 },
	);

	return { answer, ...picked.meta };
}

async function invokeChatOnProvider(
	provider: LabProvider,
	apiKey: string,
	opts: { systemPrompt: string; human: string; temperature: number },
): Promise<{ text: string; model: string }> {
	if (provider === "groq") {
		const model = CHAT_MODEL;
		const llm = new ChatGroq({ apiKey, model, temperature: opts.temperature });
		const text = await ChatPromptTemplate.fromMessages([
			["system", opts.systemPrompt],
			["human", "{input}"],
		])
			.pipe(llm)
			.pipe(new StringOutputParser())
			.invoke({ input: opts.human });
		return { text, model };
	}

	if (provider === "cerebras") {
		const cfg = loadCerebrasConfigFromEnv();
		const model = cfg?.chatModel ?? resolveDefaultModel("cerebras", "chat") ?? "gpt-oss-120b";
		const { content } = await cerebrasChatComplete({
			apiKey,
			model,
			messages: lcMessagesToCerebras([
				new SystemMessage(opts.systemPrompt),
				new HumanMessage(opts.human),
			]),
			stream: false,
			temperature: opts.temperature,
			max_completion_tokens: 4096,
		});
		return { text: content, model };
	}

	const model =
		provider === "openrouter"
			? (resolveDefaultModel("openrouter", "chat") ?? "openrouter/free")
			: provider === "deepseek"
				? (resolveDefaultModel("deepseek", "chat") ?? "deepseek-chat")
				: (resolveDefaultModel("minimax", "chat") ?? "MiniMax-M2.5");

	const openAiBase =
		provider === "openrouter"
			? openRouterApiBase()
			: provider === "deepseek"
				? deepSeekApiBase()
				: API_BASE.minimax;

	const llm = new ChatOpenAI({
		apiKey,
		model,
		temperature: opts.temperature,
		configuration: { baseURL: openAiBase },
	});
	const text = await ChatPromptTemplate.fromMessages([
		["system", opts.systemPrompt],
		["human", "{input}"],
	])
		.pipe(llm)
		.pipe(new StringOutputParser())
		.invoke({ input: opts.human });
	return { text, model };
}
