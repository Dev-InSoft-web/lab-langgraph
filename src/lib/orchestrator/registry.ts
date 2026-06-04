import { preloadIsaDocSecrets } from "../core/secrets.js";
import { loadCerebrasApiKeysFromEnv } from "../providers/cerebras/cerebras-api-keys.js";
import { loadCohereApiKeysFromEnv } from "../providers/cohere/cohere-api-keys.js";
import { loadDeepSeekApiKeysFromEnv } from "../providers/deepseek/deepseek-api-keys.js";
import { loadGroqApiKeysFromEnv } from "../providers/groq/groq-api-keys.js";
import { loadHuggingFaceApiKeysFromEnv } from "../providers/huggingface/huggingface-api-keys.js";
import { loadOpenRouterApiKeysFromEnv } from "../providers/openrouter/openrouter-api-keys.js";
import type { LabCapability, LabProvider } from "./types.js";

export type SlotDefinition = {
	provider: LabProvider;
	capability: LabCapability;
	keyLabel: string;
	sortOrder: number;
};

/** Orden de cascada por capacidad (sort_order ascendente). */
export function slotDefinitionsForCapability(capability: LabCapability): SlotDefinition[] {
	preloadIsaDocSecrets();
	const out: SlotDefinition[] = [];
	let order = 0;

	const pushGroq = (cap: LabCapability) => {
		for (const e of loadGroqApiKeysFromEnv()) {
			out.push({ provider: "groq", capability: cap, keyLabel: e.label, sortOrder: order++ });
		}
	};

	const pushCerebras = (cap: LabCapability, base: number) => {
		let o = base;
		for (const e of loadCerebrasApiKeysFromEnv()) {
			out.push({ provider: "cerebras", capability: cap, keyLabel: e.label, sortOrder: o++ });
		}
	};

	const pushOpenRouter = (cap: LabCapability, base: number) => {
		let o = base;
		for (const e of loadOpenRouterApiKeysFromEnv()) {
			out.push({ provider: "openrouter", capability: cap, keyLabel: e.label, sortOrder: o++ });
		}
	};

	const pushDeepSeek = (cap: LabCapability, base: number) => {
		let o = base;
		for (const e of loadDeepSeekApiKeysFromEnv()) {
			out.push({ provider: "deepseek", capability: cap, keyLabel: e.label, sortOrder: o++ });
		}
	};

	const pushGemini = (cap: LabCapability, base: number) => {
		let o = base;
		for (const e of loadGeminiKeysFromEnv()) {
			out.push({ provider: "gemini", capability: cap, keyLabel: e.label, sortOrder: o++ });
		}
	};

	const pushMinimax = (cap: LabCapability, base: number) => {
		if (process.env.MINIMAX_API_KEY?.trim()) {
			out.push({
				provider: "minimax",
				capability: cap,
				keyLabel: "MINIMAX_API_KEY",
				sortOrder: base,
			});
		}
	};

	const pushHf = (base: number) => {
		let o = base;
		for (const e of loadHuggingFaceApiKeysFromEnv()) {
			out.push({
				provider: "huggingface",
				capability: "embeddings",
				keyLabel: e.label,
				sortOrder: o++,
			});
		}
	};

	const pushCohere = (cap: LabCapability, base: number) => {
		let o = base;
		for (const e of loadCohereApiKeysFromEnv()) {
			out.push({ provider: "cohere", capability: cap, keyLabel: e.label, sortOrder: o++ });
		}
	};

	switch (capability) {
		case "whisper":
			pushGroq("whisper");
			break;
		case "chat":
			pushGroq("chat");
			pushCerebras("chat", 20);
			pushOpenRouter("chat", 35);
			pushDeepSeek("chat", 50);
			pushGemini("chat", 65);
			pushMinimax("chat", 80);
			break;
		case "proofread":
			pushGroq("proofread");
			pushCerebras("proofread", 20);
			pushOpenRouter("proofread", 35);
			pushDeepSeek("proofread", 50);
			pushGemini("proofread", 65);
			pushMinimax("proofread", 80);
			break;
		case "embeddings":
			pushHf(0);
			pushCohere("embeddings", 20);
			break;
		case "rerank":
			pushCohere("rerank", 0);
			break;
		default:
			break;
	}

	return out;
}

function loadGeminiKeysFromEnv(): Array<{ label: string; key: string }> {
	const entries: Array<{ label: string; key: string }> = [];
	const add = (raw: string | undefined, label: string) => {
		const k = raw?.trim();
		if (k && !entries.some((e) => e.key === k)) entries.push({ label, key: k });
	};
	add(process.env.GEMINI_API_KEY, "GEMINI_API_KEY");
	add(process.env.GEMINI_API_KEY_2, "GEMINI_API_KEY_2");
	return entries;
}

export function resolveApiKeySecret(provider: LabProvider, keyLabel: string): string | null {
	preloadIsaDocSecrets();
	const direct = process.env[keyLabel]?.trim();
	if (direct) return direct;

	if (provider === "groq") {
		return loadGroqApiKeysFromEnv().find((e) => e.label === keyLabel)?.key ?? null;
	}
	if (provider === "cerebras") {
		return loadCerebrasApiKeysFromEnv().find((e) => e.label === keyLabel)?.key ?? null;
	}
	if (provider === "openrouter") {
		return loadOpenRouterApiKeysFromEnv().find((e) => e.label === keyLabel)?.key ?? null;
	}
	if (provider === "deepseek") {
		return loadDeepSeekApiKeysFromEnv().find((e) => e.label === keyLabel)?.key ?? null;
	}
	if (provider === "cohere") {
		return loadCohereApiKeysFromEnv().find((e) => e.label === keyLabel)?.key ?? null;
	}
	if (provider === "gemini") {
		return loadGeminiKeysFromEnv().find((e) => e.label === keyLabel)?.key ?? null;
	}
	if (provider === "minimax" && keyLabel === "MINIMAX_API_KEY") {
		return process.env.MINIMAX_API_KEY?.trim() ?? null;
	}
	if (provider === "huggingface") {
		return loadHuggingFaceApiKeysFromEnv().find((e) => e.label === keyLabel)?.key ?? null;
	}
	return null;
}
