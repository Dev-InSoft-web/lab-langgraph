import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {
	getClientesisDatabaseUrl,
	getClientesisMssqlConfig,
	getPatyDatabaseUrl,
	getPatyMssqlConfig,
	getRagDatabaseUrl,
} from "../lib/core/config.js";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { pingClientesisDb, pingPatyDb, pingRagDb } from "../lib/db/pg.js";

function pgLabel(url: string): string {
	try {
		const u = new URL(url);
		return `${u.hostname}/${u.pathname.replace(/^\//, "")}`;
	} catch {
		return "(url inválida)";
	}
}

function maskMssql(cfg: ReturnType<typeof getPatyMssqlConfig>): Record<string, unknown> | null {
	if (!cfg) return null;
	return {
		host: cfg.host,
		port: cfg.port,
		user: cfg.user,
		database: cfg.database,
		hasPassword: Boolean(cfg.pass),
	};
}

async function handler(request: HttpRequest, _ctx: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	const patyPg = getPatyDatabaseUrl();
	const clientesisPg = getClientesisDatabaseUrl();
	let ragUrl: string | null = null;
	let ragOk = false;
	try {
		ragUrl = getRagDatabaseUrl();
		ragOk = await pingRagDb();
	} catch {
		ragUrl = null;
	}

	const [patyOk, clientesisOk] = await Promise.all([pingPatyDb(), pingClientesisDb()]);

	return jsonResponse(
		{
			ok: true,
			postgres: {
				paty: {
					label: pgLabel(patyPg),
					ping: patyOk,
					schemas: ["BD_PATY", "BD_LAB"],
					role: "PatyIA, ISA-DOC, catálogo maestro (bd_*)",
				},
				clientesis: {
					label: pgLabel(clientesisPg),
					ping: clientesisOk,
					sameInstanceAsPaty: patyPg === clientesisPg,
					schemas: ["BD_CLIENTESIS"],
					role: "BD_CLIENTESIS.CIS_ENTITYROW (capacitación / postman-catalog)",
				},
				rag: ragUrl
					? { label: pgLabel(ragUrl), ping: ragOk, schemas: ["BD_RAG"] }
					: { configured: false },
			},
			mssql: {
				clientesis: maskMssql(getClientesisMssqlConfig()),
				paty: maskMssql(getPatyMssqlConfig()),
			},
			hints: {
				isaDoc: "Solo PUBLIC_LAB_LANGGRAPH_URL; sin claves ni BD en ISA-DOC/.env",
				store: "GET /api/entity/{project}/{page}/{entity}",
			},
		},
		200,
		corsHeaders(origin),
	);
}

app.http("configConnections", {
	route: "config/connections",
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	handler,
});
