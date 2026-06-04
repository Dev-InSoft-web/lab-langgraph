import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { getPromptCatalogSummary } from "../lib/patyia/prompts/catalog.js";

async function getPatyiaPromptsHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	try {
		if (request.query.get("refresh") === "1") {
			const { syncPatyiaPromptsFromIsaDoc } = await import("../lib/patyia/db/syncPromptsFromIsaDoc.js");
			await syncPatyiaPromptsFromIsaDoc({ log: true });
		}
		const catalog = await getPromptCatalogSummary();
		return jsonResponse(
			{
				ok: true,
				storage: "postgresql:bd_paty.paty_instruccion",
				syncedAt: catalog.syncedAt,
				agents: catalog.agents,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("getPatyiaPrompts", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("getPatyiaPrompts", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "patyia/prompts",
	handler: getPatyiaPromptsHandler,
});
