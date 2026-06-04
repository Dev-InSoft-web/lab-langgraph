import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import type { Document } from "@langchain/core/documents";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { clearAllMedia } from "../lib/media/store.js";
import { loadPdfWithMedia } from "../lib/rag/pdfLoad.js";
import { clearVectorStore, indexDocuments } from "../lib/rag/vectorstore.js";

async function indexHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const replace = request.query.get("replace") !== "false";
		const form = await request.formData();
		const files: { name: string; buffer: Buffer }[] = [];

		for (const [, value] of form.entries()) {
			if (typeof value === "string") continue;
			const file = value as File;
			if (!file.name?.toLowerCase().endsWith(".pdf")) continue;
			const arrayBuffer = await file.arrayBuffer();
			files.push({ name: file.name, buffer: Buffer.from(arrayBuffer) });
		}

		if (files.length === 0) {
			return jsonResponse({ ok: false, error: "No se recibieron PDFs (.pdf) en multipart/form-data" }, 400, corsHeaders(origin));
		}

		if (replace) {
			await clearVectorStore();
			await clearAllMedia();
		}

		const allDocs: Document[] = [];
		let imagesExtracted = 0;
		for (const f of files) {
			const { docs, images } = await loadPdfWithMedia(f.buffer, f.name);
			allDocs.push(...docs);
			imagesExtracted += images.length;
		}

		context.log(
			`Indexando ${files.length} PDF(s), ${allDocs.length} página(s) texto, ${imagesExtracted} imagen(es)`,
		);

		const result = await indexDocuments(allDocs);

		return jsonResponse(
			{
				ok: true,
				message: `${files.length} PDF(s) indexados · ${result.chunks} fragmentos · ${imagesExtracted} imagen(es)`,
				pdfs: files.map((f) => f.name),
				chunks: result.chunks,
				files: result.files,
				imagesExtracted,
				replaced: replace,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("index error", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("indexDocuments", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "index",
	handler: indexHandler,
});
