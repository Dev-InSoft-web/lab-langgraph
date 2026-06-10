import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequestPublic } from "../lib/core/http.js";
import { listInstruccionesFromDb } from "../lib/langlab/db/promptsRepo.js";

const SKIP_KEYS = new Set(["LANGLAB_BASE", "CLASSIFIER_TIPO_CONSULTA"]);

async function getPatyiaInstruccionesHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const block = beginHttpRequestPublic(request, origin);
	if (block) return block;

	if (request.method !== "GET") {
		return jsonResponse({ ok: false, error: "GET requerido" }, 405, corsHeaders(origin));
	}

	try {
		const rows = await listInstruccionesFromDb();
		const mapped = rows
			.filter((r) => !SKIP_KEYS.has(String(r.iinstruccion ?? "").trim().toUpperCase()))
			.map((r) => ({
				IINSTRUCCION: String(r.iinstruccion ?? "").trim().toUpperCase(),
				NINSTRUCCION: `PROMPT_${String(r.iinstruccion ?? "").trim().toUpperCase()}`,
				INSTRUCCION: String(r.instruccion ?? ""),
				DESCRIPCION: r.descripcion ?? "",
				BACTIVO: 1,
			}));
		return jsonResponse(
			{
				ok: true,
				storage: "postgresql:BD_LANGLAB.INSTRUCCION",
				rows: mapped,
				rowCount: mapped.length,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("getPatyiaInstrucciones", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("getPatyiaInstrucciones", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "patyia/instrucciones",
	handler: getPatyiaInstruccionesHandler,
});
