import {
	createRateLimitHintTracker,
	formatRateLimitHintSummary,
	isRateLimitLikeMessage,
	recordRateLimitHints,
	sleepProviderRateLimitMs,
	waitMsForRateLimit,
} from "../core/retry-wait.js";
import {
	acquireOrchestratorLease,
	listOrchestratorSlots,
	releaseOrchestratorLease,
	syncOrchestratorSlots,
} from "./store.js";
import type { LabCapability, LabProvider, OrchestratorLease } from "./types.js";
import { getLeasedApiKey } from "./store.js";

export type CascadeInvokeCtx = {
	apiKey: string;
	lease: OrchestratorLease;
	provider: LabProvider;
	keyLabel: string;
};

export type CascadeResult<T> =
	| { ok: true; value: T; lease: OrchestratorLease }
	| { ok: false; rateLimited: true; waitMs: number; error: string }
	| { ok: false; rateLimited: false; error: string };

/**
 * Ejecuta fn con un lease del proveedor indicado. Libera slot y aplica cooldown en 429.
 */
export async function runWithProviderLease<T>(
	capability: LabCapability,
	provider: LabProvider,
	fn: (ctx: CascadeInvokeCtx) => Promise<T>,
): Promise<CascadeResult<T>> {
	await syncOrchestratorSlots(capability);
	const acquired = await acquireOrchestratorLease(capability, provider);
	if (!acquired.ok) {
		return {
			ok: false,
			rateLimited: true,
			waitMs: acquired.waitMs,
			error: acquired.reason,
		};
	}
	const { lease } = acquired;
	const apiKey = await getLeasedApiKey(lease);
	const ctx: CascadeInvokeCtx = {
		apiKey,
		lease,
		provider: lease.provider,
		keyLabel: lease.keyLabel,
	};
	try {
		const value = await fn(ctx);
		await releaseOrchestratorLease({ leaseId: lease.leaseId, ok: true, httpStatus: 200 });
		return { ok: true, value, lease };
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		const is429 = isRateLimitLikeMessage(err);
		await releaseOrchestratorLease({
			leaseId: lease.leaseId,
			ok: false,
			errorMessage: err,
			httpStatus: is429 ? 429 : undefined,
		});
		return {
			ok: false,
			rateLimited: is429,
			waitMs: is429 ? waitMsForRateLimit(createRateLimitHintTracker(), err) : 0,
			error: err,
		};
	}
}

/**
 * Turno inteligente: recorre proveedores y keys en PG (sort_order) con espera entre ciclos.
 */
export async function runCapabilityCascade<T>(
	capability: LabCapability,
	providers: LabProvider[],
	fn: (ctx: CascadeInvokeCtx) => Promise<T>,
	opts?: { maxCycles?: number; logLabel?: string },
): Promise<T> {
	const maxCycles =
		opts?.maxCycles ?? (Number(process.env.ORCHESTRATOR_CASCADE_MAX_CYCLES?.trim()) || 8);
	const label = opts?.logLabel ?? capability;
	await syncOrchestratorSlots(capability);

	const roundErrors: string[] = [];
	for (let cycle = 1; cycle <= maxCycles; cycle += 1) {
		const hint = createRateLimitHintTracker();
		for (const provider of providers) {
			const slots = (await listOrchestratorSlots(capability, provider)).filter((s) => s.enabled);
			for (const slot of slots) {
				const r = await runWithProviderLease(capability, provider, fn);
				if (r.ok) {
					if (cycle > 1 || slot.key_label !== slots[0]?.key_label) {
						console.log(
							`  Orchestrator · ${label} · ${provider} · ${slot.key_label} · ciclo ${cycle}`,
						);
					}
					return r.value;
				}
				roundErrors.push(`${provider}/${slot.key_label}: ${r.error.slice(0, 120)}`);
				if (r.rateLimited) recordRateLimitHints(hint, r.error);
			}
		}

		const wait = waitMsForRateLimit(hint, roundErrors.join("; "));
		const summary = formatRateLimitHintSummary(hint);
		if (cycle >= maxCycles) break;
		console.log(
			`  Orchestrator · ${label} · ciclo ${cycle}/${maxCycles} agotado · espera ${Math.round(wait / 1000)}s${summary ? ` · ${summary}` : ""}`,
		);
		await sleepProviderRateLimitMs(wait);
	}

	throw new Error(
		`Orchestrator cascade agotado (${label}): ${roundErrors.slice(-4).join("; ")}`,
	);
}
