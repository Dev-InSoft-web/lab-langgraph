import { existsSync } from "node:fs";
import { join } from "node:path";
import { resolveLabRepoRoot } from "./data-paths.js";

/** Raíz de datos persistentes del backend (`lab-langgraph/data`). */
export function resolveLabDataRoot(): string {
	const fromEnv = process.env.LAB_DATA_ROOT?.trim();
	if (fromEnv) return fromEnv;
	return join(resolveLabRepoRoot(), "data");
}

export function labDataPath(...segments: string[]): string {
	return join(resolveLabDataRoot(), ...segments);
}

export const API_CATALOG_JSON = () => labDataPath("api-catalog.json");
export const POSTMAN_DATA_ROOT = () => labDataPath("postman");

/** ISA-DOC · catálogo de prompts PatyIA en disco (fuente antes de sync a PG LangLab). */
export const PATYIA_PROMPTS_CATALOG = () => labDataPath("patyia", "prompts", "catalog");

/** ISA-DOC · caches JSON administrados desde el lab (no son el store de conversación PG). */
export const PATYIA_CONVERSACIONES_CACHE = () =>
	labDataPath("patyia", "caches", "conversaciones-cache.json");
export const PATYIA_IDENTIDADES_CACHE = () =>
	labDataPath("patyia", "caches", "identidades-cache.json");

/** @deprecated Usar PATYIA_PROMPTS_CATALOG */
export const LANGLAB_PROMPTS_CATALOG = PATYIA_PROMPTS_CATALOG;

export const BITACORA_REVISADO = () => labDataPath("bitacora", "revisado.json");

export const OPENAI_STORAGE_ROOT = () =>
	process.env.LAB_OPENAI_STORAGE_ROOT?.trim() || labDataPath("openai-storage");

export const CLIENTESIS_SCHEMA_DIR = () => labDataPath("clientesis-schema");
export const CODEGEN_DATA_DIR = () => labDataPath("codegen");
export const SQL_DATA_DIR = () => labDataPath("sql");

/** Rutas relativas permitidas para GET/PUT `/api/persistence/*`. */
export const PERSISTENCE_ALLOWLIST: string[] = [
	"patyia/caches/conversaciones-cache.json",
	"patyia/caches/identidades-cache.json",
	"bitacora/revisado.json",
	"openai-storage/files-cache.json",
	"openai-storage/vector-stores-cache.json",
	"openai-storage/skills-cache.json",
	"openai-storage/duplicates.json",
	"openai-storage/backup-progress.json",
];

export function resolvePersistenceRelPath(rel: string): string | null {
	const norm = rel.replace(/\\/g, "/").replace(/^\/+/, "");
	if (!PERSISTENCE_ALLOWLIST.includes(norm)) return null;
	if (norm.startsWith("openai-storage/")) {
		return join(OPENAI_STORAGE_ROOT(), norm.slice("openai-storage/".length));
	}
	return labDataPath(...norm.split("/"));
}

export function persistenceInventory(): { root: string; entries: { rel: string; exists: boolean }[] } {
	const root = resolveLabDataRoot();
	return {
		root,
		entries: PERSISTENCE_ALLOWLIST.map((rel) => {
			const abs = resolvePersistenceRelPath(rel);
			return { rel, exists: Boolean(abs && existsSync(abs)) };
		}),
	};
}
