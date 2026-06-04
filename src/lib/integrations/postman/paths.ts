import { existsSync } from "node:fs";
import { join } from "node:path";
import { POSTMAN_DATA_ROOT, API_CATALOG_JSON } from "../../core/lab-data-paths.js";
import type { ApiProject } from "./types.js";

export function resolveBundledCatalogPath(): string {
	const path = API_CATALOG_JSON();
	if (existsSync(path)) return path;
	const fromEnv = process.env.API_CATALOG_JSON?.trim();
	if (fromEnv && existsSync(fromEnv)) return fromEnv;
	return path;
}

export function bundledCatalogExists(): boolean {
	return existsSync(resolveBundledCatalogPath());
}

/** `data/postman` dentro de lab-langgraph (fuente para regenerar catálogo). */
export function getPostmanImportRoot(): string {
	return POSTMAN_DATA_ROOT();
}

export function getProjectPaths(project: ApiProject): {
	collection: string;
	environments: string;
	entitiesDir?: string;
} {
	const base = join(getPostmanImportRoot(), project);
	if (project === "patyia") {
		return {
			collection: join(base, "collection.json"),
			environments: join(base, "environments.json"),
			entitiesDir: join(base, "entities"),
		};
	}
	return {
		collection: join(base, "collection.json"),
		environments: join(base, "environments.json"),
	};
}

export function collectionExists(project: ApiProject): boolean {
	if (bundledCatalogExists()) return true;
	const p = getProjectPaths(project);
	return existsSync(p.collection) || Boolean(p.entitiesDir && existsSync(p.entitiesDir));
}
