import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { runPgLanglabExec } from "../lib/db/pg-run.js";

async function readSql(request: HttpRequest): Promise<string> {
	try {
		const body = (await request.json()) as { sql?: string };
		return (typeof body.sql === "string" ? body.sql : "").trim();
	} catch {
		return "";
	}
}

async function langlabExecHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	if (request.method !== "POST") {
		return jsonResponse({ ok: false, error: "POST requerido" }, 405, corsHeaders(origin));
	}

	const sql = await readSql(request);
	if (!sql) return jsonResponse({ ok: false, error: "SQL vacío" }, 400, corsHeaders(origin));

	try {
		const result = await runPgLanglabExec(sql);
		return jsonResponse(result, 200, corsHeaders(origin));
	} catch (err) {
		context.error("pg/langlab/exec", err);
		const msg = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: msg }, 500, corsHeaders(origin));
	}
}

app.http("pgLanglabExec", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "pg/langlab/exec",
	handler: langlabExecHandler,
});

/** Alias usado por apptools e ISA-DOC. */
app.http("patyiaPromptsUpsertSql", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "patyia/prompts/upsert-sql",
	handler: langlabExecHandler,
});
