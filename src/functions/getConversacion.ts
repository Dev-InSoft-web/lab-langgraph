import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { loadConversation } from "../lib/patyia/conversation/store.js";
import { conversationToPayload } from "../lib/patyia/conversation/sse.js";

async function getConversacionHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const id = Number(request.query.get("iconversacion") ?? request.query.get("id"));
		if (!Number.isFinite(id) || id <= 0) {
			return jsonResponse({ ok: false, error: "iconversacion requerido" }, 400, corsHeaders(origin));
		}
		const record = await loadConversation(id);
		if (!record) {
			return jsonResponse({ ok: false, error: "conversación no encontrada" }, 404, corsHeaders(origin));
		}
		return jsonResponse(
			{
				ok: true,
				body: {
					...conversationToPayload(record),
					turnos: record.turnos,
				},
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("getConversacion", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("getConversacion", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "conversacion",
	handler: getConversacionHandler,
});
