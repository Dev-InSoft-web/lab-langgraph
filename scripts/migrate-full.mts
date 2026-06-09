/**
 * Migración completa a Render langlab (DATABASE_URL en local.settings.json).
 *
 *   npm run db:migrate-full
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getClientesisDatabaseUrl, getLanglabDatabaseUrl } from "../src/lib/core/config.js";
import { pingClientesisDb, pingPatyDb } from "../src/lib/db/pg.js";
import { applyClientesisSchema, applyLanglabOpsSchema } from "../src/lib/db/ensure-schemas.js";
import { bootstrapCatalogFromDefinitions } from "../src/lib/ispgen/catalog-bootstrap.js";
import { registerControllersFromCatalog } from "../src/lib/ispgen/catalog-load.js";
import { seedAllCatalogData } from "../src/lib/ispgen/seed-catalog-data.js";
import { getClientesisPgPool, getPatyPgPool } from "../src/lib/db/pg.js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { resolveBundledCatalogPath } from "../src/lib/integrations/postman/paths.js";
import { upsertManifestToPg } from "../src/lib/integrations/postman/manifest.js";
import type { ApiCatalogManifest } from "../src/lib/integrations/postman/types.js";

function dbLabel(): string {
	try {
		const u = new URL(process.env.DATABASE_URL!.trim());
		return `${u.hostname}/${u.pathname.replace(/^\//, "")}`;
	} catch {
		return "?";
	}
}

preloadLabSecrets();

if (!process.env.DATABASE_URL?.trim()) {
	console.error("FALLO: DATABASE_URL — configure local.settings.json Values");
	process.exit(1);
}

console.log(`=== Migración completa → ${dbLabel()} ===\n`);

if (!(await pingPatyDb())) {
	console.error("FALLO: PATY_DATABASE_URL");
	process.exit(1);
}
if (!(await pingClientesisDb())) {
	console.error("FALLO: CLIENTESIS_DATABASE_URL");
	process.exit(1);
}
const split = getLanglabDatabaseUrl() !== getClientesisDatabaseUrl();
console.log(`[1/6] Conexión PG: paty OK, clientesis OK (split=${split})`);

console.log("[2/6] Schemas SQL (sin FK)…");
await applyLanglabOpsSchema();
await applyClientesisSchema();
console.log("      DDL paty + clientesis aplicado");

console.log("[3/6] Catálogo proyectos/secciones/entidades…");
const meta = await bootstrapCatalogFromDefinitions();
console.log(`      ${meta.projects} proyectos, ${meta.sections} secciones, ${meta.entities} entidades`);
await registerControllersFromCatalog();

console.log("[4/6] Manifiesto API → lab.api_catalog_manifest…");
const catalogPath = resolveBundledCatalogPath();
if (existsSync(catalogPath)) {
	const manifest = JSON.parse(readFileSync(catalogPath, "utf8")) as ApiCatalogManifest;
	await upsertManifestToPg(manifest);
	console.log(`      v${manifest.version} (${manifest.generatedAt})`);
} else {
	console.warn(`      omitido: falta ${catalogPath} — ejecute npm run catalog:build`);
}

console.log("[5/6] Seed lab.entity_row (datos ISA-DOC + catálogo)…");
const data = await seedAllCatalogData();
console.log("     ", data);

console.log("[6/6] Verificación…");
const patyC = await getPatyPgPool().query<{ defs: string; rows: string; manifest: string }>(`
	SELECT
		(SELECT COUNT(*)::text FROM lab.entity_definition) AS defs,
		(SELECT COUNT(*)::text FROM lab.entity_row) AS rows,
		(SELECT COUNT(*)::text FROM lab.api_catalog_manifest) AS manifest
`);
const cisC = await getClientesisPgPool().query<{ rows: string }>(
	`SELECT COUNT(*)::text AS rows FROM lab.entity_row`,
);
const p = patyC.rows[0];
const cis = cisC.rows[0];
console.log(`      paty: defs=${p?.defs} rows=${p?.rows} manifest=${p?.manifest}`);
console.log(`      clientesis entity_row=${cis?.rows}`);

if (Number(p?.rows ?? 0) + Number(cis?.rows ?? 0) < 1) {
	console.error("\nFALLO: entity_row vacío — revise data:migrate-from-isa y rutas ISA-DOC");
	process.exit(1);
}

console.log("\n[ok] Migración completa en", dbLabel());
console.log("En Render/psql use schema: lab (no public)");
console.log("Ejemplo: SELECT COUNT(*) FROM lab.entity_row;");
