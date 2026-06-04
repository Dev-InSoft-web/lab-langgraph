/**
 * Estado nomenclatura + host de BD (sin mostrar password).
 *   npx tsx scripts/db-nomenclature-status.mts
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getPatyDatabaseUrl } from "../src/lib/core/config.js";
import { getPatyPgPool, pingPatyDb } from "../src/lib/db/pg.js";

preloadLabSecrets();

function maskUrl(url: string): string {
	try {
		const u = new URL(url);
		return `${u.protocol}//${u.username ? "***@" : ""}${u.hostname}${u.port ? ":" + u.port : ""}${u.pathname}`;
	} catch {
		return "(url inválida)";
	}
}

let dbUrl: string;
try {
	dbUrl = getPatyDatabaseUrl();
} catch (e) {
	console.error("Sin PATY_DATABASE_URL / DATABASE_URL:", e);
	process.exit(1);
}

console.log("Conexión:", maskUrl(dbUrl));
if (!(await pingPatyDb())) {
	console.error("No hay ping a PostgreSQL.");
	process.exit(1);
}

const pool = getPatyPgPool();

const schemas = await pool.query<{ nspname: string }>(
	`SELECT nspname FROM pg_namespace
	 WHERE nspname ILIKE 'bd\\_%' ESCAPE '\\' OR nspname LIKE 'BD_%'
	 ORDER BY 1`,
);
console.log("\nEsquemas:");
for (const { nspname } of schemas.rows) {
	const kind =
		nspname.startsWith("BD_") ? "nuevo" : nspname === nspname.toLowerCase() ? "LEGACY" : "?";
	console.log(`  ${nspname} (${kind})`);
}

const legacy = await pool.query<{ n: number }>(
	`SELECT count(*)::int AS n FROM pg_tables WHERE schemaname IN ('bd_lab','bd_paty','bd_clientesis','bd_rag')`,
);
const nuevo = await pool.query<{ n: number }>(
	`SELECT count(*)::int AS n FROM pg_tables WHERE schemaname IN ('BD_LAB','BD_PATY','BD_CLIENTESIS','BD_RAG')`,
);
console.log(`\nTablas legacy (bd_*): ${legacy.rows[0]?.n ?? 0}`);
console.log(`Tablas BD_*: ${nuevo.rows[0]?.n ?? 0}`);

const er = await pool.query(
	`SELECT column_name FROM information_schema.columns
	 WHERE table_schema = 'BD_LAB' AND table_name = 'LAB_ENTITYROW' ORDER BY ordinal_position`,
);
if (er.rows.length) {
	console.log("\nBD_LAB.LAB_ENTITYROW:", er.rows.map((r: { column_name: string }) => r.column_name).join(", "));
} else {
	const old = await pool.query(
		`SELECT column_name FROM information_schema.columns
		 WHERE table_schema = 'bd_lab' AND table_name = 'lab_entity_row' ORDER BY ordinal_position`,
	);
	if (old.rows.length) {
		console.log("\n[LEGACY] bd_lab.lab_entity_row:", old.rows.map((r: { column_name: string }) => r.column_name).join(", "));
		console.log("\n→ Ejecutar: npm run db:migrate-nomenclature");
		process.exit(1);
	}
	console.log("\n[WARN] No hay LAB_ENTITYROW ni lab_entity_row");
	process.exit(1);
}

const legacyCols = er.rows.some((r: { column_name: string }) => r.column_name.includes("_") || r.column_name === r.column_name.toLowerCase());
if (legacyCols) {
	console.log("\n[WARN] Columnas aún en minúsculas o con _");
	process.exit(1);
}
console.log("\n[ok] Nomenclatura BD_* aplicada en esta instancia.");
