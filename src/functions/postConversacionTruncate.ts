import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { truncateConversation } from "../lib/langlab/conversation/store.js";

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
		const body = (await request.json().catch(() => ({}))) as { throughTurnIndex?: number };
		const throughTurnIndex = Number(body.throughTurnIndex);
		if (!Number.isFinite(throughTurnIndex) || throughTurnIndex < 0) {
			return jsonResponse({ ok: false, error: "throughTurnIndex requerido (>= 0)" }, 400, corsHeaders(origin));
		}
		const record = await truncateConversation(id, throughTurnIndex);
		if (!record) {
			return jsonResponse({ ok: false, error: "conversación no encontrada" }, 404, corsHeaders(origin));
		}
		return jsonResponse(
			{
				ok: true,
				iconversacion: id,
				throughTurnIndex,
				qmensajes: record.qmensajes,
				qtokens: record.qtokens,
				turnos: record.turnos,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("conversacionTruncate", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("postConversacionTruncate", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "conversacion/{iconversacion}/truncate",
	handler,
});
