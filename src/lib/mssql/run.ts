import { getMssqlPool, type MssqlTarget } from "./pool.js";

export type MssqlQueryResult = {
	ok: true;
	recordset: unknown[];
	recordsets: unknown[][];
};

export type MssqlExecResult = {
	ok: true;
	rowsAffected: number;
	rowsAffectedPerStmt: number[];
	recordsets: number;
	rows: unknown[];
	output: string;
};

export async function runMssqlQuery(target: MssqlTarget, sql: string): Promise<MssqlQueryResult> {
	const pool = await getMssqlPool(target);
	const result = await pool.request().query(sql);
	const recordsets = Array.isArray(result.recordsets) ? (result.recordsets as unknown[][]) : [];
	return {
		ok: true,
		recordset: result.recordset ?? recordsets[0] ?? [],
		recordsets,
	};
}

export async function runMssqlExec(target: MssqlTarget, sql: string): Promise<MssqlExecResult> {
	const pool = await getMssqlPool(target);
	const result = await pool.request().query(sql);
	const rowsAffectedArr = Array.isArray(result.rowsAffected) ? result.rowsAffected : [];
	const affected = rowsAffectedArr.reduce((a: number, b: number) => a + b, 0);
	const allSets = Array.isArray(result.recordsets) ? (result.recordsets as unknown[][]) : [];
	const sets = allSets.length;
	const firstRows = allSets[0] ?? [];
	return {
		ok: true,
		rowsAffected: affected,
		rowsAffectedPerStmt: rowsAffectedArr,
		recordsets: sets,
		rows: firstRows,
		output: `Filas afectadas: ${affected}. Recordsets: ${sets}. Filas devueltas: ${firstRows.length}.`,
	};
}
