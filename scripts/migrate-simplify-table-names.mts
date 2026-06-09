/**
 * Renombra tablas legacy → nomenclatura simplificada (CONVERSACION, no CONVERSACION_CONVERSACION).
 * Idempotente. Alternativa manual a la migración embebida en db/schema/ops/002_patyia.sql.
 *
 *   npm run db:migrate-simplify-names
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabDatabaseUrl } from "../src/lib/core/config.js";
import { getPatyPgPool, getClientesisPgPool, getRagPgPool, pingPatyDb, pingRagDb } from "../src/lib/db/pg.js";
import { pgQ } from "../src/lib/db/pg-quote.js";
import { SIMPLIFY_TABLE_RENAMES } from "../src/lib/db/simplify-table-rename-map.js";
import type { TableRename } from "../src/lib/db/entity-domain-rename-map.js";
import { ENTITY_DOMAIN_SEQUENCE_RENAMES } from "../src/lib/db/entity-domain-rename-map.js";

preloadLabSecrets();

try {
	getLanglabDatabaseUrl();
} catch (e) {
	console.error(e);
	process.exit(1);
}

if (!(await pingPatyDb())) {
	console.error("Sin conexión PATY_DATABASE_URL / LANGLAB_DATABASE_URL");
	process.exit(1);
}

async function tableExists(pool: { query: Function }, schema: string, table: string): Promise<boolean> {
	const r = await pool.query(
		`SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
		[schema, table],
	);
	return (r.rowCount ?? 0) > 0;
}

async function renameTable(
	pool: { query: Function },
	schema: string,
	oldTable: string,
	newTable: string,
): Promise<void> {
	if (oldTable === newTable) return;
	const existsOld = await tableExists(pool, schema, oldTable);
	const existsNew = await tableExists(pool, schema, newTable);
	if (!existsOld) {
		if (existsNew) console.log(`  skip ${schema}.${newTable} (ya renombrado)`);
		return;
	}
	if (existsNew) {
		await pool.query(`DROP TABLE ${pgQ(schema)}.${pgQ(oldTable)}`);
		console.log(`  drop duplicada ${schema}.${oldTable} (conserva ${newTable})`);
		return;
	}
	await pool.query(`ALTER TABLE ${pgQ(schema)}.${pgQ(oldTable)} RENAME TO ${pgQ(newTable)}`);
	console.log(`  OK ${schema}.${oldTable} → ${newTable}`);
}

async function uppercaseColumns(pool: { query: Function }, schema: string, table: string): Promise<void> {
	if (!(await tableExists(pool, schema, table))) return;
	const cols = await pool.query<{ column_name: string }>(
		`SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
		[schema, table],
	);
	for (const row of cols.rows) {
		const newCol = row.column_name.toUpperCase().replace(/_/g, "");
		if (newCol === row.column_name) continue;
		await pool.query(
			`ALTER TABLE ${pgQ(schema)}.${pgQ(table)} RENAME COLUMN ${pgQ(row.column_name)} TO ${pgQ(newCol)}`,
		);
	}
}

async function recreateFunctions(pool: { query: Function }): Promise<void> {
	await pool.query(`
		CREATE OR REPLACE FUNCTION "BD_LANGLAB"."CONVERSACION_NEXTTURNINDEX"(p_iconversacion BIGINT)
		RETURNS INT LANGUAGE sql STABLE AS $$
			SELECT COALESCE(MAX("ITURNINDEX"), 0) + 1
			FROM "BD_LANGLAB"."CONVERSACION_TURNO"
			WHERE "ICONVERSACION" = p_iconversacion;
		$$`);
	await pool.query(`
		CREATE OR REPLACE FUNCTION "BD_LANGLAB"."ORCHESTRATOR_EXPIRESTALORCHESTRATORLEASES"()
		RETURNS INT LANGUAGE plpgsql AS $$
		DECLARE n INT;
		BEGIN
			UPDATE "BD_LAB"."ORCHESTRATOR_LEASE"
			SET "RELEASEDAT" = NOW(), "BOK" = FALSE,
				"LASTERROR" = COALESCE("LASTERROR", 'expired_stale_lease')
			WHERE "RELEASEDAT" IS NULL AND "EXPIRESAT" < NOW();
			GET DIAGNOSTICS n = ROW_COUNT;
			DELETE FROM "BD_LANGLAB"."CONVERSACION_TURNOLOCK" WHERE "LOCKEDUNTIL" < NOW();
			RETURN n;
		END;
		$$`);
	console.log("  funciones CONVERSACION_/ORCHESTRATOR_ actualizadas");
}

async function migratePool(pool: { query: Function }, label: string, filter?: (r: TableRename) => boolean): Promise<void> {
	console.log(`\n${label}:`);
	const renames = filter ? SIMPLIFY_TABLE_RENAMES.filter(filter) : SIMPLIFY_TABLE_RENAMES;
	for (const { schema, oldTable, newTable } of renames) {
		await renameTable(pool, schema, oldTable, newTable);
	}
	const seen = new Set<string>();
	for (const { schema, newTable } of renames) {
		const key = `${schema}.${newTable}`;
		if (seen.has(key)) continue;
		seen.add(key);
		await uppercaseColumns(pool, schema, newTable);
	}
}

console.log("Migración nomenclatura simplificada …");
const opsPool = getPatyPgPool();
await opsPool.query(`CREATE SCHEMA IF NOT EXISTS "BD_LAB"`);
const bdLabCanonical: Record<string, string> = {
	lab_api_key_slot: "ORCHESTRATOR_SLOT",
	lab_orchestrator_lease: "ORCHESTRATOR_LEASE",
	lab_capability_timing: "ORCHESTRATOR_CAPABILITY",
	lab_orchestrator_rotation_log: "ORCHESTRATOR_ROTATIONLOG",
	lab_entity_row: "ENTITY_ROW",
	lab_store_project: "STORE_PROJECT",
	lab_store_section: "STORE_SECTION",
	lab_entity_definition: "ENTITY_DEFINITION",
	lab_api_catalog_manifest: "APICATALOG_MANIFEST",
	lab_bitacora_revisado: "BITACORA_REVISADO",
	lab_auth_user: "AUTH_USER",
};
const bdLabTables = await opsPool.query<{ tablename: string }>(
	`SELECT tablename FROM pg_tables WHERE schemaname = 'bd_lab'`,
);
for (const row of bdLabTables.rows) {
	const canonical = bdLabCanonical[row.tablename] ?? row.tablename;
	if (
		(await tableExists(opsPool, "BD_LAB", canonical)) ||
		(await tableExists(opsPool, "BD_LAB", row.tablename))
	) {
		await opsPool.query(`DROP TABLE IF EXISTS bd_lab.${pgQ(row.tablename)}`);
		console.log(`  drop bd_lab.${row.tablename} (ya en BD_LAB)`);
		continue;
	}
	await opsPool.query(`ALTER TABLE bd_lab.${pgQ(row.tablename)} SET SCHEMA "BD_LAB"`);
	if (row.tablename !== canonical) {
		await opsPool.query(`ALTER TABLE "BD_LAB".${pgQ(row.tablename)} RENAME TO ${pgQ(canonical)}`);
	}
	console.log(`  bd_lab.${row.tablename} → BD_LAB.${canonical}`);
}

await migratePool(opsPool, "Ops (BD_LANGLAB + BD_LAB)", (r) => r.schema !== "BD_RAG" && r.schema !== "BD_CLIENTESIS");

for (const { schema, oldSeq, newSeq } of ENTITY_DOMAIN_SEQUENCE_RENAMES) {
	const r = await opsPool.query(`SELECT 1 FROM pg_sequences WHERE schemaname = $1 AND sequencename = $2`, [schema, oldSeq]);
	if ((r.rowCount ?? 0) === 0) continue;
	const existsNew = await opsPool.query(`SELECT 1 FROM pg_sequences WHERE schemaname = $1 AND sequencename = $2`, [schema, newSeq]);
	if ((existsNew.rowCount ?? 0) > 0) continue;
	await opsPool.query(`ALTER SEQUENCE ${pgQ(schema)}.${pgQ(oldSeq)} RENAME TO ${pgQ(newSeq)}`);
	console.log(`  seq ${oldSeq} → ${newSeq}`);
}

await recreateFunctions(opsPool);

try {
	const cisPool = getClientesisPgPool();
	await migratePool(cisPool, "Clientesis", (r) => r.schema === "BD_CLIENTESIS");
} catch {
	/* misma instancia */
}

if (await pingRagDb()) {
	const ragPool = getRagPgPool();
	await migratePool(ragPool, "RAG", (r) => r.schema === "BD_RAG");
} else {
	console.log("\nRAG: omitido (sin RAG_DATABASE_URL)");
}

console.log("\n[ok] Nomenclatura simplificada aplicada.");
