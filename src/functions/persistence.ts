import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { persistenceInventory, PERSISTENCE_ALLOWLIST } from "../lib/core/lab-data-paths.js";
import { readPersistenceJson, writePersistenceJson } from "../lib/persistence/json-store.js";
import { readRevisadoAll, writeRevisadoMany } from "../lib/persistence/revisado.js";
import {
	guardarConvsCache,
	leerConvsCache,
	loadIdentidadesCache,
	saveIdentidadesCache,
} from "../lib/persistence/patyia-caches.js";

async function inventoryHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	return jsonResponse(
		{ ok: true, allowlist: PERSISTENCE_ALLOWLIST, ...persistenceInventory() },
		200,
		corsHeaders(origin),
	);
}

async function genericStoreHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	const rel = request.params.path?.replace(/\\/g, "/") ?? "";
	if (!rel) {
		return jsonResponse({ ok: false, error: "path requerido" }, 400, corsHeaders(origin));
	}

	try {
		if (request.method === "GET") {
			const data = await readPersistenceJson(rel);
			return jsonResponse({ ok: true, path: rel, data: data ?? {} }, 200, corsHeaders(origin));
		}
		if (request.method === "PUT" || request.method === "POST") {
			const text = await request.text();
			const data = text.trim() ? (JSON.parse(text) as unknown) : {};
			await writePersistenceJson(rel, data);
			return jsonResponse({ ok: true, path: rel }, 200, corsHeaders(origin));
		}
		return jsonResponse({ ok: false, error: "Método no soportado" }, 405, corsHeaders(origin));
	} catch (err) {
		context.error("persistence store", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function revisadoHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	try {
		if (request.method === "GET") {
			return jsonResponse(await readRevisadoAll(), 200, corsHeaders(origin));
		}
		const text = await request.text();
		const body = text.trim() ? (JSON.parse(text) as Record<string, unknown>) : {};
		const updates: Record<string, boolean> = {};
		for (const [k, v] of Object.entries(body)) updates[k] = !!v;
		const next = await writeRevisadoMany(updates);
		return jsonResponse(next, 200, corsHeaders(origin));
	} catch (err) {
		context.error("revisado", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function patyiaConversacionesHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	const db = request.query.get("db")?.trim() ?? "";
	const itercero = request.query.get("itercero")?.trim() ?? "";
	const icontacto = request.query.get("icontacto")?.trim() ?? "";
	if (!db || !itercero) {
		return jsonResponse({ ok: false, error: "db e itercero requeridos" }, 400, corsHeaders(origin));
	}
	try {
		if (request.method === "GET") {
			const entry = await leerConvsCache(db, itercero, icontacto);
			return jsonResponse({ ok: true, entry }, 200, corsHeaders(origin));
		}
		if (request.method === "PUT" || request.method === "POST") {
			const text = await request.text();
			const body = JSON.parse(text) as { items?: unknown[] };
			const items = Array.isArray(body.items) ? body.items : [];
			await guardarConvsCache(db, itercero, icontacto, items as Parameters<typeof guardarConvsCache>[3]);
			return jsonResponse({ ok: true }, 200, corsHeaders(origin));
		}
		return jsonResponse({ ok: false, error: "Método no soportado" }, 405, corsHeaders(origin));
	} catch (err) {
		context.error("patyia conversaciones cache", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function patyiaIdentidadesHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	try {
		if (request.method === "GET") {
			return jsonResponse({ ok: true, cache: await loadIdentidadesCache() }, 200, corsHeaders(origin));
		}
		if (request.method === "PUT" || request.method === "POST") {
			const text = await request.text();
			const cache = JSON.parse(text) as Parameters<typeof saveIdentidadesCache>[0];
			await saveIdentidadesCache(cache);
			return jsonResponse({ ok: true }, 200, corsHeaders(origin));
		}
		return jsonResponse({ ok: false, error: "Método no soportado" }, 405, corsHeaders(origin));
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("persistenceInventory", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "persistence",
	handler: inventoryHandler,
});

app.http("persistenceStore", {
	methods: ["GET", "PUT", "POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "persistence/{*path}",
	handler: genericStoreHandler,
});

app.http("persistenceRevisado", {
	methods: ["GET", "POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "revisado",
	handler: revisadoHandler,
});

app.http("persistencePatyiaConvs", {
	methods: ["GET", "PUT", "POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "patyia/cache/conversaciones",
	handler: patyiaConversacionesHandler,
});

app.http("persistencePatyiaIdentidades", {
	methods: ["GET", "PUT", "POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "patyia/cache/identidades",
	handler: patyiaIdentidadesHandler,
});
