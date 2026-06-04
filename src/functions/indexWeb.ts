import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { loadGovernmentWebDocuments, resolveGovernmentPagesDir } from "../lib/rag/webChunks.js";
import { indexWebDocuments } from "../lib/rag/vectorstore.js";

async function indexWebHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	try {
		const append = request.query.get("append") === "true";
		const pagesDir = resolveGovernmentPagesDir();
		const { documents, pages, chunks, skippedEmpty } =
			await loadGovernmentWebDocuments(pagesDir);

		if (documents.length === 0) {
			return jsonResponse(
				{
					ok: false,
					error:
						"No hay páginas en web/government/pages/. Ejecuta npm run lab:gov:fetch en ISA-DOC.",
				},
				400,
				corsHeaders(origin),
			);
		}

		context.log(
			`Indexando web (contadores): ${pagesDir} · ${pages} pág · ${chunks} chunks · append=${append}`,
		);
		const result = await indexWebDocuments(documents);

		return jsonResponse(
			{
				ok: true,
				message: `Corpus web indexado · ${result.chunks} chunks · ${pages} página(s)`,
				pagesDir,
				pages,
				chunks: result.chunks,
				segmentChunks: chunks,
				skippedEmpty,
				files: result.files,
				appended: append,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("index web error", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("indexWeb", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "index/web",
	handler: indexWebHandler,
});
