import { getCatalogPgPool } from "../db/store-routing.js";
import {
	Q_LAB_ENTITY_DEFINITION,
	Q_LAB_STORE_PROJECT,
	Q_LAB_STORE_SECTION,
} from "../db/pg-identifiers.js";
import { sqlCol } from "../db/pg-quote.js";
import { ensurePatySchema } from "../db/ensure-schemas.js";
import type { EntityDefinitionRecord, StoreProjectRecord, StoreSectionRecord } from "./catalog-types.js";

let catalogReady = false;

export async function ensureCatalogSchema(): Promise<void> {
	if (catalogReady) return;
	await ensurePatySchema();
	catalogReady = true;
}

export async function countCatalogRows(): Promise<number> {
	await ensureCatalogSchema();
	const res = await getCatalogPgPool().query<{ c: string }>(
		`SELECT COUNT(*)::text AS c FROM ${Q_LAB_ENTITY_DEFINITION}`,
	);
	return Number(res.rows[0]?.c ?? 0);
}

export async function upsertProject(row: StoreProjectRecord): Promise<void> {
	await ensureCatalogSchema();
	await getCatalogPgPool().query(
		`INSERT INTO ${Q_LAB_STORE_PROJECT} (${sqlCol("slug")}, ${sqlCol("name")}, ${sqlCol("description")}, ${sqlCol("sortkey")}, ${sqlCol("meta")}, ${sqlCol("fhultact")})
		 VALUES ($1, $2, $3, $4, $5::jsonb, now())
		 ON CONFLICT (${sqlCol("slug")}) DO UPDATE SET
		   ${sqlCol("name")} = EXCLUDED.${sqlCol("name")},
		   ${sqlCol("description")} = EXCLUDED.${sqlCol("description")},
		   ${sqlCol("sortkey")} = EXCLUDED.${sqlCol("sortkey")},
		   ${sqlCol("meta")} = EXCLUDED.${sqlCol("meta")},
		   ${sqlCol("fhultact")} = now()`,
		[row.slug, row.name, row.description ?? null, row.sort_key, JSON.stringify(row.meta ?? {})],
	);
}

export async function upsertSection(row: StoreSectionRecord): Promise<void> {
	await ensureCatalogSchema();
	await getCatalogPgPool().query(
		`INSERT INTO ${Q_LAB_STORE_SECTION} (${sqlCol("projectslug")}, ${sqlCol("slug")}, ${sqlCol("name")}, ${sqlCol("description")}, ${sqlCol("sortkey")}, ${sqlCol("meta")}, ${sqlCol("fhultact")})
		 VALUES ($1, $2, $3, $4, $5, $6::jsonb, now())
		 ON CONFLICT (${sqlCol("projectslug")}, ${sqlCol("slug")}) DO UPDATE SET
		   ${sqlCol("name")} = EXCLUDED.${sqlCol("name")},
		   ${sqlCol("description")} = EXCLUDED.${sqlCol("description")},
		   ${sqlCol("sortkey")} = EXCLUDED.${sqlCol("sortkey")},
		   ${sqlCol("meta")} = EXCLUDED.${sqlCol("meta")},
		   ${sqlCol("fhultact")} = now()`,
		[
			row.project_slug,
			row.slug,
			row.name,
			row.description ?? null,
			row.sort_key,
			JSON.stringify(row.meta ?? {}),
		],
	);
}

export async function upsertEntityDefinition(row: EntityDefinitionRecord): Promise<void> {
	await ensureCatalogSchema();
	await getCatalogPgPool().query(
		`INSERT INTO ${Q_LAB_ENTITY_DEFINITION} (
			${sqlCol("projectslug")}, ${sqlCol("sectionslug")}, ${sqlCol("entityslug")}, ${sqlCol("name")}, ${sqlCol("description")},
			${sqlCol("primarykeys")}, ${sqlCol("columns")}, ${sqlCol("details")}, ${sqlCol("searchfields")}, ${sqlCol("sortkey")}, ${sqlCol("meta")}, ${sqlCol("fhultact")}
		) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11::jsonb,now())
		ON CONFLICT (${sqlCol("projectslug")}, ${sqlCol("sectionslug")}, ${sqlCol("entityslug")}) DO UPDATE SET
			${sqlCol("name")} = EXCLUDED.${sqlCol("name")},
			${sqlCol("description")} = EXCLUDED.${sqlCol("description")},
			${sqlCol("primarykeys")} = EXCLUDED.${sqlCol("primarykeys")},
			${sqlCol("columns")} = EXCLUDED.${sqlCol("columns")},
			${sqlCol("details")} = EXCLUDED.${sqlCol("details")},
			${sqlCol("searchfields")} = EXCLUDED.${sqlCol("searchfields")},
			${sqlCol("sortkey")} = EXCLUDED.${sqlCol("sortkey")},
			${sqlCol("meta")} = EXCLUDED.${sqlCol("meta")},
			${sqlCol("fhultact")} = now()`,
		[
			row.project_slug,
			row.section_slug,
			row.entity_slug,
			row.name,
			row.description ?? null,
			JSON.stringify(row.primary_keys),
			JSON.stringify(row.columns),
			JSON.stringify(row.details ?? []),
			JSON.stringify(row.search_fields ?? []),
			row.sort_key,
			JSON.stringify(row.meta ?? {}),
		],
	);
}

export async function listProjects(): Promise<StoreProjectRecord[]> {
	await ensureCatalogSchema();
	const res = await getCatalogPgPool().query(
		`SELECT ${sqlCol("slug")} AS slug, ${sqlCol("name")} AS name, ${sqlCol("description")} AS description, ${sqlCol("sortkey")} AS sortkey, ${sqlCol("meta")} AS meta FROM ${Q_LAB_STORE_PROJECT} ORDER BY ${sqlCol("sortkey")}, ${sqlCol("slug")}`,
	);
	return res.rows.map((r) => ({
		slug: String(r.slug),
		name: String(r.name),
		description: r.description as string | undefined,
		sort_key: Number(r.sortkey ?? r.sort_key),
		meta: (r.meta ?? {}) as Record<string, unknown>,
	}));
}

export async function listSections(projectSlug: string): Promise<StoreSectionRecord[]> {
	await ensureCatalogSchema();
	const res = await getCatalogPgPool().query(
		`SELECT ${sqlCol("projectslug")} AS projectslug, ${sqlCol("slug")} AS slug, ${sqlCol("name")} AS name, ${sqlCol("description")} AS description, ${sqlCol("sortkey")} AS sortkey, ${sqlCol("meta")} AS meta
		 FROM ${Q_LAB_STORE_SECTION} WHERE ${sqlCol("projectslug")} = $1 ORDER BY ${sqlCol("sortkey")}, ${sqlCol("slug")}`,
		[projectSlug],
	);
	return res.rows.map((r) => ({
		project_slug: String(r.projectslug ?? r.project_slug),
		slug: String(r.slug),
		name: String(r.name),
		description: r.description as string | undefined,
		sort_key: Number(r.sortkey ?? r.sort_key),
		meta: (r.meta ?? {}) as Record<string, unknown>,
	}));
}

export async function listEntityDefinitions(
	projectSlug: string,
	sectionSlug?: string,
): Promise<EntityDefinitionRecord[]> {
	await ensureCatalogSchema();
	const params: string[] = [projectSlug];
	let sql = `SELECT ${sqlCol("projectslug")} AS projectslug, ${sqlCol("sectionslug")} AS sectionslug, ${sqlCol("entityslug")} AS entityslug,
		${sqlCol("name")} AS name, ${sqlCol("description")} AS description, ${sqlCol("primarykeys")} AS primarykeys, ${sqlCol("columns")} AS columns,
		${sqlCol("details")} AS details, ${sqlCol("searchfields")} AS searchfields, ${sqlCol("sortkey")} AS sortkey, ${sqlCol("meta")} AS meta
		FROM ${Q_LAB_ENTITY_DEFINITION} WHERE ${sqlCol("projectslug")} = $1`;
	if (sectionSlug) {
		params.push(sectionSlug);
		sql += ` AND ${sqlCol("sectionslug")} = $2`;
	}
	sql += ` ORDER BY ${sqlCol("sectionslug")}, ${sqlCol("sortkey")}, ${sqlCol("entityslug")}`;
	const res = await getCatalogPgPool().query(sql, params);
	return res.rows.map(mapDefinitionRow);
}

function mapDefinitionRow(r: Record<string, unknown>): EntityDefinitionRecord {
	return {
		project_slug: String(r.projectslug ?? r.project_slug),
		section_slug: String(r.sectionslug ?? r.section_slug),
		entity_slug: String(r.entityslug ?? r.entity_slug),
		name: String(r.name),
		description: r.description as string | undefined,
		primary_keys: parseJsonArray(r.primarykeys ?? r.primary_keys),
		columns: parseJson(r.columns) as EntityDefinitionRecord["columns"],
		details: parseJson(r.details) as EntityDefinitionRecord["details"],
		search_fields: parseJsonArray(r.searchfields ?? r.search_fields),
		sort_key: Number(r.sortkey ?? r.sort_key),
		meta: (parseJson(r.meta) ?? {}) as Record<string, unknown>,
	};
}

function parseJson(v: unknown): unknown {
	if (typeof v === "string") return JSON.parse(v);
	return v;
}

function parseJsonArray(v: unknown): string[] {
	const parsed = parseJson(v);
	return Array.isArray(parsed) ? parsed.map(String) : [];
}

export async function loadAllEntityDefinitions(): Promise<EntityDefinitionRecord[]> {
	await ensureCatalogSchema();
	const res = await getCatalogPgPool().query(
		`SELECT ${sqlCol("projectslug")} AS projectslug, ${sqlCol("sectionslug")} AS sectionslug, ${sqlCol("entityslug")} AS entityslug,
			${sqlCol("name")} AS name, ${sqlCol("description")} AS description, ${sqlCol("primarykeys")} AS primarykeys, ${sqlCol("columns")} AS columns,
			${sqlCol("details")} AS details, ${sqlCol("searchfields")} AS searchfields, ${sqlCol("sortkey")} AS sortkey, ${sqlCol("meta")} AS meta
		 FROM ${Q_LAB_ENTITY_DEFINITION} ORDER BY ${sqlCol("projectslug")}, ${sqlCol("sectionslug")}, ${sqlCol("sortkey")}`,
	);
	return res.rows.map(mapDefinitionRow);
}
