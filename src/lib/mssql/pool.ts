import sql from "mssql";
import {
	getClientesisMssqlConfig,
	getPatyMssqlConfig,
	type MssqlConnectionConfig,
} from "../core/config.js";

export type MssqlTarget = "clientesis" | "paty";

const pools = new Map<MssqlTarget, sql.ConnectionPool>();
const connecting = new Map<MssqlTarget, Promise<sql.ConnectionPool>>();

function configFor(target: MssqlTarget): MssqlConnectionConfig | null {
	return target === "clientesis" ? getClientesisMssqlConfig() : getPatyMssqlConfig();
}

function configError(target: MssqlTarget): string {
	const prefix = target === "clientesis" ? "CLIENTESIS_MSSQL" : "PATY_MSSQL";
	return `MSSQL ${target}: configure ${prefix}_HOST, _USER, _PASS, _DB en local.settings.json`;
}

async function buildPool(cfg: MssqlConnectionConfig): Promise<sql.ConnectionPool> {
	const p = new sql.ConnectionPool({
		server: cfg.host,
		port: cfg.port,
		user: cfg.user,
		password: cfg.pass,
		database: cfg.database,
		options: { encrypt: true, trustServerCertificate: true },
		pool: { max: 5, min: 0, idleTimeoutMillis: 30_000 },
		requestTimeout: 300_000,
		connectionTimeout: 30_000,
	});
	await p.connect();
	return p;
}

export async function getMssqlPool(target: MssqlTarget): Promise<sql.ConnectionPool> {
	const existing = pools.get(target);
	if (existing?.connected) return existing;

	const pending = connecting.get(target);
	if (pending) return pending;

	const cfg = configFor(target);
	if (!cfg) throw new Error(configError(target));

	const promise = buildPool(cfg)
		.then((p) => {
			pools.set(target, p);
			return p;
		})
		.catch((err: unknown) => {
			pools.delete(target);
			throw err;
		})
		.finally(() => {
			connecting.delete(target);
		});

	connecting.set(target, promise);
	return promise;
}

export async function pingMssql(target: MssqlTarget): Promise<{ ok: boolean; reason?: string }> {
	try {
		const pool = await getMssqlPool(target);
		await pool.request().query("SELECT 1 AS ok");
		return { ok: true };
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return { ok: false, reason: msg };
	}
}

export function mssqlTargetLabel(target: MssqlTarget): string {
	return target === "clientesis" ? "CLIENTES (ClientesIS)" : "AYUDASCP_IA_STAGING (PatyIA)";
}
