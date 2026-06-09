import type { Pool } from "pg";
import { getLanglabPgPool } from "../db/pg.js";
import { PG_SCHEMA_ISADOC, PG_SCHEMA_LANGLAB } from "../db/pg-identifiers.js";
import { pingMssql, type MssqlTarget } from "../mssql/pool.js";
import { runMssqlQuery } from "../mssql/run.js";

export const BACKUP_VERSION = 1;

export type BackupProject = "langlab" | "clientesis" | "patyia";

const PROJECT_ALIASES: Record<string, BackupProject> = {
	langlab: "langlab",
	"isa-doc": "langlab",
	isadoc: "langlab",
	clientesis: "clientesis",
	clientes: "clientesis",
	patyia: "patyia",
	paty: "patyia",
};

export type PgTableBackup = {
	columns: { name: string; type: string; nullable: boolean }[];
	rows: Record<string, unknown>[];
	rowCount: number;
};

export type PgSchemaBackup = {
	tables: Record<string, PgTableBackup>;
};

export type MssqlTableBackup = {
	schema: string;
	columns: { name: string; type: string; nullable: boolean }[];
	rows: Record<string, unknown>[];
	rowCount: number;
};

export type MssqlDatabaseBackup = {
	database: string;
	tables: Record<string, MssqlTableBackup>;
};

export type BackupPayload = {
	v: number;
	generatedAt: string;
	projects: BackupProject[];
	langlab?: {
		postgres: {
			"BD_LANGLAB": PgSchemaBackup;
			"BD_ISADOC": PgSchemaBackup;
		};
	};
	clientesis?: { mssql: MssqlDatabaseBackup };
	patyia?: { mssql: MssqlDatabaseBackup };
	errors?: Partial<Record<BackupProject, string>>;
};

export function normalizeBackupProjects(raw: unknown): BackupProject[] {
	if (!Array.isArray(raw)) return [];
	const out: BackupProject[] = [];
	for (const item of raw) {
		if (typeof item !== "string") continue;
		const key = item.trim().toLowerCase();
		const mapped = PROJECT_ALIASES[key];
		if (mapped && !out.includes(mapped)) out.push(mapped);
	}
	return out;
}

async function listPgTables(pool: Pool, schema: string): Promise<string[]> {
	const res = await pool.query<{ table_name: string }>(
		`SELECT table_name FROM information_schema.tables
		 WHERE table_schema = $1 AND table_type = 'BASE TABLE'
		 ORDER BY table_name`,
		[schema],
	);
	return res.rows.map((r) => r.table_name);
}

async function pgTableColumns(
	pool: Pool,
	schema: string,
	table: string,
): Promise<{ name: string; type: string; nullable: boolean }[]> {
	const res = await pool.query<{ column_name: string; data_type: string; is_nullable: string }>(
		`SELECT column_name, data_type, is_nullable
		 FROM information_schema.columns
		 WHERE table_schema = $1 AND table_name = $2
		 ORDER BY ordinal_position`,
		[schema, table],
	);
	return res.rows.map((r) => ({
		name: r.column_name,
		type: r.data_type,
		nullable: r.is_nullable === "YES",
	}));
}

async function exportPgTable(pool: Pool, schema: string, table: string): Promise<PgTableBackup> {
	const columns = await pgTableColumns(pool, schema, table);
	const qSchema = `"${schema.replace(/"/g, '""')}"`;
	const qTable = `"${table.replace(/"/g, '""')}"`;
	const res = await pool.query(`SELECT * FROM ${qSchema}.${qTable}`);
	return {
		columns,
		rows: res.rows as Record<string, unknown>[],
		rowCount: res.rowCount ?? res.rows.length,
	};
}

async function exportPgSchema(pool: Pool, schema: string): Promise<PgSchemaBackup> {
	const tables: Record<string, PgTableBackup> = {};
	for (const table of await listPgTables(pool, schema)) {
		tables[table] = await exportPgTable(pool, schema, table);
	}
	return { tables };
}

async function exportLanglabPg(): Promise<BackupPayload["langlab"]> {
	const pool = getLanglabPgPool();
	return {
		postgres: {
			"BD_LANGLAB": await exportPgSchema(pool, PG_SCHEMA_LANGLAB),
			"BD_ISADOC": await exportPgSchema(pool, PG_SCHEMA_ISADOC),
		},
	};
}

async function listMssqlTables(target: MssqlTarget): Promise<{ schema: string; table: string }[]> {
	const result = await runMssqlQuery(
		target,
		`SELECT s.name AS schema_name, t.name AS table_name
		 FROM sys.tables t
		 INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
		 WHERE t.is_ms_shipped = 0
		 ORDER BY s.name, t.name`,
	);
	const rows = result.recordset as { schema_name: string; table_name: string }[];
	return rows.map((r) => ({ schema: r.schema_name, table: r.table_name }));
}

async function mssqlTableColumns(
	target: MssqlTarget,
	schema: string,
	table: string,
): Promise<{ name: string; type: string; nullable: boolean }[]> {
	const esc = (s: string) => s.replace(/]/g, "]]");
	const result = await runMssqlQuery(
		target,
		`SELECT c.name AS column_name, ty.name AS data_type, c.is_nullable
		 FROM sys.columns c
		 INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id
		 INNER JOIN sys.tables t ON c.object_id = t.object_id
		 INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
		 WHERE s.name = '${esc(schema)}' AND t.name = '${esc(table)}'
		 ORDER BY c.column_id`,
	);
	const rows = result.recordset as { column_name: string; data_type: string; is_nullable: boolean }[];
	return rows.map((r) => ({
		name: r.column_name,
		type: r.data_type,
		nullable: !!r.is_nullable,
	}));
}

async function exportMssqlTable(
	target: MssqlTarget,
	schema: string,
	table: string,
): Promise<MssqlTableBackup> {
	const esc = (s: string) => s.replace(/]/g, "]]");
	const columns = await mssqlTableColumns(target, schema, table);
	const result = await runMssqlQuery(target, `SELECT * FROM [${esc(schema)}].[${esc(table)}]`);
	return {
		schema,
		columns,
		rows: (result.recordset ?? []) as Record<string, unknown>[],
		rowCount: result.recordset?.length ?? 0,
	};
}

async function exportMssqlDatabase(target: MssqlTarget): Promise<MssqlDatabaseBackup> {
	const ping = await pingMssql(target);
	if (!ping.ok) throw new Error(ping.reason ?? `MSSQL ${target} no disponible`);

	const tables: Record<string, MssqlTableBackup> = {};
	for (const { schema, table } of await listMssqlTables(target)) {
		const key = `${schema}.${table}`;
		tables[key] = await exportMssqlTable(target, schema, table);
	}

	const dbResult = await runMssqlQuery(target, "SELECT DB_NAME() AS db");
	const dbRow = dbResult.recordset[0] as { db?: string } | undefined;

	return {
		database: dbRow?.db ?? target,
		tables,
	};
}

export async function buildBackup(projects: BackupProject[]): Promise<BackupPayload> {
	const payload: BackupPayload = {
		v: BACKUP_VERSION,
		generatedAt: new Date().toISOString(),
		projects: [...projects],
	};

	const errors: Partial<Record<BackupProject, string>> = {};

	for (const project of projects) {
		try {
			if (project === "langlab") {
				payload.langlab = await exportLanglabPg();
			} else if (project === "clientesis") {
				payload.clientesis = { mssql: await exportMssqlDatabase("clientesis") };
			} else if (project === "patyia") {
				payload.patyia = { mssql: await exportMssqlDatabase("paty") };
			}
		} catch (err) {
			errors[project] = err instanceof Error ? err.message : String(err);
		}
	}

	if (Object.keys(errors).length) payload.errors = errors;
	return payload;
}

export function minifyBackup(payload: BackupPayload): string {
	return JSON.stringify(payload);
}
