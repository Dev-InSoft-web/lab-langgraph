/**
 * Auth en BD_LANGLAB.AUTH_USER (BD_LAB = mismo dominio, consolidado vía 019).
 *
 *   npm run auth:apply-pg
 *   npm run auth:apply-pg -- --seed
 *
 * Previo recomendado: npm run db:nomenclature-status && npm run db:audit-tables
 */
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabDatabaseUrl } from "../src/lib/core/config.js";
import { pingPatyDb, getPatyPgPool } from "../src/lib/db/pg.js";
import { ensureLabAuthSchema } from "../src/lib/auth/ensure-auth-schema.js";
import { syncPermissionsFromDoc } from "../src/lib/auth/permissions.js";
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

const pool = getPatyPgPool();

const bdLab = await pool.query<{ n: string }>(
	`SELECT count(*)::text AS n FROM pg_tables WHERE schemaname = 'BD_LAB'`,
);
if (Number(bdLab.rows[0]?.n ?? 0) > 0) {
	console.warn("WARN: aún hay tablas en BD_LAB — se consolidarán en BD_LANGLAB");
}

console.log("Aplicando auth en BD_LANGLAB…");
await ensureLabAuthSchema();

const check = await pool.query<{ n: string }>(
	`SELECT count(*)::text AS n FROM information_schema.tables
	 WHERE table_schema = 'BD_LANGLAB' AND table_name = 'AUTH_USER'`,
);
console.log("  BD_LANGLAB.AUTH_USER:", check.rows[0]?.n === "1" ? "OK" : "FALTA");

const seed = process.argv.includes("--seed");
if (seed) {
	const root = join(fileURLToPath(import.meta.url), "..", "..");
	const username = process.env.LAB_SEED_USERNAME?.trim() || "JAGUDELOE";
	const password = process.env.LAB_SEED_PASSWORD?.trim() || "Jeffrey1.618";
	await upsertLabUser({ username, password, displayName: username, roleCode: "admin" });
	console.log(`  usuario: ${username.toUpperCase()} (rol admin)`);
	const permPath = join(root, "src/lib/auth/lab-permissions.json");
	const permDoc = JSON.parse(readFileSync(permPath, "utf8")) as {
		roles: Record<string, { description?: string; allow: string[] }>;
		users: Record<string, { role: string }>;
	};
	await syncPermissionsFromDoc(permDoc);
	console.log("  permisos: AUTH_ROLE / AUTH_ROLEALLOW");
} else {
	console.log("  (omitido seed; usa --seed)");
}

const orphan = await pool.query<{ n: string }>(
	`SELECT count(*)::text AS n FROM pg_tables WHERE schemaname = 'BD_LAB'`,
);
if (Number(orphan.rows[0]?.n ?? 0) > 0) {
	console.warn("\n[WARN] Quedan tablas en BD_LAB. Ejecute: npm run db:consolidate-schemas");
} else {
	console.log("\n[ok] Solo BD_LANGLAB (BD_LAB consolidado).");
}
