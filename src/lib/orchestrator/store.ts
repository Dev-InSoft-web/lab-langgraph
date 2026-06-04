import { getPgPool } from "../db/pg.js";
import { Q_LAB_API_KEY_SLOT, Q_LAB_ORCHESTRATOR_LEASE } from "../db/pg-identifiers.js";
import { ensurePatyiaSchema } from "../patyia/db/ensureSchema.js";
import {
	resolveApiKeySecret,
	slotDefinitionsForCapability,
} from "./registry.js";
import {
	createRateLimitHintTracker,
	waitMsForRateLimit,
} from "../core/retry-wait.js";
import { logOrchestratorRotation } from "./rotation-log.js";
import type {
	LabApiKeySlotRow,
	LabCapability,
	LabProvider,
	LeaseAcquireResult,
	OrchestratorLease,
	ReleaseLeaseInput,
} from "./types.js";

export function keySuffix(key: string): string {
	return key.length >= 4 ? `···${key.slice(-4)}` : "···";
}

export async function syncOrchestratorSlots(capability?: LabCapability): Promise<number> {
	await ensurePatyiaSchema();
	const caps: LabCapability[] = capability
		? [capability]
		: ["whisper", "chat", "proofread", "embeddings", "rerank"];
	let n = 0;
	const pool = getPgPool();
	for (const cap of caps) {
		const defs = slotDefinitionsForCapability(cap);
		for (const d of defs) {
			if (!resolveApiKeySecret(d.provider, d.keyLabel)) continue;
			await pool.query(
				`INSERT INTO ${Q_LAB_API_KEY_SLOT} (provider, capability, keylabel, sortorder, benabled)
				 VALUES ($1, $2, $3, $4, TRUE)
				 ON CONFLICT (provider, capability, keylabel)
				 DO UPDATE SET sortorder = EXCLUDED.sortorder, benabled = TRUE, fhultact = NOW()`,
				[d.provider, d.capability, d.keyLabel, d.sortOrder],
			);
			n += 1;
		}
	}
	return n;
}

function rowFromDb(r: Record<string, unknown>): LabApiKeySlotRow {
	return {
		provider: String(r.provider),
		capability: String(r.capability),
		key_label: String(r.keylabel ?? r.key_label),
		sort_order: Number(r.sortorder ?? r.sort_order),
		enabled: Boolean(r.benabled ?? r.enabled),
		cooldown_until: (r.cooldownuntil ?? r.cooldown_until)
			? new Date(String(r.cooldownuntil ?? r.cooldown_until))
			: null,
		last_used_at: (r.lastusedat ?? r.last_used_at)
			? new Date(String(r.lastusedat ?? r.last_used_at))
			: null,
		last_http_status:
			r.lasthttpstatus != null
				? Number(r.lasthttpstatus)
				: r.last_http_status != null
					? Number(r.last_http_status)
					: null,
		last_error: r.lasterror != null ? String(r.lasterror) : r.last_error != null ? String(r.last_error) : null,
		wait_ms_hint:
			r.waitmshint != null ? Number(r.waitmshint) : r.wait_ms_hint != null ? Number(r.wait_ms_hint) : null,
		consecutive_failures: Number(r.consecutivefailures ?? r.consecutive_failures ?? 0),
		meta: (r.meta as Record<string, unknown>) ?? {},
		updated_at: new Date(String(r.fhultact ?? r.updated_at)),
	};
}

export async function listOrchestratorSlots(
	capability?: LabCapability,
	provider?: LabProvider,
): Promise<LabApiKeySlotRow[]> {
	await ensurePatyiaSchema();
	const pool = getPgPool();
	const clauses: string[] = [];
	const params: unknown[] = [];
	if (capability) {
		params.push(capability);
		clauses.push(`capability = $${params.length}`);
	}
	if (provider) {
		params.push(provider);
		clauses.push(`provider = $${params.length}`);
	}
	const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
	const res = await pool.query(
		`SELECT * FROM ${Q_LAB_API_KEY_SLOT} ${where} ORDER BY capability, sortorder, keylabel`,
		params,
	);
	return res.rows.map((r) => rowFromDb(r as Record<string, unknown>));
}

async function pickAvailableSlotInTx(
	client: import("pg").PoolClient,
	capability: LabCapability,
	provider?: LabProvider,
): Promise<LabApiKeySlotRow | null> {
	const params: unknown[] = [capability];
	let providerClause = "";
	if (provider) {
		params.push(provider);
		providerClause = ` AND provider = $${params.length}`;
	}
	const res = await client.query(
		`SELECT * FROM ${Q_LAB_API_KEY_SLOT}
		 WHERE capability = $1 AND benabled = TRUE
		   AND (cooldownuntil IS NULL OR cooldownuntil <= NOW())
		   ${providerClause}
		 ORDER BY sortorder ASC, lastusedat NULLS FIRST
		 LIMIT 1
		 FOR UPDATE SKIP LOCKED`,
		params,
	);
	if (!res.rows.length) return null;
	return rowFromDb(res.rows[0] as Record<string, unknown>);
}

async function earliestCooldownMs(
	capability: LabCapability,
	provider?: LabProvider,
): Promise<{ waitMs: number; slots: LabApiKeySlotRow[] }> {
	const slots = await listOrchestratorSlots(capability, provider);
	const now = Date.now();
	let minWait = 60_000;
	for (const s of slots) {
		if (!s.enabled) continue;
		if (!s.cooldown_until) continue;
		const w = s.cooldown_until.getTime() - now;
		if (w > 0 && w < minWait) minWait = w;
		if (s.wait_ms_hint && s.wait_ms_hint > minWait) minWait = s.wait_ms_hint;
	}
	return { waitMs: Math.max(minWait, 1000), slots };
}

export async function acquireOrchestratorLease(
	capability: LabCapability,
	provider?: LabProvider,
): Promise<LeaseAcquireResult> {
	await syncOrchestratorSlots(capability);

	const pool = getPgPool();
	const client = await pool.connect();
	let slot: LabApiKeySlotRow | null = null;
	try {
		await client.query("BEGIN");
		slot = await pickAvailableSlotInTx(client, capability, provider);
		if (!slot) {
			await client.query("ROLLBACK");
			const { waitMs, slots } = await earliestCooldownMs(capability, provider);
			return {
				ok: false,
				waitMs,
				reason: "all_slots_in_cooldown",
				slots,
			};
		}

		const secret = resolveApiKeySecret(slot.provider as LabProvider, slot.key_label);
		if (!secret) {
			await client.query("ROLLBACK");
			return { ok: false, waitMs: 0, reason: `missing_secret:${slot.key_label}` };
		}

		const ins = await client.query(
			`INSERT INTO ${Q_LAB_ORCHESTRATOR_LEASE} (provider, capability, keylabel)
			 VALUES ($1, $2, $3)
			 RETURNING ilease`,
			[slot.provider, slot.capability, slot.key_label],
		);
		await client.query(
			`UPDATE ${Q_LAB_API_KEY_SLOT}
			 SET lastusedat = NOW(), fhultact = NOW()
			 WHERE provider = $1 AND capability = $2 AND keylabel = $3`,
			[slot.provider, slot.capability, slot.key_label],
		);
		await client.query("COMMIT");
		const leaseId = String((ins.rows[0] as { ilease: string }).ilease);
		const lease: OrchestratorLease = {
			leaseId,
			provider: slot.provider as LabProvider,
			capability: slot.capability as LabCapability,
			keyLabel: slot.key_label,
			keySuffix: keySuffix(secret),
		};
		await logOrchestratorRotation({
			capability: slot.capability as LabCapability,
			provider: lease.provider,
			keyLabel: lease.keyLabel,
			event: "acquire_lease",
			leaseId,
		});
		return { ok: true, lease };
	} catch (e) {
		try {
			await client.query("ROLLBACK");
		} catch {
			/* */
		}
		throw e;
	} finally {
		client.release();
	}
}

export async function releaseOrchestratorLease(input: ReleaseLeaseInput): Promise<void> {
	await ensurePatyiaSchema();
	const pool = getPgPool();
	const leaseRes = await pool.query(
		`SELECT * FROM ${Q_LAB_ORCHESTRATOR_LEASE} WHERE ilease = $1 AND releasedat IS NULL`,
		[input.leaseId],
	);
	if (!leaseRes.rows.length) return;

	const row = leaseRes.rows[0] as {
		provider: string;
		capability: string;
		keylabel: string;
		key_label?: string;
	};
	const keyLabel = String(row.keylabel ?? row.key_label);

	let waitMs = 0;
	if (!input.ok && input.errorMessage) {
		const tracker = createRateLimitHintTracker();
		waitMs = waitMsForRateLimit(tracker, input.errorMessage, input.headers ?? null);
	}

	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		await client.query(
			`UPDATE ${Q_LAB_ORCHESTRATOR_LEASE}
			 SET releasedat = NOW(), bok = $2, lasterror = $3, waitmsapplied = $4
			 WHERE ilease = $1`,
			[input.leaseId, input.ok, input.errorMessage?.slice(0, 2000) ?? null, waitMs || null],
		);

		if (!input.ok && waitMs > 0) {
			await client.query(
				`UPDATE ${Q_LAB_API_KEY_SLOT}
				 SET cooldownuntil = NOW() + ($4::numeric * INTERVAL '1 millisecond'),
				     waitmshint = $4,
				     lasthttpstatus = $5,
				     lasterror = $3,
				     consecutivefailures = consecutivefailures + 1,
				     fhultact = NOW()
				 WHERE provider = $1 AND capability = $2 AND keylabel = $6`,
				[
					row.provider,
					row.capability,
					input.errorMessage?.slice(0, 2000) ?? null,
					waitMs,
					input.httpStatus ?? null,
					keyLabel,
				],
			);
		} else if (input.ok) {
			await client.query(
				`UPDATE ${Q_LAB_API_KEY_SLOT}
				 SET consecutivefailures = 0,
				     lasthttpstatus = $4,
				     lasterror = NULL,
				     fhultact = NOW()
				 WHERE provider = $1 AND capability = $2 AND keylabel = $3`,
				[row.provider, row.capability, keyLabel, input.httpStatus ?? 200],
			);
		}

		await client.query("COMMIT");
		await logOrchestratorRotation({
			capability: row.capability as LabCapability,
			provider: row.provider as LabProvider,
			keyLabel,
			event: input.ok ? "release_ok" : "release_error",
			leaseId: input.leaseId,
			waitMs: waitMs || undefined,
			meta: { httpStatus: input.httpStatus },
		});
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}

export async function getLeasedApiKey(lease: OrchestratorLease): Promise<string> {
	const key = resolveApiKeySecret(lease.provider, lease.keyLabel);
	if (!key) throw new Error(`Secret no encontrado para ${lease.keyLabel}`);
	return key;
}

export async function withOrchestratorLease<T>(
	capability: LabCapability,
	provider: LabProvider | undefined,
	fn: (lease: OrchestratorLease, apiKey: string) => Promise<T>,
): Promise<T> {
	const acquired = await acquireOrchestratorLease(capability, provider);
	if (!acquired.ok) {
		throw new Error(
			`Orchestrator: sin slot (${acquired.reason}) · esperar ${acquired.waitMs}ms`,
		);
	}
	const { lease } = acquired;
	const apiKey = await getLeasedApiKey(lease);
	try {
		const result = await fn(lease, apiKey);
		await releaseOrchestratorLease({ leaseId: lease.leaseId, ok: true, httpStatus: 200 });
		return result;
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		await releaseOrchestratorLease({
			leaseId: lease.leaseId,
			ok: false,
			errorMessage: msg,
			httpStatus: /429|rate.?limit/i.test(msg) ? 429 : undefined,
		});
		throw e;
	}
}
