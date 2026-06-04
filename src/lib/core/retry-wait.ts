/** Máximo de espera entre reintentos genéricos (red, 0 segmentos, EBUSY). */
export const MAX_RETRY_WAIT_MS = 60_000;

export const PROVIDER_RATE_LIMIT_CEILING_MS = 15 * 60_000;

const TRY_AGAIN_IN_RE = /try again in (?:(\d+)m)?([\d.]+)s/gi;
const RETRY_AFTER_SEC_RE = /retry[- ]?after[:\s]+(\d+(?:\.\d+)?)\s*(?:s|sec|seconds)?/gi;
const ASPH_QUOTA_RE = /Limit\s+(\d+)\s*,\s*Used\s+(\d+)\s*,\s*Requested\s+(\d+)/i;
const TRAFFIC_SOON_MS = Number(process.env.PROVIDER_TRAFFIC_WAIT_MS?.trim()) || 90_000;

export type RateLimitHintTracker = {
	maxMs: number;
	snippets: string[];
	quotas: Array<{
		label: string;
		used?: number;
		limit?: number;
		remaining?: number;
		requested?: number;
		resetSec?: number;
	}>;
};

export type GroqRetryHintTracker = RateLimitHintTracker;

export function createRateLimitHintTracker(): RateLimitHintTracker {
	return { maxMs: 0, snippets: [], quotas: [] };
}

export const createGroqRetryHintTracker = createRateLimitHintTracker;

function bumpWait(tracker: RateLimitHintTracker, ms: number, snippet: string): void {
	if (ms > tracker.maxMs) tracker.maxMs = ms;
	tracker.snippets.push(snippet);
}

function parseTryAgainIn(text: string, tracker: RateLimitHintTracker): void {
	TRY_AGAIN_IN_RE.lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = TRY_AGAIN_IN_RE.exec(text)) !== null) {
		const min = Number(m[1] || 0);
		const sec = Number(m[2] || 0);
		const ms = Math.ceil((min * 60 + sec) * 1000) + 2000;
		const label = min > 0 ? `${min}m${sec}s` : `${sec}s`;
		bumpWait(tracker, ms, `try again in ${label}`);
	}
}

function parseRetryAfterHeader(text: string, tracker: RateLimitHintTracker): void {
	RETRY_AFTER_SEC_RE.lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = RETRY_AFTER_SEC_RE.exec(text)) !== null) {
		const sec = Number(m[1]);
		if (Number.isFinite(sec) && sec > 0) {
			bumpWait(tracker, Math.ceil(sec * 1000) + 1000, `Retry-After ${sec}s`);
		}
	}
}

function parseAsphQuota(text: string, tracker: RateLimitHintTracker): void {
	const m = ASPH_QUOTA_RE.exec(text);
	if (!m) return;
	const limit = Number(m[1]);
	const used = Number(m[2]);
	const requested = Number(m[3]);
	tracker.quotas.push({ label: "ASPH", limit, used, requested });
	const snippet = `ASPH ${used}/${limit} (+${requested} pedido)`;
	if (!tracker.snippets.includes(snippet)) tracker.snippets.push(snippet);
}

function headerResetSec(headers: Record<string, string>, name: string): number | null {
	const v = headers[name] ?? headers[name.toLowerCase()];
	if (!v) return null;
	const n = Number(v);
	return Number.isFinite(n) && n > 0 ? n : null;
}

function parseRateLimitHeaders(headers: Record<string, string>, tracker: RateLimitHintTracker): void {
	const resetTokens = headerResetSec(headers, "x-ratelimit-reset-tokens-minute");
	const resetReqs = headerResetSec(headers, "x-ratelimit-reset-requests-day");
	const remTokens = headerResetSec(headers, "x-ratelimit-remaining-tokens-minute");
	const remReqs = headerResetSec(headers, "x-ratelimit-remaining-requests-day");
	const limTokens = headerResetSec(headers, "x-ratelimit-limit-tokens-minute");
	const limReqs = headerResetSec(headers, "x-ratelimit-limit-requests-day");

	if (limTokens != null || remTokens != null) {
		tracker.quotas.push({
			label: "TPM",
			limit: limTokens ?? undefined,
			remaining: remTokens ?? undefined,
			resetSec: resetTokens ?? undefined,
		});
	}
	if (limReqs != null || remReqs != null) {
		tracker.quotas.push({
			label: "RPD",
			limit: limReqs ?? undefined,
			remaining: remReqs ?? undefined,
			resetSec: resetReqs ?? undefined,
		});
	}

	for (const [sec, label] of [
		[resetTokens, "TPM reset"],
		[resetReqs, "RPD reset"],
	] as const) {
		if (sec != null) {
			bumpWait(tracker, Math.ceil(sec * 1000) + 1500, `${label} ${sec}s`);
		}
	}

	const httpRetry = headers["retry-after"] ?? headers["Retry-After"];
	if (httpRetry) {
		const sec = Number(httpRetry);
		if (Number.isFinite(sec) && sec > 0) {
			bumpWait(tracker, Math.ceil(sec * 1000) + 1000, `Retry-After ${sec}s`);
		}
	}
}

function parseTrafficSoon(text: string, tracker: RateLimitHintTracker): void {
	if (/try again soon|high traffic|experiencing high/i.test(text)) {
		bumpWait(tracker, TRAFFIC_SOON_MS, "tráfico alto (~90s)");
	}
}

export function recordRateLimitHints(
	tracker: RateLimitHintTracker,
	text: string,
	headers?: Record<string, string> | null,
): void {
	if (text) {
		parseTryAgainIn(text, tracker);
		parseRetryAfterHeader(text, tracker);
		parseAsphQuota(text, tracker);
		parseTrafficSoon(text, tracker);
	}
	if (headers && Object.keys(headers).length) parseRateLimitHeaders(headers, tracker);
}

export const recordGroqRetryHints = recordRateLimitHints;

export function waitMsForRateLimit(
	tracker: RateLimitHintTracker,
	errorMessage: string,
	headers?: Record<string, string> | null,
): number {
	recordRateLimitHints(tracker, errorMessage, headers);
	if (tracker.maxMs > 0) {
		return Math.min(tracker.maxMs, PROVIDER_RATE_LIMIT_CEILING_MS);
	}
	return MAX_RETRY_WAIT_MS;
}

export const waitMsForGroq429 = waitMsForRateLimit;

const WHISPER_RETRY_STEP_MS = Number(process.env.WHISPER_RETRY_STEP_MS?.trim()) || 30_000;
const WHISPER_EBUSY_WAIT_MS = Number(process.env.WHISPER_EBUSY_WAIT_MS?.trim()) || 25_000;
const WHISPER_MIN_ATTEMPT_GAP_MS = Number(process.env.WHISPER_MIN_ATTEMPT_GAP_MS?.trim()) || 15_000;

export function isRateLimitLikeMessage(msg: string): boolean {
	return /429|rate.?limit|quota|ASPH|try again in|try again soon|high traffic/i.test(msg);
}

export function isBusyLockMessage(msg: string): boolean {
	return /EBUSY|resource busy|locked|EPERM/i.test(msg);
}

export function waitMsForWhisperRetry(params: {
	attempt: number;
	errorMessage: string;
	tracker: RateLimitHintTracker;
	avgRateLimitWaitMs?: number | null;
}): number {
	const { attempt, errorMessage, tracker, avgRateLimitWaitMs } = params;
	recordRateLimitHints(tracker, errorMessage, null);
	let wait = tracker.maxMs;
	if (isRateLimitLikeMessage(errorMessage)) {
		wait = Math.max(wait, waitMsForRateLimit(tracker, errorMessage));
	}
	const escalon = Math.min(
		WHISPER_RETRY_STEP_MS * Math.min(Math.max(attempt - 1, 0), 10),
		PROVIDER_RATE_LIMIT_CEILING_MS,
	);
	wait = Math.max(wait, escalon);
	if (avgRateLimitWaitMs != null && avgRateLimitWaitMs > 0) {
		wait = Math.max(wait, Math.round(avgRateLimitWaitMs * 0.9));
	}
	if (isBusyLockMessage(errorMessage)) {
		wait = Math.max(wait, WHISPER_EBUSY_WAIT_MS);
	}
	wait = Math.max(wait, WHISPER_MIN_ATTEMPT_GAP_MS);
	return Math.min(wait, PROVIDER_RATE_LIMIT_CEILING_MS);
}

export function sleepWhisperRetryMs(ms: number): Promise<void> {
	return sleepProviderRateLimitMs(ms);
}

export function formatRateLimitHintSummary(tracker: RateLimitHintTracker): string {
	const parts: string[] = [];
	if (tracker.quotas.length) {
		for (const q of tracker.quotas) {
			if (q.label === "ASPH" && q.limit != null && q.used != null) {
				parts.push(`ASPH ${q.used}/${q.limit}${q.requested != null ? ` (+${q.requested})` : ""}`);
			} else if (q.resetSec != null) {
				parts.push(`${q.label} en ${q.resetSec}s`);
			} else if (q.remaining != null && q.limit != null) {
				parts.push(`${q.label} ${q.remaining}/${q.limit}`);
			}
		}
	}
	const hints = [...new Set(tracker.snippets.filter((s) => !s.startsWith("ASPH ")))];
	if (hints.length) parts.push(hints.join(", "));
	if (!parts.length && !tracker.maxMs) return "";
	return `${parts.join(" · ")} → espera ${Math.round(tracker.maxMs / 1000)}s`;
}

export const formatGroqRetryHintSummary = formatRateLimitHintSummary;

export function capRetryWaitMs(ms: number | undefined, fallback = MAX_RETRY_WAIT_MS): number {
	if (ms == null || !Number.isFinite(ms) || ms <= 0) return fallback;
	return Math.min(Math.round(ms), MAX_RETRY_WAIT_MS);
}

export function sleepMs(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, capRetryWaitMs(ms)));
}

export function sleepProviderRateLimitMs(ms: number): Promise<void> {
	const wait = Math.min(Math.max(0, Math.round(ms)), PROVIDER_RATE_LIMIT_CEILING_MS);
	return new Promise((r) => setTimeout(r, wait));
}

export const sleepGroq429Ms = sleepProviderRateLimitMs;

export function headersFromFetchResponse(res: Response): Record<string, string> {
	const out: Record<string, string> = {};
	res.headers.forEach((v, k) => {
		out[k.toLowerCase()] = v;
	});
	return out;
}

export function headersFromSdkError(err: unknown): Record<string, string> | undefined {
	if (!err || typeof err !== "object") return undefined;
	const o = err as {
		headers?: Headers | Record<string, string>;
		response?: { headers?: Headers | Record<string, string> };
	};
	const raw = o.headers ?? o.response?.headers;
	if (!raw) return undefined;
	if (typeof (raw as Headers).forEach === "function") {
		return headersFromFetchResponse({ headers: raw as Headers } as Response);
	}
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(raw as Record<string, string>)) {
		out[k.toLowerCase()] = String(v);
	}
	return out;
}

export function enrichRateLimitErrorMessage(err: unknown, fallback: string): string {
	const msg = err instanceof Error ? err.message : String(err);
	const headers = headersFromSdkError(err);
	const bits = [msg || fallback];
	if (headers) {
		const resetT = headers["x-ratelimit-reset-tokens-minute"];
		const resetD = headers["x-ratelimit-reset-requests-day"];
		if (resetT) bits.push(`x-ratelimit-reset-tokens-minute: ${resetT}`);
		if (resetD) bits.push(`x-ratelimit-reset-requests-day: ${resetD}`);
	}
	return bits.join(" | ");
}
