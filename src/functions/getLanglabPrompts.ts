import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { getPromptCatalogSummary } from "../lib/langlab/prompts/catalog.js";

async function getLanglabPromptsHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		if (request.query.get("refresh") === "1") {
			const { syncLanglabPromptsFromBundled } = await import("../lib/langlab/db/syncPromptsFromIsaDoc.js");
			await syncLanglabPromptsFromBundled({ log: true });
		}
		const catalog = await getPromptCatalogSummary();
		return jsonResponse(
			{
				ok: true,
				storage: "postgresql:BD_LANGLAB.INSTRUCCION_INSTRUCCION",
				syncedAt: catalog.syncedAt,
				agents: catalog.agents,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("getLanglabPrompts", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("getLanglabPrompts", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "langlab/prompts",
	handler: getLanglabPromptsHandler,
});
