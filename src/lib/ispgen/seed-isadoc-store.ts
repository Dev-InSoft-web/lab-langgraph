import { readFileSync, existsSync } from "node:fs";
import { resolveBundledCatalogPath } from "../integrations/postman/paths.js";
import { upsertManifestToPg } from "../integrations/postman/manifest.js";
import type { ApiCatalogManifest } from "../integrations/postman/types.js";
import { getLanglabPgPool } from "../db/pg.js";
import { PG_SCHEMA_ISADOC, Q_APICATALOG_MANIFEST, Q_BITACORA_REVISADO } from "../db/pg-identifiers.js";
import { bootstrapCatalogFromDefinitions } from "./catalog-bootstrap.js";
import { countCatalogRows } from "./catalog-repository.js";
import { seedAllCatalogData } from "./seed-catalog-data.js";
import { loadMergedRevisadoJson } from "../persistence/revisado-merge.js";
import { writeRevisadoManyPg } from "../persistence/revisado-pg.js";

export type IsadocTableCounts = {
	storeProject: number;
	storeSection: number;
	entityDefinition: number;
	entityRow: number;
	bitacoraRevisado: number;
	apiCatalogManifest: number;
};

export async function countIsadocTables(): Promise<IsadocTableCounts> {
	const pool = getLanglabPgPool();
	const q = async (table: string): Promise<number> => {
		const res = await pool.query<{ n: string }>(
			`SELECT count(*)::text AS n FROM information_schema.tables t
			 WHERE t.table_schema = $1 AND t.table_name = $2`,
			[PG_SCHEMA_ISADOC, table],
		);
		if (!(Number(res.rows[0]?.n ?? 0))) return 0;
		const c = await pool.query<{ n: string }>(
			`SELECT count(*)::text AS n FROM "${PG_SCHEMA_ISADOC}"."${table}"`,
		);
		return Number(c.rows[0]?.n ?? 0);
	};

	return {
		storeProject: await q("STORE_PROJECT"),
		storeSection: await q("STORE_SECTION"),
		entityDefinition: await q("ENTITY_DEFINITION"),
		entityRow: await q("ENTITY_ROW"),
		bitacoraRevisado: await q("BITACORA_REVISADO"),
		apiCatalogManifest: await q("APICATALOG_MANIFEST"),
	};
}

async function seedManifestIfEmpty(): Promise<number> {
	const pool = getLanglabPgPool();
	const res = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM ${Q_APICATALOG_MANIFEST}`);
	if (Number(res.rows[0]?.n ?? 0) > 0) return 0;

	const path = resolveBundledCatalogPath();
	if (!existsSync(path)) return 0;
	const manifest = JSON.parse(readFileSync(path, "utf8")) as ApiCatalogManifest;
	await upsertManifestToPg(manifest);
	return 1;
}

async function seedRevisadoTableIfEmpty(): Promise<number> {
	const pool = getLanglabPgPool();
	const res = await pool.query<{ n: string }>(`SELECT count(*)::text AS n FROM ${Q_BITACORA_REVISADO}`);
	if (Number(res.rows[0]?.n ?? 0) > 0) return 0;

	const merged = await loadMergedRevisadoJson();
	if (!Object.keys(merged).length) return 0;
	await writeRevisadoManyPg(merged);
	return Object.keys(merged).length;
}

/** Repuebla tablas vacías de BD_ISADOC desde definiciones TS y JSON de ISA-DOC/lab data. */
export async function populateEmptyIsadocTables(): Promise<{
	before: IsadocTableCounts;
	after: IsadocTableCounts;
	actions: Record<string, unknown>;
}> {
	const before = await countIsadocTables();
	const actions: Record<string, unknown> = {};

	if (before.storeProject === 0 || before.storeSection === 0 || before.entityDefinition === 0) {
		const defs = await countCatalogRows();
		if (defs === 0) {
			const meta = await bootstrapCatalogFromDefinitions();
			actions.catalogBootstrap = meta;
		}
	}

	actions.entitySeed = await seedAllCatalogData();

	const manifestN = await seedManifestIfEmpty();
	if (manifestN) actions.apiCatalogManifest = manifestN;

	const revisadoN = await seedRevisadoTableIfEmpty();
	if (revisadoN) actions.bitacoraRevisado = revisadoN;

	const after = await countIsadocTables();
	return { before, after, actions };
}
