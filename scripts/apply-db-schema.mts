/**
 * Aplica schemas en ambas BD Render:
 *   - DATABASE_URL (ops): paty, lab
 *   - RAG_DATABASE_URL (rag): rag
 *
 *   npm run db:apply-schema
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { pingClientesisDb, pingPatyDb, pingRagDb } from "../src/lib/db/pg.js";
import { ensureClientesisSchema, ensurePatySchema } from "../src/lib/db/ensure-schemas.js";
import { ensureRagSchema } from "../src/lib/rag/ensureSchema.js";
import { syncOrchestratorSlots } from "../src/lib/orchestrator/store.js";
import { listOrchestratorSlots } from "../src/lib/orchestrator/store.js";

preloadLabSecrets();

console.log("Comprobando conexiones…");
const patyOk = await pingPatyDb();
const clientesisOk = await pingClientesisDb();
const ragOk = await pingRagDb();
if (!patyOk) {
	console.error("FALLO: PATY_DATABASE_URL");
	process.exit(1);
}
if (!clientesisOk) {
	console.error("FALLO: CLIENTESIS_DATABASE_URL");
	process.exit(1);
}
if (!ragOk) {
	console.error("FALLO: RAG_DATABASE_URL");
	process.exit(1);
}
console.log("  paty: OK");
console.log("  clientesis: OK");
console.log("  rag: OK\n");

console.log("Aplicando schema paty (ops) + clientesis…");
await ensurePatySchema();
await ensureClientesisSchema();
const n = await syncOrchestratorSlots();
const slots = await listOrchestratorSlots();
console.log(`  slots orquestador: ${n} (total ${slots.length})`);

console.log("\nAplicando schema rag (vec_contapyme, vec_fitdocs)…");
await ensureRagSchema();
console.log("  rag: listo");

console.log("\n[ok] Ambas bases preparadas.");
