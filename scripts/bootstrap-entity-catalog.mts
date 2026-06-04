/**
 * Aplica metadatos de catálogo (si 009 no corrió) y opcionalmente datos.
 *
 *   npm run catalog:bootstrap
 *   npm run catalog:bootstrap -- --data
 */
import { preloadIsaDocSecrets } from "../src/lib/core/secrets.js";
import { bootstrapCatalogFromDefinitions } from "../src/lib/ispgen/catalog-bootstrap.js";
import { registerControllersFromCatalog } from "../src/lib/ispgen/catalog-load.js";
import { seedAllCatalogData } from "../src/lib/ispgen/seed-catalog-data.js";

preloadIsaDocSecrets();
const withData = process.argv.includes("--data");

const meta = await bootstrapCatalogFromDefinitions();
console.log(`[ok] catálogo: ${meta.projects} proyectos, ${meta.sections} secciones, ${meta.entities} entidades`);

const n = await registerControllersFromCatalog();
console.log(`[ok] ${n} controladores registrados`);

if (withData) {
	const data = await seedAllCatalogData();
	console.log("[ok] datos:", data);
}
