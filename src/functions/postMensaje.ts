import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { appendRating, loadConversation } from "../lib/patyia/conversation/store.js";
import type { MensajePostBody } from "../lib/patyia/conversation/types.js";

async function postMensajeHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	try {
		const body = (await request.json()) as MensajePostBody;
		const iconversacion = Number(body.iconversacion);
		if (!Number.isFinite(iconversacion) || iconversacion <= 0) {
			return jsonResponse({ ok: false, error: "iconversacion requerido" }, 400, corsHeaders(origin));
		}
		const conv = await loadConversation(iconversacion);
		if (!conv) {
			return jsonResponse({ ok: false, error: "conversación no encontrada" }, 404, corsHeaders(origin));
		}
		const rating = {
			iconversacion,
			calificacion: body.calificacion,
			comentario: body.comentario,
			createdAt: new Date().toISOString(),
		};
		await appendRating(rating);
		return jsonResponse({ ok: true, body: rating }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("postMensaje", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("postMensaje", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "mensaje",
	handler: postMensajeHandler,
});
