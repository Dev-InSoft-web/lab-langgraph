/**
 * Renombra esquemas bd_* → BD_* y tablas/columnas a mayúsculas sin _ (conserva datos).
 *   npm run db:migrate-nomenclature
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getPatyDatabaseUrl } from "../src/lib/core/config.js";
import { getPatyPgPool, getClientesisPgPool, getRagPgPool, pingPatyDb, pingRagDb } from "../src/lib/db/pg.js";
import { pgQ } from "../src/lib/db/pg-quote.js";

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

type ColMap = Record<string, string>;

type TableMove = {
	oldSchema: string;
	oldTable: string;
	newSchema: string;
	newTable: string;
	columns?: ColMap;
};

const OPS_MOVES: TableMove[] = [
	{ oldSchema: "bd_paty", oldTable: "paty_tdconsulta", newSchema: "BD_PATY", newTable: "PATY_TDCONSULTA" },
	{ oldSchema: "bd_paty", oldTable: "paty_instruccion", newSchema: "BD_PATY", newTable: "PATY_INSTRUCCION" },
	{ oldSchema: "bd_paty", oldTable: "paty_tdconsulta_instruccion", newSchema: "BD_PATY", newTable: "PATY_TDCONSULTAINSTRUCCION" },
	{ oldSchema: "bd_paty", oldTable: "paty_tdconsulta_corpus", newSchema: "BD_PATY", newTable: "PATY_TDCONSULTACORPUS" },
	{ oldSchema: "bd_paty", oldTable: "paty_conversacion", newSchema: "BD_PATY", newTable: "PATY_CONVERSACION" },
	{ oldSchema: "bd_paty", oldTable: "paty_conversacion_turno", newSchema: "BD_PATY", newTable: "PATY_CONVERSACIONTURNO" },
	{ oldSchema: "bd_paty", oldTable: "paty_mensaje_calificado", newSchema: "BD_PATY", newTable: "PATY_MENSAJECALIFICADO" },
	{ oldSchema: "bd_paty", oldTable: "paty_conversacion_turno_lock", newSchema: "BD_PATY", newTable: "PATY_CONVERSACIONTURNOLOCK" },
	{ oldSchema: "bd_paty", oldTable: "paty_conversacion_turno_timing", newSchema: "BD_PATY", newTable: "PATY_CONVERSACIONTURNOTIMING" },
	{ oldSchema: "bd_lab", oldTable: "lab_entity_row", newSchema: "BD_LAB", newTable: "LAB_ENTITYROW" },
	{ oldSchema: "bd_lab", oldTable: "lab_store_project", newSchema: "BD_LAB", newTable: "LAB_STOREPROJECT" },
	{ oldSchema: "bd_lab", oldTable: "lab_store_section", newSchema: "BD_LAB", newTable: "LAB_STORESECTION" },
	{ oldSchema: "bd_lab", oldTable: "lab_entity_definition", newSchema: "BD_LAB", newTable: "LAB_ENTITYDEFINITION" },
	{ oldSchema: "bd_lab", oldTable: "lab_api_catalog_manifest", newSchema: "BD_LAB", newTable: "LAB_APICATALOGMANIFEST" },
	{ oldSchema: "bd_lab", oldTable: "lab_bitacora_revisado", newSchema: "BD_LAB", newTable: "LAB_BITACORAREVISADO" },
	{ oldSchema: "bd_lab", oldTable: "lab_api_key_slot", newSchema: "BD_LAB", newTable: "LAB_APIKEYSLOT" },
	{ oldSchema: "bd_lab", oldTable: "lab_orchestrator_lease", newSchema: "BD_LAB", newTable: "LAB_ORCHESTRATORLEASE" },
	{ oldSchema: "bd_lab", oldTable: "lab_capability_timing", newSchema: "BD_LAB", newTable: "LAB_CAPABILITYTIMING" },
	{ oldSchema: "bd_lab", oldTable: "lab_orchestrator_rotation_log", newSchema: "BD_LAB", newTable: "LAB_ORCHESTRATORROTATIONLOG" },
	{
		oldSchema: "bd_lab",
		oldTable: "lab_auth_user",
		newSchema: "BD_LAB",
		newTable: "LAB_AUTHUSER",
		columns: { password_hash: "PASSWORDHASH", display_name: "DISPLAYNAME" },
	},
	{ oldSchema: "bd_clientesis", oldTable: "cis_entity_row", newSchema: "BD_CLIENTESIS", newTable: "CIS_ENTITYROW" },
];

const RAG_MOVES: TableMove[] = [
	{ oldSchema: "bd_rag", oldTable: "rag_index_run", newSchema: "BD_RAG", newTable: "RAG_INDEXRUN" },
	{ oldSchema: "bd_rag", oldTable: "rag_vec_contapyme", newSchema: "BD_RAG", newTable: "RAG_VECCONTAPYME" },
	{ oldSchema: "bd_rag", oldTable: "rag_vec_fitdocs", newSchema: "BD_RAG", newTable: "RAG_VECFITDOCS" },
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
		["bd_lab", "seq_lab_store_project", "SEQ_LAB_STOREPROJECT"],
		["bd_lab", "seq_lab_store_section", "SEQ_LAB_STORESECTION"],
		["bd_lab", "seq_lab_entity_definition", "SEQ_LAB_ENTITYDEFINITION"],
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
	await pool.query(`CREATE SCHEMA IF NOT EXISTS "BD_PATY"`);
	await pool.query(`
		CREATE OR REPLACE FUNCTION "BD_PATY"."PATY_NEXTTURNINDEX"(p_iconversacion BIGINT)
		RETURNS INT LANGUAGE sql STABLE AS $$
			SELECT COALESCE(MAX("ITURNINDEX"), 0) + 1
			FROM "BD_PATY"."PATY_CONVERSACIONTURNO"
			WHERE "ICONVERSACION" = p_iconversacion;
		$$`);
	await pool.query(`
		CREATE OR REPLACE FUNCTION "BD_PATY"."PATY_EXPIRESTALORCHESTRATORLEASES"()
		RETURNS INT LANGUAGE plpgsql AS $$
		DECLARE n INT;
		BEGIN
			UPDATE "BD_LAB"."LAB_ORCHESTRATORLEASE"
			SET "RELEASEDAT" = NOW(), "BOK" = FALSE,
				"LASTERROR" = COALESCE("LASTERROR", 'expired_stale_lease')
			WHERE "RELEASEDAT" IS NULL AND "EXPIRESAT" < NOW();
			GET DIAGNOSTICS n = ROW_COUNT;
			DELETE FROM "BD_PATY"."PATY_CONVERSACIONTURNOLOCK" WHERE "LOCKEDUNTIL" < NOW();
			RETURN n;
		END;
		$$`);
	console.log("  funciones BD_PATY actualizadas");
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

console.log("\n[ok] Migración nomenclatura terminada.");
