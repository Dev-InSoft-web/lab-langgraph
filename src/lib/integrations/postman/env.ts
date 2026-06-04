import type { ApiProject, Environment } from "./types.js";
import { loadEnvironmentsFromManifest } from "./manifest.js";

export function loadEnvironments(project: ApiProject) {
	return loadEnvironmentsFromManifest(project);
}

export function resolveEnvironment(
	project: ApiProject,
	envId?: string,
): { env: Environment; vars: Record<string, string> } {
	const file = loadEnvironments(project);
	const id = envId?.trim() || process.env.LAB_API_ENV?.trim() || file.active;
	const env = file.environments.find((e) => e.id === id) ?? file.environments[0];
	if (!env) throw new Error(`Sin entorno Postman para ${project}`);
	const vars: Record<string, string> = {};
	for (const v of env.values) {
		if (v.enabled === false) continue;
		vars[v.key] = v.value ?? "";
	}
	return { env, vars };
}

/** Mezcla secretos de proceso sobre variables del entorno (sin commitear tokens). */
export function mergeEnvSecrets(
	project: ApiProject,
	vars: Record<string, string>,
): Record<string, string> {
	const out = { ...vars };
	if (project === "patyia") {
		const token = process.env.PATYIA_TOKEN?.trim();
		const ck = process.env.PATYIA_CONTROLKEY?.trim();
		const host = process.env.PATYIA_HOST?.trim();
		if (token) out.token = token;
		if (ck) out.CONTROLKEY = ck;
		if (host) out.HOST = host;
	} else {
		const token = process.env.CLIENTESIS_TOKEN?.trim() || process.env.VERIFY_API_TOKEN?.trim();
		if (token) out.token = token;
		const host = process.env.CLIENTESIS_HOST_CONTAPYMEU?.trim();
		if (host) out.host_contapymeu = host;
	}
	return out;
}
