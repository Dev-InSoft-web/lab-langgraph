import { API_BASE } from "../../core/lab-constants.js";

export type HuggingFaceCatalogEntry = {
	platformName: string;
	modelId: string;
	task: "feature-extraction" | "sentence-similarity";
	freeTier: boolean;
};

/** Modelos típicos para embeddings vía Inference API. */
export const HUGGINGFACE_EMBED_CATALOG: HuggingFaceCatalogEntry[] = [
	{
		platformName: "MiniLM L6 v2 (RAG default)",
		modelId: "sentence-transformers/all-MiniLM-L6-v2",
		task: "feature-extraction",
		freeTier: true,
	},
	{
		platformName: "Multilingual E5 small",
		modelId: "intfloat/multilingual-e5-small",
		task: "feature-extraction",
		freeTier: true,
	},
];

export function huggingFaceInferenceBase(): string {
	return API_BASE.huggingface.replace(/\/$/, "");
}
