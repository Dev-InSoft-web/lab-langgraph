/*
 * Endpoints para la app ISA-JAGUDELOE (frontend estático gh-pages).
 * Rutas: /api/isa/...  — los GET son PÚBLICOS (consulta libre); las escrituras exigen JWT.
 * Reutiliza los repositorios existentes para no quemar SQL en el front.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {
	corsHeaders,
	jsonResponse,
	beginHttpRequest,
	beginHttpRequestPublic,
} from "../lib/core/http.js";
import { loadBitacoraBundle } from "../lib/bitacora/repository.js";
import { listEntityRows } from "../lib/ispgen/repository.js";
import { readRevisadoAll, writeRevisadoMany } from "../lib/persistence/revisado.js";

const SPACES = [
	{ id: "patyia", label: "PatyIA" },
	{ id: "clientesis", label: "ClientesIS" },
];

function normalizeProject(p: string | undefined): string {
	return (p ?? "").trim().toLowerCase();
}

/** GET /api/isa/spaces — lista de spaces disponibles. */
async function spacesHandler(request: HttpRequest): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const pre = beginHttpRequestPublic(request, origin);
	if (pre) return pre;
	return jsonResponse({ ok: true, spaces: SPACES }, 200, corsHeaders(origin));
}

/** GET /api/isa/{project}/bitacora — bundle de bitácora (layout + segmentos). */
async function bitacoraHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const pre = beginHttpRequestPublic(request, origin);
	if (pre) return pre;
	const project = normalizeProject(request.params.project);
	try {
		const bundle = await loadBitacoraBundle(project);
		if (!bundle) {
			return jsonResponse({ ok: true, project, layout: { nodes: [] }, segments: {} }, 200, corsHeaders(origin));
		}
		// El front consume segments como un único mapa por segmentId.
		const segments = { ...(bundle.md ?? {}), ...(bundle.sql ?? {}) };
		return jsonResponse({ ok: true, project, layout: bundle.layout, segments }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("isa/bitacora", err);
		return jsonResponse({ ok: false, error: errMsg(err) }, 500, corsHeaders(origin));
	}
}

/** GET /api/isa/{project}/tickets — tickets del space desde el entity store. */
async function ticketsHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const pre = beginHttpRequestPublic(request, origin);
	if (pre) return pre;
	const project = normalizeProject(request.params.project);
	const estado = request.query.get("estado")?.trim();
	try {
		const seg = { project, page: "tickets", entity: "ticket" };
		const filter = estado ? { estado } : undefined;
		const { rows, total } = await listEntityRows(seg, { limit: 500, filter });
		const tickets = rows.map((r) => ({ id: r.ientityid, ...(r.body as Record<string, unknown>) }));
		return jsonResponse({ ok: true, project, total, rows: tickets }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("isa/tickets", err);
		return jsonResponse({ ok: false, error: errMsg(err) }, 500, corsHeaders(origin));
	}
}

/**
 * /api/isa/{project}/checks
 *  - GET (público): estado de los checks del space.
 *  - POST (JWT): marcar/desmarcar un check { revisadoKey, checked }.
 */
async function checksHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const project = normalizeProject(request.params.project);

	if (request.method === "GET") {
		const pre = beginHttpRequestPublic(request, origin);
		if (pre) return pre;
		try {
			const map = await readRevisadoAll();
			const rows = Object.entries(map)
				.filter(([k]) => k.toLowerCase().includes(project))
				.map(([revisadoKey, checked]) => ({ revisadoKey, checked: !!checked }));
			return jsonResponse({ ok: true, project, rows }, 200, corsHeaders(origin));
		} catch (err) {
			context.error("isa/checks GET", err);
			return jsonResponse({ ok: false, error: errMsg(err) }, 500, corsHeaders(origin));
		}
	}

	// POST: requiere sesión.
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	try {
		const text = await request.text();
		const body = text.trim() ? (JSON.parse(text) as { revisadoKey?: string; checked?: boolean }) : {};
		const key = (body.revisadoKey ?? "").trim();
		if (!key) return jsonResponse({ ok: false, error: "revisadoKey requerido" }, 400, corsHeaders(origin));
		const next = await writeRevisadoMany({ [key]: !!body.checked });
		return jsonResponse({ ok: true, project, revisadoKey: key, checked: !!next[key] }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("isa/checks POST", err);
		return jsonResponse({ ok: false, error: errMsg(err) }, 500, corsHeaders(origin));
	}
}

function errMsg(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

app.http("isaSpaces", { methods: ["GET", "OPTIONS"], authLevel: "anonymous", route: "isa/spaces", handler: spacesHandler });
app.http("isaBitacora", { methods: ["GET", "OPTIONS"], authLevel: "anonymous", route: "isa/{project}/bitacora", handler: bitacoraHandler });
app.http("isaTickets", { methods: ["GET", "OPTIONS"], authLevel: "anonymous", route: "isa/{project}/tickets", handler: ticketsHandler });
app.http("isaChecks", { methods: ["GET", "POST", "OPTIONS"], authLevel: "anonymous", route: "isa/{project}/checks", handler: checksHandler });
