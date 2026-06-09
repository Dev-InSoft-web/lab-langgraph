import { HttpRequest, HttpResponseInit } from "@azure/functions";

import { labAuthDeniedResponse, verifyRequestLabJwt } from "../auth/guard.js";
import { CORS_ALLOW_ORIGIN } from "./lab-constants.js";

const DEFAULT_ORIGIN = CORS_ALLOW_ORIGIN;

export function corsHeaders(origin?: string | null): Record<string, string> {
	const allow = origin && origin !== "null" ? origin : DEFAULT_ORIGIN;
	return {
		"Access-Control-Allow-Origin": allow,
		"Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Max-Age": "86400",
	};
}

export function jsonResponse(
	body: unknown,
	status = 200,
	extraHeaders: Record<string, string> = {},
): HttpResponseInit {
	return {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			...extraHeaders,
		},
		jsonBody: body,
	};
}

export function optionsResponse(origin?: string | null): HttpResponseInit {
	return { status: 204, headers: corsHeaders(origin) };
}

/** OPTIONS sin exigir JWT (consultas MSSQL públicas, health, etc.). */
export function beginHttpRequestPublic(
	request: HttpRequest,
	origin?: string | null,
): HttpResponseInit | null {
	if (request.method === "OPTIONS") return optionsResponse(origin);
	return null;
}

/** OPTIONS o 401 si falta JWT (cuando LAB_AUTH_REQUIRED está activo). */
export async function beginHttpRequest(
	request: HttpRequest,
	origin?: string | null,
): Promise<HttpResponseInit | null> {
	if (request.method === "OPTIONS") return optionsResponse(origin);
	const claims = await verifyRequestLabJwt(request);
	if (claims) return null;
	return jsonResponse(await labAuthDeniedResponse(), 401, corsHeaders(origin));
}
