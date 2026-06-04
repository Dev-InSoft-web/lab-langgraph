import type { CatalogEntry, HttpCallResult, ResolvedRequest } from "./types.js";
import { substituteTemplate } from "./substitute.js";
import { getRuntimeVars } from "../connections.js";
import type { ApiProject } from "./types.js";
import { getCatalogEntry } from "./catalog.js";

export function resolveCatalogRequest(
	entry: CatalogEntry,
	vars: Record<string, string>,
	overrides?: { path?: string; body?: string },
): ResolvedRequest {
	const hostKey = entry.hostVar;
	const host = substituteTemplate(`{{${hostKey}}}`, vars).replace(/\/$/, "");
	let path = substituteTemplate(entry.pathTemplate, vars);
	if (overrides?.path) path = overrides.path.startsWith("/") ? overrides.path : `/${overrides.path}`;
	const url = `${host}${path}`;
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (entry.authBearer && vars.token) headers.Authorization = `Bearer ${vars.token}`;
	let body: string | undefined;
	if (overrides?.body !== undefined) body = overrides.body;
	else if (entry.bodyTemplate) body = substituteTemplate(entry.bodyTemplate, vars);
	return { method: entry.method, url, headers, body };
}

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isMutatingMethod(method: string): boolean {
	return MUTATING.has(method.toUpperCase());
}

export async function executeHttp(req: ResolvedRequest): Promise<HttpCallResult> {
	const t0 = Date.now();
	const opts: RequestInit = { method: req.method, headers: req.headers };
	if (req.body != null && req.method !== "GET" && req.method !== "HEAD") {
		opts.body = req.body;
	}
	try {
		const res = await fetch(req.url, opts);
		const text = await res.text();
		let data: unknown = {};
		try {
			data = JSON.parse(text);
		} catch {
			data = { raw: text.slice(0, 8000) };
		}
		return { status: res.status, data, durationMs: Date.now() - t0 };
	} catch (err) {
		return {
			status: 0,
			data: {},
			error: err instanceof Error ? err.message : String(err),
			durationMs: Date.now() - t0,
		};
	}
}

/** Tras JWT PatyIA, guarda token en vars si viene en respuesta. */
export function applyResponseVars(
	project: ApiProject,
	entry: CatalogEntry,
	vars: Record<string, string>,
	result: HttpCallResult,
): Record<string, string> {
	const next = { ...vars };
	if (project !== "patyia" || !result.data || typeof result.data !== "object") return next;
	const d = result.data as Record<string, unknown>;
	const resp = (d.respuesta ?? d) as Record<string, unknown>;
	if (entry.pathTemplate.includes("/api/JWT") && typeof resp.token === "string") {
		next.token = resp.token;
	}
	if (typeof resp.iconversacion === "number") next.iconversacion = String(resp.iconversacion);
	if (typeof resp.itiquete === "number") next.itiquete = String(resp.itiquete);
	return next;
}

export async function executeCatalogEntry(opts: {
	project: ApiProject;
	catalogId: string;
	envId?: string;
	vars?: Record<string, string>;
	overrides?: { path?: string; body?: string };
	allowMutations?: boolean;
}): Promise<{ entry: CatalogEntry; request: ResolvedRequest; result: HttpCallResult; varsAfter: Record<string, string> }> {
	const entry = getCatalogEntry(opts.project, opts.catalogId);
	if (!entry) throw new Error(`Endpoint no encontrado: ${opts.catalogId}`);
	if (isMutatingMethod(entry.method) && !opts.allowMutations) {
		throw new Error(
			`Método ${entry.method} requiere allowMutations=true. Use mode=guide o habilite mutaciones explícitamente.`,
		);
	}
	let vars = opts.vars ?? getRuntimeVars(opts.project, opts.envId);
	const request = resolveCatalogRequest(entry, vars, opts.overrides);
	const result = await executeHttp(request);
	vars = applyResponseVars(opts.project, entry, vars, result);
	return { entry, request, result, varsAfter: vars };
}
