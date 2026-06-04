/**
 * Borra schemas y reinicializa (sin FK). Luego migración de datos.
 *
 *   npm run db:reset-migrate
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import {
	getClientesisDatabaseUrl,
	getPatyDatabaseUrl,
} from "../src/lib/core/config.js";
import { getClientesisPgPool, getPatyPgPool } from "../src/lib/db/pg.js";
import { resolveLabRepoRoot } from "../src/lib/core/data-paths.js";

preloadLabSecrets();

function label(url: string): string {
	try {
		const u = new URL(url);
		return `${u.hostname}/${u.pathname.replace(/^\//, "")}`;
	} catch {
		return url;
	}
}

async function runReset(pool: Awaited<ReturnType<typeof getPatyPgPool>>, sqlFile: string, name: string) {
	const sql = await readFile(sqlFile, "utf8");
	console.log(`[reset] ${name}`);
	await pool.query(sql);
}

const root = resolveLabRepoRoot();
const patyUrl = getPatyDatabaseUrl();
const clientesisUrl = getClientesisDatabaseUrl();

console.log(`Paty PG:        ${label(patyUrl)}`);
console.log(`Clientesis PG:  ${label(clientesisUrl)}\n`);

await runReset(
	getPatyPgPool(),
	join(root, "db", "schema", "ops", "000_reset_paty.sql"),
	"paty+lab",
);

if (clientesisUrl !== patyUrl) {
	await runReset(
		getClientesisPgPool(),
		join(root, "db", "schema", "clientesis", "000_reset_clientesis.sql"),
		"clientesis lab",
	);
} else {
	console.log("[reset] clientesis comparte instancia Paty — un solo DROP lab/paty");
}

process.env.LAB_DB_RESET = "1";
console.log("\n[ok] Schemas eliminados. Ejecute: npm run db:migrate-full");
