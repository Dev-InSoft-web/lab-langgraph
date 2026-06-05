import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { buildConversationDetailResponse } from "../lib/patyia/conversation/getHandler.js";
import { deleteConversation, patchConversation } from "../lib/patyia/conversation/store.js";
import type { PatchConversationBody } from "../lib/patyia/conversation/types.js";

async function conversacionByIdHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	const raw = request.params.iconversacion;
	const id = Number(raw);
	if (!Number.isFinite(id) || id <= 0) {
		return jsonResponse({ ok: false, error: "iconversacion inválido" }, 400, corsHeaders(origin));
	}

	if (request.method === "GET") {
		try {
			const body = await buildConversationDetailResponse(id);
			if (!body) {
				return jsonResponse({ ok: false, error: "conversación no encontrada" }, 404, corsHeaders(origin));
			}
			return jsonResponse(body, 200, corsHeaders(origin));
		} catch (err) {
			context.error("conversacionById GET", err);
			const message = err instanceof Error ? err.message : String(err);
			return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
		}
	}

	if (request.method === "PATCH") {
		try {
			const body = (await request.json().catch(() => ({}))) as PatchConversationBody;
			const ok = await patchConversation(id, {
				titulo: body.titulo,
				itdestado: body.itdestado,
			});
			if (!ok) {
				return jsonResponse({ ok: false, error: "conversación no encontrada" }, 404, corsHeaders(origin));
			}
			return jsonResponse({ ok: true, iconversacion: id }, 200, corsHeaders(origin));
		} catch (err) {
			context.error("conversacionById PATCH", err);
			const message = err instanceof Error ? err.message : String(err);
			return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
		}
	}

	if (request.method === "DELETE") {
		try {
			const ok = await deleteConversation(id);
			if (!ok) {
				return jsonResponse({ ok: false, error: "conversación no encontrada" }, 404, corsHeaders(origin));
			}
			return jsonResponse({ ok: true, iconversacion: id }, 200, corsHeaders(origin));
		} catch (err) {
			context.error("conversacionById DELETE", err);
			const message = err instanceof Error ? err.message : String(err);
			return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
		}
	}

	return jsonResponse({ ok: false, error: "Método no permitido" }, 405, corsHeaders(origin));
}

app.http("conversacionById", {
	methods: ["GET", "PATCH", "DELETE", "OPTIONS"],
	authLevel: "anonymous",
	route: "conversacion/{iconversacion}",
	handler: conversacionByIdHandler,
});
