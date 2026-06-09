import type { EntitySegment } from "../ispgen/types.js";

/** Mapeo rel path (allowlist) → fila en BD_ISADOC.ENTITY_ROW. */
const REL_TO_SEGMENT: Record<string, EntitySegment> = {
	"patyia/caches/conversaciones-cache.json": {
		project: "patyia",
		page: "caches",
		entity: "conversaciones",
	},
	"patyia/caches/identidades-cache.json": {
		project: "patyia",
		page: "caches",
		entity: "identidades",
	},
	"openai-storage/files-cache.json": {
		project: "isa-doc",
		page: "openai-storage",
		entity: "files-cache",
	},
	"openai-storage/vector-stores-cache.json": {
		project: "isa-doc",
		page: "openai-storage",
		entity: "vector-stores-cache",
	},
	"openai-storage/skills-cache.json": {
		project: "isa-doc",
		page: "openai-storage",
		entity: "skills-cache",
	},
	"openai-storage/duplicates.json": {
		project: "isa-doc",
		page: "openai-storage",
		entity: "duplicates",
	},
	"openai-storage/backup-progress.json": {
		project: "isa-doc",
		page: "openai-storage",
		entity: "backup-progress",
	},
};

export function persistenceRelToSegment(rel: string): EntitySegment | null {
	const norm = rel.replace(/\\/g, "/").replace(/^\/+/, "");
	return REL_TO_SEGMENT[norm] ?? null;
}

export function unwrapPersistenceBody<T>(raw: Record<string, unknown> | null | undefined): T | null {
	if (!raw) return null;
	if (typeof raw.body !== "undefined") return raw.body as T;
	return raw as T;
}
