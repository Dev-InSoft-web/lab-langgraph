import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatGroq } from "@langchain/groq";
import { CHAT_MODEL, getGroqApiKey } from "../core/config.js";
import { loadCerebrasConfigFromEnv, type CerebrasConfig } from "../providers/cerebras/cerebras-config.js";
import { getCerebrasKeyPool } from "../providers/cerebras/cerebras-api-keys.js";
import { cerebrasChatComplete, lcMessagesToCerebras } from "../providers/cerebras/cerebras-sdk.js";
import type { BaseMessage } from "@langchain/core/messages";
import { AIMessage } from "@langchain/core/messages";

export type LabChatProvider = "groq" | "cerebras";

export function getLabChatProvider(): LabChatProvider {
	const raw = process.env.LAB_CHAT_PROVIDER?.trim().toLowerCase();
	if (raw === "cerebras" && loadCerebrasConfigFromEnv()) return "cerebras";
	return "groq";
}

export type CreateChatLlmOpts = {
	temperature?: number;
	jsonMode?: boolean;
	provider?: LabChatProvider;
	model?: string;
	cerebras?: CerebrasConfig | null;
};

/** LangChain runnable que delega en @cerebras/cerebras_cloud_sdk. */
function cerebrasSdkLlm(cfg: CerebrasConfig, model: string, temperature: number): BaseChatModel {
	return new RunnableLambda({
		func: async (input: BaseMessage[] | { messages?: BaseMessage[] }) => {
			const messages = Array.isArray(input)
				? input
				: (input as { messages?: BaseMessage[] }).messages ?? [];
			const pool = getCerebrasKeyPool();
			const { content } = await cerebrasChatComplete({
				apiKey: pool.currentKey,
				model,
				messages: lcMessagesToCerebras(messages),
				stream: false,
				temperature,
				max_completion_tokens: 8192,
			});
			return new AIMessage(content);
		},
	}) as unknown as BaseChatModel;
}

export function createChatLlm(opts: CreateChatLlmOpts = {}): BaseChatModel {
	const provider = opts.provider ?? getLabChatProvider();
	const temperature = opts.temperature ?? 0;

	if (provider === "cerebras") {
		const cfg = opts.cerebras ?? loadCerebrasConfigFromEnv();
		if (!cfg) throw new Error("CEREBRAS_API_KEY no configurada (secrets/patyia/lab-langgraph.env)");
		const model = opts.model ?? cfg.chatModel;
		return cerebrasSdkLlm(cfg, model, temperature);
	}

	const llm = new ChatGroq({
		apiKey: getGroqApiKey(),
		model: opts.model ?? CHAT_MODEL,
		temperature,
	});
	if (opts.jsonMode) {
		return llm.bind({ response_format: { type: "json_object" } }) as BaseChatModel;
	}
	return llm;
}
