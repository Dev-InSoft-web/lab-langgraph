/**
 * Limpia esquemas/tablas legacy en LangLab y aplica nomenclatura canónica.
 *   npm run db:cleanup-legacy
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabDatabaseUrl } from "../src/lib/core/config.js";
import { getPatyPgPool, pingPatyDb } from "../src/lib/db/pg.js";
import { applyLanglabOpsSchema } from "../src/lib/db/ensure-schemas.js";
import { pgQ } from "../src/lib/db/pg-quote.js";

preloadLabSecrets();

try {
	getLanglabDatabaseUrl();
} catch (e) {
	console.error(e);
	process.exit(1);
}

if (!(await pingPatyDb())) {
	console.error("Sin conexión a LANGLAB_DATABASE_URL");
	process.exit(1);
}

const pool = getPatyPgPool();

async function listSchemas(): Promise<Array<{ nspname: string; tables: number }>> {
	const r = await pool.query<{ nspname: string; ntables: string }>(`
		SELECT n.nspname, count(t.tablename)::text AS ntables
		FROM pg_namespace n
		LEFT JOIN pg_tables t ON t.schemaname = n.nspname
		WHERE n.nspname NOT LIKE 'pg_%'
		  AND n.nspname <> 'information_schema'
		GROUP BY n.nspname
		ORDER BY n.nspname
	`);
	return r.rows.map((row) => ({ nspname: row.nspname, tables: Number(row.ntables) }));
}

console.log("=== Antes de limpieza ===");
for (const s of await listSchemas()) {
	const legacy = /^(bd_|paty|lab|clientesis)/i.test(s.nspname) || s.nspname === "BD_PATY" || s.nspname === "BD_RAG";
	console.log(`  ${legacy ? "[LEGACY]" : "[OK]    "} ${s.nspname}: ${s.tables} tabla(s)`);
}

console.log("\nAplicando ops (002 renombres + 018 cleanup)…");
const files = await applyLanglabOpsSchema();
console.log("  ", files.join(", "));

console.log("\n=== Después de limpieza ===");
const after = await listSchemas();
for (const s of after) {
	const legacy = /^(bd_|paty|lab|clientesis)/i.test(s.nspname) && !s.nspname.startsWith("BD_");
	const wrong = s.nspname === "BD_RAG";
	console.log(`  ${legacy || wrong ? "[WARN]" : "[OK]  "} ${s.nspname}: ${s.tables} tabla(s)`);
}

const canonical = await pool.query(`
	SELECT table_schema, table_name
	FROM information_schema.tables
	WHERE table_schema IN ('BD_LANGLAB', 'BD_LAB', 'BD_CLIENTESIS')
	  AND table_name IN ('CONVERSACION', 'CONVERSACION_TURNO', 'ENTITY_ROW', 'ORCHESTRATOR_SLOT', 'INSTRUCCION')
	ORDER BY 1, 2
`);
console.log("\nTablas canónicas clave:");
for (const row of canonical.rows) {
	console.log(`  ${row.table_schema}.${row.table_name}`);
}

const badCols = await pool.query<{ table_schema: string; table_name: string; column_name: string }>(`
	SELECT table_schema, table_name, column_name
	FROM information_schema.columns
	WHERE table_schema = 'BD_LANGLAB'
	  AND column_name <> upper(replace(column_name, '_', ''))
	ORDER BY 1, 2, 3
	LIMIT 20
`);
if (badCols.rows.length) {
	console.log("\n[WARN] Columnas aún con minúsculas/guiones (muestra):");
	for (const c of badCols.rows) {
		console.log(`  ${c.table_schema}.${c.table_name}.${c.column_name}`);
	}
} else {
	console.log("\n[ok] Columnas BD_LANGLAB en mayúsculas sin _");
}

const leftover = after.filter((s) => {
	const n = s.nspname;
	return (
		n.startsWith("bd_") ||
		n === "paty" ||
		n === "lab" ||
		n === "clientesis" ||
		(n === "BD_RAG" && s.tables > 0)
	);
});
if (leftover.length) {
	console.log("\n[WARN] Quedan esquemas legacy:", leftover.map((s) => s.nspname).join(", "));
	process.exit(1);
}

const hasBdLab = after.some((s) => s.nspname === "BD_LAB");
if (hasBdLab) {
	console.log("\n[WARN] Aún existe esquema BD_LAB — re-ejecutar ops (019_consolidate)");
	process.exit(1);
}
console.log("\n[ok] BD_LANGLAB (runtime) + BD_PATY (ISA-DOC store) + BD_CLIENTESIS.");
