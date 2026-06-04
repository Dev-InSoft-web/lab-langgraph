import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import {
	getController,
	listRegisteredControllers,
	parseListQuery,
} from "../lib/ispgen/controller.js";
import { parseJSDetail } from "../lib/ispgen/jsdetail.js";
import { ensureEntityControllersRegisteredAsync } from "../lib/ispgen/register.js";
import { rspErr } from "../lib/ispgen/response.js";
import { seedAllCatalogData } from "../lib/ispgen/seed-catalog-data.js";

function storeCors(origin: string | null): Record<string, string> {
	return {
		...corsHeaders(origin),
		"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	};
}

async function registryHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);
	await ensureEntityControllersRegisteredAsync();
	return jsonResponse(
		{
			ok: true,
			segment: "{project}/{page}/{entity}",
			entities: listRegisteredControllers(),
			hints: {
				list: "GET /api/entity/{project}/{page}/{entity}?limit=&offset=&q=&fields=&parentPk=&tags=&filter.x=",
				detail: "GET .../{pk}?detail=todo | detail={\"assets\":{\"todo\":true}}",
				propagate: "POST body con arrays en claves de details (ej. assets)",
			},
		},
		200,
		storeCors(origin),
	);
}

async function seedHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);
	if (request.method !== "POST") {
		return jsonResponse({ ok: false, error: "POST requerido" }, 405, storeCors(origin));
	}
	try {
		await ensureEntityControllersRegisteredAsync();
		const data = await seedAllCatalogData();
		return jsonResponse({ ok: true, data }, 200, storeCors(origin));
	} catch (err) {
		context.error("entity seed", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, storeCors(origin));
	}
}

async function entityHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	await ensureEntityControllersRegisteredAsync();
	const project = request.params.project?.trim();
	const page = request.params.page?.trim();
	const entity = request.params.entity?.trim();
	const pk = request.params.pk?.trim();

	if (!project || !page || !entity) {
		return jsonResponse({ ok: false, error: "project, page y entity requeridos" }, 400, storeCors(origin));
	}

	const ctrl = getController(project, page, entity);
	if (!ctrl) {
		return jsonResponse(
			{ ...rspErr(`Entidad no registrada: ${project}/${page}/${entity}`, 404) },
			404,
			storeCors(origin),
		);
	}

	try {
		const url = new URL(request.url);

		if (!pk) {
			if (request.method === "GET") {
				const res = await ctrl.list(parseListQuery(url));
				return jsonResponse(res, 200, storeCors(origin));
			}
			if (request.method === "POST") {
				const text = await request.text();
				const body = text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
				const parentPk = url.searchParams.get("parentPk") ?? undefined;
				const tags = url.searchParams.get("tags")?.split(",").filter(Boolean);
				const res = await ctrl.create(body, {
					parent: parentPk
						? {
								project: url.searchParams.get("parentProject") ?? project,
								page: url.searchParams.get("parentPage") ?? page,
								entity: url.searchParams.get("parentEntity") ?? "ticket",
								pk: parentPk,
							}
						: undefined,
					tags,
				});
				return jsonResponse(res, 200, storeCors(origin));
			}
			return jsonResponse({ ok: false, error: "Método no soportado" }, 405, storeCors(origin));
		}

		const decodedPk = decodeURIComponent(pk);

		if (request.method === "GET") {
			const jsDetail = parseJSDetail(url.searchParams.get("detail"));
			const fields = url.searchParams.get("fields")?.split(",").map((s) => s.trim()).filter(Boolean);
			const res = await ctrl.getOne(decodedPk, jsDetail, fields);
			const status = res.encabezado.resultado ? 200 : (res.encabezado.codigo ?? 404);
			return jsonResponse(res, status, storeCors(origin));
		}

		if (request.method === "PUT" || request.method === "PATCH") {
			const text = await request.text();
			const body = text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
			const res = await ctrl.update(decodedPk, body, request.method === "PUT");
			const status = res.encabezado.resultado ? 200 : (res.encabezado.codigo ?? 400);
			return jsonResponse(res, status, storeCors(origin));
		}

		if (request.method === "DELETE") {
			const res = await ctrl.remove(decodedPk);
			const status = res.encabezado.resultado ? 200 : (res.encabezado.codigo ?? 404);
			return jsonResponse(res, status, storeCors(origin));
		}

		if (request.method === "POST" && url.pathname.endsWith("/propagate")) {
			const text = await request.text();
			const body = text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
			const res = await ctrl.update(decodedPk, body, false);
			return jsonResponse(res, 200, storeCors(origin));
		}

		return jsonResponse({ ok: false, error: "Método no soportado" }, 405, storeCors(origin));
	} catch (err) {
		context.error("entity store", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ...rspErr(message, 500) }, 500, storeCors(origin));
	}
}

app.http("entityRegistry", {
	route: "entity",
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	handler: registryHandler,
});

app.http("entitySeed", {
	route: "entity/seed",
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	handler: seedHandler,
});

app.http("entityCrud", {
	route: "entity/{project}/{page}/{entity}/{pk?}",
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	authLevel: "anonymous",
	handler: entityHandler,
});
