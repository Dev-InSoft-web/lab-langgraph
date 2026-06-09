import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest, beginHttpRequestPublic } from "../lib/core/http.js";
import {
	getMermaidAsset,
	publishMermaidAsset,
	type MermaidAssetRecord,
} from "../lib/tickets/mermaid-asset.js";
import { mermaidInkUrl, prepareMermaidDiagram } from "../lib/mermaid/ink.js";

function cors(origin: string | null): Record<string, string> {
	return {
		...corsHeaders(origin),
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	};
}

function toPublicView(rec: MermaidAssetRecord) {
	return {
		filename: rec.filename,
		ticketId: rec.ticketId ?? null,
		mermaidSource: rec.mermaidSource,
		mermaidInkUrl: rec.mermaidInkUrl,
		sourceSha1: rec.sourceSha1,
		url: rec.url,
		display_url: rec.display_url,
		thumb: rec.thumb,
		width: rec.width,
		height: rec.height,
		sha1: rec.sha1,
		publishedAt: rec.publishedAt,
	};
}

/** GET /api/tickets/mermaid/{filename} — código, mermaid.ink e imgbb si ya publicado. */
async function mermaidGetHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const block = beginHttpRequestPublic(request, origin);
	if (block) return block;

	const filename = request.params.filename?.trim();
	if (!filename) {
		return jsonResponse({ ok: false, error: "filename requerido" }, 400, cors(origin));
	}

	const row = await getMermaidAsset(filename);
	if (row) {
		return jsonResponse({ ok: true, published: true, asset: toPublicView(row) }, 200, cors(origin));
	}

	return jsonResponse(
		{ ok: false, error: `Sin asset mermaid: ${filename}`, published: false },
		404,
		cors(origin),
	);
}

type PublishBody = {
	filename?: string;
	source?: string;
	ticketId?: string;
	force?: boolean;
	/** Solo previsualizar URLs sin subir a imgbb. */
	preview?: boolean;
};

/** POST /api/tickets/mermaid/publish — publica o reutiliza por mermaidInkUrl. */
async function mermaidPublishHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const block = await beginHttpRequest(request, origin);
	if (block) return block;

	try {
		const body = (await request.json()) as PublishBody;
		const filename = body.filename?.trim();
		const source = body.source?.trim();
		if (!filename || !source) {
			return jsonResponse({ ok: false, error: "filename y source requeridos" }, 400, cors(origin));
		}

		const prepared = prepareMermaidDiagram(source);
		const inkUrl = mermaidInkUrl(prepared);

		if (body.preview) {
			return jsonResponse(
				{
					ok: true,
					preview: true,
					filename,
					mermaidSource: prepared,
					mermaidInkUrl: inkUrl,
				},
				200,
				cors(origin),
			);
		}

		const { record, reused } = await publishMermaidAsset({
			filename,
			source: prepared,
			ticketId: body.ticketId?.trim(),
			force: Boolean(body.force),
		});

		return jsonResponse(
			{
				ok: true,
				reused,
				asset: toPublicView(record),
			},
			reused ? 200 : 201,
			cors(origin),
		);
	} catch (err) {
		context.error("mermaid publish", err);
		return jsonResponse(
			{ ok: false, error: err instanceof Error ? err.message : String(err) },
			500,
			cors(origin),
		);
	}
}

app.http("ticketMermaidGet", {
	route: "tickets/mermaid/{filename}",
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	handler: mermaidGetHandler,
});

app.http("ticketMermaidPublish", {
	route: "tickets/mermaid/publish",
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	handler: mermaidPublishHandler,
});
