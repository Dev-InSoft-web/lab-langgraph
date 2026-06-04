import { join } from "node:path";
import { getClientesisPgPool, getPatyPgPool } from "./pg.js";
import { applySqlFiles } from "./apply-sql-dir.js";
import { resolveLabRepoRoot } from "../core/data-paths.js";

function schemaDir(...parts: string[]): string {
	return join(resolveLabRepoRoot(), "db", "schema", ...parts);
}

let patyApplied = false;
let clientesisApplied = false;

/** BD Paty/Lab: esquemas BD_PATY, BD_LAB (prompts, orquestador, catálogo, entity row). */
export async function ensurePatySchema(): Promise<string[]> {
	if (patyApplied) return [];
	const files = await applySqlFiles(getPatyPgPool(), schemaDir("ops"));
	await getPatyPgPool()
		.query('SELECT "BD_PATY"."PATY_EXPIRESTALORCHESTRATORLEASES"()')
		.catch(() => {});
	patyApplied = true;
	return files;
}

/** BD ClientesIS: esquema BD_CLIENTESIS (CIS_ENTITYROW). */
export async function ensureClientesisSchema(): Promise<string[]> {
	if (clientesisApplied) return [];
	const files = await applySqlFiles(getClientesisPgPool(), schemaDir("clientesis"));
	clientesisApplied = true;
	return files;
}

export async function ensureAllStoreSchemas(): Promise<void> {
	await ensurePatySchema();
	await ensureClientesisSchema();
}

/** @deprecated */
export const ensureOpsSchema = ensurePatySchema;
