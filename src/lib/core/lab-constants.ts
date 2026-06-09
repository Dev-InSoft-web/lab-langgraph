import type { LabCapability, LabProvider } from "../orchestrator/types.js";
export {
	PG_SCHEMA_LANGLAB,
	PG_SCHEMA_ISADOC,
	PG_SCHEMA_PATY,
	PG_SCHEMA_LAB,
	PG_SCHEMA_CLIENTESIS,
	PG_SCHEMA_RAG,
	T_LAB_API_KEY_SLOT,
	T_LAB_ORCHESTRATOR_LEASE,
	T_LAB_CAPABILITY_TIMING,
	T_LAB_ORCHESTRATOR_ROTATION_LOG,
	T_PATY_CONVERSACION_TURNO_LOCK,
	T_PATY_CONVERSACION_TURNO_TIMING,
	T_RAG_VEC_CONTAPYME,
	T_RAG_VEC_FITDOCS,
	Q_LAB_API_KEY_SLOT,
	Q_LAB_ORCHESTRATOR_LEASE,
} from "../db/pg-identifiers.js";

export const TABLE_LAB_API_KEY_SLOT = "ORCHESTRATOR_SLOT";
export const TABLE_LAB_ORCHESTRATOR_LEASE = "ORCHESTRATOR_LEASE";
export const TABLE_CONVERSACION_TURN_LOCK = "CONVERSACION_TURNOLOCK";
export const TABLE_CONVERSACION_TURN_TIMING = "CONVERSACION_TURNOTIMING";
export const TABLE_LAB_CAPABILITY_TIMING = "ORCHESTRATOR_CAPABILITY";
export const TABLE_LAB_ORCHESTRATOR_ROTATION_LOG = "ORCHESTRATOR_ROTATIONLOG";

export const PGVECTOR_TABLE_FITDOCS = "VECTOR_FITDOCS";
export const PGVECTOR_TABLE_CONTAPYME = "VECTOR_CONTAPYME";

/** @deprecated Usar getRagVectorTableName() */
export const PGVECTOR_COLLECTION = PGVECTOR_TABLE_CONTAPYME;

export function getRagVectorTableName(profile?: "contapyme" | "fitdocs"): string {
	const p = profile ?? (process.env.RAG_PROFILE?.toLowerCase() === "fitdocs" ? "fitdocs" : "contapyme");
	return p === "fitdocs" ? PGVECTOR_TABLE_FITDOCS : PGVECTOR_TABLE_CONTAPYME;
}

export const EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
export const EMBEDDING_DIMENSIONS = 384;

export const DATABASE_SSL_ENABLED = true;
export const CORS_ALLOW_ORIGIN = "*";

export const API_BASE = {
	groq: "https://api.groq.com/openai/v1",
	cerebras: "https://api.cerebras.ai/v1",
	gemini: "https://generativelanguage.googleapis.com/v1beta",
	openrouter: "https://openrouter.ai/api/v1",
	cohere: "https://api.cohere.com",
	deepseek: "https://api.deepseek.com",
	minimax: "https://api.minimax.io",
	huggingface: "https://router.huggingface.co/hf-inference",
};

export const DEFAULT_MODEL: Partial<
	Record<LabProvider, Partial<Record<LabCapability, string>>>
> = {
	groq: {
		whisper: "whisper-large-v3-turbo",
		chat: "llama-3.3-70b-versatile",
		proofread: "llama-3.3-70b-versatile",
	},
	cerebras: {
		chat: "gpt-oss-120b",
		proofread: "zai-glm-4.7",
	},
	gemini: {
		chat: "gemini-2.5-flash",
		proofread: "gemini-2.5-flash",
	},
	openrouter: {
		chat: "openrouter/free",
		proofread: "meta-llama/llama-3.3-70b-instruct:free",
	},
	deepseek: {
		chat: "deepseek-chat",
		proofread: "deepseek-chat",
	},
	minimax: {
		chat: "MiniMax-M2.5",
		proofread: "MiniMax-M2.5",
	},
	cohere: {
		chat: "command-r-08-2024",
		embeddings: "embed-english-v3.0",
		rerank: "rerank-v3.5",
	},
};

export function resolveDefaultModel(
	provider: LabProvider,
	capability: LabCapability,
): string | null {
	return DEFAULT_MODEL[provider]?.[capability] ?? null;
}

export const MINIMAX_RUNTIME = {
	sttModel: "whisper-large",
	sttMode: "auto" as const,
	fallbackAfterGroqWaits: 2,
};

export const PROBE_LIMITS = {
	openrouterRpdPerKey: 50,
	cohereTrialCallsPerMonth: 1000,
	geminiRpdPerKey: 250,
	geminiProbeDelayMs: 2500,
	geminiProbeMax429Retries: 4,
	deepseekWelcomeDays: 30,
};
