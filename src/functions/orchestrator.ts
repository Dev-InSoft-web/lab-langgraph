import { stat } from "node:fs/promises";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import {
	acquireOrchestratorLease,
	listOrchestratorSlots,
	releaseOrchestratorLease,
	syncOrchestratorSlots,
} from "../lib/orchestrator/store.js";
import type { LabCapability, LabProvider } from "../lib/orchestrator/types.js";
import { runWhisperWithOrchestrator } from "../lib/orchestrator/run-whisper.js";

const CAPABILITIES = new Set<LabCapability>([
	"whisper",
	"chat",
	"proofread",
	"embeddings",
	"rerank",
]);
const PROVIDERS = new Set<LabProvider>(["groq", "cerebras", "gemini", "minimax", "huggingface"]);

function parseCapability(raw: string | null): LabCapability | null {
	const v = raw?.trim() as LabCapability | undefined;
	return v && CAPABILITIES.has(v) ? v : null;
}

function parseProvider(raw: string | null): LabProvider | undefined {
	const v = raw?.trim() as LabProvider | undefined;
	return v && PROVIDERS.has(v) ? v : undefined;
}

async function readJsonBody<T>(request: HttpRequest): Promise<T> {
	const text = await request.text();
	if (!text.trim()) return {} as T;
	return JSON.parse(text) as T;
}

async function orchestratorStatusHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const capability = parseCapability(request.query.get("capability"));
		const provider = parseProvider(request.query.get("provider"));
		const slots = await listOrchestratorSlots(capability ?? undefined, provider);
		const now = Date.now();
		return jsonResponse(
			{
				ok: true,
				slots: slots.map((s) => ({
					...s,
					cooldownMs:
						s.cooldown_until && s.cooldown_until.getTime() > now
							? s.cooldown_until.getTime() - now
							: 0,
					ready: !s.cooldown_until || s.cooldown_until.getTime() <= now,
				})),
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("orchestrator status", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function orchestratorSyncHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const body = await readJsonBody<{ capability?: string }>(request);
		const capability = parseCapability(body.capability ?? null);
		const n = await syncOrchestratorSlots(capability ?? undefined);
		return jsonResponse({ ok: true, synced: n }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("orchestrator sync", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function orchestratorLeaseHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const body = await readJsonBody<{ capability?: string; provider?: string }>(request);
		const capability = parseCapability(body.capability ?? null);
		if (!capability) {
			return jsonResponse(
				{ ok: false, error: "capability requerida (whisper|chat|proofread|embeddings|rerank)" },
				400,
				corsHeaders(origin),
			);
		}
		const provider = parseProvider(body.provider ?? null);
		const result = await acquireOrchestratorLease(capability, provider);
		if (!result.ok) {
			return jsonResponse(
				{
					ok: false,
					waitMs: result.waitMs,
					reason: result.reason,
					retryAfterMs: result.waitMs,
				},
				503,
				corsHeaders(origin),
			);
		}
		return jsonResponse({ ok: true, lease: result.lease }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("orchestrator lease", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function orchestratorReleaseHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const body = await readJsonBody<{
			leaseId?: string;
			ok?: boolean;
			errorMessage?: string;
			httpStatus?: number;
		}>(request);
		if (!body.leaseId?.trim()) {
			return jsonResponse({ ok: false, error: "leaseId requerido" }, 400, corsHeaders(origin));
		}
		await releaseOrchestratorLease({
			leaseId: body.leaseId.trim(),
			ok: body.ok !== false,
			errorMessage: body.errorMessage,
			httpStatus: body.httpStatus,
		});
		return jsonResponse({ ok: true }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("orchestrator release", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function youtubeWhisperTranscribeHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const body = await readJsonBody<{
			audioPath?: string;
			videoId?: string;
			model?: string;
			language?: string;
			rotateOn429?: boolean;
		}>(request);

		const audioPath = body.audioPath?.trim();
		const videoId = body.videoId?.trim();
		if (!audioPath || !videoId) {
			return jsonResponse(
				{ ok: false, error: "audioPath (absoluta) y videoId requeridos" },
				400,
				corsHeaders(origin),
			);
		}

		try {
			await stat(audioPath);
		} catch {
			return jsonResponse({ ok: false, error: `audio no encontrado: ${audioPath}` }, 404, corsHeaders(origin));
		}

		context.log(`Whisper orchestrator: ${videoId} · ${audioPath}`);
		const out = await runWhisperWithOrchestrator({
			audioPath,
			videoId,
			model: body.model,
			language: body.language,
			rotateOn429: body.rotateOn429,
		});

		if (!out.ok) {
			return jsonResponse(
				{
					ok: false,
					reason: out.reason,
					waitMs: out.waitMs,
					retryAfterMs: out.waitMs,
					lastError: out.lastError,
				},
				503,
				corsHeaders(origin),
			);
		}

		return jsonResponse(
			{
				ok: true,
				videoId,
				audioPath,
				leaseId: out.leaseId,
				keyLabel: out.keyLabel,
				keySuffix: out.keySuffix,
				model: out.result.model,
				chunkCount: out.result.chunkCount,
				segmentCount: out.result.segments.length,
				segments: out.result.segments,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("youtube whisper transcribe", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("orchestratorStatus", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "orchestrator/status",
	handler: orchestratorStatusHandler,
});

app.http("orchestratorSync", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "orchestrator/sync-keys",
	handler: orchestratorSyncHandler,
});

app.http("orchestratorLease", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "orchestrator/lease",
	handler: orchestratorLeaseHandler,
});

app.http("orchestratorRelease", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "orchestrator/release",
	handler: orchestratorReleaseHandler,
});

app.http("youtubeWhisperTranscribe", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "youtube/whisper/transcribe",
	handler: youtubeWhisperTranscribeHandler,
});
