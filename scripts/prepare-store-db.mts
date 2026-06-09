/**
 * Prepara BD operacional: schemas 006–010, catálogo y datos entity_row.
 * No requiere RAG_DATABASE_URL.
 *
 *   npm run db:prepare-store
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { pingOpsDb } from "../src/lib/db/pg.js";
import { ensureOpsSchema } from "../src/lib/langlab/db/ensureSchema.js";
import { bootstrapCatalogFromDefinitions } from "../src/lib/ispgen/catalog-bootstrap.js";
import { registerControllersFromCatalog } from "../src/lib/ispgen/catalog-load.js";
import { seedAllCatalogData } from "../src/lib/ispgen/seed-catalog-data.js";
import { countCatalogRows } from "../src/lib/ispgen/catalog-repository.js";
import { getOpsPgPool } from "../src/lib/db/pg.js";

preloadLabSecrets();

if (!process.env.DATABASE_URL?.trim()) {
	console.error("FALLO: falta DATABASE_URL en local.settings.json o secrets/patyia/lab-databases.env");
	process.exit(1);
}

console.log("Comprobando DATABASE_URL (ops)…");
if (!(await pingOpsDb())) {
	console.error("FALLO: no hay conexión a PostgreSQL operacional");
	process.exit(1);
}
console.log("  ops: OK\n");

console.log("Aplicando schemas ops (paty, lab, 006–010)…");
await ensureOpsSchema();
console.log("  DDL: OK\n");

const before = await countCatalogRows();
console.log(`Catálogo antes: ${before} definiciones`);

console.log("Bootstrap catálogo (proyectos, secciones, entidades)…");
const meta = await bootstrapCatalogFromDefinitions();
console.log(`  ${meta.projects} proyectos, ${meta.sections} secciones, ${meta.entities} entidades`);

const n = await registerControllersFromCatalog();
console.log(`  ${n} controladores listos\n`);

console.log("Seed datos en lab.entity_row…");
const data = await seedAllCatalogData();
console.log("  ", data);

const counts = await getOpsPgPool().query<{
	projects: string;
	sections: string;
	defs: string;
	rows: string;
}>(`
	SELECT
		(SELECT COUNT(*)::text FROM lab.store_project) AS projects,
		(SELECT COUNT(*)::text FROM lab.store_section) AS sections,
		(SELECT COUNT(*)::text FROM lab.entity_definition) AS defs,
		(SELECT COUNT(*)::text FROM lab.entity_row) AS rows
`);
const c = counts.rows[0];
console.log("\nResumen PG:");
console.log(`  store_project: ${c?.projects}`);
console.log(`  store_section: ${c?.sections}`);
console.log(`  entity_definition: ${c?.defs}`);
console.log(`  entity_row: ${c?.rows}`);
console.log("\n[ok] BD operacional preparada para CRUD /api/entity y /api/catalog.");
