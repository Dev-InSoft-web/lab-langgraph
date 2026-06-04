import { stat } from "node:fs/promises";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { syncOrchestratorSlots, listOrchestratorSlots } from "../lib/orchestrator/store.js";
import type { LabCapability } from "../lib/orchestrator/types.js";
import { runWhisperWithOrchestrator } from "../lib/orchestrator/run-whisper.js";
import { promoteProofreadTest, proofreadVideo } from "../lib/youtube/proofread/run.js";

const CAPABILITIES = new Set<LabCapability>([
	"whisper",
	"chat",
	"proofread",
	"embeddings",
	"rerank",
]);

async function readJsonBody<T>(request: HttpRequest): Promise<T> {
	const text = await request.text();
	if (!text.trim()) return {} as T;
	return JSON.parse(text) as T;
}

async function toolsHealthHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	try {
		let orchestrator: { slots: number; ready: number; pg?: boolean; note?: string };
		try {
			await syncOrchestratorSlots();
			const slots = await listOrchestratorSlots();
			const ready = slots.filter(
				(s) => s.enabled && (!s.cooldown_until || s.cooldown_until.getTime() <= Date.now()),
			).length;
			orchestrator = { slots: slots.length, ready, pg: true };
		} catch (dbErr) {
			const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
			context.warn("orchestrator PG unavailable", msg);
			orchestrator = { slots: 0, ready: 0, pg: false, note: "PG offline · whisper usa rotación en servidor" };
		}
		return jsonResponse(
			{
				ok: true,
				service: "lab-langgraph",
				orchestrator,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("tools health", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function toolsWhisperHandler(
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

		context.log(`tools/whisper: ${videoId}`);
		const out = await runWhisperWithOrchestrator({
			audioPath,
			videoId,
			model: body.model,
			language: body.language,
			rotateOn429: true,
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
				tool: "whisper",
				videoId,
				audioPath,
				keyLabel: out.keyLabel,
				keySuffix: out.keySuffix,
				model: out.result.model,
				segmentCount: out.result.segments.length,
				segments: out.result.segments,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("tools whisper", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function toolsProofreadHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const body = await readJsonBody<{
			videoId?: string;
			corpusJsonPath?: string;
			force?: boolean;
			allowOpenAi?: boolean;
			promote?: boolean;
		}>(request);

		const videoId = body.videoId?.trim() ?? request.query.get("videoId")?.trim();
		if (!videoId) {
			return jsonResponse({ ok: false, error: "videoId requerido" }, 400, corsHeaders(origin));
		}

		if (body.promote || request.query.get("promote") === "true") {
			await promoteProofreadTest(videoId);
			return jsonResponse({ ok: true, promoted: true, videoId }, 200, corsHeaders(origin));
		}

		const corpusJsonPath =
			body.corpusJsonPath?.trim() ?? request.query.get("corpusJsonPath")?.trim() ?? undefined;

		context.log(`tools/proofread: ${videoId}`);
		const result = await proofreadVideo({
			videoId,
			force: body.force,
			allowOpenAi: body.allowOpenAi,
			corpusJsonPath,
		});

		if (!result.ok) {
			return jsonResponse(
				{
					ok: false,
					error: result.error,
					videoId: result.videoId,
					retryAfterMinutes: result.retryAfterMinutes,
				},
				503,
				corsHeaders(origin),
			);
		}

		const { ok: _ok, ...rest } = result;
		return jsonResponse({ ok: true, tool: "proofread", ...rest }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("tools proofread", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("labToolsHealth", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "tools/health",
	handler: toolsHealthHandler,
});

app.http("labToolsWhisper", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "tools/whisper/transcribe",
	handler: toolsWhisperHandler,
});

app.http("labToolsProofread", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "tools/proofread",
	handler: toolsProofreadHandler,
});
