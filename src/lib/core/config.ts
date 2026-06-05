import { loadCerebrasConfigFromEnv } from "../providers/cerebras/cerebras-config.js";
import { loadHuggingFaceApiKeysFromEnv } from "../providers/huggingface/huggingface-api-keys.js";
import {
	EMBEDDING_DIMENSIONS,
	EMBEDDING_MODEL,
	getRagVectorTableName,
	resolveDefaultModel,
} from "./lab-constants.js";
import { preloadIsaDocSecrets } from "./secrets.js";

function env(...keys: string[]): string {
	for (const k of keys) {
		const v = process.env[k]?.trim();
		if (v) return v;
	}
	return "";
}

/** BD PatyIA + ISA-DOC (`paty`, `lab` catálogo y filas isa-doc/patyia). */
export function getPatyDatabaseUrl(): string {
	preloadIsaDocSecrets();
	const url = env("PATY_DATABASE_URL", "DATABASE_URL", "LAB_DATABASE_URL", "OPS_DATABASE_URL");
	if (!url) {
		throw new Error("PATY_DATABASE_URL / DATABASE_URL no configurada (Render langlab).");
	}
	return url;
}

/** BD ClientesIS (Capacitación + postman-catalog). Si falta, usa PATY hasta crear `clientesis_lab` en Render. */
export function getClientesisDatabaseUrl(): string {
	preloadIsaDocSecrets();
	return env("CLIENTESIS_DATABASE_URL", "CLIENTESIS_PG_URL") || getPatyDatabaseUrl();
}

/** @deprecated Alias de `getPatyDatabaseUrl`. */
export function getDatabaseUrl(): string {
	return getPatyDatabaseUrl();
}

export type MssqlConnectionConfig = {
	host: string;
	port: number;
	user: string;
	pass: string;
	database: string;
};

export function getClientesisMssqlConfig(): MssqlConnectionConfig | null {
	preloadIsaDocSecrets();
	const host = env("CLIENTESIS_MSSQL_HOST", "hostdb");
	const user = env("CLIENTESIS_MSSQL_USER", "userdb");
	const pass = env("CLIENTESIS_MSSQL_PASS", "passdb");
	const database = env("CLIENTESIS_MSSQL_DB", "namedb");
	if (!host || !user || !pass || !database) return null;
	const port = Number(env("CLIENTESIS_MSSQL_PORT", "portdb") || "1433");
	return { host, port, user, pass, database };
}

export function getPatyMssqlConfig(): MssqlConnectionConfig | null {
	preloadIsaDocSecrets();
	const host = env("PATY_MSSQL_HOST", "paty_hostdb");
	const user = env("PATY_MSSQL_USER", "paty_userdb");
	const pass = env("PATY_MSSQL_PASS", "paty_passdb");
	const database = env("PATY_MSSQL_DB", "paty_namedb");
	if (!host && !user && !pass && !database) return null;
	if (!host || !user || !pass || !database) return null;
	const port = Number(env("PATY_MSSQL_PORT", "paty_portdb") || "1433");
	return { host, port, user, pass, database };
}

/** BD RAG dedicada (pgvector). Opcional: FitDocs/vectores sin instancia RAG separada. */
export function getRagDatabaseUrlOptional(): string | null {
	preloadIsaDocSecrets();
	const url = env("RAG_DATABASE_URL");
	return url || null;
}

/** BD RAG dedicada (pgvector). Lanza solo si un endpoint RAG lo requiere. */
export function getRagDatabaseUrl(): string {
	const url = getRagDatabaseUrlOptional();
	if (!url) {
		throw new Error("RAG_DATABASE_URL no configurada");
	}
	return url;
}

export function getGroqApiKey(): string {
	preloadIsaDocSecrets();
	const key = env("GROQ_API_KEY", "paty_groq_api_key");
	if (!key) {
		throw new Error(
			"GROQ_API_KEY no configurada. Ponla en lab-langgraph/local.settings.json",
		);
	}
	return key;
}

/** Embeddings vía Hugging Face (primera key disponible; rotación vía orquestador). */
export function getHuggingFaceApiKey(): string {
	preloadIsaDocSecrets();
	const keys = loadHuggingFaceApiKeysFromEnv();
	if (keys.length) return keys[0]!.key;
	const key = env("HUGGINGFACE_API_KEY", "paty_huggingface_api_key");
	if (!key) {
		throw new Error(
			"HUGGINGFACE_API_KEY no configurada en lab-langgraph/secrets. Necesaria para embeddings del RAG.",
		);
	}
	return key;
}

export function getPgCollection(profile?: "contapyme" | "fitdocs"): string {
	return getRagVectorTableName(profile ?? getRagProfile());
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };

/** Modelo Groq chat (definido en lab-constants, no en settings). */
export const CHAT_MODEL = resolveDefaultModel("groq", "chat") ?? "llama-3.3-70b-versatile";

/** Proofread: Cerebras en cascada si hay keys configuradas. */
export function proofreadUsesCerebras(): boolean {
	return loadCerebrasConfigFromEnv() != null;
}

export function getOpenAiApiKeyOptional(): string | null {
	preloadIsaDocSecrets();
	const key = env("paty_openai_api_key", "OPENAI_API_KEY", "OPENAI_PROOFREAD_API_KEY");
	return key || null;
}

/** `contapyme` = videos YouTube ContaPyme; `fitdocs` = PDFs fitness (default histórico). */
export function getRagProfile(): "contapyme" | "fitdocs" {
	const p = env("RAG_PROFILE").toLowerCase();
	return p === "fitdocs" ? "fitdocs" : "contapyme";
}
