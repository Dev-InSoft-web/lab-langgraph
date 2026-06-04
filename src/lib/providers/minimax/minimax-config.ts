import { API_BASE, MINIMAX_RUNTIME, resolveDefaultModel } from "../../core/lab-constants.js";
import { preloadIsaDocSecrets } from "../../core/secrets.js";
import { keySuffix } from "../groq/groq-api-keys.js";

export type MinimaxSttMode = "api" | "multimodal" | "auto";

/** `sk-cp-*` = Token Plan / suscripción; `sk-api-*` = pay-as-you-go (Balance). */
export type MinimaxKeyKind = "subscription" | "paygo" | "unknown";

export function detectMinimaxKeyKind(apiKey: string): MinimaxKeyKind {
	const k = apiKey.trim();
	if (k.startsWith("sk-cp")) return "subscription";
	if (k.startsWith("sk-api")) return "paygo";
	return "unknown";
}

export type MinimaxConfig = {
	apiKey: string;
	keyKind: MinimaxKeyKind;
	apiBase: string;
	sttApiBase: string;
	sttModel: string;
	sttMode: MinimaxSttMode;
	chatModel: string;
	groupId: string | null;
	fallbackAfterGroqWaits: number;
};

export function loadMinimaxConfigFromEnv(): MinimaxConfig | null {
	preloadIsaDocSecrets();
	const apiKey = process.env.MINIMAX_API_KEY?.trim();
	if (!apiKey) return null;

	const apiBase = API_BASE.minimax.replace(/\/$/, "");
	const sttApiBase = apiBase;
	const sttModel = MINIMAX_RUNTIME.sttModel;
	const sttMode: MinimaxSttMode = MINIMAX_RUNTIME.sttMode;
	const chatModel = resolveDefaultModel("minimax", "chat") ?? "MiniMax-M2.5";
	const groupId: string | null = null;
	const fallbackAfterGroqWaits = Math.max(1, MINIMAX_RUNTIME.fallbackAfterGroqWaits);

	return {
		apiKey,
		keyKind: detectMinimaxKeyKind(apiKey),
		apiBase,
		sttApiBase,
		sttModel,
		sttMode,
		chatModel,
		groupId,
		fallbackAfterGroqWaits,
	};
}

export function minimaxKeyDisplay(cfg: MinimaxConfig): string {
	const kind =
		cfg.keyKind === "subscription"
			? "Token Plan"
			: cfg.keyKind === "paygo"
				? "pay-as-you-go"
				: "key";
	return `MINIMAX_API_KEY (${kind}) · ${keySuffix(cfg.apiKey)}`;
}

export function isMinimaxConfigured(): boolean {
	return loadMinimaxConfigFromEnv() != null;
}

/** Alias histórico (scripts whisper en ISA-DOC). */
export const isMinimaxSttConfigured = isMinimaxConfigured;
