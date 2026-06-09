import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequestPublic } from "../lib/core/http.js";
import { loadBitacoraBundle } from "../lib/bitacora/repository.js";

const PROJECTS = new Set(["patyia", "clientesis", "isa-doc"]);

async function bitacoraHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const block = beginHttpRequestPublic(request, origin);
	if (block) return block;

	const project = (request.params.project ?? "").trim().toLowerCase();
	if (!PROJECTS.has(project)) {
		return jsonResponse({ ok: false, error: "Proyecto no válido", allowed: [...PROJECTS] }, 400, corsHeaders(origin));
	}

	try {
		const bundle = await loadBitacoraBundle(project);
		if (!bundle) {
			return jsonResponse(
				{ ok: false, error: `Sin layout de bitácora para ${project}. Ejecutar: npm run bitacora:migrate-${project}` },
				404,
				corsHeaders(origin),
			);
		}
		return jsonResponse(bundle, 200, corsHeaders(origin));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: msg }, 500, corsHeaders(origin));
	}
}

app.http("bitacoraGet", {
	route: "bitacora/{project}",
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	handler: bitacoraHandler,
});
