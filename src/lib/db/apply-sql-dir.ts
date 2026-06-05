import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Pool } from "pg";

export async function applySqlFiles(pool: Pool, dir: string): Promise<string[]> {
	const applied: string[] = [];
	const allowReset = process.env.LAB_DB_RESET === "1";
	const migrateLegacy = process.env.LAB_DB_MIGRATE_LEGACY === "1";
	const files = (await readdir(dir))
		.filter((f) => f.endsWith(".sql"))
		.filter((f) => allowReset || !f.startsWith("000_reset"))
		.filter((f) => migrateLegacy || !f.startsWith("013_"))
		.sort();
	for (const file of files) {
		const sql = await readFile(join(dir, file), "utf8");
		await pool.query(sql);
		applied.push(file);
	}
	return applied;
}
