import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { clearAllMedia } from "../lib/media/store.js";
import { clearVectorStore } from "../lib/rag/vectorstore.js";

async function resetHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

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
