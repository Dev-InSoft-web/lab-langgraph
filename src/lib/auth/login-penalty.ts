/**
 * Penalización progresiva por intentos fallidos de login (anti fuerza bruta).
 * Al 3er fallo consecutivo se bloquea 1 minuto, al 4º 5 minutos y del 5º en
 * adelante 10 minutos por intento. Un login exitoso limpia el contador.
 */
import { queryPaty } from "../db/pg.js";

const Q_PENALTY = '"BD_LANGLAB"."AUTH_LOGINPENALTY"';

const FREE_ATTEMPTS = 2; // a partir del 3er fallo se penaliza

function lockMinutesForFailCount(failCount: number): number {
	if (failCount <= FREE_ATTEMPTS) return 0;
	if (failCount === FREE_ATTEMPTS + 1) return 1;
	if (failCount === FREE_ATTEMPTS + 2) return 5;
	return 10;
}

type PenaltyRow = {
	FAILCOUNT: number;
	LOCKEDUNTIL: string | null;
};

export type LoginPenaltyState = {
	blocked: boolean;
	/** Segundos restantes de bloqueo (solo si blocked). */
	retryAfterSeconds: number;
	failCount: number;
};

/** Consulta si el usuario está actualmente bloqueado. */
export async function checkLoginPenalty(username: string): Promise<LoginPenaltyState> {
	const rows = await queryPaty<PenaltyRow>(
		`SELECT "FAILCOUNT", "LOCKEDUNTIL" FROM ${Q_PENALTY} WHERE "USERNAME" = $1`,
		[username.toUpperCase()],
	);
	const row = rows[0];
	if (!row?.LOCKEDUNTIL) {
		return { blocked: false, retryAfterSeconds: 0, failCount: row?.FAILCOUNT ?? 0 };
	}
	const remainingMs = new Date(row.LOCKEDUNTIL).getTime() - Date.now();
	if (remainingMs <= 0) {
		return { blocked: false, retryAfterSeconds: 0, failCount: row.FAILCOUNT };
	}
	return {
		blocked: true,
		retryAfterSeconds: Math.ceil(remainingMs / 1000),
		failCount: row.FAILCOUNT,
	};
}

/** Registra un fallo y devuelve el estado resultante (con bloqueo si aplica). */
export async function registerLoginFailure(username: string): Promise<LoginPenaltyState> {
	const rows = await queryPaty<PenaltyRow>(
		`INSERT INTO ${Q_PENALTY} ("USERNAME","FAILCOUNT","FHULTACT")
		 VALUES ($1, 1, now())
		 ON CONFLICT ("USERNAME") DO UPDATE SET
		   "FAILCOUNT" = ${Q_PENALTY}."FAILCOUNT" + 1,
		   "FHULTACT" = now()
		 RETURNING "FAILCOUNT", "LOCKEDUNTIL"`,
		[username.toUpperCase()],
	);
	const failCount = rows[0]?.FAILCOUNT ?? 1;
	const minutes = lockMinutesForFailCount(failCount);
	if (!minutes) {
		return { blocked: false, retryAfterSeconds: 0, failCount };
	}
	await queryPaty(
		`UPDATE ${Q_PENALTY} SET "LOCKEDUNTIL" = now() + ($2 || ' minutes')::interval, "FHULTACT" = now()
		 WHERE "USERNAME" = $1`,
		[username.toUpperCase(), String(minutes)],
	);
	return { blocked: true, retryAfterSeconds: minutes * 60, failCount };
}

/** Limpia el contador tras un login exitoso. */
export async function clearLoginPenalty(username: string): Promise<void> {
	await queryPaty(`DELETE FROM ${Q_PENALTY} WHERE "USERNAME" = $1`, [username.toUpperCase()]);
}
