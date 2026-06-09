/**
 * Lista tablas/columnas de BD_LANGLAB y BD_ISADOC e indica uso en runtime.
 *
 *   npm run db:audit-tables
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabPgPool } from "../src/lib/db/pg.js";
import { PG_SCHEMA_ISADOC, PG_SCHEMA_LANGLAB } from "../src/lib/db/pg-identifiers.js";

preloadLabSecrets();

const LANGLAB_KEEP = new Set([
	"CONVERSACION",
	"CONVERSACION_TURNO",
	"CONVERSACION_MENSAJE",
	"CONVERSACION_MENSAJE_METRICAS",
	"CONVERSACION_TURNOLOCK",
	"CONVERSACION_TURNOTIMING",
	"INSTRUCCION",
	"TDCONSULTA",
	"TDCONSULTA_INSTRUCCION",
	"TDCONSULTA_CORPUS",
	"ORCHESTRATOR_SLOT",
	"ORCHESTRATOR_LEASE",
	"ORCHESTRATOR_CAPABILITY",
	"ORCHESTRATOR_ROTATIONLOG",
	"AUTH_USER",
]);

const ISADOC_KEEP = new Set([
	"ENTITY_ROW",
	"STORE_PROJECT",
	"STORE_SECTION",
	"ENTITY_DEFINITION",
	"BITACORA_REVISADO",
	"APICATALOG_MANIFEST",
]);

async function auditSchema(schema: string, keep: Set<string>) {
	const pool = getLanglabPgPool();
	const tables = await pool.query<{ table_name: string }>(
		`SELECT table_name FROM information_schema.tables
		 WHERE table_schema = $1 AND table_type = 'BASE TABLE' ORDER BY table_name`,
		[schema],
	);

	console.log(`\n=== ${schema} (${tables.rows.length} tablas) ===`);
	for (const { table_name } of tables.rows) {
		const cols = await pool.query<{ column_name: string; data_type: string }>(
			`SELECT column_name, data_type FROM information_schema.columns
			 WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position`,
			[schema, table_name],
		);
		const count = await pool.query<{ n: string }>(
			`SELECT count(*)::text AS n FROM "${schema}"."${table_name}"`,
		);
		const n = count.rows[0]?.n ?? "?";
		const rec = keep.has(table_name) ? "KEEP" : "DROP";
		console.log(`\n${table_name} [${rec}] rows=${n}`);
		for (const c of cols.rows) console.log(`  - ${c.column_name}: ${c.data_type}`);
	}

	const orphans = tables.rows.filter((t) => !keep.has(t.table_name));
	if (orphans.length) {
		console.log(`\nHuérfanas en ${schema}: ${orphans.map((t) => t.table_name).join(", ")}`);
		console.log("Ejecutar: npm run db:apply-pg-ops (migración 023)");
	}
}

await auditSchema(PG_SCHEMA_LANGLAB, LANGLAB_KEEP);
await auditSchema(PG_SCHEMA_ISADOC, ISADOC_KEEP);
await getLanglabPgPool().end();
console.log("\n[ok] Auditoría completada.");
