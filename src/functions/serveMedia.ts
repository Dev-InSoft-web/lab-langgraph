import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { beginHttpRequest, corsHeaders } from "../lib/core/http.js";
import { readMediaPng } from "../lib/media/store.js";

async function mediaHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	const id = request.params.id?.replace(/\.png$/i, "") ?? "";

	const png = await readMediaPng(id);
	if (!png) {
		return { status: 404, headers: corsHeaders(origin), body: "Not found" };
	}

	return {
		status: 200,
		headers: {
			...corsHeaders(origin),
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=86400",
		},
		body: png,
	};
}

app.http("serveMedia", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "media/{id}",
	handler: mediaHandler,
});
