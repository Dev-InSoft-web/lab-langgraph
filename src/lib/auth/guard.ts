import { HttpRequest, HttpResponseInit } from "@azure/functions";
import { bearerTokenFromRequest, labAuthRequired, verifyLabJwt, type LabJwtClaims } from "./lab-jwt.js";

export type { LabJwtClaims };

type PublicRoute = { method: string; path: string };

const PUBLIC_ROUTES: PublicRoute[] = [
	{ method: "GET", path: "/health" },
	{ method: "GET", path: "/tools/health" },
	{ method: "GET", path: "/docs" },
	{ method: "GET", path: "/openapi.json" },
	{ method: "POST", path: "/auth/token" },
	{ method: "GET", path: "/mssql/clientesis/ping" },
	{ method: "GET", path: "/mssql/paty/ping" },
	{ method: "GET", path: "/mssql/clientesis/query" },
	{ method: "GET", path: "/mssql/paty/query" },
	{ method: "POST", path: "/mssql/clientesis/query" },
	{ method: "POST", path: "/mssql/paty/query" },
];

/** GET de API ISA-DOC (lectura) sin JWT. SignalR negotiate y mutaciones siguen protegidos. */
const ISA_DOC_GET_PREFIXES = [
	"/entity",
	"/catalog",
	"/revisado",
	"/persistence",
	"/config/connections",
	"/imgbb/",
	"/tickets/mermaid/",
	"/patyia/cache/",
	"/bitacora/",
] as const;

export function normalizeApiPath(pathname: string): string {
	const idx = pathname.indexOf("/api");
	if (idx < 0) return pathname;
	const rest = pathname.slice(idx + 4);
	return rest || "/";
}

function normalizePath(path: string): string {
	return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}

export function isIsaDocPublicGet(method: string, apiPath: string): boolean {
	if (method.toUpperCase() !== "GET") return false;
	const p = normalizePath(apiPath);
	if (p.startsWith("/mssql/") && (p.endsWith("/ping") || p.endsWith("/query"))) return true;
	return ISA_DOC_GET_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix));
}

export function isPublicLabRoute(method: string, apiPath: string): boolean {
	const m = method.toUpperCase();
	const p = normalizePath(apiPath);
	if (PUBLIC_ROUTES.some((r) => r.method === m && r.path === p)) return true;
	return isIsaDocPublicGet(m, p);
}

export async function verifyRequestLabJwt(request: HttpRequest): Promise<LabJwtClaims | null> {
	if (!labAuthRequired()) return { sub: "anonymous", username: "anonymous" };
	const apiPath = normalizeApiPath(new URL(request.url).pathname);
	if (isPublicLabRoute(request.method, apiPath)) return { sub: "public", username: "public" };

	const token = bearerTokenFromRequest(request.headers.get("authorization"));
	if (!token) return null;
	try {
		return await verifyLabJwt(token);
	} catch {
		return null;
	}
}

export function unauthorizedBody(): Record<string, unknown> {
	return {
		ok: false,
		error: "No autorizado",
		hint: "POST /api/auth/token con { username, password } y enviar Authorization: Bearer <token>",
	};
}

export async function labAuthDeniedResponse(): Promise<HttpResponseInit["jsonBody"]> {
	return unauthorizedBody();
}

const integracionesUser = (): string =>
	(process.env.LAB_INTEGRACIONES_USER?.trim() || "INTEGRACIONES").toUpperCase();

/** Usuario cuyo rol/excepciones aplican al request (token técnico INTEGRACIONES → onBehalfOf). */
export function permissionSubjectFromClaims(claims: LabJwtClaims): string {
	const actor = claims.username.trim().toUpperCase();
	const delegate = typeof claims.onBehalfOf === "string" ? claims.onBehalfOf.trim() : "";
	if (actor === integracionesUser() && delegate) return delegate;
	return claims.username;
}
