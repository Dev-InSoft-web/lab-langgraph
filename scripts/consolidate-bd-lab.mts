/**
 * Unifica BD_LAB → BD_LANGLAB (mismo dominio operacional LangLab).
 * Ejecutar antes de DDL nuevo si el cliente DB aún muestra dos esquemas.
 *
 *   npm run db:consolidate-schemas
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
const sql = readFileSync(join(root, "db/schema/ops/019_consolidate_bd_lab_into_bd_langlab.sql"), "utf8");
const pool = getPatyPgPool();

const before = await pool.query<{ schemaname: string; tablename: string }>(
	`SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('BD_LAB','BD_LANGLAB') ORDER BY 1,2`,
);
console.log("Antes:", before.rows.map((r) => `${r.schemaname}.${r.tablename}`).join(", ") || "(vacío)");

await pool.query(sql);

const after = await pool.query<{ schemaname: string; tablename: string }>(
	`SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('BD_LAB','BD_LANGLAB') ORDER BY 1,2`,
);
console.log("Después:", after.rows.map((r) => `${r.schemaname}.${r.tablename}`).join(", "));

const bdLabLeft = after.rows.filter((r) => r.schemaname === "BD_LAB").length;
if (bdLabLeft > 0) {
	console.error("\n[FALLO] Aún existe BD_LAB");
	process.exit(1);
}
console.log("\n[ok] BD_LAB consolidado en BD_LANGLAB");
