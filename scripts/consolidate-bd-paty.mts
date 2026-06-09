/**
 * Unifica BD_PATY (+ BD_CLIENTESIS) → BD_ISADOC y elimina esquemas legacy.
 *
 *   npm run db:consolidate-isadoc
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { pingPatyDb, getPatyPgPool } from "../src/lib/db/pg.js";

preloadLabSecrets();

if (!(await pingPatyDb())) {
	console.error("Sin conexión PostgreSQL");
	process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sql = readFileSync(join(root, "db/schema/ops/021_consolidate_bd_isadoc.sql"), "utf8");
const pool = getPatyPgPool();

const listSchemas = async () => {
	const r = await pool.query<{ schemaname: string; tablename: string }>(
		`SELECT schemaname, tablename FROM pg_tables
		 WHERE schemaname IN ('BD_PATY','BD_ISADOC','BD_CLIENTESIS') ORDER BY 1,2`,
	);
	return r.rows.map((x) => `${x.schemaname}.${x.tablename}`).join(", ") || "(vacío)";
};

console.log("Antes:", await listSchemas());
await pool.query(sql);
console.log("Después:", await listSchemas());

const patyLeft = await pool.query<{ n: string }>(
	`SELECT count(*)::text AS n FROM pg_namespace WHERE nspname = 'BD_PATY'`,
);
if (Number(patyLeft.rows[0]?.n ?? 0) > 0) {
	console.error("\n[FALLO] Aún existe esquema BD_PATY");
	process.exit(1);
}
console.log("\n[ok] BD_PATY consolidado en BD_ISADOC");
