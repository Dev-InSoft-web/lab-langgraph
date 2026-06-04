import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolveLabRepoRoot } from "../core/data-paths.js";
import { getPatyPgPool } from "../db/pg.js";

let applied = false;

/** Solo `014_lab_auth_users.sql` — no reaplica el resto de ops (evita fallos en BDs ya migradas). */
export async function ensureLabAuthSchema(): Promise<void> {
	if (applied) return;
	const path = join(resolveLabRepoRoot(), "db", "schema", "ops", "014_lab_auth_users.sql");
	const sql = await readFile(path, "utf8");
	await getPatyPgPool().query(sql);
	applied = true;
}
