import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { getRagPgPool } from "../db/pg.js";

function resolveRagSchemaDir(): string {
	const fromEnv = process.env.LAB_LANGGRAPH_ROOT?.trim();
	if (fromEnv) return join(fromEnv, "db", "schema", "rag");
	return join(__dirname, "..", "..", "..", "db", "schema", "rag");
}

let applied = false;

export async function ensureRagSchema(): Promise<void> {
	if (applied) return;
	const dir = resolveRagSchemaDir();
	const pool = getRagPgPool();
	const files = (await readdir(dir))
		.filter((f) => f.endsWith(".sql"))
		.sort();
	for (const file of files) {
		const sql = await readFile(join(dir, file), "utf8");
		await pool.query(sql);
	}
	applied = true;
}
