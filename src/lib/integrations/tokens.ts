import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { resolveLabRepoRoot } from "../core/data-paths.js";
import type { ApiProject } from "./postman/types.js";

function readTokenJson(path: string): string | null {
	if (!existsSync(path)) return null;
	try {
		const raw = readFileSync(path, "utf8");
		const parsed = JSON.parse(raw) as { token?: string };
		return parsed.token?.trim() || null;
	} catch {
		return null;
	}
}

function tokenPaths(project: ApiProject): string[] {
	const root = resolveLabRepoRoot();
	const name = project === "patyia" ? "token.patyia.json" : "token.clientesis.json";
	const envFile =
		project === "patyia"
			? process.env.PATYIA_TOKEN_FILE?.trim()
			: process.env.CLIENTESIS_TOKEN_FILE?.trim();
	const out: string[] = [];
	if (envFile) out.push(resolve(envFile));
	out.push(join(root, "secrets", "tokens", name));
	return out;
}

export function loadProjectToken(project: ApiProject): string | null {
	if (project === "patyia") {
		const env = process.env.PATYIA_TOKEN?.trim();
		if (env) return env;
	} else {
		const env = process.env.CLIENTESIS_TOKEN?.trim() || process.env.VERIFY_API_TOKEN?.trim();
		if (env) return env;
	}
	for (const p of tokenPaths(project)) {
		const t = readTokenJson(p);
		if (t) return t;
	}
	return null;
}
