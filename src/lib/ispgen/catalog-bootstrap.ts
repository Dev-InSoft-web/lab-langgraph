import {
	ENTITY_DEFINITIONS,
	STORE_PROJECTS,
	STORE_SECTIONS,
} from "./catalog-definitions.js";
import {
	countCatalogRows,
	upsertEntityDefinition,
	upsertProject,
	upsertSection,
} from "./catalog-repository.js";

/** Pobla lab.store_* desde definiciones TS (idempotente). */
export async function bootstrapCatalogFromDefinitions(): Promise<{
	projects: number;
	sections: number;
	entities: number;
}> {
	for (const p of STORE_PROJECTS) await upsertProject(p);
	for (const s of STORE_SECTIONS) await upsertSection(s);
	for (const e of ENTITY_DEFINITIONS) await upsertEntityDefinition(e);
	return {
		projects: STORE_PROJECTS.length,
		sections: STORE_SECTIONS.length,
		entities: ENTITY_DEFINITIONS.length,
	};
}

export async function ensureCatalogBootstrapped(): Promise<void> {
	const n = await countCatalogRows();
	if (n === 0) await bootstrapCatalogFromDefinitions();
}
