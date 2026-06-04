import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { pingRagDb } from "../src/lib/db/pg.js";
import { ensureRagSchema } from "../src/lib/rag/ensureSchema.js";

preloadLabSecrets();
if (!(await pingRagDb())) {
	console.error("RAG_DATABASE_URL no responde");
	process.exit(1);
}
await ensureRagSchema();
console.log("[ok] Schema rag aplicado en RAG_DATABASE_URL");
