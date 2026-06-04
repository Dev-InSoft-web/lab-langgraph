import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { bootstrapCatalogFromDefinitions } from "../lib/ispgen/catalog-bootstrap.js";
import {
	listEntityDefinitions,
	listProjects,
	listSections,
} from "../lib/ispgen/catalog-repository.js";
import { ensureEntityControllersRegisteredAsync } from "../lib/ispgen/register.js";
import { seedAllCatalogData } from "../lib/ispgen/seed-catalog-data.js";

function catalogCors(origin: string | null): Record<string, string> {
	return {
		...corsHeaders(origin),
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	};
}

async function projectsHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	await ensureEntityControllersRegisteredAsync();
	const projects = await listProjects();
	const enriched = await Promise.all(
		projects.map(async (p) => ({
			...p,
			sections: await listSections(p.slug),
		})),
	);
	return jsonResponse({ ok: true, projects: enriched }, 200, catalogCors(origin));
}

async function sectionsHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	const project = request.params.project?.trim();
	if (!project) {
		return jsonResponse({ ok: false, error: "project requerido" }, 400, catalogCors(origin));
	}
	const sections = await listSections(project);
	return jsonResponse({ ok: true, project, sections }, 200, catalogCors(origin));
}

async function entitiesHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	const project = request.params.project?.trim();
	const page = request.params.page?.trim();
	if (!project || !page) {
		return jsonResponse({ ok: false, error: "project y page requeridos" }, 400, catalogCors(origin));
	}
	await ensureEntityControllersRegisteredAsync();
	const entities = await listEntityDefinitions(project, page);
	return jsonResponse(
		{
			ok: true,
			project,
			page,
			entities: entities.map((e) => ({
				entity: e.entity_slug,
				name: e.name,
				primaryKeys: e.primary_keys,
				columns: e.columns,
				details: e.details,
				searchFields: e.search_fields,
				apiPath: `/api/entity/${e.project_slug}/${e.section_slug}/${e.entity_slug}`,
			})),
		},
		200,
		catalogCors(origin),
	);
}

async function bootstrapHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	if (request.method !== "POST") {
		return jsonResponse({ ok: false, error: "POST requerido" }, 405, catalogCors(origin));
	}
	try {
		const meta = await bootstrapCatalogFromDefinitions();
		await ensureEntityControllersRegisteredAsync();
		const data = request.query.get("data") === "1" ? await seedAllCatalogData() : undefined;
		return jsonResponse({ ok: true, meta, data }, 200, catalogCors(origin));
	} catch (err) {
		context.error("catalog bootstrap", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, catalogCors(origin));
	}
}

app.http("catalogProjects", {
	route: "catalog/projects",
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	handler: projectsHandler,
});

app.http("catalogSections", {
	route: "catalog/projects/{project}/sections",
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	handler: sectionsHandler,
});

app.http("catalogEntities", {
	route: "catalog/projects/{project}/sections/{page}/entities",
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	handler: entitiesHandler,
});

app.http("catalogBootstrap", {
	route: "catalog/bootstrap",
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	handler: bootstrapHandler,
});
