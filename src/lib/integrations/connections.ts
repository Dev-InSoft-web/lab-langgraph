import { preloadLabSecrets } from "../core/secrets.js";
import { resolveLabRepoRoot } from "../core/data-paths.js";
import { resolveLabDataRoot } from "../core/lab-data-paths.js";
import {
	getClientesisDatabaseUrl,
	getLanglabDatabaseUrl,
	getRagDatabaseUrl,
} from "../core/config.js";
import { pingClientesisDb, pingPatyDb, pingRagDb } from "../db/pg.js";
import {
	PG_SCHEMA_ISADOC,
	PG_SCHEMA_LANGLAB,
	PG_SCHEMA_RAG,
} from "../core/lab-constants.js";
import { bundledCatalogExists } from "./postman/paths.js";
import { loadEnvironments, mergeEnvSecrets, resolveEnvironment } from "./postman/env.js";
import { getManifestMeta, getLoadedCatalogSource, loadApiCatalogManifest } from "./postman/manifest.js";
import { loadCatalog } from "./postman/catalog.js";
import { loadProjectToken } from "./tokens.js";
import type { ApiProject } from "./postman/types.js";

export type ConnectionProfile = {
	project: ApiProject;
	envId: string;
	envName: string;
	vars: Record<string, string>;
	hasToken: boolean;
	collectionReady: boolean;
};

/** Resumen seguro (sin valores secretos) para health/diagnóstico. */
export async function getConnectionsSummary(): Promise<{
	labRoot: string;
	dataRoot: string;
		databases: {
		paty: { configured: boolean; ok: boolean; schemas: string[] };
		clientesis: { configured: boolean; ok: boolean; schemas: string[] };
		rag: { configured: boolean; ok: boolean; schemas: string[] };
	};
	catalog: ReturnType<typeof getManifestMeta> & { bundled: boolean };
	projects: ConnectionProfile[];
}> {
	preloadLabSecrets();
	try {
		await loadApiCatalogManifest();
	} catch {
		/* catálogo aún sin seed en PG */
	}
	const projects: ApiProject[] = ["patyia", "clientesis"];
	const out: ConnectionProfile[] = [];
	for (const project of projects) {
		try {
			const envs = loadEnvironments(project);
			const envId = process.env.LAB_API_ENV?.trim() || envs.active;
			const { env, vars } = resolveEnvironment(project, envId);
			const merged = mergeEnvSecrets(project, vars);
			const token = loadProjectToken(project);
			if (token) merged.token = token;
			out.push({
				project,
				envId: env.id,
				envName: env.name,
				vars: Object.fromEntries(
					Object.entries(merged).map(([k, v]) => [
						k,
						k.toLowerCase().includes("token") || k === "CONTROLKEY" ? (v ? "***" : "") : v,
					]),
				),
				hasToken: Boolean(merged.token?.trim()),
				collectionReady: loadCatalog(project).length > 0,
			});
		} catch {
			out.push({
				project,
				envId: "?",
				envName: "?",
				vars: {},
				hasToken: Boolean(loadProjectToken(project)),
				collectionReady: false,
			});
		}
	}
	const catalogMeta = getManifestMeta();
	let patyConfigured = false;
	let clientesisConfigured = false;
	let ragConfigured = false;
	try {
		getLanglabDatabaseUrl();
		patyConfigured = true;
	} catch {
		patyConfigured = false;
	}
	try {
		getClientesisDatabaseUrl();
		clientesisConfigured = true;
	} catch {
		clientesisConfigured = false;
	}
	try {
		getRagDatabaseUrl();
		ragConfigured = true;
	} catch {
		ragConfigured = false;
	}
	const patyOk = patyConfigured ? await pingPatyDb() : false;
	const clientesisOk = clientesisConfigured ? await pingClientesisDb() : false;
	const ragOk = ragConfigured ? await pingRagDb() : false;
	return {
		labRoot: resolveLabRepoRoot(),
		dataRoot: resolveLabDataRoot(),
		databases: {
			paty: { configured: patyConfigured, ok: patyOk, schemas: [PG_SCHEMA_LANGLAB, PG_SCHEMA_ISADOC] },
			clientesis: {
				configured: clientesisConfigured,
				ok: clientesisOk,
				schemas: [PG_SCHEMA_ISADOC],
			},
			rag: { configured: ragConfigured, ok: ragOk, schemas: [PG_SCHEMA_RAG] },
		},
		catalog: {
			...catalogMeta,
			bundled: bundledCatalogExists(),
			runtimeSource: getLoadedCatalogSource() ?? catalogMeta.runtimeSource,
		},
		projects: out,
	};
}

export function getRuntimeVars(project: ApiProject, envId?: string): Record<string, string> {
	const { vars } = resolveEnvironment(project, envId);
	const merged = mergeEnvSecrets(project, vars);
	const token = loadProjectToken(project);
	if (token) merged.token = token;
	return merged;
}
