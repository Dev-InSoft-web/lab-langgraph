import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { createConversation, listConversations } from "../lib/langlab/conversation/store.js";
import type { CreateConversationBody } from "../lib/langlab/conversation/types.js";

const LAB_ITERCERO = "lab-langgraph";

async function conversacionesHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	if (request.method === "GET") {
		try {
			const itercero = (request.query.get("itercero") ?? LAB_ITERCERO).trim();
			const icontacto = (request.query.get("icontacto") ?? "default").trim();
			if (!itercero) {
				return jsonResponse({ ok: false, error: "itercero requerido" }, 400, corsHeaders(origin));
			}
			const items = await listConversations(itercero, icontacto || undefined);
			return jsonResponse(
				{
					ok: true,
					itercero,
					icontacto,
					items: items.map((it) => ({
						iconversacion: it.iconversacion,
						titulo: it.titulo,
						prompt: it.prompt,
						qmensajes: it.qmensajes,
						fhcre: it.fhcre,
						fhultact: it.fhultact,
					})),
				},
				200,
				corsHeaders(origin),
			);
		} catch (err) {
			context.error("conversaciones GET", err);
			const message = err instanceof Error ? err.message : String(err);
			return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
		}
	}

	if (request.method === "POST") {
		try {
			const body = (await request.json().catch(() => ({}))) as CreateConversationBody;
			const itercero = (body.itercero ?? LAB_ITERCERO).trim();
			const icontacto = (body.icontacto ?? "default").trim();
			const nombreUsuario = (body.nombre_usuario ?? "Usuario lab").trim();
			const record = await createConversation({
				itercero,
				icontacto,
				nombreUsuario,
				titulo: body.titulo,
			});
			if (!record) {
				return jsonResponse({ ok: false, error: "No se pudo crear" }, 500, corsHeaders(origin));
			}
			return jsonResponse(
				{
					ok: true,
					body: {
						iconversacion: record.iconversacion,
						titulo: record.titulo,
						fhcre: record.fhcre,
					},
				},
				201,
				corsHeaders(origin),
			);
		} catch (err) {
			context.error("conversaciones POST", err);
			const message = err instanceof Error ? err.message : String(err);
			return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
		}
	}

	return jsonResponse({ ok: false, error: "Método no permitido" }, 405, corsHeaders(origin));
}

app.http("conversaciones", {
	methods: ["GET", "POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "conversaciones",
	handler: conversacionesHandler,
});
