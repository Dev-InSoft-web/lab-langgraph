import { HttpResponseInit } from "@azure/functions";

import { CORS_ALLOW_ORIGIN } from "./lab-constants.js";

const DEFAULT_ORIGIN = CORS_ALLOW_ORIGIN;

export function corsHeaders(origin?: string | null): Record<string, string> {
	const allow = origin && origin !== "null" ? origin : DEFAULT_ORIGIN;
	return {
		"Access-Control-Allow-Origin": allow,
		"Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
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
