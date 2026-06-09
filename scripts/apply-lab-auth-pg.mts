/**
 * Crea/actualiza tabla bd_lab.lab_auth_user y opcionalmente el usuario seed.
 * No requiere RAG_DATABASE_URL.
 *
 *   npm run auth:apply-pg
 *   npm run auth:apply-pg -- --seed
 */
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabDatabaseUrl } from "../src/lib/core/config.js";
import { pingPatyDb, getPatyPgPool } from "../src/lib/db/pg.js";
import { ensureLabAuthSchema } from "../src/lib/auth/ensure-auth-schema.js";
import { upsertLabUser } from "../src/lib/auth/users.js";

preloadLabSecrets();

try {
	getLanglabDatabaseUrl();
} catch (e) {
	console.error("FALLO:", e instanceof Error ? e.message : e);
	process.exit(1);
}

if (!(await pingPatyDb())) {
	console.error("FALLO: sin conexión a PATY_DATABASE_URL / DATABASE_URL");
	process.exit(1);
}

const root = join(fileURLToPath(import.meta.url), "..", "..");
console.log("Aplicando bd_lab.lab_auth_user…");
await ensureLabAuthSchema();
const pool = getPatyPgPool();

const check = await pool.query<{ n: string }>(
	`SELECT COUNT(*)::text AS n FROM information_schema.tables
	 WHERE table_schema = 'BD_LAB' AND table_name = 'AUTH_AUTHUSER'`,
);
console.log("  tabla AUTH_AUTHUSER:", check.rows[0]?.n === "1" ? "OK" : "FALTA");

const seed = process.argv.includes("--seed");
if (seed) {
	const username = process.env.LAB_SEED_USERNAME?.trim() || "JAGUDELOE";
	const password = process.env.LAB_SEED_PASSWORD?.trim() || "Jeffrey1.618";
	await upsertLabUser({ username, password, displayName: username });
	console.log(`  usuario: ${username.toUpperCase()} (hash bcrypt actualizado)`);
} else {
	console.log("  (omitido seed; usa --seed o npm run auth:seed-user)");
}

console.log("\n[ok] Auth PG listo.");
