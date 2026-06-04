import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { clearAllMedia } from "../lib/media/store.js";
import { clearVectorStore } from "../lib/rag/vectorstore.js";

async function resetHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		await clearVectorStore();
		await clearAllMedia();
		return jsonResponse({ ok: true, message: "Índice vectorial e imágenes vaciados" }, 200, corsHeaders(origin));
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("resetIndex", {
	methods: ["DELETE", "POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "reset",
	handler: resetHandler,
});
