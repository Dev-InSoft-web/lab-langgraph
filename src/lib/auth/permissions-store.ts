import { getPatyPgPool } from "../db/pg.js";
import {
	COL_AUTH,
	COL_AUTH_ROLE,
	COL_AUTH_ROLEALLOW,
	COL_AUTH_USERALLOW,
	Q_AUTH_ROLE,
	Q_AUTH_ROLEALLOW,
	Q_AUTH_USERALLOW,
	Q_LAB_AUTH_USER,
} from "../db/pg-identifiers.js";
import { ensureLabAuthSchema } from "./ensure-auth-schema.js";
import { findLabUser } from "./users.js";

export type UserExceptionDef = {
	description?: string;
	allow: string;
	sql_scope?: string;
};

export type PermissionDoc = {
	roles: Record<string, { description?: string; allow: string[] }>;
	users: Record<string, { role: string }>;
	user_exceptions?: Record<string, UserExceptionDef[]>;
};

type RoleDef = { description: string; allow: string[] };
type UserException = { allowrule: string; sqlscope: string | null; description: string };
type Cache = {
	roles: Map<string, RoleDef>;
	userRoles: Map<string, string>;
	userExceptions: Map<string, UserException[]>;
	loadedAt: number;
};

const CACHE_TTL_MS = 60_000;
let cache: Cache | null = null;

function normalizeUser(username: string): string {
	return username.trim().toUpperCase();
}

function normalizePath(path: string): string {
	const p = path.trim();
	if (!p) return "/";
	return p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p;
}

export function matchAllowRule(rule: string, method: string, apiPath: string): boolean {
	const trimmed = rule.trim();
	if (trimmed === "*") return true;

	const colon = trimmed.indexOf(":");
	const ruleMethod = colon >= 0 ? trimmed.slice(0, colon) : "*";
	const rulePath = colon >= 0 ? trimmed.slice(colon + 1) : trimmed;

	const m = method.toUpperCase();
	if (ruleMethod !== "*" && ruleMethod.toUpperCase() !== m) return false;

	const path = normalizePath(apiPath);
	const rp = normalizePath(rulePath.startsWith("/") ? rulePath : `/${rulePath}`);

	if (rp === "*" || rp === "/*") return true;
	if (rp.endsWith("/*")) {
		const prefix = rp.slice(0, -2);
		return path === prefix || path.startsWith(`${prefix}/`);
	}
	return path === rp;
}

async function loadCache(force = false): Promise<Cache> {
	const now = Date.now();
	if (!force && cache && now - cache.loadedAt < CACHE_TTL_MS) return cache;

	await ensureLabAuthSchema();
	const pool = getPatyPgPool();

	const roleRows = await pool.query<{ rolecode: string; description: string | null }>(
		`SELECT r.${COL_AUTH_ROLE.ROLECODE} AS rolecode, r.${COL_AUTH_ROLE.DESCRIPTION} AS description
		 FROM ${Q_AUTH_ROLE} r
		 WHERE r.${COL_AUTH_ROLE.ACTIVE} = true`,
	);

	const allowRows = await pool.query<{ rolecode: string; allowrule: string }>(
		`SELECT a.${COL_AUTH_ROLEALLOW.ROLECODE} AS rolecode, a.${COL_AUTH_ROLEALLOW.ALLOWRULE} AS allowrule
		 FROM ${Q_AUTH_ROLEALLOW} a
		 INNER JOIN ${Q_AUTH_ROLE} r ON r.${COL_AUTH_ROLE.ROLECODE} = a.${COL_AUTH_ROLEALLOW.ROLECODE}
		 WHERE r.${COL_AUTH_ROLE.ACTIVE} = true`,
	);

	let userRows: { rows: Array<{ username: string; rolecode: string | null }> };
	try {
		userRows = await pool.query(
			`SELECT ${COL_AUTH.USERNAME} AS username, ${COL_AUTH.ROLECODE} AS rolecode
			 FROM ${Q_LAB_AUTH_USER}
			 WHERE ${COL_AUTH.ACTIVE} = true AND ${COL_AUTH.ROLECODE} IS NOT NULL`,
		);
	} catch {
		userRows = { rows: [] };
	}

	let userAllowRows: {
		rows: Array<{
			username: string;
			allowrule: string;
			sqlscope: string | null;
			description: string | null;
		}>;
	};
	try {
		userAllowRows = await pool.query(
			`SELECT ${COL_AUTH_USERALLOW.USERNAME} AS username,
			        ${COL_AUTH_USERALLOW.ALLOWRULE} AS allowrule,
			        ${COL_AUTH_USERALLOW.SQLSCOPE} AS sqlscope,
			        ${COL_AUTH_USERALLOW.DESCRIPTION} AS description
			 FROM ${Q_AUTH_USERALLOW}`,
		);
	} catch {
		userAllowRows = { rows: [] };
	}

	const roles = new Map<string, RoleDef>();
	for (const row of roleRows.rows) {
		const code = row.rolecode.trim();
		if (!roles.has(code)) roles.set(code, { description: row.description?.trim() ?? "", allow: [] });
	}
	for (const row of allowRows.rows) {
		const code = row.rolecode.trim();
		const rule = row.allowrule.trim();
		if (!rule) continue;
		const role = roles.get(code) ?? { description: "", allow: [] };
		if (!role.allow.includes(rule)) role.allow.push(rule);
		roles.set(code, role);
	}

	const userRoles = new Map<string, string>();
	for (const row of userRows.rows) {
		const u = normalizeUser(row.username);
		const role = row.rolecode?.trim();
		if (u && role) userRoles.set(u, role);
	}

	const userExceptions = new Map<string, UserException[]>();
	for (const row of userAllowRows.rows) {
		const u = normalizeUser(row.username);
		const allowrule = row.allowrule?.trim();
		if (!u || !allowrule) continue;
		const list = userExceptions.get(u) ?? [];
		list.push({
			allowrule,
			sqlscope: row.sqlscope?.trim() || null,
			description: row.description?.trim() ?? "",
		});
		userExceptions.set(u, list);
	}

	cache = { roles, userRoles, userExceptions, loadedAt: now };
	return cache;
}

async function resolveUserRole(username: string): Promise<string | null> {
	const u = normalizeUser(username);
	const c = await loadCache();
	const cached = c.userRoles.get(u);
	if (cached) return cached;
	const row = await findLabUser(u);
	return row?.rolecode?.trim() || null;
}

export async function getUserRole(username: string): Promise<string | null> {
	return resolveUserRole(username);
}

export async function userMayAccessEndpoint(
	username: string,
	method: string,
	apiPath: string,
): Promise<boolean> {
	const path = apiPath.endsWith("/") && apiPath.length > 1 ? apiPath.slice(0, -1) : apiPath;
	if (path === "/signalr/negotiate") return true;

	if (method.toUpperCase() === "GET") return true;

	const c = await loadCache();
	const u = normalizeUser(username);
	const roleName = c.userRoles.get(u) ?? (await resolveUserRole(username));
	if (!roleName) return false;

	const exceptions = c.userExceptions.get(normalizeUser(username)) ?? [];
	if (exceptions.some((ex) => matchAllowRule(ex.allowrule, method, apiPath))) return true;

	const role = c.roles.get(roleName);
	if (!role?.allow.length) return false;
	return role.allow.some((rule) => matchAllowRule(rule, method, apiPath));
}

/** Alcance SQL restringido al emitir token de servicio (ej. instrucciones_editor → solo INSTRUCCION staging). */
export async function getUserSqlScopeForEndpoint(
	username: string,
	method: string,
	apiPath: string,
): Promise<string | null> {
	const c = await loadCache();
	const exceptions = c.userExceptions.get(normalizeUser(username)) ?? [];
	for (const ex of exceptions) {
		if (matchAllowRule(ex.allowrule, method, apiPath) && ex.sqlscope) return ex.sqlscope;
	}
	const roleName = c.userRoles.get(normalizeUser(username)) ?? (await resolveUserRole(username));
	if (
		roleName === "instrucciones_editor" &&
		matchAllowRule("POST:/mssql/paty/exec", method, apiPath)
	) {
		return "paty_staging_instrucciones";
	}
	return null;
}

export async function permissionDeniedBody(username: string): Promise<Record<string, unknown>> {
	return {
		ok: false,
		error: "Permiso denegado",
		username: normalizeUser(username),
		role: await getUserRole(username),
		hint: "Roles y allow en BD_LANGLAB.AUTH_ROLE / AUTH_ROLEALLOW; usuario en AUTH_USER.ROLECODE",
	};
}

export async function upsertRole(roleCode: string, description?: string): Promise<void> {
	await ensureLabAuthSchema();
	const code = roleCode.trim();
	const pool = getPatyPgPool();
	await pool.query(
		`INSERT INTO ${Q_AUTH_ROLE} AS t (${COL_AUTH_ROLE.ROLECODE}, ${COL_AUTH_ROLE.DESCRIPTION}, ${COL_AUTH_ROLE.ACTIVE})
		 VALUES ($1, $2, true)
		 ON CONFLICT (${COL_AUTH_ROLE.ROLECODE}) DO UPDATE SET
		   ${COL_AUTH_ROLE.DESCRIPTION} = COALESCE(EXCLUDED.${COL_AUTH_ROLE.DESCRIPTION}, t.${COL_AUTH_ROLE.DESCRIPTION}),
		   ${COL_AUTH_ROLE.ACTIVE} = true,
		   ${COL_AUTH_ROLE.FHULTACT} = now()`,
		[code, description?.trim() ?? null],
	);
}

export async function replaceRoleAllows(roleCode: string, allow: string[]): Promise<void> {
	await ensureLabAuthSchema();
	const code = roleCode.trim();
	const rules = [...new Set(allow.map((r) => r.trim()).filter(Boolean))];
	const pool = getPatyPgPool();
	await pool.query(`DELETE FROM ${Q_AUTH_ROLEALLOW} WHERE ${COL_AUTH_ROLEALLOW.ROLECODE} = $1`, [code]);
	for (const rule of rules) {
		await pool.query(
			`INSERT INTO ${Q_AUTH_ROLEALLOW} (${COL_AUTH_ROLEALLOW.ROLECODE}, ${COL_AUTH_ROLEALLOW.ALLOWRULE})
			 VALUES ($1, $2)
			 ON CONFLICT DO NOTHING`,
			[code, rule],
		);
	}
}

export async function assignUserRole(username: string, roleCode: string): Promise<void> {
	await ensureLabAuthSchema();
	const u = normalizeUser(username);
	const role = roleCode.trim();
	const pool = getPatyPgPool();
	await upsertRole(role);
	await pool.query(
		`UPDATE ${Q_LAB_AUTH_USER} SET ${COL_AUTH.ROLECODE} = $2, ${COL_AUTH.FHULTACT} = now()
		 WHERE ${COL_AUTH.USERNAME} = $1`,
		[u, role],
	);
}

export async function replaceUserExceptions(username: string, exceptions: UserExceptionDef[]): Promise<void> {
	await ensureLabAuthSchema();
	const u = normalizeUser(username);
	const pool = getPatyPgPool();
	await pool.query(`DELETE FROM ${Q_AUTH_USERALLOW} WHERE ${COL_AUTH_USERALLOW.USERNAME} = $1`, [u]);
	for (const ex of exceptions) {
		const allowrule = ex.allow?.trim();
		if (!allowrule) continue;
		await pool.query(
			`INSERT INTO ${Q_AUTH_USERALLOW}
			 (${COL_AUTH_USERALLOW.USERNAME}, ${COL_AUTH_USERALLOW.ALLOWRULE}, ${COL_AUTH_USERALLOW.SQLSCOPE}, ${COL_AUTH_USERALLOW.DESCRIPTION})
			 VALUES ($1, $2, $3, $4)
			 ON CONFLICT DO NOTHING`,
			[u, allowrule, ex.sql_scope?.trim() ?? null, ex.description?.trim() ?? null],
		);
	}
}

export async function syncPermissionsFromDoc(doc: PermissionDoc): Promise<void> {
	for (const [roleCode, def] of Object.entries(doc.roles)) {
		await upsertRole(roleCode, def.description);
		await replaceRoleAllows(roleCode, def.allow ?? []);
	}
	for (const [username, def] of Object.entries(doc.users)) {
		await assignUserRole(username, def.role);
	}
	await ensureLabAuthSchema();
	const pool = getPatyPgPool();
	await pool.query(`DELETE FROM ${Q_AUTH_USERALLOW}`);
	for (const [username, exceptions] of Object.entries(doc.user_exceptions ?? {})) {
		await replaceUserExceptions(username, exceptions ?? []);
	}
	cache = null;
}

export function invalidatePermissionCache(): void {
	cache = null;
}
