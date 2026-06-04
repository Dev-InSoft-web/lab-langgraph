import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { listIndexedSources } from "../lib/rag/vectorstore.js";

async function documentsHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	try {
		const sources = await listIndexedSources();
		return jsonResponse({ ok: true, documents: sources }, 200, corsHeaders(origin));
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("documents", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "documents",
	handler: documentsHandler,
});
