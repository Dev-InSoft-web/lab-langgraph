import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type QuotaPeriod = "daily" | "monthly" | "welcome";

export type QuotaKeyState = {
	periodKey: string;
	requestCount: number;
	cooldownUntil: string | null;
	lastError?: string;
};

export type QuotaStateFile = {
	updatedAt: string;
	keys: Record<string, QuotaKeyState>;
};

export function utcDayKey(d = new Date()): string {
	return d.toISOString().slice(0, 10);
}

export function utcMonthKey(d = new Date()): string {
	return d.toISOString().slice(0, 7);
}

export function msUntilUtcMonthEnd(): number {
	const now = new Date();
	const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
	return Math.max(60_000, next.getTime() - now.getTime());
}

export function msUntilUtcMidnight(): number {
	const now = new Date();
	const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
	return Math.max(60_000, next.getTime() - now.getTime());
}

export async function loadQuotaState(path: string): Promise<QuotaStateFile> {
	try {
		return JSON.parse(await readFile(path, "utf8")) as QuotaStateFile;
	} catch {
		return { updatedAt: new Date().toISOString(), keys: {} };
	}
}

export async function saveQuotaState(path: string, state: QuotaStateFile): Promise<void> {
	state.updatedAt = new Date().toISOString();
	await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
}

function periodKeyFor(period: QuotaPeriod, welcomeStartedAt?: string): string {
	if (period === "monthly") return utcMonthKey();
	if (period === "daily") return utcDayKey();
	if (period === "welcome" && welcomeStartedAt) {
		const start = new Date(welcomeStartedAt);
		return `welcome:${start.toISOString().slice(0, 10)}`;
	}
	return utcDayKey();
}

export function quotaCanRequest(
	state: QuotaStateFile,
	slotKey: string,
	period: QuotaPeriod,
	limit: number,
	welcomeStartedAt?: string,
	welcomeDays = 30,
): { ok: boolean; reason?: string; waitMs?: number } {
	const pk = periodKeyFor(period, welcomeStartedAt);
	const fullKey = `${slotKey}:${period}:${pk}`;
	let row = state.keys[fullKey];
	if (!row || row.periodKey !== pk) {
		row = { periodKey: pk, requestCount: 0, cooldownUntil: null };
		state.keys[fullKey] = row;
	}
	const now = Date.now();
	if (row.cooldownUntil) {
		const until = new Date(row.cooldownUntil).getTime();
		if (until > now) {
			return { ok: false, reason: "cooldown", waitMs: until - now };
		}
		row.cooldownUntil = null;
	}
	if (period === "welcome" && welcomeStartedAt) {
		const elapsed = now - new Date(welcomeStartedAt).getTime();
		if (elapsed > welcomeDays * 86_400_000) {
			return { ok: false, reason: "welcome_expired", waitMs: 0 };
		}
	}
	if (row.requestCount >= limit) {
		const waitMs = period === "monthly" ? msUntilUtcMonthEnd() : msUntilUtcMidnight();
		return { ok: false, reason: `${period}_exhausted`, waitMs };
	}
	return { ok: true };
}

export function quotaRecordRequest(state: QuotaStateFile, slotKey: string, period: QuotaPeriod): void {
	const pk = period === "monthly" ? utcMonthKey() : utcDayKey();
	const fullKey = `${slotKey}:${period}:${pk}`;
	let row = state.keys[fullKey];
	if (!row || row.periodKey !== pk) {
		row = { periodKey: pk, requestCount: 0, cooldownUntil: null };
		state.keys[fullKey] = row;
	}
	row.requestCount += 1;
}

export function quotaStatePath(outDir: string, name: string): string {
	return join(outDir, name);
}
