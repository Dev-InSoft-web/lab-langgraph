import type { ApiProject, CatalogEndpoint, CatalogEntry } from "./types.js";
import {
	loadCatalogFromManifest,
	getProjectManifest,
	loadApiCatalogManifestSync,
} from "./manifest.js";

export type { CatalogEndpoint, CatalogEntry };

export function loadCatalog(project: ApiProject, _refresh = false): CatalogEntry[] {
	return loadCatalogFromManifest(project);
}

export function searchCatalog(
	project: ApiProject,
	query: string,
	limit = 20,
): CatalogEntry[] {
	const q = query.toLowerCase().trim();
	const all = loadCatalog(project);
	if (!q) return all.slice(0, limit);
	const tokens = q.split(/\s+/).filter(Boolean);
	const scored = all.map((e) => {
		const ext = e as CatalogEndpoint;
		const hay = [
			e.name,
			e.entity,
			e.method,
			e.pathTemplate,
			ext.urlTemplate,
			e.description ?? "",
			ext.entityDescription ?? "",
		]
			.join(" ")
			.toLowerCase();
		let score = 0;
		for (const t of tokens) if (hay.includes(t)) score++;
		return { e, score };
	});
	return scored
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
		.map((x) => x.e);
}

export function getCatalogEntry(project: ApiProject, id: string): CatalogEntry | null {
	return loadCatalog(project).find((e) => e.id === id) ?? null;
}

export function getFullProjectCatalog(project: ApiProject) {
	return getProjectManifest(project);
}

export function loadFullManifest() {
	return loadApiCatalogManifestSync();
}
