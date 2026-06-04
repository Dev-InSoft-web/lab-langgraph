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
];

export function normalizeApiPath(pathname: string): string {
	const idx = pathname.indexOf("/api");
	if (idx < 0) return pathname;
	const rest = pathname.slice(idx + 4);
	return rest || "/";
}

export function isPublicLabRoute(method: string, apiPath: string): boolean {
	const m = method.toUpperCase();
	const p = apiPath.endsWith("/") && apiPath.length > 1 ? apiPath.slice(0, -1) : apiPath;
	return PUBLIC_ROUTES.some((r) => r.method === m && r.path === p);
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
