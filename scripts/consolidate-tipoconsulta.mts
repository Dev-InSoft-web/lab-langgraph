/**
 * TDCONSULTA* → CONVERSACION_TIPOCONSULTA
 *   npm run db:consolidate-tipoconsulta
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getPatyPgPool, pingPatyDb } from "../src/lib/db/pg.js";

preloadLabSecrets();
if (!(await pingPatyDb())) process.exit(1);

const sql = readFileSync(
	join(process.cwd(), "db/schema/ops/026_consolidate_conversacion_tipoconsulta.sql"),
	"utf8",
);
const pool = getPatyPgPool();
const before = await pool.query<{ tablename: string }>(
	`SELECT tablename FROM pg_tables WHERE schemaname = 'BD_LANGLAB'
	 AND (tablename LIKE 'TDCONSULTA%' OR tablename = 'CONVERSACION_TIPOCONSULTA') ORDER BY 1`,
);
console.log("Antes:", before.rows.map((r) => r.tablename).join(", ") || "(vacío)");
await pool.query(sql);
const after = await pool.query<{ tablename: string; n: string }>(
	`SELECT tablename FROM pg_tables WHERE schemaname = 'BD_LANGLAB'
	 AND (tablename LIKE 'TDCONSULTA%' OR tablename = 'CONVERSACION_TIPOCONSULTA') ORDER BY 1`,
);
console.log("Después:", after.rows.map((r) => r.tablename).join(", "));
const count = await pool.query<{ n: string }>(
	`SELECT count(*)::text AS n FROM "BD_LANGLAB"."CONVERSACION_TIPOCONSULTA"`,
);
console.log(`Filas CONVERSACION_TIPOCONSULTA: ${count.rows[0]?.n ?? "0"}`);
if (after.rows.some((r) => r.tablename.startsWith("TDCONSULTA"))) process.exit(1);
console.log("\n[ok] Consolidado");
