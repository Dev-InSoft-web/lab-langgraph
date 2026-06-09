import { getLanglabPgPool } from "./pg.js";

export type PgExecResult = {
	ok: true;
	rows: unknown[];
	rowCount: number;
	rowsAffected: number;
	output: string;
};

export async function runPgLanglabExec(sql: string): Promise<PgExecResult> {
	const pool = getLanglabPgPool();
	const result = await pool.query(sql);
	const rows = result.rows ?? [];
	const rowCount = result.rowCount ?? rows.length;
	return {
		ok: true,
		rows,
		rowCount,
		rowsAffected: rowCount,
		output: `Filas afectadas/devueltas: ${rowCount}.`,
	};
}
