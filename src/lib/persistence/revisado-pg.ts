import { getPatyPgPool } from "../db/pg.js";
import { COL_REV, Q_LAB_BITACORA_REVISADO } from "../db/pg-identifiers.js";
import type { RevisadoMap } from "./revisado.js";

export async function readRevisadoAllPg(): Promise<RevisadoMap> {
	const res = await getPatyPgPool().query<{ revisadokey: string; bchecked: boolean }>(
		`SELECT ${COL_REV.KEY} AS revisadokey, ${COL_REV.BCHECKED} AS bchecked FROM ${Q_LAB_BITACORA_REVISADO}`,
	);
	const map: RevisadoMap = {};
	for (const row of res.rows) map[row.revisadokey] = !!row.bchecked;
	return map;
}

export async function writeRevisadoManyPg(updates: RevisadoMap): Promise<RevisadoMap> {
	if (!Object.keys(updates).length) return readRevisadoAllPg();
	const pool = getPatyPgPool();
	const keys = Object.keys(updates);
	const values: unknown[] = [];
	const tuples: string[] = [];
	let i = 1;
	for (const k of keys) {
		tuples.push(`($${i++}, $${i++}, now())`);
		values.push(k, !!updates[k]);
	}
	await pool.query(
		`INSERT INTO ${Q_LAB_BITACORA_REVISADO} (${COL_REV.KEY}, ${COL_REV.BCHECKED}, ${COL_REV.FHULTACT})
		 VALUES ${tuples.join(", ")}
		 ON CONFLICT (${COL_REV.KEY}) DO UPDATE SET
		   ${COL_REV.BCHECKED} = EXCLUDED.${COL_REV.BCHECKED},
		   ${COL_REV.FHULTACT} = now()`,
		values,
	);
	return readRevisadoAllPg();
}

export async function countRevisadoPg(): Promise<number> {
	const res = await getPatyPgPool().query<{ c: string }>(
		`SELECT COUNT(*)::text AS c FROM ${Q_LAB_BITACORA_REVISADO}`,
	);
	return Number(res.rows[0]?.c ?? 0);
}
