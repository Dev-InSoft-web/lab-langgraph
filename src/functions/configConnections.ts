import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {
	getClientesisDatabaseUrl,
	getClientesisMssqlConfig,
	getLanglabDatabaseUrl,
	getPatyMssqlConfig,
	getRagDatabaseUrl,
} from "../lib/core/config.js";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { pingClientesisDb, pingPatyDb, pingRagDb } from "../lib/db/pg.js";
import { pingMssql } from "../lib/mssql/pool.js";

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

	const patyPg = getLanglabDatabaseUrl();
	const clientesisPg = getClientesisDatabaseUrl();
	let ragUrl: string | null = null;
	let ragOk = false;
	try {
		ragUrl = getRagDatabaseUrl();
		ragOk = await pingRagDb();
	} catch {
		ragUrl = null;
	}

	const [patyOk, clientesisOk, mssqlClientesis, mssqlPaty] = await Promise.all([
		pingPatyDb(),
		pingClientesisDb(),
		getClientesisMssqlConfig() ? pingMssql("clientesis") : Promise.resolve({ ok: false, reason: "no configurado" }),
		getPatyMssqlConfig() ? pingMssql("paty") : Promise.resolve({ ok: false, reason: "no configurado" }),
	]);

	return jsonResponse(
		{
			ok: true,
			postgres: {
				langlab: {
					label: pgLabel(patyPg),
					ping: patyOk,
					schemas: ["BD_LANGLAB", "BD_ISADOC"],
					role: "LangLab runtime (BD_LANGLAB) + ISA-DOC store (BD_ISADOC)",
				},
				/** @deprecated alias */
				paty: {
					label: pgLabel(patyPg),
					ping: patyOk,
					schemas: ["BD_LANGLAB"],
					role: "alias de langlab",
				},
				clientesis: {
					label: pgLabel(clientesisPg),
					ping: clientesisOk,
					sameInstanceAsPaty: patyPg === clientesisPg,
					schemas: ["BD_ISADOC"],
					role: "Entity store proyecto clientesis en BD_ISADOC",
				},
				rag: ragUrl
					? { label: pgLabel(ragUrl), ping: ragOk, schemas: ["BD_RAG"] }
					: { configured: false },
			},
			mssql: {
				clientesis: { ...(maskMssql(getClientesisMssqlConfig()) ?? {}), ping: mssqlClientesis.ok },
				paty: { ...(maskMssql(getPatyMssqlConfig()) ?? {}), ping: mssqlPaty.ok },
			},
			hints: {
				isaDoc: "Solo PUBLIC_LAB_LANGGRAPH_URL; sin claves MSSQL en ISA-DOC/.env",
				mssqlQuery: "GET|POST /api/mssql/{clientesis|paty}/query (solo SELECT, sin auth)",
				mssqlExec: "POST /api/mssql/{clientesis|paty}/exec (JWT Bearer requerido)",
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
