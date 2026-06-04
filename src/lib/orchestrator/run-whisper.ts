import { stat } from "node:fs/promises";
import { loadGroqApiKeysFromEnv } from "../providers/groq/groq-api-keys.js";
import { transcribeAudioAbsolutePath } from "../youtube/whisper/groq-transcribe.js";
import type { WhisperTranscribeResult } from "../youtube/whisper/groq-transcribe.js";
import {
	acquireOrchestratorLease,
	getLeasedApiKey,
	releaseOrchestratorLease,
	syncOrchestratorSlots,
} from "./store.js";
import {
	createRateLimitHintTracker,
	recordRateLimitHints,
	waitMsForRateLimit,
} from "../core/retry-wait.js";

export type RunWhisperJobInput = {
	audioPath: string;
	videoId: string;
	model?: string;
	language?: string;
	rotateOn429?: boolean;
};

export type RunWhisperJobResult =
	| { ok: true; result: WhisperTranscribeResult; leaseId: string; keyLabel: string; keySuffix: string }
	| { ok: false; waitMs: number; reason: string; lastError?: string };

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, Math.min(ms, 15 * 60_000)));
}

/** Rotación en memoria si PG no responde (solo en lang-lab). */
async function runWhisperEnvKeyFallback(
	input: RunWhisperJobInput,
): Promise<RunWhisperJobResult> {
	const keys = loadGroqApiKeysFromEnv();
	if (!keys.length) {
		return { ok: false, waitMs: 0, reason: "no_groq_keys_on_server" };
	}
	let lastError: string | undefined;
	const tracker = createRateLimitHintTracker();

	for (let ki = 0; ki < keys.length; ki += 1) {
		const entry = keys[ki]!;
		try {
			const result = await transcribeAudioAbsolutePath({
				audioPath: input.audioPath,
				videoId: input.videoId,
				model: input.model,
				language: input.language,
				apiKey: entry.key,
			});
			return {
				ok: true,
				result,
				leaseId: "env-fallback",
				keyLabel: entry.label,
				keySuffix: entry.key.slice(-4),
			};
		} catch (e) {
			lastError = e instanceof Error ? e.message : String(e);
			if (!/429|rate.?limit|ASPH/i.test(lastError)) {
				return { ok: false, waitMs: 0, reason: "transcribe_failed", lastError };
			}
			recordRateLimitHints(tracker, lastError);
		}
	}

	const waitMs = waitMsForRateLimit(tracker, lastError ?? "");
	if (input.rotateOn429 !== false && waitMs > 0) {
		await sleep(waitMs);
		return runWhisperEnvKeyFallback(input);
	}
	return { ok: false, waitMs, reason: "exhausted_env_keys", lastError };
}

export async function runWhisperWithOrchestrator(
	input: RunWhisperJobInput,
): Promise<RunWhisperJobResult> {
	try {
		await syncOrchestratorSlots("whisper");
	} catch {
		console.warn("  Whisper · PG no disponible · rotación keys en servidor (env)");
		return runWhisperEnvKeyFallback(input);
	}

	const rotate = input.rotateOn429 !== false;
	const provider = "groq" as const;
	let lastError: string | undefined;
	let maxWait = 0;

	for (let attempt = 0; attempt < 12; attempt += 1) {
		const acquired = await acquireOrchestratorLease("whisper", provider);
		if (!acquired.ok) {
			maxWait = Math.max(maxWait, acquired.waitMs);
			if (!rotate) {
				return { ok: false, waitMs: acquired.waitMs, reason: acquired.reason };
			}
			await sleep(acquired.waitMs);
			continue;
		}

		const { lease } = acquired;
		const apiKey = await getLeasedApiKey(lease);
		try {
			const result = await transcribeAudioAbsolutePath({
				audioPath: input.audioPath,
				videoId: input.videoId,
				model: input.model,
				language: input.language,
				apiKey,
			});
			await releaseOrchestratorLease({ leaseId: lease.leaseId, ok: true, httpStatus: 200 });
			return {
				ok: true,
				result,
				leaseId: lease.leaseId,
				keyLabel: lease.keyLabel,
				keySuffix: lease.keySuffix,
			};
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			lastError = msg;
			const is429 = /429|rate.?limit|ASPH/i.test(msg);
			await releaseOrchestratorLease({
				leaseId: lease.leaseId,
				ok: false,
				errorMessage: msg,
				httpStatus: is429 ? 429 : undefined,
			});
			if (!rotate || !is429) {
				return { ok: false, waitMs: 0, reason: "transcribe_failed", lastError: msg };
			}
		}
	}

	return {
		ok: false,
		waitMs: maxWait || 60_000,
		reason: "exhausted_rotations",
		lastError,
	};
}
