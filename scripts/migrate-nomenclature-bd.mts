/**
 * Renombra esquemas bd_* → BD_* y tablas/columnas a mayúsculas sin _ (conserva datos).
 *   npm run db:migrate-nomenclature
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabDatabaseUrl } from "../src/lib/core/config.js";
import { getPatyPgPool, getClientesisPgPool, getRagPgPool, pingPatyDb, pingRagDb } from "../src/lib/db/pg.js";
import { pgQ } from "../src/lib/db/pg-quote.js";

preloadLabSecrets();

try {
	getLanglabDatabaseUrl();
} catch (e) {
	console.error(e);
	process.exit(1);
}

if (!(await pingPatyDb())) {
	console.error("Sin conexión PATY_DATABASE_URL");
	process.exit(1);
}

type ColMap = Record<string, string>;

type TableMove = {
	oldSchema: string;
	oldTable: string;
	newSchema: string;
	newTable: string;
	columns?: ColMap;
};

const OPS_MOVES: TableMove[] = [
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_tdconsulta", newSchema: "BD_LANGLAB", newTable: "TDCONSULTA" },
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_instruccion", newSchema: "BD_LANGLAB", newTable: "INSTRUCCION" },
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_tdconsulta_instruccion", newSchema: "BD_LANGLAB", newTable: "TDCONSULTA_INSTRUCCION" },
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_tdconsulta_corpus", newSchema: "BD_LANGLAB", newTable: "TDCONSULTA_CORPUS" },
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_conversacion", newSchema: "BD_LANGLAB", newTable: "CONVERSACION" },
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_conversacion_turno", newSchema: "BD_LANGLAB", newTable: "CONVERSACION_TURNO" },
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_mensaje_calificado", newSchema: "BD_LANGLAB", newTable: "CONVERSACION_MENSAJE" },
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_conversacion_turno_lock", newSchema: "BD_LANGLAB", newTable: "CONVERSACION_TURNOLOCK" },
	{ oldSchema: "BD_LANGLAB", oldTable: "paty_conversacion_turno_timing", newSchema: "BD_LANGLAB", newTable: "CONVERSACION_TURNOTIMING" },
	{ oldSchema: "bd_lab", oldTable: "lab_entity_row", newSchema: "BD_LAB", newTable: "ENTITY_ROW" },
	{ oldSchema: "bd_lab", oldTable: "lab_store_project", newSchema: "BD_LAB", newTable: "STORE_PROJECT" },
	{ oldSchema: "bd_lab", oldTable: "lab_store_section", newSchema: "BD_LAB", newTable: "STORE_SECTION" },
	{ oldSchema: "bd_lab", oldTable: "lab_entity_definition", newSchema: "BD_LAB", newTable: "ENTITY_DEFINITION" },
	{ oldSchema: "bd_lab", oldTable: "lab_api_catalog_manifest", newSchema: "BD_LAB", newTable: "APICATALOG_MANIFEST" },
	{ oldSchema: "bd_lab", oldTable: "lab_bitacora_revisado", newSchema: "BD_LAB", newTable: "BITACORA_REVISADO" },
	{ oldSchema: "bd_lab", oldTable: "lab_api_key_slot", newSchema: "BD_LAB", newTable: "ORCHESTRATOR_SLOT" },
	{ oldSchema: "bd_lab", oldTable: "lab_orchestrator_lease", newSchema: "BD_LAB", newTable: "ORCHESTRATOR_LEASE" },
	{ oldSchema: "bd_lab", oldTable: "lab_capability_timing", newSchema: "BD_LAB", newTable: "ORCHESTRATOR_CAPABILITY" },
	{ oldSchema: "bd_lab", oldTable: "lab_orchestrator_rotation_log", newSchema: "BD_LAB", newTable: "ORCHESTRATOR_ROTATIONLOG" },
	{
		oldSchema: "bd_lab",
		oldTable: "lab_auth_user",
		newSchema: "BD_LAB",
		newTable: "AUTH_USER",
		columns: { password_hash: "PASSWORDHASH", display_name: "DISPLAYNAME" },
	},
	{ oldSchema: "bd_clientesis", oldTable: "cis_entity_row", newSchema: "BD_CLIENTESIS", newTable: "ENTITY_ROW" },
];

const RAG_MOVES: TableMove[] = [
	{ oldSchema: "bd_rag", oldTable: "rag_index_run", newSchema: "BD_RAG", newTable: "INDEX_RUN" },
	{ oldSchema: "bd_rag", oldTable: "rag_vec_contapyme", newSchema: "BD_RAG", newTable: "VECTOR_CONTAPYME" },
];

async function tableExists(pool: { query: Function }, schema: string, table: string): Promise<boolean> {
	const r = await pool.query(
		`SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
		[schema, table],
	);
	return (r.rowCount ?? 0) > 0;
}

async function migrateTable(pool: { query: Function }, move: TableMove): Promise<void> {
	const existsOld = await tableExists(pool, move.oldSchema, move.oldTable);
	const existsNew = await tableExists(pool, move.newSchema, move.newTable);
	if (!existsOld) {
		if (existsNew) console.log(`  skip ${move.newSchema}.${move.newTable} (ya migrado)`);
		return;
	}
	if (existsNew) {
		console.warn(`  conflicto: existen ${move.oldSchema}.${move.oldTable} y ${move.newSchema}.${move.newTable}`);
		return;
	}

	await pool.query(`CREATE SCHEMA IF NOT EXISTS ${pgQ(move.newSchema)}`);
	await pool.query(
		`ALTER TABLE ${pgQ(move.oldSchema)}.${pgQ(move.oldTable)} SET SCHEMA ${pgQ(move.newSchema)}`,
	);
	await pool.query(
		`ALTER TABLE ${pgQ(move.newSchema)}.${pgQ(move.oldTable)} RENAME TO ${pgQ(move.newTable)}`,
	);

	const cols = await pool.query<{ column_name: string }>(
		`SELECT column_name FROM information_schema.columns
		 WHERE table_schema = $1 AND table_name = $2`,
		[move.newSchema, move.newTable],
	);

	for (const row of cols.rows) {
		const oldCol = row.column_name;
		const forced = move.columns?.[oldCol];
		const newCol = forced ?? oldCol.toUpperCase().replace(/_/g, "");
		if (newCol === oldCol) continue;
		await pool.query(
			`ALTER TABLE ${pgQ(move.newSchema)}.${pgQ(move.newTable)} RENAME COLUMN ${pgQ(oldCol)} TO ${pgQ(newCol)}`,
		);
	}
	console.log(`  OK ${move.oldSchema}.${move.oldTable} → ${move.newSchema}.${move.newTable}`);
}

async function renameSequences(pool: { query: Function }): Promise<void> {
	const seqMap: Array<[string, string, string]> = [
		["bd_lab", "seq_lab_store_project", "SEQ_STORE_PROJECT"],
		["bd_lab", "seq_lab_store_section", "SEQ_STORE_SECTION"],
		["bd_lab", "seq_lab_entity_definition", "SEQ_ENTITY_DEFINITION"],
	];
	for (const [oldSchema, oldSeq, newSeq] of seqMap) {
		const r = await pool.query(
			`SELECT 1 FROM pg_sequences WHERE schemaname = $1 AND sequencename = $2`,
			[oldSchema, oldSeq],
		);
		if ((r.rowCount ?? 0) === 0) continue;
		await pool.query(`CREATE SCHEMA IF NOT EXISTS "BD_LAB"`);
		await pool.query(`ALTER SEQUENCE ${pgQ(oldSchema)}.${pgQ(oldSeq)} SET SCHEMA "BD_LAB"`);
		await pool.query(`ALTER SEQUENCE "BD_LAB".${pgQ(oldSeq)} RENAME TO ${pgQ(newSeq)}`);
		console.log(`  seq ${oldSeq} → BD_LAB.${newSeq}`);
	}
}

async function recreatePatyFunctions(pool: { query: Function }): Promise<void> {
	await pool.query(`CREATE SCHEMA IF NOT EXISTS "BD_LANGLAB"`);
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
	console.log("  funciones BD_LANGLAB actualizadas (prefijo entidad)");
}

console.log("Migración nomenclatura BD_* …\nOps (paty+lab+clientesis):");
const opsPool = getPatyPgPool();
for (const m of OPS_MOVES) await migrateTable(opsPool, m);
await renameSequences(opsPool);
await recreatePatyFunctions(opsPool);

try {
	const cisPool = getClientesisPgPool();
	for (const m of OPS_MOVES.filter((x) => x.oldSchema === "bd_clientesis")) {
		await migrateTable(cisPool, m);
	}
} catch {
	/* misma instancia que ops */
}

if (await pingRagDb()) {
	console.log("\nRAG:");
	const ragPool = getRagPgPool();
	for (const m of RAG_MOVES) await migrateTable(ragPool, m);
} else {
	console.log("\nRAG: omitido (sin RAG_DATABASE_URL)");
}

/** Esquemas bd_* vacíos tras mover tablas a "BD_*" (confunden en pgAdmin). */
async function dropEmptyLegacySchemas(pool: { query: Function }): Promise<void> {
	for (const legacy of ["bd_lab", "BD_LANGLAB", "bd_clientesis", "bd_rag"]) {
		const t = await pool.query(
			`SELECT count(*)::int AS n FROM pg_tables WHERE schemaname = $1`,
			[legacy],
		);
		const s = await pool.query(
			`SELECT count(*)::int AS n FROM pg_sequences WHERE schemaname = $1`,
			[legacy],
		);
		const n = (t.rows[0]?.n ?? 0) + (s.rows[0]?.n ?? 0);
		if (n > 0) {
			console.log(`  conservar ${legacy} (${n} objeto(s) aún)`);
			continue;
		}
		const exists = await pool.query(`SELECT 1 FROM pg_namespace WHERE nspname = $1`, [legacy]);
		if ((exists.rowCount ?? 0) === 0) continue;
		await pool.query(`DROP SCHEMA ${pgQ(legacy)} CASCADE`);
		console.log(`  DROP SCHEMA ${legacy} (vacío)`);
	}
}

console.log("\nLimpieza esquemas legacy vacíos…");
await dropEmptyLegacySchemas(opsPool);
try {
	await dropEmptyLegacySchemas(getClientesisPgPool());
} catch {
	/* misma instancia */
}
if (await pingRagDb()) await dropEmptyLegacySchemas(getRagPgPool());

console.log("\n[ok] Migración nomenclatura terminada.");
