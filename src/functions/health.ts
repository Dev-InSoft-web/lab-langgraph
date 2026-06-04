import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { pingOpsDb, pingRagDb } from "../lib/db/pg.js";
import { PG_SCHEMA_LAB, PG_SCHEMA_PATY, PG_SCHEMA_RAG } from "../lib/core/lab-constants.js";
import { signalRConfigured } from "../lib/core/signalr-config.js";

async function healthHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	const [opsOk, ragOk] = await Promise.all([pingOpsDb(), pingRagDb()]);

	return jsonResponse(
		{
			ok: opsOk && ragOk,
			service: "lab-langgraph",
			databases: {
				ops: { ok: opsOk, schemas: [PG_SCHEMA_PATY, PG_SCHEMA_LAB] },
				rag: { ok: ragOk, schemas: [PG_SCHEMA_RAG] },
			},
			signalR: { configured: signalRConfigured() },
			hint: "POST /api/index, /api/ask, GET /api/signalr/negotiate, POST /api/signalr/notify",
		},
		opsOk && ragOk ? 200 : 503,
		corsHeaders(origin),
	);
}

app.http("health", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "health",
	handler: healthHandler,
});
