import { loadGeminiApiKeysFromEnv } from "./gemini-api-keys.js";
import { API_BASE, resolveDefaultModel } from "../../core/lab-constants.js";

export function geminiApiBase(): string {
	return API_BASE.gemini.replace(/\/$/, "");
}

export type GeminiCatalogEntry = {
	platformName: string;
	modelId: string;
	freeTierDoc: boolean;
	notes?: string;
};

export type GeminiModality =
	| "language"
	| "image"
	| "tts"
	| "audio"
	| "embed"
	| "other"
	| "skipped";

export const GEMINI_MODALITY_DIRS: GeminiModality[] = [
	"language",
	"image",
	"tts",
	"audio",
	"embed",
	"other",
	"skipped",
];

export const GEMINI_FREE_TIER_DOC: GeminiCatalogEntry[] = [
	{ platformName: "Gemini 2.5 Flash", modelId: "gemini-2.5-flash", freeTierDoc: true },
	{ platformName: "Gemini 2.5 Flash-Lite", modelId: "gemini-2.5-flash-lite", freeTierDoc: true },
	{ platformName: "Gemini 2.0 Flash", modelId: "gemini-2.0-flash", freeTierDoc: true },
	{ platformName: "Gemini 2.0 Flash-Lite", modelId: "gemini-2.0-flash-lite", freeTierDoc: true },
	{ platformName: "Gemini 3 Flash", modelId: "gemini-3-flash-preview", freeTierDoc: true },
	{
		platformName: "Gemini 3.1 Flash-Lite",
		modelId: "gemini-3.1-flash-lite",
		freeTierDoc: true,
	},
	{ platformName: "Gemini 3.5 Flash", modelId: "gemini-3.5-flash", freeTierDoc: false, notes: "probar cuota" },
	{ platformName: "Gemini Flash (alias)", modelId: "gemini-flash-latest", freeTierDoc: false },
	{ platformName: "Gemini Flash-Lite (alias)", modelId: "gemini-flash-lite-latest", freeTierDoc: false },
];

export function classifyGeminiModel(modelId: string): GeminiModality {
	const id = modelId.toLowerCase();
	if (/embedding|embed/i.test(id)) return "embed";
	if (/tts/i.test(id)) return "tts";
	if (/lyria|music|audio-generation/i.test(id)) return "audio";
	if (/image|imagen|banana/i.test(id)) return "image";
	if (/robotics|computer-use|deep-research|antigravity|clip-preview/i.test(id)) return "other";
	if (!/^gemini-/i.test(id) && !/^gemma-/i.test(id)) return "other";
	return "language";
}

export function isGeminiTextChatProbeTarget(modelId: string): boolean {
	return classifyGeminiModel(modelId) === "language";
}

export function loadGeminiConfigFromEnv(): { chatModel: string } | null {
	if (!loadGeminiApiKeysFromEnv().length) return null;
	const chatModel = resolveDefaultModel("gemini", "chat") ?? "gemini-2.5-flash";
	return { chatModel };
}

export function isGeminiRateLimitError(msg: string): boolean {
	return /429|quota|rate.?limit|resource.?exhausted|too many requests/i.test(msg);
}
