import { join } from "node:path";
import { getClientesisPgPool, getLanglabPgPool } from "./pg.js";
import { applySqlFiles } from "./apply-sql-dir.js";
import { resolveLabRepoRoot } from "../core/data-paths.js";

function schemaDir(...parts: string[]): string {
	return join(resolveLabRepoRoot(), "db", "schema", ...parts);
}

let langlabReady = false;
let clientesisReady = false;

async function langlabCoreTableExists(): Promise<boolean> {
	const r = await getLanglabPgPool().query(
		`SELECT 1 FROM information_schema.tables WHERE table_schema = 'BD_LANGLAB' AND table_name = 'CONVERSACION' LIMIT 1`,
	);
	return (r.rowCount ?? 0) > 0;
}

/** Aplica todos los SQL de ops (npm run db:apply-pg-ops). */
export async function applyLanglabOpsSchema(): Promise<string[]> {
	const files = await applySqlFiles(getLanglabPgPool(), schemaDir("ops"));
	await getLanglabPgPool()
		.query('SELECT "BD_LANGLAB"."ORCHESTRATOR_EXPIRESTALORCHESTRATORLEASES"()')
		.catch(() => {});
	langlabReady = true;
	return files;
}

/** Aplica SQL clientesis (npm run db:apply-pg-ops). */
export async function applyClientesisSchema(): Promise<string[]> {
	const files = await applySqlFiles(getClientesisPgPool(), schemaDir("clientesis"));
	clientesisReady = true;
	return files;
}

/**
 * Comprueba que el esquema operacional existe (runtime / handlers).
 * No ejecuta migraciones DDL — usar applyLanglabOpsSchema() o npm run db:apply-pg-ops.
 */
export async function ensureLanglabSchema(): Promise<string[]> {
	if (langlabReady) return [];

	if (process.env.LAB_DB_AUTO_APPLY === "1") {
		return applyLanglabOpsSchema();
	}

	if (!(await langlabCoreTableExists())) {
		throw new Error(
			'Tabla "BD_LANGLAB"."CONVERSACION" no existe. Ejecutar: npm run db:apply-pg-ops',
		);
	}

	langlabReady = true;
	return [];
}

export async function ensureClientesisSchema(): Promise<string[]> {
	if (clientesisReady) return [];

	if (process.env.LAB_DB_AUTO_APPLY === "1") {
		return applyClientesisSchema();
	}

	const r = await getLanglabPgPool().query(
		`SELECT 1 FROM information_schema.tables WHERE table_schema = 'BD_ISADOC' AND table_name = 'ENTITY_ROW' LIMIT 1`,
	);
	if ((r.rowCount ?? 0) === 0) {
		throw new Error(
			'Tabla "BD_ISADOC"."ENTITY_ROW" no existe. Ejecutar: npm run db:apply-pg-ops',
		);
	}

	clientesisReady = true;
	return [];
}

export async function ensureAllStoreSchemas(): Promise<void> {
	await ensureLanglabSchema();
	await ensureClientesisSchema();
}

/** @deprecated Usar applyLanglabOpsSchema en scripts de migración. */
export const ensurePatySchema = applyLanglabOpsSchema;
/** @deprecated */
export const ensureOpsSchema = applyLanglabOpsSchema;
