import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {
	corsHeaders,
	jsonResponse,
	optionsResponse,
	beginHttpRequest,
	beginHttpRequestPublic,
} from "../lib/core/http.js";
import { mssqlTargetLabel, pingMssql, type MssqlTarget } from "../lib/mssql/pool.js";
import { runMssqlExec, runMssqlQuery } from "../lib/mssql/run.js";
import { assertPatyStagingInstruccionesSql, assertReadOnlySql } from "../lib/mssql/sql-guard.js";
import { verifyRequestLabJwt } from "../lib/auth/guard.js";

async function readSql(request: HttpRequest): Promise<string> {
	if (request.method === "GET") {
		return (request.query.get("sql") ?? "").trim();
	}
	try {
		const body = (await request.json()) as { sql?: string };
		return (typeof body.sql === "string" ? body.sql : "").trim();
	} catch {
		return "";
	}
}

async function pingHandler(
	request: HttpRequest,
	_context: InvocationContext,
	target: MssqlTarget,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const block = beginHttpRequestPublic(request, origin);
	if (block) return block;

	const ping = await pingMssql(target);
	return jsonResponse(
		{
			ok: ping.ok,
			target,
			database: mssqlTargetLabel(target),
			...(ping.reason ? { error: ping.reason } : {}),
		},
		ping.ok ? 200 : 503,
		corsHeaders(origin),
	);
}

async function queryHandler(
	request: HttpRequest,
	_context: InvocationContext,
	target: MssqlTarget,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const block = beginHttpRequestPublic(request, origin);
	if (block) return block;

	const sql = await readSql(request);
	if (!sql) return jsonResponse({ ok: false, error: "SQL vacío" }, 400, corsHeaders(origin));

	try {
		assertReadOnlySql(sql);
		const result = await runMssqlQuery(target, sql);
		return jsonResponse(result, 200, corsHeaders(origin));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		const status = msg.includes("Solo consultas") || msg.includes("no permitida") ? 403 : 500;
		return jsonResponse({ ok: false, error: msg }, status, corsHeaders(origin));
	}
}

async function execHandler(
	request: HttpRequest,
	_context: InvocationContext,
	target: MssqlTarget,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	if (request.method !== "POST") {
		return jsonResponse({ ok: false, error: "Método no permitido" }, 405, corsHeaders(origin));
	}

	const sql = await readSql(request);
	if (!sql) return jsonResponse({ ok: false, error: "SQL vacío" }, 400, corsHeaders(origin));

	try {
		const claims = await verifyRequestLabJwt(request);
		const sqlScope = typeof claims?.sqlScope === "string" ? claims.sqlScope.trim() : "";
		if (sqlScope === "paty_staging_instrucciones") {
			if (target !== "paty") {
				return jsonResponse(
					{ ok: false, error: "Alcance restringido: solo PatyIA staging (INSTRUCCION)" },
					403,
					corsHeaders(origin),
				);
			}
			assertPatyStagingInstruccionesSql(sql);
		}
		const result = await runMssqlExec(target, sql);
		return jsonResponse(result, 200, corsHeaders(origin));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		const status = /no permitid|solo fusión|solo MERGE/i.test(msg) ? 403 : 500;
		return jsonResponse({ ok: false, error: msg }, status, corsHeaders(origin));
	}
}

function registerMssqlRoutes(target: MssqlTarget): void {
	const name = target === "clientesis" ? "Clientesis" : "Paty";

	app.http(`mssql${name}Ping`, {
		route: `mssql/${target}/ping`,
		methods: ["GET", "OPTIONS"],
		authLevel: "anonymous",
		handler: (req, ctx) => pingHandler(req, ctx, target),
	});

	app.http(`mssql${name}Query`, {
		route: `mssql/${target}/query`,
		methods: ["GET", "POST", "OPTIONS"],
		authLevel: "anonymous",
		handler: (req, ctx) => queryHandler(req, ctx, target),
	});

	app.http(`mssql${name}Exec`, {
		route: `mssql/${target}/exec`,
		methods: ["POST", "OPTIONS"],
		authLevel: "anonymous",
		handler: (req, ctx) => execHandler(req, ctx, target),
	});
}

registerMssqlRoutes("clientesis");
registerMssqlRoutes("paty");
