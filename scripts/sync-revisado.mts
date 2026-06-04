/**
 * Migra checks de bitácora a PG y sincroniza JSON en ISA-DOC + lab.
 *
 *   npm run revisado:sync
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { pingPatyDb } from "../src/lib/db/pg.js";
import { exportRevisadoSnapshots, readRevisadoAll } from "../src/lib/persistence/revisado.js";
import { loadMergedRevisadoJson } from "../src/lib/persistence/revisado-merge.js";

preloadLabSecrets();

if (!(await pingPatyDb())) {
	console.error("FALLO: sin conexión a PATY_DATABASE_URL");
	process.exit(1);
}

const before = await loadMergedRevisadoJson();
console.log(`Fuentes JSON unificadas: ${Object.keys(before).length} claves`);

const map = await readRevisadoAll();
console.log(`PG lab.bitacora_revisado: ${Object.keys(map).length} claves`);

await exportRevisadoSnapshots();
console.log("[ok] Exportado a ISA-DOC/data/revisado.json y public/static-api/revisado.json");
