import { Pool, type PoolConfig, type QueryResultRow } from "pg";
import {
	getClientesisDatabaseUrl,
	getPatyDatabaseUrl,
	getRagDatabaseUrl,
} from "../core/config.js";
import { DATABASE_SSL_ENABLED } from "../core/lab-constants.js";

let patyPool: Pool | null = null;
let clientesisPool: Pool | null = null;
let ragPool: Pool | null = null;

function poolConfig(connectionString: string): PoolConfig {
	return {
		connectionString,
		max: 8,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 30_000,
		ssl: DATABASE_SSL_ENABLED ? { rejectUnauthorized: false } : false,
	};
}

/** BD PatyIA + ISA-DOC store (`paty`, `lab` para isa-doc/patyia). */
export function getPatyPgPool(): Pool {
	if (!patyPool) {
		patyPool = new Pool(poolConfig(getPatyDatabaseUrl()));
	}
	return patyPool;
}

/** BD ClientesIS / Capacitación store (`lab` sin FK restrictivos). */
export function getClientesisPgPool(): Pool {
	if (!clientesisPool) {
		clientesisPool = new Pool(poolConfig(getClientesisDatabaseUrl()));
	}
	return clientesisPool;
}

/** BD RAG dedicada: pgvector (`rag`). */
export function getRagPgPool(): Pool {
	if (!ragPool) {
		ragPool = new Pool(poolConfig(getRagDatabaseUrl()));
	}
	return ragPool;
}

/** @deprecated Alias de `getPatyPgPool`. */
export const getOpsPgPool = getPatyPgPool;

/** @deprecated Alias de `getPatyPgPool`. */
export const getPgPool = getPatyPgPool;

export async function pingPatyDb(): Promise<boolean> {
	try {
		await getPatyPgPool().query("SELECT 1");
		return true;
	} catch {
		return false;
	}
}

export async function pingClientesisDb(): Promise<boolean> {
	try {
		await getClientesisPgPool().query("SELECT 1");
		return true;
	} catch {
		return false;
	}
}

/** @deprecated */
export const pingOpsDb = pingPatyDb;

export async function pingRagDb(): Promise<boolean> {
	try {
		await getRagPgPool().query("SELECT 1");
		return true;
	} catch {
		return false;
	}
}

export async function queryPaty<T extends QueryResultRow = QueryResultRow>(
	sql: string,
	params?: unknown[],
): Promise<T[]> {
	const res = await getPatyPgPool().query(sql, params);
	return res.rows as T[];
}

export async function queryClientesis<T extends QueryResultRow = QueryResultRow>(
	sql: string,
	params?: unknown[],
): Promise<T[]> {
	const res = await getClientesisPgPool().query(sql, params);
	return res.rows as T[];
}

export async function queryRag<T extends QueryResultRow = QueryResultRow>(
	sql: string,
	params?: unknown[],
): Promise<T[]> {
	const res = await getRagPgPool().query(sql, params);
	return res.rows as T[];
}

/** @deprecated Usar `queryPaty` */
export const queryOps = queryPaty;

/** @deprecated Usar `queryPaty` */
export const query = queryPaty;

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
	sql: string,
	params?: unknown[],
): Promise<T | null> {
	const rows = await queryPaty<T>(sql, params);
	return rows[0] ?? null;
}
