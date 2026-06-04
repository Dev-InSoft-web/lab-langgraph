import { API_BASE, PROBE_LIMITS } from "../../core/lab-constants.js";

export type CohereModality = "chat" | "embed" | "rerank";

export type CohereCatalogEntry = {
	platformName: string;
	modelId: string;
	modality: CohereModality;
	/** Trial / development free tier (p. ej. 1000 llamadas/mes). */
	freeTier: boolean;
	/** Si el orquestador debe esperar al próximo mes UTC al agotar cuota. */
	billingPeriod?: "monthly" | "none";
	notes?: string;
};

/** Capa gratis trial — ver https://docs.cohere.com/docs/models */
export const COHERE_FREE_TIER_CATALOG: CohereCatalogEntry[] = [
	{
		platformName: "Command R+",
		modelId: "command-r-plus-08-2024",
		modality: "chat",
		freeTier: true,
		billingPeriod: "monthly",
		notes: "alias command-r-plus",
	},
	{
		platformName: "Command A",
		modelId: "command-a-03-2025",
		modality: "chat",
		freeTier: true,
		billingPeriod: "monthly",
	},
	{
		platformName: "Command R7B",
		modelId: "command-r7b-12-2024",
		modality: "chat",
		freeTier: true,
		billingPeriod: "monthly",
	},
	{
		platformName: "Aya Expanse",
		modelId: "c4ai-aya-expanse-32b",
		modality: "chat",
		freeTier: true,
		billingPeriod: "monthly",
	},
	{
		platformName: "Rerank 3.5",
		modelId: "rerank-v3.5",
		modality: "rerank",
		freeTier: true,
		billingPeriod: "monthly",
	},
	{
		platformName: "Embed English v3",
		modelId: "embed-english-v3.0",
		modality: "embed",
		freeTier: true,
		billingPeriod: "monthly",
	},
	{
		platformName: "Embed Multilingual v3",
		modelId: "embed-multilingual-v3.0",
		modality: "embed",
		freeTier: true,
		billingPeriod: "monthly",
	},
];

/** Modelos listados pero fuera de trial gratuito (solo inventario / --include-paid). */
export const COHERE_PAID_ONLY_CATALOG: CohereCatalogEntry[] = [
	{
		platformName: "Command A+",
		modelId: "command-a-plus-05-2026",
		modality: "chat",
		freeTier: false,
	},
	{
		platformName: "Command A Reasoning",
		modelId: "command-a-reasoning-08-2025",
		modality: "chat",
		freeTier: false,
	},
	{
		platformName: "Command A Vision",
		modelId: "command-a-vision-07-2025",
		modality: "chat",
		freeTier: false,
	},
	{
		platformName: "Command (legacy)",
		modelId: "command",
		modality: "chat",
		freeTier: false,
		notes: "deprecated",
	},
];

export const COHERE_TRIAL_CALLS_PER_MONTH = PROBE_LIMITS.cohereTrialCallsPerMonth;

export function cohereApiBase(): string {
	return API_BASE.cohere.replace(/\/$/, "");
}
