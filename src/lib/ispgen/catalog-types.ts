import type { DetailRelation, EntitySchema } from "./types.js";

export type StoreProjectRecord = {
	slug: string;
	name: string;
	description?: string;
	sort_key: number;
	meta?: Record<string, unknown>;
};

export type StoreSectionRecord = {
	project_slug: string;
	slug: string;
	name: string;
	description?: string;
	sort_key: number;
	meta?: Record<string, unknown>;
};

export type EntityDefinitionRecord = {
	project_slug: string;
	section_slug: string;
	entity_slug: string;
	name: string;
	description?: string;
	primary_keys: string[];
	columns: EntitySchema["columns"];
	details?: DetailRelation[];
	search_fields?: string[];
	sort_key: number;
	meta?: Record<string, unknown>;
};

export function definitionToSchema(def: EntityDefinitionRecord): EntitySchema {
	return {
		project: def.project_slug,
		page: def.section_slug,
		entity: def.entity_slug,
		primaryKeys: def.primary_keys,
		columns: def.columns,
		details: def.details,
		searchFields: def.search_fields,
	};
}
