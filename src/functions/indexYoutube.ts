import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { clearAllMedia } from "../lib/media/store.js";
import { loadYoutubeCorpusDocuments, resolveYoutubeVideosDir } from "../lib/rag/youtubeChunks.js";
import { clearVectorStore, indexYoutubeDocuments } from "../lib/rag/vectorstore.js";

async function indexYoutubeHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	try {
		const replace = request.query.get("replace") !== "false";
		const videosDir = resolveYoutubeVideosDir();
		const { documents: allDocs, videos, segments, skippedNoSegments } =
			await loadYoutubeCorpusDocuments(videosDir);

		if (allDocs.length === 0) {
			return jsonResponse(
				{ ok: false, error: "No hay segmentos en el corpus YouTube (.json en videos/)" },
				400,
				corsHeaders(origin),
			);
		}

		if (replace) {
			await clearVectorStore();
			await clearAllMedia();
		}

		context.log(
			`Indexando YouTube: ${videosDir} · ${videos} video(s) · ${segments} segmento(s)`,
		);
		const result = await indexYoutubeDocuments(allDocs);

		return jsonResponse(
			{
				ok: true,
				message: `Corpus YouTube indexado · ${result.chunks} chunks · ${videos} video(s)`,
				videosDir,
				videos,
				segments,
				skippedNoSegments,
				chunks: result.chunks,
				files: result.files,
				replaced: replace,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("index youtube error", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("indexYoutube", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "index/youtube",
	handler: indexYoutubeHandler,
});
