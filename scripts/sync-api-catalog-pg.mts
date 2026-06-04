/**
 * Sube data/api-catalog.json a PostgreSQL (lab.api_catalog_manifest).
 *
 *   npm run catalog:sync-pg
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { preloadIsaDocSecrets } from "../src/lib/core/secrets.js";
import { resolveBundledCatalogPath } from "../src/lib/integrations/postman/paths.js";
import { upsertManifestToPg } from "../src/lib/integrations/postman/manifest.js";
import type { ApiCatalogManifest } from "../src/lib/integrations/postman/types.js";

preloadIsaDocSecrets();
const path = resolveBundledCatalogPath();
if (!existsSync(path)) {
	console.error(`Falta ${path}. Ejecute primero: npm run catalog:build`);
	process.exit(1);
}
const manifest = JSON.parse(readFileSync(path, "utf8")) as ApiCatalogManifest;
await upsertManifestToPg(manifest);
console.log(`[ok] Manifiesto v${manifest.version} en PG (${manifest.generatedAt})`);
