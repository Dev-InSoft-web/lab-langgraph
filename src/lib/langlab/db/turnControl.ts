import { getPgPool } from "../../db/pg.js";
import {
	Q_LAB_CAPABILITY_TIMING,
	Q_PATY_CONVERSACION_TURNO_LOCK,
	Q_PATY_CONVERSACION_TURNO_TIMING,
} from "../../db/pg-identifiers.js";
import { sqlCol } from "../../db/pg-quote.js";
import { logOrchestratorRotation } from "../../orchestrator/rotation-log.js";
import type { LabCapability } from "../../orchestrator/types.js";
import { ensureLanglabSchema } from "./ensureSchema.js";
import {
	FN_CONVERSACION_NEXT_TURN_INDEX,
	FN_ORCHESTRATOR_EXPIRE_STALE_LEASES,
} from "./pg-functions.js";

export type TurnLockResult =
	| { ok: true }
	| { ok: false; waitMs: number; reason: string };

export async function expireStaleLabState(): Promise<number> {
	await ensureLanglabSchema();
	const res = await getPgPool().query<{ expire_stale_orchestrator_leases: number }>(
		`SELECT ${FN_ORCHESTRATOR_EXPIRE_STALE_LEASES}() AS expire_stale_orchestrator_leases`,
	);
	return Number(res.rows[0]?.expire_stale_orchestrator_leases ?? 0);
}

export async function nextTurnIndex(iconversacion: number): Promise<number> {
	await ensureLanglabSchema();
	const res = await getPgPool().query<{ next_conversacion_turn_index: number }>(
		`SELECT ${FN_CONVERSACION_NEXT_TURN_INDEX}($1) AS next_conversacion_turn_index`,
		[iconversacion],
	);
	return Number(res.rows[0]?.next_conversacion_turn_index ?? 1);
}

async function minTurnGapMs(capability: LabCapability): Promise<number> {
	const res = await getPgPool().query<{ minturngapms: number }>(
		`SELECT ${sqlCol("minturngapms")} AS minturngapms FROM ${Q_LAB_CAPABILITY_TIMING} WHERE ${sqlCol("capability")} = $1`,
		[capability],
	);
	return Number(res.rows[0]?.minturngapms ?? 0);
}

export async function enforceTurnGap(
	iconversacion: number,
	capability: LabCapability = "chat",
): Promise<void> {
	await ensureLanglabSchema();
	const gap = await minTurnGapMs(capability);
	if (gap <= 0) return;

	const pool = getPgPool();
	const row = await pool.query<{ lastturnat: Date }>(
		`SELECT ${sqlCol("lastturnat")} AS lastturnat FROM ${Q_PATY_CONVERSACION_TURNO_TIMING} WHERE ${sqlCol("iconversacion")} = $1`,
		[iconversacion],
	);
	if (!row.rows.length) return;

	const elapsed = Date.now() - new Date(row.rows[0]!.lastturnat).getTime();
	if (elapsed < gap) {
		const waitMs = gap - elapsed;
		await logOrchestratorRotation({
			capability,
			provider: "groq",
			keyLabel: "(timing)",
			event: "turn_gap_wait",
			iconversacion,
			waitMs,
		});
		await new Promise((r) => setTimeout(r, waitMs));
	}
}

export async function touchTurnTiming(
	iconversacion: number,
	capability: LabCapability = "chat",
): Promise<void> {
	await ensureLanglabSchema();
	await getPgPool().query(
		`INSERT INTO ${Q_PATY_CONVERSACION_TURNO_TIMING} (${sqlCol("iconversacion")}, ${sqlCol("lastturnat")}, ${sqlCol("lastcapability")}, ${sqlCol("fhultact")})
		 VALUES ($1, NOW(), $2, NOW())
		 ON CONFLICT (${sqlCol("iconversacion")}) DO UPDATE SET
		   ${sqlCol("lastturnat")} = NOW(),
		   ${sqlCol("lastcapability")} = EXCLUDED.${sqlCol("lastcapability")},
		   ${sqlCol("fhultact")} = NOW()`,
		[iconversacion, capability],
	);
}

export async function acquireConversationTurnLock(
	iconversacion: number,
	holder = "lab-langgraph",
): Promise<TurnLockResult> {
	await ensureLanglabSchema();
	const pool = getPgPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		await client.query(`DELETE FROM ${Q_PATY_CONVERSACION_TURNO_LOCK} WHERE ${sqlCol("lockeduntil")} < NOW()`);
		const existing = await client.query(
			`SELECT ${sqlCol("lockeduntil")} AS lockeduntil FROM ${Q_PATY_CONVERSACION_TURNO_LOCK} WHERE ${sqlCol("iconversacion")} = $1 FOR UPDATE`,
			[iconversacion],
		);
		if (existing.rows.length) {
			const until = new Date(String(existing.rows[0]!.lockeduntil)).getTime();
			const waitMs = Math.max(1000, until - Date.now());
			await client.query("ROLLBACK");
			return { ok: false, waitMs, reason: "conversation_locked" };
		}
		await client.query(
			`INSERT INTO ${Q_PATY_CONVERSACION_TURNO_LOCK} (${sqlCol("iconversacion")}, ${sqlCol("holder")}, ${sqlCol("lockeduntil")})
			 VALUES ($1, $2, NOW() + INTERVAL '4 minutes')`,
			[iconversacion, holder],
		);
		await client.query("COMMIT");
		await logOrchestratorRotation({
			capability: "chat",
			provider: "groq",
			keyLabel: "(lock)",
			event: "turn_lock",
			iconversacion,
		});
		return { ok: true };
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}

export async function releaseConversationTurnLock(iconversacion: number): Promise<void> {
	await ensureLanglabSchema();
	await getPgPool().query(`DELETE FROM ${Q_PATY_CONVERSACION_TURNO_LOCK} WHERE ${sqlCol("iconversacion")} = $1`, [iconversacion]);
	await logOrchestratorRotation({
		capability: "chat",
		provider: "groq",
		keyLabel: "(lock)",
		event: "turn_unlock",
		iconversacion,
	});
}
