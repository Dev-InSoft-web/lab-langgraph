import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { ask, chunksToSources } from "../lib/rag/ask.js";
import { normalizeCorpusList, normalizeTipoList } from "../lib/rag/metadata.js";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";

type AskBody = {
	question?: string;
	k?: number;
	/** Un corpus o lista (filtro OR). */
	corpus?: string | string[];
	/** Alias de corpus */
	tags?: string | string[];
	tipo?: string | string[];
};

async function askHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	try {
		const body = (await request.json()) as AskBody;
		const question = String(body.question ?? "").trim();
		if (!question) {
			return jsonResponse({ ok: false, error: "question vacía" }, 400, corsHeaders(origin));
		}
		const k = Math.min(Math.max(Number(body.k) || 4, 1), 20);
		const corpusRaw = body.corpus ?? body.tags;
		const corpusList = Array.isArray(corpusRaw)
			? corpusRaw
			: corpusRaw
				? [corpusRaw]
				: undefined;
		const tipoRaw = body.tipo;
		const tipoList = Array.isArray(tipoRaw) ? tipoRaw : tipoRaw ? [tipoRaw] : undefined;
		const filters = {
			corpus: normalizeCorpusList(corpusList),
			tipo: normalizeTipoList(tipoList),
		};

		const { answer, chunks } = await ask(question, k, filters);
		const apiBase = new URL(request.url).origin + "/api";
		const sources = await chunksToSources(chunks, apiBase);

		return jsonResponse(
			{
				ok: true,
				answer,
				sources,
				fragments: chunks.length,
				filter: filters.corpus || filters.tipo ? filters : undefined,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("ask error", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("askQuestion", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "ask",
	handler: askHandler,
});
