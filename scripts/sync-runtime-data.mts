/**
 * Pobla PostgreSQL desde archivos locales (data/**).
 * Runtime en Azure NO lee MD/JSON — solo esta migración y APIs de escritura.
 *
 *   npm run db:sync-runtime-data
 */
import "dotenv/config";
import { preloadIsaDocSecrets } from "../src/lib/core/secrets.js";
import { pingPatyDb } from "../src/lib/db/pg.js";
import { syncLanglabPromptsFromBundled } from "../src/lib/langlab/db/syncPromptsFromIsaDoc.js";
import { readBundledManifestForSeed, upsertManifestToPg } from "../src/lib/integrations/postman/manifest.js";
import { syncPermissionsFromDoc, type PermissionDoc } from "../src/lib/auth/permissions.js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { seedAllCatalogData } from "../src/lib/ispgen/seed-catalog-data.js";

preloadIsaDocSecrets();

if (!(await pingPatyDb())) {
	console.error("FALLO: sin conexión a PostgreSQL");
	process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

console.log("1/4 Permisos (AUTH_ROLE)…");
const permDoc = JSON.parse(
	readFileSync(join(root, "src/lib/auth/lab-permissions.json"), "utf8"),
) as PermissionDoc;
await syncPermissionsFromDoc(permDoc);

console.log("2/4 Prompts LangLab (INSTRUCCION)…");
await syncLanglabPromptsFromBundled({ log: true });

console.log("3/4 API catalog (APICATALOG_MANIFEST)…");
try {
	await upsertManifestToPg(readBundledManifestForSeed());
	console.log("   APICATALOG_MANIFEST OK");
} catch (e) {
	console.warn("   Skip catalog:", e instanceof Error ? e.message : e);
}

console.log("4/4 Entity store (ENTITY_ROW)…");
const counts = await seedAllCatalogData();
console.log(counts);

console.log("\n[ok] BD lista para runtime remoto (sin depender de data/ en Azure).");
