import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PROBE_LIMITS } from "../../core/lab-constants.js";
import {
	createRateLimitHintTracker,
	waitMsForRateLimit,
	PROVIDER_RATE_LIMIT_CEILING_MS,
} from "../../core/retry-wait.js";

export const GEMINI_PROBE_RPD_PER_KEY = PROBE_LIMITS.geminiRpdPerKey;
export const GEMINI_PROBE_DELAY_MS = PROBE_LIMITS.geminiProbeDelayMs;
export const GEMINI_PROBE_MAX_429_RETRIES = PROBE_LIMITS.geminiProbeMax429Retries;

export type GeminiKeyRateDay = {
	utcDay: string;
	requestCount: number;
	cooldownUntil: string | null;
	lastQuotaHint?: string;
};

export type GeminiRateStateFile = {
	updatedAt: string;
	rpdLimitPerKey: number;
	keys: Record<string, GeminiKeyRateDay>;
};

export function utcDayKey(d = new Date()): string {
	return d.toISOString().slice(0, 10);
}

export async function loadGeminiRateState(path: string): Promise<GeminiRateStateFile> {
	try {
		const raw = JSON.parse(await readFile(path, "utf8")) as GeminiRateStateFile;
		return {
			updatedAt: raw.updatedAt ?? new Date().toISOString(),
			rpdLimitPerKey: raw.rpdLimitPerKey ?? GEMINI_PROBE_RPD_PER_KEY,
			keys: raw.keys ?? {},
		};
	} catch {
		return {
			updatedAt: new Date().toISOString(),
			rpdLimitPerKey: GEMINI_PROBE_RPD_PER_KEY,
			keys: {},
		};
	}
}

export async function saveGeminiRateState(path: string, state: GeminiRateStateFile): Promise<void> {
	state.updatedAt = new Date().toISOString();
	state.rpdLimitPerKey = GEMINI_PROBE_RPD_PER_KEY;
	await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
}

function ensureKeyDay(state: GeminiRateStateFile, keyLabel: string): GeminiKeyRateDay {
	const day = utcDayKey();
	let row = state.keys[keyLabel];
	if (!row || row.utcDay !== day) {
		row = { utcDay: day, requestCount: 0, cooldownUntil: null };
		state.keys[keyLabel] = row;
	}
	return row;
}

export function geminiKeyCanProbe(state: GeminiRateStateFile, keyLabel: string): {
	ok: boolean;
	reason?: string;
	waitMs?: number;
	rpdRemaining?: number;
} {
	const row = ensureKeyDay(state, keyLabel);
	const now = Date.now();
	if (row.cooldownUntil) {
		const until = new Date(row.cooldownUntil).getTime();
		if (until > now) {
			return {
				ok: false,
				reason: "cooldown",
				waitMs: until - now,
			};
		}
		row.cooldownUntil = null;
	}
	const limit = state.rpdLimitPerKey;
	if (row.requestCount >= limit) {
		return {
			ok: false,
			reason: "rpd_exhausted",
			rpdRemaining: 0,
			waitMs: msUntilUtcMidnight(),
		};
	}
	return { ok: true, rpdRemaining: limit - row.requestCount };
}

export function geminiKeyRecordRequest(state: GeminiRateStateFile, keyLabel: string): void {
	const row = ensureKeyDay(state, keyLabel);
	row.requestCount += 1;
}

export function geminiKeyApplyCooldown(
	state: GeminiRateStateFile,
	keyLabel: string,
	waitMs: number,
	quotaHint?: string,
): void {
	const row = ensureKeyDay(state, keyLabel);
	const until = new Date(Date.now() + Math.min(waitMs, PROVIDER_RATE_LIMIT_CEILING_MS));
	row.cooldownUntil = until.toISOString();
	if (quotaHint) row.lastQuotaHint = quotaHint.slice(0, 500);
}

function msUntilUtcMidnight(): number {
	const now = new Date();
	const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
	return Math.max(60_000, next.getTime() - now.getTime());
}

export function parseGemini429WaitMs(status: number, body: string, headers?: Headers): number {
	if (status !== 429) return 0;
	const tracker = createRateLimitHintTracker();
	const hdr: Record<string, string> = {};
	headers?.forEach((v, k) => {
		hdr[k.toLowerCase()] = v;
	});
	waitMsForRateLimit(tracker, body, hdr);

	try {
		const json = JSON.parse(body) as {
			error?: { details?: Array<{ retryDelay?: string; "@type"?: string }> };
		};
		for (const d of json.error?.details ?? []) {
			const m = String(d.retryDelay ?? "").match(/^(\d+(?:\.\d+)?)s$/);
			if (m) {
				const ms = Math.ceil(Number(m[1]) * 1000) + 2000;
				if (ms > tracker.maxMs) tracker.maxMs = ms;
			}
		}
	} catch {
		/* */
	}

	const quotaM = body.match(/limit:\s*(\d+)/i);
	if (quotaM) tracker.snippets.push(`quota limit ${quotaM[1]}`);

	if (tracker.maxMs > 0) return Math.min(tracker.maxMs, PROVIDER_RATE_LIMIT_CEILING_MS);
	return Math.min(90_000, PROVIDER_RATE_LIMIT_CEILING_MS);
}

export function isGemini429(status: number, body: string): boolean {
	return status === 429 || /quota|rate.?limit|resource.?exhausted/i.test(body);
}

export async function sleepGeminiProbe(ms: number): Promise<void> {
	const w = Math.max(0, Math.min(Math.round(ms), PROVIDER_RATE_LIMIT_CEILING_MS));
	if (w > 0) {
		console.log(`  ⏳ espera ${(w / 1000).toFixed(0)}s (RPD/429)…`);
		await new Promise((r) => setTimeout(r, w));
	}
}

export function rateStatePath(outDir: string): string {
	return join(outDir, "rate-state.json");
}
