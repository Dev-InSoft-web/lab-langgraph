/**
 * Renombra tablas PATY_/LAB_/CIS_/RAG_ → prefijo de dominio de entidad (conserva datos).
 *   npm run db:migrate-entity-domain
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getPatyDatabaseUrl } from "../src/lib/core/config.js";
import { getPatyPgPool, getClientesisPgPool, getRagPgPool, pingPatyDb, pingRagDb } from "../src/lib/db/pg.js";
import { pgQ } from "../src/lib/db/pg-quote.js";
import {
	ENTITY_DOMAIN_SEQUENCE_RENAMES,
	ENTITY_DOMAIN_TABLE_RENAMES,
	type TableRename,
	LEGACY_SCHEMAS_TO_DROP,
} from "../src/lib/db/entity-domain-rename-map.js";

preloadLabSecrets();

try {
	getPatyDatabaseUrl();
} catch (e) {
	console.error(e);
	process.exit(1);
}

if (!(await pingPatyDb())) {
	console.error("Sin conexión PATY_DATABASE_URL");
	process.exit(1);
}

async function tableExists(pool: { query: Function }, schema: string, table: string): Promise<boolean> {
	const r = await pool.query(
		`SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
		[schema, table],
	);
	return (r.rowCount ?? 0) > 0;
}

async function rowCount(pool: { query: Function }, schema: string, table: string): Promise<number> {
	const r = await pool.query<{ c: number }>(
		`SELECT COUNT(*)::int AS c FROM ${pgQ(schema)}.${pgQ(table)}`,
	);
	return r.rows[0]?.c ?? 0;
}

async function renameTable(
	pool: { query: Function },
	schema: string,
	oldTable: string,
	newTable: string,
): Promise<void> {
	const existsOld = await tableExists(pool, schema, oldTable);
	const existsNew = await tableExists(pool, schema, newTable);
	if (!existsOld) {
		if (existsNew) console.log(`  skip ${schema}.${newTable} (ya renombrado)`);
		return;
	}
	if (existsNew) {
		const oldN = await rowCount(pool, schema, oldTable);
		const newN = await rowCount(pool, schema, newTable);
		if (newN === 0) {
			await pool.query(`DROP TABLE ${pgQ(schema)}.${pgQ(newTable)}`);
			await pool.query(
				`ALTER TABLE ${pgQ(schema)}.${pgQ(oldTable)} RENAME TO ${pgQ(newTable)}`,
			);
			console.log(`  OK ${schema}.${oldTable} → ${newTable} (${oldN} filas; tabla vacía duplicada eliminada)`);
			return;
		}
		if (oldN > 0) {
			await pool.query(
				`INSERT INTO ${pgQ(schema)}.${pgQ(newTable)} SELECT * FROM ${pgQ(schema)}.${pgQ(oldTable)} ON CONFLICT DO NOTHING`,
			);
			await pool.query(`DROP TABLE ${pgQ(schema)}.${pgQ(oldTable)}`);
			console.log(`  merge ${schema}.${oldTable} → ${newTable} (${oldN} filas fusionadas)`);
			return;
		}
		await pool.query(`DROP TABLE ${pgQ(schema)}.${pgQ(oldTable)}`);
		console.log(`  drop vacía ${schema}.${oldTable} (conserva ${newTable})`);
		return;
	}
	await pool.query(
		`ALTER TABLE ${pgQ(schema)}.${pgQ(oldTable)} RENAME TO ${pgQ(newTable)}`,
	);
	console.log(`  OK ${schema}.${oldTable} → ${newTable}`);
}

async function renameSequences(pool: { query: Function }): Promise<void> {
	for (const { schema, oldSeq, newSeq } of ENTITY_DOMAIN_SEQUENCE_RENAMES) {
		const r = await pool.query(
			`SELECT 1 FROM pg_sequences WHERE schemaname = $1 AND sequencename = $2`,
			[schema, oldSeq],
		);
		if ((r.rowCount ?? 0) === 0) continue;
		const existsNew = await pool.query(
			`SELECT 1 FROM pg_sequences WHERE schemaname = $1 AND sequencename = $2`,
			[schema, newSeq],
		);
		if ((existsNew.rowCount ?? 0) > 0) {
			console.log(`  skip seq ${newSeq} (ya existe)`);
			continue;
		}
		await pool.query(`ALTER SEQUENCE ${pgQ(schema)}.${pgQ(oldSeq)} RENAME TO ${pgQ(newSeq)}`);
		console.log(`  seq ${oldSeq} → ${newSeq}`);
	}
}

async function recreateFunctions(pool: { query: Function }): Promise<void> {
	await pool.query(`CREATE SCHEMA IF NOT EXISTS "BD_PATY"`);
	await pool.query(`CREATE SCHEMA IF NOT EXISTS "BD_LAB"`);
	await pool.query(`
		CREATE OR REPLACE FUNCTION "BD_PATY"."CONVERSACION_NEXTTURNINDEX"(p_iconversacion BIGINT)
		RETURNS INT LANGUAGE sql STABLE AS $$
			SELECT COALESCE(MAX("ITURNINDEX"), 0) + 1
			FROM "BD_PATY"."CONVERSACION_CONVERSACIONTURNO"
			WHERE "ICONVERSACION" = p_iconversacion;
		$$`);
	await pool.query(`
		CREATE OR REPLACE FUNCTION "BD_PATY"."ORCHESTRATOR_EXPIRESTALORCHESTRATORLEASES"()
		RETURNS INT LANGUAGE plpgsql AS $$
		DECLARE n INT;
		BEGIN
			UPDATE "BD_LAB"."ORCHESTRATOR_ORCHESTRATORLEASE"
			SET "RELEASEDAT" = NOW(), "BOK" = FALSE,
				"LASTERROR" = COALESCE("LASTERROR", 'expired_stale_lease')
			WHERE "RELEASEDAT" IS NULL AND "EXPIRESAT" < NOW();
			GET DIAGNOSTICS n = ROW_COUNT;
			DELETE FROM "BD_PATY"."CONVERSACION_CONVERSACIONTURNOLOCK" WHERE "LOCKEDUNTIL" < NOW();
			RETURN n;
		END;
		$$`);
	// Quitar funciones con prefijo PATY_ si existen
	for (const fn of ["PATY_NEXTTURNINDEX", "PATY_EXPIRESTALORCHESTRATORLEASES"]) {
		await pool.query(`DROP FUNCTION IF EXISTS "BD_PATY".${pgQ(fn)}(BIGINT)`).catch(() => {});
		await pool.query(`DROP FUNCTION IF EXISTS "BD_PATY".${pgQ(fn)}()`).catch(() => {});
	}
	console.log("  funciones CONVERSACION_/ORCHESTRATOR_ actualizadas");
}

async function ensureClientesisSchema(pool: { query: Function }): Promise<void> {
	await pool.query(`CREATE SCHEMA IF NOT EXISTS "BD_CLIENTESIS"`);
	// Migrar clientesis.* → BD_CLIENTESIS si quedó esquema suelto
	const legacyTables = await pool.query<{ schemaname: string; tablename: string }>(
		`SELECT schemaname, tablename FROM pg_tables
		 WHERE schemaname IN ('clientesis', 'bd_clientesis')
		 AND tablename ILIKE '%entity%row%'`,
	);
	for (const row of legacyTables.rows) {
		const src = `${pgQ(row.schemaname)}.${pgQ(row.tablename)}`;
		const hasNew = await tableExists(pool, "BD_CLIENTESIS", "ENTITY_ENTITYROW");
		const hasOld = await tableExists(pool, row.schemaname, row.tablename);
		if (!hasOld) continue;
		if (!hasNew) {
			await pool.query(`CREATE SCHEMA IF NOT EXISTS "BD_CLIENTESIS"`);
			await pool.query(
				`ALTER TABLE ${src} SET SCHEMA "BD_CLIENTESIS"`,
			);
			await pool.query(
				`ALTER TABLE "BD_CLIENTESIS".${pgQ(row.tablename)} RENAME TO ${pgQ("ENTITY_ENTITYROW")}`,
			);
			console.log(`  clientesis: ${row.schemaname}.${row.tablename} → BD_CLIENTESIS.ENTITY_ENTITYROW`);
		}
	}
}

async function dropEmptyLegacySchemas(pool: { query: Function }): Promise<void> {
	for (const legacy of LEGACY_SCHEMAS_TO_DROP) {
		const t = await pool.query(
			`SELECT count(*)::int AS n FROM pg_tables WHERE schemaname = $1`,
			[legacy],
		);
		const s = await pool.query(
			`SELECT count(*)::int AS n FROM pg_sequences WHERE schemaname = $1`,
			[legacy],
		);
		const f = await pool.query(
			`SELECT count(*)::int AS n FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = $1`,
			[legacy],
		);
		const n = (t.rows[0]?.n ?? 0) + (s.rows[0]?.n ?? 0) + (f.rows[0]?.n ?? 0);
		if (n > 0) {
			console.log(`  conservar ${legacy} (${n} objeto(s))`);
			continue;
		}
		const exists = await pool.query(`SELECT 1 FROM pg_namespace WHERE nspname = $1`, [legacy]);
		if ((exists.rowCount ?? 0) === 0) continue;
		await pool.query(`DROP SCHEMA ${pgQ(legacy)} CASCADE`);
		console.log(`  DROP SCHEMA ${legacy}`);
	}
}

async function migratePool(pool: { query: Function }, label: string, filter?: (r: TableRename) => boolean): Promise<void> {
	console.log(`\n${label}:`);
	const renames = filter ? ENTITY_DOMAIN_TABLE_RENAMES.filter(filter) : ENTITY_DOMAIN_TABLE_RENAMES;
	for (const { schema, oldTable, newTable } of renames) {
		await renameTable(pool, schema, oldTable, newTable);
	}
}

console.log("Migración prefijos entidad (PATY_/LAB_/… → CONVERSACION_/ENTITY_/…) …");
const opsPool = getPatyPgPool();
await migratePool(opsPool, "Ops (BD_PATY + BD_LAB)", (r) => r.schema !== "BD_RAG" && r.schema !== "BD_CLIENTESIS");
await renameSequences(opsPool);
await recreateFunctions(opsPool);
await ensureClientesisSchema(opsPool);

try {
	const cisPool = getClientesisPgPool();
	await migratePool(cisPool, "Clientesis", (r) => r.schema === "BD_CLIENTESIS");
	await ensureClientesisSchema(cisPool);
} catch {
	/* misma instancia */
}

if (await pingRagDb()) {
	const ragPool = getRagPgPool();
	await migratePool(ragPool, "RAG", (r) => r.schema === "BD_RAG");
} else {
	console.log("\nRAG: omitido (sin RAG_DATABASE_URL)");
}

console.log("\nLimpieza esquemas legacy vacíos…");
await dropEmptyLegacySchemas(opsPool);
try {
	await dropEmptyLegacySchemas(getClientesisPgPool());
} catch {
	/* misma instancia */
}
if (await pingRagDb()) await dropEmptyLegacySchemas(getRagPgPool());

console.log("\n[ok] Migración prefijos entidad terminada.");
console.log("Siguiente: npm run catalog:sql:gen && npm run db:apply-pg-ops  (re-seed definiciones ticket)");
