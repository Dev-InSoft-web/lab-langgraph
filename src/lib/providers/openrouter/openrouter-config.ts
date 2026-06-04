import { API_BASE, PROBE_LIMITS } from "../../core/lab-constants.js";

/** Catálogo OpenRouter (capa :free). Límites $0: ~20 RPM / 50 RPD workspace; con saldo → ~1000 RPD. */
export type OpenRouterCatalogEntry = {
	platformName: string;
	modelId: string;
	freeTier: boolean;
	notes?: string;
};

export const OPENROUTER_FREE_CATALOG: OpenRouterCatalogEntry[] = [
	{ platformName: "OpenRouter Free Router", modelId: "openrouter/free", freeTier: true },
	{ platformName: "OpenRouter Owl Alpha", modelId: "openrouter/owl-alpha", freeTier: true },
	{ platformName: "Gemma 4 31B IT", modelId: "google/gemma-4-31b-it:free", freeTier: true },
	{ platformName: "Gemma 4 26B A4B IT", modelId: "google/gemma-4-26b-a4b-it:free", freeTier: true },
	{ platformName: "Lyria 3 Pro Preview", modelId: "google/lyria-3-pro-preview", freeTier: true },
	{ platformName: "Lyria 3 Clip Preview", modelId: "google/lyria-3-clip-preview", freeTier: true },
	{ platformName: "GPT-OSS 120B", modelId: "openai/gpt-oss-120b:free", freeTier: true },
	{ platformName: "GPT-OSS 20B", modelId: "openai/gpt-oss-20b:free", freeTier: true },
	{ platformName: "Llama 3.3 70B Instruct", modelId: "meta-llama/llama-3.3-70b-instruct:free", freeTier: true },
	{ platformName: "Llama 3.2 3B Instruct", modelId: "meta-llama/llama-3.2-3b-instruct:free", freeTier: true },
	{ platformName: "Hermes 3 Llama 3.1 405B", modelId: "nousresearch/hermes-3-llama-3.1-405b:free", freeTier: true },
	{ platformName: "Nemotron 3 Super 120B", modelId: "nvidia/nemotron-3-super-120b-a12b:free", freeTier: true },
	{ platformName: "Nemotron 3 Nano 30B", modelId: "nvidia/nemotron-3-nano-30b-a3b:free", freeTier: true },
	{
		platformName: "Nemotron 3 Nano Omni Reasoning",
		modelId: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
		freeTier: true,
	},
	{ platformName: "Nemotron Nano 12B VL", modelId: "nvidia/nemotron-nano-12b-v2-vl:free", freeTier: true },
	{ platformName: "Nemotron Nano 9B v2", modelId: "nvidia/nemotron-nano-9b-v2:free", freeTier: true },
	{ platformName: "Qwen3 Coder", modelId: "qwen/qwen3-coder:free", freeTier: true },
	{ platformName: "Qwen3 Next 80B", modelId: "qwen/qwen3-next-80b-a3b-instruct:free", freeTier: true },
	{ platformName: "Poolside Laguna M.1", modelId: "poolside/laguna-m.1:free", freeTier: true },
	{ platformName: "Poolside Laguna XS.2", modelId: "poolside/laguna-xs.2:free", freeTier: true },
	{ platformName: "Kimi K2.6", modelId: "moonshotai/kimi-k2.6:free", freeTier: true },
	{ platformName: "GLM 4.5 Air", modelId: "z-ai/glm-4.5-air:free", freeTier: true },
	{ platformName: "LFM 2.5 1.2B Thinking", modelId: "liquid/lfm-2.5-1.2b-thinking:free", freeTier: true },
	{ platformName: "LFM 2.5 1.2B Instruct", modelId: "liquid/lfm-2.5-1.2b-instruct:free", freeTier: true },
	{
		platformName: "Dolphin Mistral 24B Venice",
		modelId: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
		freeTier: true,
	},
];

export const OPENROUTER_RPD_FREE_TIER = PROBE_LIMITS.openrouterRpdPerKey;

export function openRouterApiBase(): string {
	return API_BASE.openrouter.replace(/\/$/, "");
}
