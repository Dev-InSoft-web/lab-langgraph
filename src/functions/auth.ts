import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import {
	LAB_JWT_EXPIRY_DAYS,
	bearerTokenFromRequest,
	signLabJwt,
	verifyLabJwt,
} from "../lib/auth/lab-jwt.js";
import { unwrapTransportPassword } from "../lib/auth/caesar-transport.js";
import { verifyPassword } from "../lib/auth/password.js";
import {
	getUserRole,
	getUserSqlScopeForEndpoint,
	permissionDeniedBody,
	userMayAccessEndpoint,
} from "../lib/auth/permissions.js";
import { findLabUser } from "../lib/auth/users.js";
import {
	checkLoginPenalty,
	clearLoginPenalty,
	registerLoginFailure,
} from "../lib/auth/login-penalty.js";
import { normalizeApiPath, verifyRequestLabJwt } from "../lib/auth/guard.js";

const INTEGRACIONES_USER = () =>
	(process.env.LAB_INTEGRACIONES_USER?.trim() || "INTEGRACIONES").toUpperCase();

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
	const password = unwrapTransportPassword(String(body.password ?? ""));
	if (!username || !password) {
		return jsonResponse({ ok: false, error: "username y password requeridos" }, 400, corsHeaders(origin));
	}

	// Penalización anti fuerza bruta: 3 fallos seguidos → 1 min, 4º → 5 min, 5º+ → 10 min.
	try {
		const penalty = await checkLoginPenalty(username);
		if (penalty.blocked) {
			return jsonResponse(
				{
					ok: false,
					error: "Demasiados intentos fallidos. Espera antes de reintentar.",
					retryAfterSeconds: penalty.retryAfterSeconds,
				},
				429,
				{ ...corsHeaders(origin), "Retry-After": String(penalty.retryAfterSeconds) },
			);
		}
	} catch (err) {
		_context.error("auth/token penalty check", err);
		// Si la tabla de penalización falla no bloqueamos el login legítimo.
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
	const ok = user?.active ? await verifyPassword(password, user.passwordhash) : false;
	if (!user || !ok) {
		let retryAfterSeconds = 0;
		try {
			const penalty = await registerLoginFailure(username);
			retryAfterSeconds = penalty.retryAfterSeconds;
		} catch (err) {
			_context.error("auth/token penalty register", err);
		}
		return jsonResponse(
			{
				ok: false,
				error: "Credenciales inválidas",
				...(retryAfterSeconds ? { retryAfterSeconds } : {}),
			},
			retryAfterSeconds ? 429 : 401,
			{
				...corsHeaders(origin),
				...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
			},
		);
	}

	try {
		await clearLoginPenalty(username);
	} catch (err) {
		_context.error("auth/token penalty clear", err);
	}

	try {
		const { token, expiresAt } = await signLabJwt(user.username);
		const role = user.rolecode?.trim() || (await getUserRole(user.username));
		return jsonResponse(
			{
				ok: true,
				token,
				tokenType: "Bearer",
				expiresAt,
				expiresInDays: LAB_JWT_EXPIRY_DAYS,
				username: user.username,
				role,
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
		const role = await getUserRole(claims.username);
		return jsonResponse(
			{ ok: true, username: claims.username, role, exp: claims.exp, sub: claims.sub },
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

/** Token técnico INTEGRACIONES para mutaciones; exige sesión de usuario con permiso en el endpoint. */
async function serviceTokenHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);
	if (request.method !== "POST") {
		return jsonResponse({ ok: false, error: "POST requerido" }, 405, corsHeaders(origin));
	}

	const claims = await verifyRequestLabJwt(request);
	if (!claims) {
		return jsonResponse({ ok: false, error: "Sesión requerida" }, 401, corsHeaders(origin));
	}

	let body: { method?: string; path?: string };
	try {
		const text = await request.text();
		body = text.trim() ? (JSON.parse(text) as { method?: string; path?: string }) : {};
	} catch {
		return jsonResponse({ ok: false, error: "JSON inválido" }, 400, corsHeaders(origin));
	}

	const method = String(body.method ?? "POST").toUpperCase();
	const apiPath = normalizeApiPath(String(body.path ?? "/pg/langlab/exec"));
	const username = claims.username;
	if (!(await userMayAccessEndpoint(username, method, apiPath))) {
		return jsonResponse(await permissionDeniedBody(username), 403, corsHeaders(origin));
	}

	try {
		const serviceUser = INTEGRACIONES_USER();
		const sqlScope = await getUserSqlScopeForEndpoint(username, method, apiPath);
		const { token, expiresAt } = await signLabJwt(serviceUser, {
			onBehalfOf: username,
			sqlScope: sqlScope ?? undefined,
		});
		return jsonResponse(
			{
				ok: true,
				token,
				tokenType: "Bearer",
				expiresAt,
				actingAs: serviceUser,
				username,
				role: await getUserRole(username),
				...(sqlScope ? { sqlScope } : {}),
			},
			200,
			corsHeaders(origin),
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("authMe", {
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	route: "auth/me",
	handler: meHandler,
});

app.http("authServiceToken", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "auth/service-token",
	handler: serviceTokenHandler,
});
