import { join } from "node:path";
import { getClientesisPgPool, getPatyPgPool } from "./pg.js";
import { applySqlFiles } from "./apply-sql-dir.js";
import { resolveLabRepoRoot } from "../core/data-paths.js";

function schemaDir(...parts: string[]): string {
	return join(resolveLabRepoRoot(), "db", "schema", ...parts);
}

let patyApplied = false;
let clientesisApplied = false;

/** BD Paty/Lab: esquemas `bd_paty`, `bd_lab` (prompts, orquestador, catálogo, entity_row). */
export async function ensurePatySchema(): Promise<string[]> {
	if (patyApplied) return [];
	const files = await applySqlFiles(getPatyPgPool(), schemaDir("ops"));
	await getPatyPgPool().query("SELECT bd_paty.paty_expire_stale_orchestrator_leases()").catch(() => {});
	patyApplied = true;
	return files;
}

/** BD ClientesIS: esquema `bd_clientesis` (`cis_entity_row`). */
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
