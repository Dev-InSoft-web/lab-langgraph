/**
 * Aplica schemas operacionales en PostgreSQL (paty + lab + clientesis).
 * No requiere RAG_DATABASE_URL. Los agentes pueden ejecutarlo sin confirmación UI.
 *
 *   npm run db:apply-pg-ops
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabDatabaseUrl, getClientesisDatabaseUrl } from "../src/lib/core/config.js";
import { pingClientesisDb, pingPatyDb } from "../src/lib/db/pg.js";
import { applyClientesisSchema, applyLanglabOpsSchema } from "../src/lib/db/ensure-schemas.js";

preloadLabSecrets();

try {
	getLanglabDatabaseUrl();
	getClientesisDatabaseUrl();
} catch (e) {
	console.error("FALLO:", e instanceof Error ? e.message : e);
	process.exit(1);
}

console.log("Comprobando PostgreSQL operacional…");
const patyOk = await pingPatyDb();
const clientesisOk = await pingClientesisDb();
if (!patyOk || !clientesisOk) {
	console.error("FALLO: sin conexión a PATY_DATABASE_URL / CLIENTESIS_DATABASE_URL");
	process.exit(1);
}
console.log("  paty: OK");
console.log("  clientesis: OK\n");

console.log("Aplicando ops (paty, lab, sin FK)…");
const patyFiles = await applyLanglabOpsSchema();
console.log("  ", patyFiles.join(", "));

console.log("\nAplicando clientesis (esquema + migración desde lab.entity_row)…");
const cisFiles = await applyClientesisSchema();
console.log("  ", cisFiles.join(", "));

console.log("\n[ok] Schemas paty, lab y clientesis listos.");
