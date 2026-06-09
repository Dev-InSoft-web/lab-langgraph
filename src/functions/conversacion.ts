import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { buildConversationDetailResponse } from "../lib/langlab/conversation/getHandler.js";
import { runConversationTurn } from "../lib/langlab/conversation/runTurn.js";
import type { ConversationPostBody } from "../lib/langlab/conversation/types.js";

async function conversacionHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	if (request.method === "GET") {
		try {
			const id = Number(request.query.get("iconversacion") ?? request.query.get("id"));
			if (!Number.isFinite(id) || id <= 0) {
				return jsonResponse({ ok: false, error: "iconversacion requerido" }, 400, corsHeaders(origin));
			}
			const body = await buildConversationDetailResponse(id);
			if (!body) {
				return jsonResponse({ ok: false, error: "conversación no encontrada" }, 404, corsHeaders(origin));
			}
			return jsonResponse(body, 200, corsHeaders(origin));
		} catch (err) {
			context.error("conversacion GET", err);
			const message = err instanceof Error ? err.message : String(err);
			return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
		}
	}

	if (request.method === "POST") {
		try {
			const body = (await request.json()) as ConversationPostBody;
			const { stream } = await runConversationTurn(body);
			return {
				status: 200,
				headers: {
					...corsHeaders(origin),
					"Content-Type": "text/event-stream; charset=utf-8",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
				body: stream,
			};
		} catch (err) {
			context.error("conversacion POST", err);
			const message = err instanceof Error ? err.message : String(err);
			return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
		}
	}

	return jsonResponse({ ok: false, error: "Método no permitido" }, 405, corsHeaders(origin));
}

app.http("conversacion", {
	methods: ["GET", "POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "conversacion",
	handler: conversacionHandler,
});
