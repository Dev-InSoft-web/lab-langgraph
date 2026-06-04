import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { promoteProofreadTest, proofreadVideo } from "../lib/youtube/proofread/run.js";

async function proofreadYoutubeHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const videoId = request.query.get("videoId")?.trim();
		const corpusJsonPath = request.query.get("corpusJsonPath")?.trim();
		const promote = request.query.get("promote") === "true";
		const force = request.query.get("force") === "true";
		const allowOpenAi = request.query.get("allowOpenAi") === "true";

		if (!videoId) {
			return jsonResponse(
				{ ok: false, error: "Query videoId requerido (ej. ?videoId=-62iAmPHvkA)" },
				400,
				corsHeaders(origin),
			);
		}

		if (promote) {
			await promoteProofreadTest(videoId);
			return jsonResponse(
				{ ok: true, message: `Promovido ${videoId}-test → ${videoId}`, videoId, promoted: true },
				200,
				corsHeaders(origin),
			);
		}

		context.log(`Proofread LangGraph: ${videoId} force=${force}`);
		const result = await proofreadVideo({ videoId, force, allowOpenAi, corpusJsonPath });

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
		return jsonResponse({ ok: true, ...rest }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("proofread youtube error", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("proofreadYoutube", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "youtube/proofread",
	handler: proofreadYoutubeHandler,
});
