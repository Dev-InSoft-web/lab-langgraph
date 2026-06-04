import { API_BASE, resolveDefaultModel } from "../../core/lab-constants.js";
import { preloadIsaDocSecrets } from "../../core/secrets.js";
import {
	getCerebrasKeyPool,
	loadCerebrasApiKeysFromEnv,
	type CerebrasKeyEntry,
	type CerebrasKeyPool,
} from "./cerebras-api-keys.js";
import { keySuffix } from "../groq/groq-api-keys.js";

export type CerebrasConfig = {
	apiBase: string;
	chatModel: string;
	proofreadModel: string;
};

export type CerebrasCatalogEntry = {
	platformName: string;
	modelId: string;
	verifiedApi: boolean;
	notes?: string;
};

/** Catálogo consola Cerebras; el test cruza con GET /v1/models por cada API key. */
export const CEREBRAS_CATALOG: CerebrasCatalogEntry[] = [
	{ platformName: "OpenAI GPT OSS 120B", modelId: "gpt-oss-120b", verifiedApi: true },
	{
		platformName: "Z.ai GLM 4.7",
		modelId: "zai-glm-4.7",
		verifiedApi: true,
		notes: "reasoning_effort=none para JSON",
	},
	{ platformName: "GPT-OSS 20B", modelId: "gpt-oss-20b", verifiedApi: false },
	{ platformName: "Kimi K2.6", modelId: "kimi-k2.6", verifiedApi: false },
	{ platformName: "GLM 5.1", modelId: "glm-5.1", verifiedApi: false },
	{ platformName: "DeepSeek V3.2", modelId: "deepseek-v3.2", verifiedApi: false },
	{ platformName: "MiniMax M2", modelId: "minimax-m2", verifiedApi: false },
	{ platformName: "Mistral Large 3", modelId: "mistral-large-3", verifiedApi: false },
];

export function loadCerebrasConfigFromEnv(): CerebrasConfig | null {
	preloadIsaDocSecrets();
	if (!loadCerebrasApiKeysFromEnv().length) return null;
	const apiBase = API_BASE.cerebras.replace(/\/$/, "");
	const chatModel = resolveDefaultModel("cerebras", "chat") ?? "gpt-oss-120b";
	const proofreadModel = resolveDefaultModel("cerebras", "proofread") ?? "zai-glm-4.7";
	return { apiBase, chatModel, proofreadModel };
}

export function cerebrasKeyDisplay(pool?: CerebrasKeyPool): string {
	const p = pool ?? getCerebrasKeyPool();
	return p.currentKeyDisplay();
}

/** Para scripts de testing (inventario por key). */
export function cerebrasKeyEntryDisplay(entry: CerebrasKeyEntry, index: number, total: number): string {
	return `${index + 1}/${total} · ${entry.label} · ${keySuffix(entry.key)}`;
}

export function isCerebrasRateLimitError(msg: string): boolean {
	return /429|rate.?limit|quota|too many requests/i.test(msg);
}

export function cerebrasNeedsNoReasoning(modelId: string): boolean {
	return /^zai-glm/i.test(modelId);
}
