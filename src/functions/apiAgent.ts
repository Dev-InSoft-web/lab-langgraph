import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { getConnectionsSummary } from "../lib/integrations/connections.js";
import { loadCatalog, searchCatalog, loadFullManifest, getFullProjectCatalog } from "../lib/integrations/postman/catalog.js";
import { loadApiCatalogManifest } from "../lib/integrations/postman/manifest.js";
import { buildPostmanUiPayload } from "../lib/integrations/postman/postman-ui.js";
import { executeCatalogEntry } from "../lib/integrations/postman/execute.js";
import type { ApiProject } from "../lib/integrations/postman/types.js";
import { invokeApiTask, WORKFLOWS } from "../lib/agents/api-task/graph.js";

function parseProject(raw: string | null): ApiProject | null {
	const v = raw?.trim().toLowerCase();
	return v === "patyia" || v === "clientesis" ? v : null;
}

async function readJsonBody<T>(request: HttpRequest): Promise<T> {
	const text = await request.text();
	if (!text.trim()) return {} as T;
	return JSON.parse(text) as T;
}

async function connectionsHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	try {
		return jsonResponse({ ok: true, ...(await getConnectionsSummary()) }, 200, corsHeaders(origin));
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function catalogHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	if (request.query.get("full") === "1") {
		const manifest = await loadApiCatalogManifest();
		return jsonResponse({ ok: true, manifest }, 200, corsHeaders(origin));
	}

	const project = parseProject(request.query.get("project"));
	if (!project) {
		return jsonResponse({ ok: false, error: "project=patyia|clientesis requerido" }, 400, corsHeaders(origin));
	}

	if (request.query.get("projectFull") === "1") {
		return jsonResponse(
			{ ok: true, project: getFullProjectCatalog(project) },
			200,
			corsHeaders(origin),
		);
	}

	const q = request.query.get("q")?.trim() ?? "";
	const limit = Math.min(50, Number.parseInt(request.query.get("limit") ?? "25", 10) || 25);
	const entries = q ? searchCatalog(project, q, limit) : loadCatalog(project).slice(0, limit);
	return jsonResponse(
		{ ok: true, project, count: entries.length, meta: loadFullManifest().projects[project] ? {
			variables: loadFullManifest().projects[project].variables,
			entities: loadFullManifest().projects[project].entities,
		} : undefined, entries },
		200,
		corsHeaders(origin),
	);
}

async function postmanUiHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	const project = parseProject(request.query.get("project"));
	if (!project) {
		return jsonResponse({ ok: false, error: "project=patyia|clientesis requerido" }, 400, corsHeaders(origin));
	}
	try {
		const payload = buildPostmanUiPayload(project);
		return jsonResponse({ ok: true, project, ...payload }, 200, corsHeaders(origin));
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function manifestHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	const manifest = await loadApiCatalogManifest(request.query.get("refresh") === "1");
	return jsonResponse({ ok: true, manifest }, 200, corsHeaders(origin));
}

async function workflowsHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	return jsonResponse({ ok: true, workflows: WORKFLOWS }, 200, corsHeaders(origin));
}

async function taskHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const body = await readJsonBody<{
			task?: string;
			project?: ApiProject;
			envId?: string;
			mode?: "guide" | "execute";
			allowMutations?: boolean;
			workflowId?: string;
			useLlm?: boolean;
		}>(request);
		const task = body.task?.trim() || request.query.get("task")?.trim();
		if (!task) {
			return jsonResponse({ ok: false, error: "task requerido (lenguaje natural)" }, 400, corsHeaders(origin));
		}
		const mode = body.mode === "execute" ? "execute" : "guide";
		context.log(`api/agent/task mode=${mode} project=${body.project ?? "auto"}`);
		const out = await invokeApiTask({
			task,
			project: body.project,
			envId: body.envId,
			mode,
			allowMutations: body.allowMutations,
			workflowId: body.workflowId,
			useLlm: body.useLlm,
		});
		return jsonResponse(
			{
				ok: true,
				mode,
				plan: out.plan,
				results: out.results,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("api/agent/task", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function executeOneHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const body = await readJsonBody<{
			project?: ApiProject;
			catalogId?: string;
			envId?: string;
			allowMutations?: boolean;
			overrides?: { path?: string; body?: string };
		}>(request);
		const project = body.project ?? parseProject(request.query.get("project"));
		const catalogId = body.catalogId ?? request.query.get("catalogId")?.trim();
		if (!project || !catalogId) {
			return jsonResponse(
				{ ok: false, error: "project y catalogId requeridos" },
				400,
				corsHeaders(origin),
			);
		}
		const out = await executeCatalogEntry({
			project,
			catalogId,
			envId: body.envId,
			overrides: body.overrides,
			allowMutations: body.allowMutations ?? false,
		});
		return jsonResponse(
			{
				ok: out.result.status >= 200 && out.result.status < 300,
				entry: out.entry,
				request: { method: out.request.method, url: out.request.url },
				status: out.result.status,
				durationMs: out.result.durationMs,
				data: out.result.data,
				error: out.result.error,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		context.error("api/agent/execute", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("apiAgentConnections", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "agent/connections",
	handler: connectionsHandler,
});

app.http("apiAgentCatalog", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "agent/catalog",
	handler: catalogHandler,
});

app.http("apiAgentManifest", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "agent/manifest",
	handler: manifestHandler,
});

app.http("apiAgentPostmanUi", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "agent/postman-ui",
	handler: postmanUiHandler,
});

app.http("apiAgentWorkflows", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "agent/workflows",
	handler: workflowsHandler,
});

app.http("apiAgentTask", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "agent/task",
	handler: taskHandler,
});

app.http("apiAgentExecute", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "agent/execute",
	handler: executeOneHandler,
});
