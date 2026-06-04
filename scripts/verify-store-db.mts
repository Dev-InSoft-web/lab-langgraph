/**
 * Verifica conexión y conteos en lab.* (sin imprimir contraseñas).
 *   npx tsx scripts/verify-store-db.mts
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getOpsPgPool, pingOpsDb } from "../src/lib/db/pg.js";

preloadLabSecrets();

function dbLabel(): string {
	const url = process.env.DATABASE_URL?.trim() ?? "";
	try {
		const u = new URL(url);
		return `${u.hostname}/${u.pathname.replace(/^\//, "")}`;
	} catch {
		return url ? "(url inválida)" : "(sin DATABASE_URL)";
	}
}

console.log(`DATABASE_URL → ${dbLabel()}`);
if (!(await pingOpsDb())) {
	console.error("FALLO: sin conexión");
	process.exit(1);
}

const pool = getOpsPgPool();
const schemas = await pool.query<{ schema_name: string }>(
	`SELECT schema_name FROM information_schema.schemata
	 WHERE schema_name IN ('lab', 'paty') ORDER BY 1`,
);
console.log("Schemas:", schemas.rows.map((r) => r.schema_name).join(", ") || "(ninguno)");

const tables = await pool.query<{ table: string }>(
	`SELECT table_schema || '.' || table_name AS table
	 FROM information_schema.tables
	 WHERE table_schema = 'lab' AND table_type = 'BASE TABLE'
	 ORDER BY 1`,
);
console.log("Tablas lab:", tables.rows.map((r) => r.table).join(", ") || "(ninguna)");

try {
	const c = await pool.query<{
		projects: string;
		sections: string;
		defs: string;
		rows: string;
		manifest: string;
	}>(`
		SELECT
			(SELECT COUNT(*)::text FROM lab.store_project) AS projects,
			(SELECT COUNT(*)::text FROM lab.store_section) AS sections,
			(SELECT COUNT(*)::text FROM lab.entity_definition) AS defs,
			(SELECT COUNT(*)::text FROM lab.entity_row) AS rows,
			(SELECT COUNT(*)::text FROM lab.api_catalog_manifest) AS manifest
	`);
	const row = c.rows[0];
	console.log("\nConteos:");
	console.log(`  store_project:       ${row?.projects ?? "?"}`);
	console.log(`  store_section:       ${row?.sections ?? "?"}`);
	console.log(`  entity_definition:   ${row?.defs ?? "?"}`);
	console.log(`  entity_row:          ${row?.rows ?? "?"}`);
	console.log(`  api_catalog_manifest:${row?.manifest ?? "?"}`);
} catch (e) {
	console.error("Error leyendo lab.*:", (e as Error).message);
	process.exit(1);
}
