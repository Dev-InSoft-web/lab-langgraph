import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { getConversationLogsResponse } from "../lib/patyia/conversation/logsController.js";

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	const id = Number(request.params.iconversacion);
	if (!Number.isFinite(id) || id <= 0) {
		return jsonResponse({ ok: false, error: "iconversacion inválido" }, 400, corsHeaders(origin));
	}

	try {
		const body = await getConversationLogsResponse(id);
		if (!body) {
			return jsonResponse({ ok: false, error: "conversación no encontrada" }, 404, corsHeaders(origin));
		}
		return jsonResponse(body, 200, corsHeaders(origin));
	} catch (err) {
		context.error("conversacionLogs", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("getConversacionLogs", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "conversacion/{iconversacion}/logs",
	handler,
});
