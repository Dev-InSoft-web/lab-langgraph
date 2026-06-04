import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { buildOpenApiDocument } from "../lib/openapi/spec.js";
import { swaggerUiHtml } from "../lib/openapi/swagger-ui-html.js";

function apiBaseFromRequest(request: HttpRequest): string {
	const u = new URL(request.url);
	return `${u.origin}/api`;
}

async function openApiJsonHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	const doc = buildOpenApiDocument(apiBaseFromRequest(request));
	return jsonResponse(doc, 200, {
		...corsHeaders(origin),
		"Cache-Control": "public, max-age=300",
	});
}

async function swaggerUiHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	const specUrl = `${apiBaseFromRequest(request)}/openapi.json`;
	return {
		status: 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			...corsHeaders(origin),
		},
		body: swaggerUiHtml(specUrl),
	};
}

app.http("openApiJson", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "openapi.json",
	handler: openApiJsonHandler,
});

app.http("swaggerUi", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "docs",
	handler: swaggerUiHandler,
});
