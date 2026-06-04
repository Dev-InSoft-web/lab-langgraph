import { API_BASE, PROBE_LIMITS } from "../../core/lab-constants.js";

export type DeepSeekCatalogEntry = {
	platformName: string;
	modelId: string;
	freeTier: boolean;
	/** Créditos de bienvenida (~5M tokens / 30 días). */
	welcomeCredits?: boolean;
	notes?: string;
};

/** IDs API nativos DeepSeek — ver platform.deepseek.com */
export const DEEPSEEK_CATALOG: DeepSeekCatalogEntry[] = [
	{
		platformName: "DeepSeek Chat (V3 / flash)",
		modelId: "deepseek-chat",
		freeTier: true,
		welcomeCredits: true,
		notes: "generación rápida",
	},
	{
		platformName: "DeepSeek Reasoner (R1)",
		modelId: "deepseek-reasoner",
		freeTier: true,
		welcomeCredits: true,
		notes: "cadena de pensamiento",
	},
];

export const DEEPSEEK_WELCOME_DAYS = PROBE_LIMITS.deepseekWelcomeDays;

export function deepSeekApiBase(): string {
	return API_BASE.deepseek.replace(/\/$/, "");
}
