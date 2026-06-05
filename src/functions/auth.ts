import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import {
	LAB_JWT_EXPIRY_DAYS,
	bearerTokenFromRequest,
	signLabJwt,
	verifyLabJwt,
} from "../lib/auth/lab-jwt.js";
import { verifyPassword } from "../lib/auth/password.js";
import { findLabUser } from "../lib/auth/users.js";

async function tokenHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);
	if (request.method !== "POST") {
		return jsonResponse({ ok: false, error: "POST requerido" }, 405, corsHeaders(origin));
	}

	let body: { username?: string; password?: string };
	try {
		const text = await request.text();
		body = text.trim() ? (JSON.parse(text) as { username?: string; password?: string }) : {};
	} catch {
		return jsonResponse({ ok: false, error: "JSON inválido" }, 400, corsHeaders(origin));
	}

	const username = String(body.username ?? "").trim();
	const password = String(body.password ?? "");
	if (!username || !password) {
		return jsonResponse({ ok: false, error: "username y password requeridos" }, 400, corsHeaders(origin));
	}

	let user;
	try {
		user = await findLabUser(username);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		_context.error("auth/token DB", err);
		return jsonResponse(
			{
				ok: false,
				error: "Auth no disponible (base de datos)",
				hint: "Configura PATY_DATABASE_URL o DATABASE_URL en Azure App Settings",
				detail: message,
			},
			503,
			corsHeaders(origin),
		);
	}
	if (!user?.active) {
		return jsonResponse({ ok: false, error: "Credenciales inválidas" }, 401, corsHeaders(origin));
	}
	const ok = await verifyPassword(password, user.passwordhash);
	if (!ok) {
		return jsonResponse({ ok: false, error: "Credenciales inválidas" }, 401, corsHeaders(origin));
	}

	try {
		const { token, expiresAt } = await signLabJwt(user.username);
		return jsonResponse(
			{
				ok: true,
				token,
				tokenType: "Bearer",
				expiresAt,
				expiresInDays: LAB_JWT_EXPIRY_DAYS,
				username: user.username,
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

async function meHandler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);
	if (request.method !== "GET") {
		return jsonResponse({ ok: false, error: "GET requerido" }, 405, corsHeaders(origin));
	}

	const token = bearerTokenFromRequest(request.headers.get("authorization"));
	if (!token) {
		return jsonResponse({ ok: false, error: "Bearer token requerido" }, 401, corsHeaders(origin));
	}
	try {
		const claims = await verifyLabJwt(token);
		return jsonResponse(
			{ ok: true, username: claims.username, exp: claims.exp, sub: claims.sub },
			200,
			corsHeaders(origin),
		);
	} catch {
		return jsonResponse({ ok: false, error: "Token inválido o expirado" }, 401, corsHeaders(origin));
	}
}

app.http("authToken", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "auth/token",
	handler: tokenHandler,
});

app.http("authMe", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "auth/me",
	handler: meHandler,
});
