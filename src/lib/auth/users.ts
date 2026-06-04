import { getPatyPgPool } from "../db/pg.js";
import { COL_AUTH, Q_LAB_AUTH_USER } from "../db/pg-identifiers.js";
import { ensureLabAuthSchema } from "./ensure-auth-schema.js";
import { hashPassword } from "./password.js";

export type LabAuthUser = {
	username: string;
	passwordhash: string;
	displayname: string | null;
	active: boolean;
};

export async function findLabUser(username: string): Promise<LabAuthUser | null> {
	await ensureLabAuthSchema();
	const pool = getPatyPgPool();
	const res = await pool.query<LabAuthUser>(
		`SELECT ${COL_AUTH.USERNAME} AS username, ${COL_AUTH.PASSWORDHASH} AS passwordhash,
		        ${COL_AUTH.DISPLAYNAME} AS displayname, ${COL_AUTH.ACTIVE} AS active
		 FROM ${Q_LAB_AUTH_USER} WHERE ${COL_AUTH.USERNAME} = $1 LIMIT 1`,
		[username.trim().toUpperCase()],
	);
	return res.rows[0] ?? null;
}

export async function upsertLabUser(input: {
	username: string;
	password: string;
	displayName?: string;
}): Promise<void> {
	await ensureLabAuthSchema();
	const username = input.username.trim().toUpperCase();
	const passwordhash = await hashPassword(input.password);
	const pool = getPatyPgPool();
	await pool.query(
		`INSERT INTO ${Q_LAB_AUTH_USER} (${COL_AUTH.USERNAME}, ${COL_AUTH.PASSWORDHASH}, ${COL_AUTH.DISPLAYNAME}, ${COL_AUTH.ACTIVE})
		 VALUES ($1, $2, $3, true)
		 ON CONFLICT (${COL_AUTH.USERNAME}) DO UPDATE SET
		   ${COL_AUTH.PASSWORDHASH} = EXCLUDED.${COL_AUTH.PASSWORDHASH},
		   ${COL_AUTH.DISPLAYNAME} = COALESCE(EXCLUDED.${COL_AUTH.DISPLAYNAME}, ${Q_LAB_AUTH_USER}.${COL_AUTH.DISPLAYNAME}),
		   ${COL_AUTH.ACTIVE} = true,
		   ${COL_AUTH.FHULTACT} = now()`,
		[username, passwordhash, input.displayName ?? username],
	);
}
