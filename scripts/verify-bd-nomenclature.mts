/**
 * Reporta esquemas/tablas legacy (bd_*) vs migrados (BD_*).
 *   npx tsx scripts/verify-bd-nomenclature.mts
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabDatabaseUrl } from "../src/lib/core/config.js";
import { getPatyPgPool, pingPatyDb } from "../src/lib/db/pg.js";

preloadLabSecrets();
try {
	getLanglabDatabaseUrl();
} catch (e) {
	console.error(e);
	process.exit(1);
}
if (!(await pingPatyDb())) process.exit(1);

const pool = getPatyPgPool();

const schemas = await pool.query<{ nspname: string }>(
	`SELECT nspname FROM pg_namespace
	 WHERE nspname ILIKE 'bd\\_%' ESCAPE '\\' OR nspname LIKE 'BD_%'
	 ORDER BY nspname`,
);

console.log("\n=== Esquemas PG ===");
for (const { nspname } of schemas.rows) {
	const legacy = nspname === nspname.toLowerCase() && nspname.startsWith("bd_");
	console.log(legacy ? `  [LEGACY] ${nspname}` : `  [OK]     ${nspname}`);
}

const tables = await pool.query<{ schemaname: string; tablename: string }>(
	`SELECT schemaname, tablename FROM pg_tables
	 WHERE schemaname ILIKE 'bd\\_%' ESCAPE '\\' OR schemaname LIKE 'BD_%'
	 ORDER BY 1, 2`,
);

const legacyTables = tables.rows.filter((t) => t.schemaname === t.schemaname.toLowerCase());
const okTables = tables.rows.filter((t) => t.schemaname !== t.schemaname.toLowerCase() || t.schemaname.startsWith("BD_"));

console.log(`\n=== Tablas: ${okTables.length} en BD_*, ${legacyTables.length} legacy (bd_*) ===`);
if (legacyTables.length) {
	for (const t of legacyTables.slice(0, 30)) console.log(`  ${t.schemaname}.${t.tablename}`);
	if (legacyTables.length > 30) console.log(`  ... +${legacyTables.length - 30}`);
}

const sample = await pool.query<{ column_name: string }>(
	`SELECT column_name FROM information_schema.columns
	 WHERE table_schema = 'BD_LANGLAB' AND table_name = 'ENTITY_ROW'
	 ORDER BY ordinal_position`,
);
if (sample.rows.length) {
	const cols = sample.rows.map((r) => r.column_name);
	const hasUnderscore = cols.some((c) => c.includes("_"));
	console.log("\n=== BD_LANGLAB.ENTITY_ROW ===");
	console.log("  columnas:", cols.join(", "));
	console.log(hasUnderscore ? "  [WARN] aún hay columnas con _" : "  [OK] sin _ en columnas");
} else {
	console.log("\n[WARN] No existe BD_LANGLAB.ENTITY_ROW — ejecutar npm run db:apply-pg-ops");
}

if (legacyTables.length > 0) {
	console.log("\n→ Ejecutar: npm run db:migrate-nomenclature");
	process.exit(1);
}
console.log("\n[ok] Nomenclatura BD_* en PostgreSQL (ops).");
